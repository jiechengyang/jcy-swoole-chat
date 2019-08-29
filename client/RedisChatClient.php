<?php declare(strict_types=1);
/**
 * 基于redis的聊天
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-27 13:58:51
 */

namespace chat\client;

use chat\helper\Color;
use \Swoole\Timer;
use \swoole_table;
use chat\libs\Aes;
use chat\Application as JSWOOLE;

class RedisChatClient implements BaseClient
{
    private static $FdMapping = null;

    const BROADCAT_TYPE = 1;

    public function onStart($server)
    {
        self::showMsg('display', "Server: start.Swoole version is [" . SWOOLE_VERSION . "]");
        self::showMsg('display', "Server: HOST is {$server->host}, Port is {$server->port}");
        self::showMsg('display', "MasterPid={$server->master_pid}|Manager_pid={$server->manager_pid}");
    }

    public function onManagerStart(\swoole_server $serv)
    {
        // echo PHP_EOL, 'event: onManagerStart', PHP_EOL;
    }

    public function onWorkerStart(\swoole_server $server, int $worker_id)
    {
        // var_dump($server, $worker_id);
        // echo PHP_EOL, 'event: onWorkerStart', PHP_EOL;
    }

    // 此功能用于将慢速的任务异步地去执行，比如一个聊天室服务器，可以用它来进行发送广播
    public function onTask($ws, int $task_id, int $src_worker_id, $data)
    {
        self::showMsg('display', "#{$ws->worker_id}\tonTask: [PID={$ws->worker_pid}]: task_id=$task_id");
        $fd = $data['fd'];
        $type = $data['type'];
        $fdMapping = null;
        if (!$fdMapping) {
            $fdMapping = new \chat\client\mapping\FdMapping(false);
        }

        $res = $this->__broadcast($ws, $fd, $type, $fdMapping);
        $ws->finish([
            'fd' => $fd,
            'res' => $res,
            'type' => $type
        ]);
    }

    public function onFinish($serv, int $task_id, $data)
    {
        self::showMsg('display', "Task#$task_id finished");
        $fd = $data['fd'];
    }

    public function onConnect($server, int $fd, int $reactorId)
    {
        $fdinfo = $server->getClientInfo($fd);
        $connect_time = date('Y-m-d H:i:s', $fdinfo['connect_time']);
        $last_time = date('Y-m-d H:i:s', $fdinfo['last_time']);
        $msg = "fid#{$fd}reactorId#{$reactorId},  remote_ip#{$fdinfo['remote_ip']},  remote_port#{$fdinfo['remote_port']},  connect_time#{$connect_time},  last_time#{$last_time}";
        self::showMsg('display', $msg);
    }

    public function onOpen($ws, $request)
    {
        if (!$ws->isEstablished($request->fd)) {
            return $this->disconnect($ws, $request->fd, "Not a standard websocket protocol");
        }

        if (!self::$FdMapping) {
            self::$FdMapping = new \chat\client\mapping\FdMapping(false);
        }

        self::showMsg('display', "server#{$ws->worker_pid}: handshake success with fd#{$request->fd}");
    }

    public function onMessage($ws, $frame)
    {
        self::showMsg('showInfo', "Message: {$frame->data}");
        list('key' => $key, 'iv' => $iv) = JSWOOLE::getAesConfig();
        $aes = Aes::getInstance($key, 'aes-128-cbc', $iv, OPENSSL_ZERO_PADDING);// ($key, 'aes-256-cbc', $iv, true) OPENSSL_ZERO_PADDING
        $str = $aes->decrypt(trim($frame->data));// $aes->decryptMd5( trim( $frame->data ) );
        $data = json_decode(rtrim($str, "\0"), true);
        if (empty($data) || empty($data['type'])) {
            return $this->disconnect($ws, $frame->fd, "Illegal access to the server");
        }

        switch ($data['type']) {
            case 'sign':
                return $this->__sign($ws, $frame->fd, $data);
                break;
            case 'register':
                return $this->__register($ws, $frame->fd, $data);
                break;
            case 'users':
                return $this->__getUsers($ws, $frame->fd, $data);
            case 'logout':
                return $this->__logout($ws, $frame->fd, $data);
            case 'msg':
                return $this->__chat($ws, $frame->fd, $data);
            default:
                return $this->disconnect($ws, $frame->fd, "Illegal access to the server");
        }
    }

    private function __chat($ws, int $fd, array $data)
    {
        // task process
        if (empty($data['to'])) {
            return $this->disconnect($ws, $fd, "The listener doesn't exist.");
        }

        if (empty($data['body'])) {
            return $this->disconnect($ws, $fd, "Please input msg");
        }

        $uid = self::$FdMapping->getUidByFd($fd);
        if (empty($uid)) {
            return $this->disconnect($ws, $fd, "The Sender doesn't exist.");
        }

        if (($to_fd = $this->__checkisOnline($data['to'])) !== false) {
            //online send
            $r = $this->successSend($ws, $to_fd, [
                'from' => $uid,
                'to' => $data['to'],
                'msg' => $data['body'],
                'time' => time()
            ], 'send msg success', 104);
        } else {
            //offline save
            $to_fd = self::$FdMapping->getFdByUid($data['to']);
            self::$FdMapping->saveChatMsg($uid, $data['to'], $data['body']);
            $r = $this->successSend($ws, $to_fd, ['offline' => 1], 'send msg to_fd success', 104);
        }

        return $this->successSend($ws, $fd, [], 'send msg success - ' . $fd);
    }

    private function __sign($ws, int $fd, array $data)
    {
        if (empty($data['username']) || empty($data['password'])) {
            return $this->disconnect($ws, $fd, "The authentication information is incorrect. Please bring your uid, user name and password with you.");
        }

        $res = self::$FdMapping->login($data['username'], $data['password']);
        if (100 != $res[0]) {
            return $this->disconnect($ws, $fd, $res[1], $res[0]);
        }

        $user = $res[1];
        // 这里应该有一个抢登下线当前fd,检测uid是否在其他终端登录
        // 强制下线并给已经登录的人发送通知
        if (($old_fd = $this->__checkisOnline($user['uid'])) !== false) {
            // 下线通知：您的账号已在别的设备登录-code 107
            $rs = $this->disconnect($ws, $old_fd, "Offline notification: your account is logged on to another device", 107);
            // 清理过期/已断开的连接
            $res = $this->__clearOldSocket($ws, $old_fd, $user['uid']);
        }

        // 设置uid与fd对应关系
        self::$FdMapping->uidBindFd($user['uid'], $fd);
        self::$FdMapping->fdBindUid($fd, $user['uid']);
        self::$FdMapping->setUserLoginLasted($user['uid'], time());
        // Timer::after(500, function() use ($ws, $fd) {
        // 	// 广播更新用户
        // 	$this->__broadcast($ws, $fd);
        // });
        $task_id = $ws->task(['fd' => $fd, 'type' => self::BROADCAT_TYPE], 0);
        //send olddata and del olddata
        return $this->successSend($ws, $fd, [
            'uid' => $user['uid'],
            'users' => self::$FdMapping->getSafeUserList(),
        ], 'sign success');
    }

    private function __checkisOnline(string $uid): ?int
    {
        return !empty(self::$FdMapping->getFdByUid($uid)) ? self::$FdMapping->getFdByUid($uid) : false;
    }

    private function __register($ws, $fd, array $data)
    {
        $res = self::$FdMapping->register($data);
        if (100 != $res[0]) {
            return $this->disconnect($ws, $fd, $res[1], $res[0]);
        }

        return $this->successSend($ws, $fd, [], 'register success');
    }

    private function __getUsers($ws, int $fd, array $data)
    {
        if (!self::$FdMapping->checkExistByUser($data['uid'], 'uid')) {
            return $this->disconnect($ws, $fd, "The user does not exist");
        }

        // Login failure has expired
        if (self::$FdMapping->checkLoginOverdue($data['uid'])) {
            return $this->disconnect($ws, $fd, '长时间未登录了，请重新登录', 107);
        }

        $res = self::$FdMapping->delFd($fd, $data['uid']);

        // 设置uid与fd对应关系
        self::$FdMapping->uidBindFd($data['uid'], $fd);
        self::$FdMapping->fdBindUid($fd, $data['uid']);
        $users = self::$FdMapping->getSafeUserList();

        return $this->successSend($ws, $fd, ['users' => $users], 'lasted userlist', 100);
    }

    private function __logout($ws, int $fd, array $data)
    {
        if (self::$FdMapping->logout($data['uid'], $fd)) {
            return $this->successSend($ws, $fd, [], 'logout', 100);
        }

        return $this->disconnect($ws, $fd, 'not found uid', 101, [], false);
    }

    // 广播
    private function __broadcast($ws, $fd, int $type = 1, $fdMapping = null)
    {
        if ($fdMapping == null) {
            $fdMapping = self::$FdMapping;
        }
        if (1 === $type) {
            $users = $fdMapping->getSafeUserList();
            foreach ($users as $user) {
                $sfd = $fdMapping->getFdByUid($user['uid']);
                if ($sfd === $fd || !$ws->exist($sfd)) continue;
                $this->successSend($ws, $sfd, ['users' => $users], 'lasted userlist', 102);
            }

            return true;
        }
    }

    private function __clearOldSocket($ws, int $old_fd, string $uid)
    {
        // $fds = self::$FdMapping->getFdsByUid($user['uid']);
        // // ->exist():检测fd对应的连接是否存在
        // foreach ($fds as $fd) {
        // 	!$ws->exist($fd) && self::$FdMapping->delFd($fd);
        // }
        return !$ws->exist($old_fd) ? false : self::$FdMapping->delFd($old_fd, $uid);
    }

    protected function successSend($ws, int $fd, array $data = [], string $msg = 'ok', int $code = 100)
    {
        if (empty($fd)) return;
        $this->showMsg('showInfo', $msg);
        $ws->push($fd, json_encode([
            'code' => $code,
            'data' => $data,
            'msg' => $msg,
        ]));
    }

    public function onClose($ws, $fd)
    {
        self::showMsg('showWarning', "client-{$fd} is closed");
        self::$FdMapping->delCurrentFd($fd);
    }

    private static function showMsg($func, $msg)
    {
        if (method_exists(Color::CLASS, $func)) {
            Color::{$func}($msg);
        } else {
            Color::show($msg);
        }

        echo PHP_EOL, PHP_EOL;
    }

    private function disconnect($ws, int $fd, string $msg, int $code = 105, array $data = [], bool $close = true)
    {
        self::showMsg('showError', "code:{$code}\nmsg:{$msg}");
        $jsonData = json_encode([
            'code' => $code,
            'data' => $data,
            'msg' => $msg,
        ]);
        $ws->push($fd, $jsonData);
        // $ws->disconnect($fd);
        $close && $ws->close($fd);
        return false;
    }
}

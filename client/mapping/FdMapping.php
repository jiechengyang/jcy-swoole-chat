<?php declare(strict_types=1);
/**
 * Redis 集合操作
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-26 17:45:50
 */

namespace chat\client\mapping;

use \swoole_table;
use chat\Application as JSWOOLE;

class FdMapping
{
    const MAP_UID_FD_PREFIX = 'chat_map_uid_fd:';
    const MAP_FD_UID_PREFIX = 'chat_map_fd_uid:';
    const MAP_UID_LOGINED_AT_PERFIX = 'chat_map_uid_logined_at:';

    private $redis;

    private $userList;

    private $userConfig;

    private $swoolConfig;

    public function __construct(bool $enableCoroutine = false)
    {
        $redisConfig = JSWOOLE::getRedisConfig();
        $this->userConfig = JSWOOLE::getUserConfig();
        $this->swoolConfig = JSWOOLE::getSwooleConfig();
        if ($enableCoroutine) {
            $this->goRoutineRedis($redisConfig);
        } else {
            $this->connectRedis($redisConfig);
        }
    }

    public function __destruct()
    {
        // TODO: Implement __destruct() method.
        $this->redis->close();
    }

    private function goRoutineRedis(array $redisConfig)
    {
        \Swoole\Runtime::enableCoroutine(true, SWOOLE_HOOK_TCP | SWOOLE_HOOK_UNIX);
        go(function () use ($redisConfig) {
            $this->connectRedis($redisConfig);
        });
    }

    private function connectRedis(array $redisConfig)
    {
        $this->redis = new \Redis();
        if ($redisConfig['pconnect']) {
            $this->redis->pconnect(
                $redisConfig['host'],
                $redisConfig['port'],
                isset($redisConfig['timeout']) ? $redisConfig['timeout'] : 0,
                $redisConfig['persistent_id']
            );
        } else {
            // {timeout}秒超时，重新连接尝试之间延迟{read_timeout}毫秒
            $this->redis->connect(
                $redisConfig['host'],
                $redisConfig['port'],
                isset($redisConfig['timeout']) ? $redisConfig['timeout'] : 0,
                $redisConfig['retry_interval'],
                $redisConfig['read_timeout']
            );
        }

        !empty($redisConfig['password']) && $this->redis->auth($redisConfig['password']);
        // !empty($redisConfig['db']) && $this->redis->swapdb（0，$redisConfig['db']）;
        !empty($redisConfig['db']) && $this->redis->select($redisConfig['db']);
    }

    public function login(string $username, string $password): array
    {
        // $userList = $this->getUserList();
        $user = $this->GetUser($username);
        if (empty($user)) {
            return [103, 'Wrong username or password'];
        }

        if (!$this->checkPassword($password, $user['password'])) {
            return [103, 'Wrong username or password'];
        }

        // $uidByFd = $this->getUidByFd($user['uid']);

        // if (!empty($uidByFd)) {
        //     return [107, 'The account is already logged in on another device'];
        // }

        return [100, $user];
    }

    public function register(array $data): array
    {
        if (empty($data['username'])) return [101, 'Please enter a user name'];
        if (empty($data['password'])) return [101, 'Enter Your PIN'];
        if (empty($data['sex'])) return [101, 'Please enter your sex'];
        if (empty($data['email'])) return [101, 'Please enter your mailbox number'];
        $data['username'] = trim($data['username']);
        $data['sex'] = trim($data['sex']);
        $data['email'] = trim($data['email']);
        $data['password'] = trim($data['password']);
        $data['confirm_passwd'] = trim($data['confirm_passwd']);
        if (preg_match("/^[a-zA-Z0-9]{6,15}$/", $data['username']) === false)
            return [101, "The user name must be composed of 6 to 15 digits of letters and numbers"];
        if (preg_match("/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/", $data['password']) === false)
            return [101, "The password must be made up of at least 6 letters and numbers"];
        if (preg_match("/^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/", $data['email']) === false)
            return [101, "Please enter the correct Email format"];
        if ($data['password'] !== $data['confirm_passwd']) return [101, 'The two passwords are inconsistent'];
        if ($this->checkExistByUser($data['username']))
            return [101, 'The user name is already in use'];
        if ($this->checkExistByUser($data['email'], 'email'))
            return [101, 'The email is already in use'];
        $guid = $this->guid();
        $insData = [
            'uid' => $guid,
            'username' => $data['username'],
            'password' => $this->makePassword($data['password']),
            'sex' => $data['sex'],
            'email' => $data['email']
        ];
        // $userList = $this->getUserList();
        // array_push($userList, $insData);
        if ($this->redis->hset('chat.user', $guid, serialize($insData))) return [100, $guid];
        return [101, "User registration failed"];
    }

    public function getUserList(): array
    {
        $userList = [];
        $dbUser = $this->redis->hgetall('chat.user');
        if (!empty($dbUser)) {
            $userList = array_map(function (& $value) {
                return unserialize($value);
            }, $dbUser);
        }
        return $userList;
    }

    public function getSafeUserList(): array
    {
        $userList = $this->getUserList();
        $users = [];
        if ($userList) {
            foreach ($userList as $user) {
                $user['online'] = empty($this->getFdByUid($user['uid'])) ? 0 : 1;
                unset($user['password']);
                $users[] = $user;
            }
        }

        return $users;

    }

    public function checkExistByUser(string $value, string $skey = 'username'): bool
    {
        $userList = $this->getUserList();// !$this->userList ? $this->getUserList() : $userList;
        $exitFlag = false;
        if (!$userList) return $exitFlag;
        foreach ($userList as $key => $val) {
            if ($val[$skey] === $value) {
                $exitFlag = true;
                break;
            }
        }

        return $exitFlag;
    }

    private function GetUser(string $username)
    {
        $user = null;
        $this->userList = $this->getUserList();
        if (!$this->userList) return $user;
        foreach ($this->userList as $key => $val) {
            if ($val['username'] === $username) {
                $user = $val;
                break;
            }
        }

        return $user;
    }

    public function logout(string $uid, int $fd): bool
    {
        return $this->delFd($fd, $uid) && $this->redis->del(self::MAP_UID_LOGINED_AT_PERFIX . $uid);
    }

    // uid与fd对应，支持多端/多页面
    // public function uidBindFd(string $uid, int $fid)
    // {
    //     $this->redis->sAdd(self::MAP_UID_FD_PREFIX . $uid, $fid);
    // }

    //uid与fd对应，支持多端抢占式登录/有登录会话机制,所以一个放弃多页面
    public function uidBindFd(string $uid, int $fid, int $expire = 24 * 3600)
    {
        $this->redis->setex(self::MAP_UID_FD_PREFIX . $uid, $expire, $fid);
    }

    // fd与uid对应
    public function fdBindUid(int $fid, string $uid, int $expire = 24 * 3600)
    {
        $this->redis->setex(self::MAP_FD_UID_PREFIX . $fid, $expire, $uid);
        // OR next
        // $this->redis->set(self::MAP_FD_UID_PREFIX . $fid, $uid);
        // $this->redis->expireAt('key', $expire);
    }

    // 获取fd对应的uid
    public function getUidByFd($fd)
    {
        // return key
        return $this->redis->get(self::MAP_FD_UID_PREFIX . $fd);
    }

    // 获取uid->fid
    public function getFdByUid($uid)
    {
        return $this->redis->get(self::MAP_UID_FD_PREFIX . $uid);
    }

    // set user login lasted time 
    public function setUserLoginLasted(string $uid, int $logined_at, int $expire = 7 * 24 * 3600)
    {
        $this->redis->setex(self::MAP_UID_LOGINED_AT_PERFIX . $uid, $expire, $logined_at);
    }

    // get user login lasted time 
    public function getUserLoginLasted(string $uid)
    {
        return $this->redis->get(self::MAP_UID_LOGINED_AT_PERFIX . $uid);
    }

    // check user login Overdue
    public function checkLoginOverdue(string $uid)
    {
        $loginAt = $this->getUserLoginLasted($uid);
        if (!empty($userLoginAt)) {
            if ((time() - $loginAt) > $this->userConfig['login_expire_time']) {
                return true;
            }
        }

        return false;
    }

    // 获取uid全部fd，确保多端都能收到信息
    // public function getFdsByUid($uid)
    // {
    //     // 作用: 返回集中中所有的元素
    //     return $this->redis->sMembers(self::MAP_UID_FD_PREFIX . $uid);
    // }

    // 删除uid的某个fd
    public function delFd($fd, $uid = null)
    {
        if (is_null($uid)) {
            $uid = $this->getUidByFd($fd);
        }

        if (!$uid) {
            return false;
        }

        // srem
        // 作用: 删除集合中集为 value1 value2的元素
        // 返回值: 忽略不存在的元素后,真正删除掉的元素的个数
        // $this->redis->srem(self::MAP_UID_FD_PREFIX . $uid, $fd);
        $this->redis->del(self::MAP_UID_FD_PREFIX . $uid, $fd);
        // del
        // 作用: 删除1个或多个键
        // 返回值: 不存在的key忽略掉,返回真正删除的key的数量
        $this->redis->del(self::MAP_FD_UID_PREFIX . $fd);
        return true;
    }

    public function delCurrentFd(int $fd)
    {
        $this->redis->del(self::MAP_FD_UID_PREFIX . $fd);
        return true;
    }

    /**
     * 这个例子对服务器做了基准测试（benchmark），检测服务器能承受多高的 cost
     * 在不明显拖慢服务器的情况下可以设置最高的值
     * 8-10 是个不错的底线，在服务器够快的情况下，越高越好。
     * 以下代码目标为  ≤ 50 毫秒（milliseconds），
     * 适合系统处理交互登录。
     */
    private function benchmarkTestPasswordHash()
    {
        $timeTarget = 0.05; // 50 毫秒（milliseconds） 
        $cost = 8;
        do {
            $cost++;
            $start = microtime(true);
            password_hash("test", PASSWORD_BCRYPT, ["cost" => $cost]);
            $end = microtime(true);
        } while (($end - $start) < $timeTarget);

        echo "Appropriate Cost Found: " . $cost;
    }

    private function makePassword($password, $cost = 9)
    {
        return password_hash($password, PASSWORD_BCRYPT, ["cost" => $cost]);
    }

    private function checkPassword($password, $hashedValue)
    {
        return strlen($hashedValue) === 0 ? false : password_verify($password, $hashedValue);
    }

    public function guid()
    {
        if (function_exists('com_create_guid')) {
            return com_create_guid();
        } else {
            mt_srand(crc32(microtime()));
//            mt_srand((double)microtime() * 10000, mt_getrandmax());
            $charid = strtoupper(md5(uniqid(strval(rand()), true)));
            $hyphen = chr(45);
            $uuid = chr(123)
                . substr($charid, 0, 8) . $hyphen
                . substr($charid, 8, 4) . $hyphen
                . substr($charid, 12, 4) . $hyphen
                . substr($charid, 16, 4) . $hyphen
                . substr($charid, 20, 12)
                . chr(125);
            return $uuid;
        }
    }

    public function saveChatMsg($from, $to, $msg)
    {
        // $table = new swoole_table(1024);
        // $table->column('from', swoole_table::TYPE_STRING, 64);
        // // $table->column('current_from_fd', swoole_table::INT);
        // $table->column('to', swoole_table::TYPE_STRING, 64);
        // // $table->column('current_to_fd', swoole_table::INT);
        // $table->column('msg', swoole_table::TYPE_STRING);
        // $table->create();
        // $table['chat.msg'] = array('from' => $from, 'to' => $to, 'msg' => $msg);
        // return $table;
        $path = $this->swoolConfig['cache']['path'];
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }

        $filename = md5($from . ':' . $to) . '.data';
        $file = $path . DIRECTORY_SEPARATOR . $filename;
        $data = json_encode([$msg, time()]);
        file_put_contents($file, $data . PHP_EOL, FILE_APPEND);
    }

    public function delChatMsg($from, $to)
    {
        unlink(md5($from . ':' . $to) . '.data');
    }
}
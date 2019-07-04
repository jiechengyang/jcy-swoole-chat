<?php
/**
 * 基于redis的聊天
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-27 13:58:51
 */
namespace chat\client;

use chat\helper\Color;

class RedisChatClient implements BaseClient
{
	private static $FdMapping = null;

	public function onStart($server) 
	{
        self::showMsg('display', "Server: start.Swoole version is [".SWOOLE_VERSION."]");
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

	public function onTask(\swoole_server $serv, int $task_id, int $src_worker_id, mixed $data)
	{

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
		if ( !$ws->isEstablished($request->fd) ) {
			return $this->disconnect($ws, $fd, "Not a standard websocket protocol");
		}

		if (! self::$FdMapping) {
        	self::$FdMapping = new \chat\libs\FdMapping(false);
		}

		self::showMsg('display', "server#{$ws->worker_pid}: handshake success with fd#{$request->fd}");
	}

	public function onMessage($ws, $frame) 
	{
		self::showMsg('showInfo', "Message: {$frame->data}");
		$data = json_decode( trim($frame->data), true );
		if ( empty($data) || empty($data['type']) ) {
			return $this->disconnect($ws, $frame->fd, "Illegal access to the server");
		}

		switch ($data['type']) {
			case 'sign':
				return $this->__sign($ws, $frame->fd, $data);
				break;
			case 'register':
				return $this->__register($ws, $frame->fd, $data);
				break;
			default:
				return $this->disconnect($ws, $frame->fd, "Illegal access to the server");
		}
	}

	private function __sign($ws, $fd, array $data)
	{
		if (empty($data['username']) || empty($data['password'])) {
			return $this->disconnect($ws, $frame->fd, "The authentication information is incorrect. Please bring your uid, user name and password with you.");
		}

		$res = self::$FdMapping->login($data['username'], $data['password']);
		if ( 100 != $res[0] ) {
			return $this->disconnect($ws, $fd, $res[1], $res[0]);
		}

		$user = $res[1];
		self::$FdMapping->uidBindFd($user['uid'], $fd);
		return $this->successSend($ws, $fd, ['uid' => $user['uid']], 'sign success');	
	}

	private function __register($ws, $fd, array $data)
	{
		$res = self::$FdMapping->register($data);
		if ( 100 != $res[0] ) {
			return $this->disconnect($ws, $fd, $res[1], $res[0]);
		}

		return $this->successSend($ws, $fd, [], 'register success');
	}

	protected function successSend($ws, int $fd, array $data = [], string $msg = 'ok', int $code = 100)
	{
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

	private function disconnect($ws, int $fd, string $msg, int $code = 101)
	{
		self::showMsg('showError', $msg);
		$jsonData = json_encode([
			'code' => $code,
			'data' => '',
			'msg' => $msg,
		]);
		$ws->push($fd, $jsonData);
		// $ws->disconnect($fd);
		$ws->close($fd);
		return false;
	}	
}

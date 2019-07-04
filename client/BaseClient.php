<?php
/**
 * interface client
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-26 18:09:45
 */
namespace chat\Client;

interface BaseClient
{
	public function onStart($server);
	public function onManagerStart(\swoole_server $serv);
	public function onWorkerStart(\swoole_server $server, int $worker_id);
	public function onTask(\swoole_server $serv, int $task_id, int $src_worker_id, mixed $data);
	public function onConnect($server, int $fd, int $reactorId);
	public function onOpen($ws, $request);
	public function onMessage($ws, $frame);
	public function onClose($ws, $fd);
}
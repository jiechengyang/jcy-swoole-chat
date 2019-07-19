<?php
/**
 * 
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-26 17:50:12
 */
namespace chat\core;
use \Swoole;
use \Swoole\WebSocket\Server as WebSocketServer;
use chat\helper\Color;

class BaseSwoole
{
	private $client;
	private $config;
	private $server;

	public function __construct(array $config)
	{
		try {
			if (!extension_loaded('swoole')) {
				throw new \Exception("no swoole extension. get: https://github.com/matyhtf/swoole");
			}

			// $output = shell_exec("php --ri swoole");
			// Color::showInfo($output);
		} catch (\Exception $e) {
			Color::showError($e->getMessage());
			echo PHP_EOL;
			exit;
		}

		$this->server = new WebSocketServer($config['host'], $config['port']);//\swoole_websocket_server($config['host'], $config['port']);

		$this->server->set($config);
		$this->config = $config;
	}

	public function setClient($client)
	{
		$this->client = $client;
	}

/*	["onStart":"Swoole\Server":private]=>
	NULL
	["onShutdown":"Swoole\Server":private]=>
	NULL
	["onWorkerStart":"Swoole\Server":private]=>
	NULL
	["onWorkerStop":"Swoole\Server":private]=>
	NULL
	["onWorkerExit":"Swoole\Server":private]=>
	NULL
	["onWorkerError":"Swoole\Server":private]=>
	NULL
	["onTask":"Swoole\Server":private]=>
	NULL
	["onFinish":"Swoole\Server":private]=>
	NULL
	["onManagerStart":"Swoole\Server":private]=>
	NULL
	["onManagerStop":"Swoole\Server":private]=>
	NULL
	["onPipeMessage":"Swoole\Server":private]=>*/

	public function run()
	{
		$this->server->on('start', [$this->client, 'onStart']);
		$this->server->on('connect', [$this->client, 'onConnect']);
		$this->server->on('open', [$this->client, 'onOpen']);
		$this->server->on('message', [$this->client, 'onMessage']);
		$this->server->on('close', [$this->client, 'onClose']);

		$events = [
			'onManagerStart',
			'onWorkerStart'
		];

		foreach ($events as $event) {
			if (method_exists($this->client, $event)) {
				$this->server->on(str_replace('on', '', $event), [$this->client, $event]);
			}
		}

		if(!empty($this->config['task_worker_num'])) {
			$this->server->on('Task', [$this->client, 'onTask']);
			$this->server->on('Finish', [$this->client, 'onFinish']);
		}

		$this->server->start();
	}
}
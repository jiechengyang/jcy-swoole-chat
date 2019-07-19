<?php
/**
 * common 配置
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-26 17:39:27
 */

return [
	'root' => ROOT_PATH,
	'swoole' => [
		'log' => [
			'trace' => true,//追踪错误
			'path' => ROOT_PATH . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR . 'logs'
		],
		'cache' => [
			'path' => ROOT_PATH . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR . 'cache'
		]
	],
	'socket' => [
		'host' => '0.0.0.0',
		'port' => 9502,
		'daemonize' => false,
		'heartbeat_check_interval' => 120, // 心跳检测间隔时长(秒)
		'heartbeat_idle_time' => 10 * 60, // 连接最大允许空闲的时间
		'worker_num' => 2, // 工作进程数量. 设置为CPU的1-4倍最合理
		'max_request' => 10000, // 防止 PHP 内存溢出, 一个工作进程处理 X 次任务后自动重启 (注: 0,不自动重启)
		'max_conn' => 1024,// 最大连接数
		'dispatch_mode' => 2,
		'task_worker_num' => 4,
		'log_file' => ROOT_PATH . DIRECTORY_SEPARATOR . 'runtime' . DIRECTORY_SEPARATOR . 'logs' . DIRECTORY_SEPARATOR . 'websocket-swoole.log'
		// 'task_worker_num' => 8,// 任务工作进程数量
	],
	'redis' => [
		'host' => '127.0.0.1',
		'port' => 6379,
		'db' => 0,
		'pconnect' => false,
		'password' => '',
		'timeout'  => 2.5,
		'reserved' => NULL,
		'retry_interval' => NULL,
		'read_timeout'  => 100,
		'persistent_id' => 'JSWOOLE'
	],
	'user' => [
		'login_expire_time' => 1 * 24 * 3600
	]
];
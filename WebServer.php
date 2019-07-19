<?php

$http = new Swoole\Http\Server("0.0.0.0", 9521);

$http->set([
//    'daemonize' => 1,
//    'open_cpu_affinity' => 1,
//    'task_worker_num' => 1,
    //'open_cpu_affinity' => 1,
    //'task_worker_num' => 100,
    //'enable_port_reuse' => true,
    'worker_num' => 1,
    //'log_file' => __DIR__.'/swoole.log',
//    'reactor_num' => 24,
    //'dispatch_mode' => 3,
    //'discard_timeout_request' => true,
//    'open_tcp_nodelay' => true,
//    'open_mqtt_protocol' => true,
    //'task_worker_num' => 1,
    //'user' => 'www-data',
    //'group' => 'www-data',
//'daemonize' => true,
//    'ssl_cert_file' => $key_dir.'/ssl.crt',
//    'ssl_key_file' => $key_dir.'/ssl.key',
//    'enable_static_handler' => true,
//    'document_root' => '/home/htf/workspace/php/www.swoole.com/web/'
]);
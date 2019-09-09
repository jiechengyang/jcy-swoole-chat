<?php
declare(strict_types=1);
/**
 * Created by PhpStorm
 * User: Administrator
 * Author: JieChengYang
 * Date: 2019/9/9
 * Time: 21:36
 */
return [
    'server' => [
        'host' => '0.0.0.0',
        'addr' => 'http://192.168.0.106',
        'port' => 9521,
//        'daemonize' => 1,
//        'open_cpu_affinity' => 1,
//        'task_worker_num' => 1,
//        'enable_port_reuse' => true,
        'worker_num' => 1,
//        'log_file' => __DIR__.'/swoole.log',
//        'reactor_num' => 24,
//        'dispatch_mode' => 3,
//        'discard_timeout_request' => true,
//        'open_tcp_nodelay' => true,
//        'open_mqtt_protocol' => true,
//        'user' => 'www-data',
//        'group' => 'www-data',
//        'ssl_cert_file' => $key_dir.'/ssl.crt',
//        'ssl_key_file' => $key_dir.'/ssl.key',
//        'enable_static_handler' => true,
//        'document_root' => '/home/htf/workspace/php/www.swoole.com/web/'
    ],
    'logs' => [
        'log_path' => RUNTIME_PATH . DIRECTORY_SEPARATOR . 'logs',
        'pid_path' => RUNTIME_PATH . DIRECTORY_SEPARATOR . 'pids',
    ],
    'uploadConfig' => [
        'uploadSaveFilePath' => 'uploads',
        'imageMaxSize'       => 2048000,
        'imageAllowFiles'    => [
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".bmp"
        ],
        'imgAllowFileMimes' => [
            'image/x-ms-bmp',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/png',
            'image/tiff',
            'image/tiff',
            'image/x-targa',
            'image/vnd.adobe.photoshop',
        ],
        'fileMaxSize'       => 4096000,
        "fileAllowFiles"    => [
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".bmp",
            ".flv",
            ".swf",
            ".mkv",
            ".avi",
            ".rm",
            ".rmvb",
            ".mpeg",
            ".mpg",
            ".ogg",
            ".ogv",
            ".mov",
            ".wmv",
            ".mp4",
            ".webm",
            ".mp3",
            ".wav",
            // ".mid",
            ".rar",
            ".zip",
            ".tar",
            // ".gz",
            ".7z",
            // ".bz2",
            // ".cab",
            // ".iso",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
            ".pdf",
            ".txt",
            ".md",
            ".xml"
        ],
    ]
];
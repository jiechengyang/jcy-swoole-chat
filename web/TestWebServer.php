<?php declare(strict_types=1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 15:25
 */
register_shutdown_function('fatalError');
set_error_handler('appError');

function fatalError(): void
{
    header("Connection: close");
    $size = ob_get_length();
    header("Content-Length: $size");
    ob_end_flush();
    flush();
}

function appError($errno, $errstr, $errfile, $errline, array $err_context): void
{
    $errno = $errno & error_reporting();
    if ($errno == 0) return;
    if (!defined('E_STRICT')) define('E_STRICT', 2048);
    if (!defined('E_RECOVERABLE_ERROR')) define('E_RECOVERABLE_ERROR', 4096);
    print "<pre>\n<b>";
    switch ($errno) {
        case E_ERROR:
            print "Error";
            break;
        case E_WARNING:
            print "Warning";
            break;
        case E_PARSE:
            print "Parse Error";
            break;
        case E_NOTICE:
            print "Notice";
            break;
        case E_CORE_ERROR:
            print "Core Error";
            break;
        case E_CORE_WARNING:
            print "Core Warning";
            break;
        case E_COMPILE_ERROR:
            print "Compile Error";
            break;
        case E_COMPILE_WARNING:
            print "Compile Warning";
            break;
        case E_USER_ERROR:
            print "User Error";
            break;
        case E_USER_WARNING:
            print "User Warning";
            break;
        case E_USER_NOTICE:
            print "User Notice";
            break;
        case E_STRICT:
            print "Strict Notice";
            break;
        case E_RECOVERABLE_ERROR:
            print "Recoverable Error";
            break;
        default:
            print "Unknown error ($errno)";
            break;
    }
    print ":</b> <i>$errstr</i> in <b>$errfile</b> on line <b>$errline</b>\n";
    if (function_exists('debug_backtrace')) {
        //print "backtrace:\n";
        $backtrace = debug_backtrace();
        array_shift($backtrace);
        foreach ($backtrace as $i => $l) {
            print "[$i] in function <b>{$l['class']}{$l['type']}{$l['function']}</b>";
            if ($l['file']) print " in <b>{$l['file']}</b>";
            if ($l['line']) print " on line <b>{$l['line']}</b>";
            print "\n";
        }
    }
    print "\n</pre>";
    if (isset($GLOBALS['error_fatal'])) {
        if ($GLOBALS['error_fatal'] & $errno) die('fatal');
    }
}

function error_fatal($mask = NULL)
{
    if (!is_null($mask)) {
        $GLOBALS['error_fatal'] = $mask;
    } elseif (!isset($GLOBALS['die_on'])) {
        $GLOBALS['error_fatal'] = 0;
    }
    return $GLOBALS['error_fatal'];
}

class Http
{
    public static function response(swoole_server $server, int $fd, $data)
    {
        //HTTP/1.1 200
        //Server:SwooleServer
        //Content-Type:text/html;charset=utf8
        //Content-Length:13
        //cache-control: private
        //content-length: 5
        //content-type: text/html; charset=utf-8
        //date: Fri, 19 Jul 2019 07:19:52 GMT
        //server: Tengine
        //status: 200
        //x-frame-options: SAMEORIGIN
        //x-ua-compatible: IE=10
        //        <h1>Hello Swoole.</h1>
        //响应行
        $response = [
            'Http/1.1 200 '
        ];
        //响应头
        $headers = [
            'Server' => 'JswooleServer',
            'Content-Type' => 'text/html;charset=utf-8',
            'Content-Length' => mb_strlen($data),
            'cache-control' => 'private'
        ];
        foreach ($headers as $key => $header) {
            $response[] = $key . ':' . $header;
        }
        //空行
        $response[] = '';
        //响应体
        $response[] = $data;
        $sendData = implode("\r\n", $response);
        $server->send($fd, $sendData);
    }
}

$serv = new swoole_server('127.0.0.1', 9533);
$serv->set([
    'worker_num' => 4,
//    'daemonize' => true,
    'backlog' => 128,
]);
//监听连接进入事件
$serv->on('connect', function ($serv, $fd) {
    echo "Client: Connect.\n";
});

//监听数据接收事件
$serv->on('receive', function ($serv, $fd, $from_id, $data) {
    Http::response($serv, $fd, "<h1>Hello JSWOOLE.</h1>");
});

//监听连接关闭事件
$serv->on('close', function ($serv, $fd) {
    echo "Client: Close.\n";
});


//启动服务器
$serv->start();
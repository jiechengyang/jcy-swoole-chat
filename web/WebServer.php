<?php declare(strict_types=1);
/**
 * swoole web server init file
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 15:49
 */

defined('ROOT_PATH') or define('ROOT_PATH', dirname(__FILE__));
defined('WEB_PATH') or define('WEB_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'public');
defined('RUNTIME_PATH') or define('RUNTIME_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'runtime');
$config = require_once ROOT_PATH . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'main.php';
$config['classPath'] = [];
require_once ROOT_PATH . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
spl_autoload_register('autoLoader');
set_exception_handler('appError');

function appError($exception): void
{
    $exceptionHash = array(
        'className' => 'Exception',
        'message' => $exception->getMessage(),
        'code' => $exception->getCode(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'userAgent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '',
        'trace' => array(),
    );
    $traceItems = $exception->getTrace();
    foreach ($traceItems as $traceItem) {
        $traceHash = array(
            'file' => isset($traceItem['file']) ? $traceItem['file'] : 'null',
            'line' => isset($traceItem['line']) ? $traceItem['line'] : 'null',
            'function' => isset($traceItem['function']) ? $traceItem['function'] : 'null',
            'args' => array(),
        );

        if (!empty($traceItem['class'])) {
            $traceHash['class'] = $traceItem['class'];
        }

        if (!empty($traceItem['type'])) {
            $traceHash['type'] = $traceItem['type'];
        }

        if (!empty($traceItem['args'])) {
            foreach ($traceItem['args'] as $argsItem) {
                $traceHash['args'][] = \var_export($argsItem, true);
            }
        }

        $exceptionHash['trace'][] = $traceHash;
    }
    print_r($exceptionHash);
}

function error_fatal($mask = NULL): ?string
{
    if (!is_null($mask)) {
        $GLOBALS['error_fatal'] = $mask;
    } elseif (!isset($GLOBALS['die_on'])) {
        $GLOBALS['error_fatal'] = 0;
    }
    return $GLOBALS['error_fatal'];
}

function autoLoader(string $class): void
{
    global $config;
    if (isset($config['classPath'][$class])) {
        require_once "" . $config['classPath'][$class] . "";
        return;
    }

    $baseClass = str_replace("\\", DIRECTORY_SEPARATOR, $class) . '.php';
    $classPath = str_replace('App/', '', ROOT_PATH . DIRECTORY_SEPARATOR . $baseClass);
    if (is_file($classPath)) {
        $config['classPath'][$baseClass] = $classPath;
        require_once($classPath);
        return;
    }
}

function initPath($paths)
{
    array_walk($paths, function ($path, $key) {
        !is_dir($path) && mkdir($path, 0770, true);
    });
}

$config['server'] = array_merge($config['server'], [
    'log_file' => $config['logs']['log_path'] . DIRECTORY_SEPARATOR . 'web-swoole.log',
    'pid_file' => $config['logs']['pid_path'] . DIRECTORY_SEPARATOR . 'web-swoole.pid',
    'document_root' => WEB_PATH
]);

$configContainer = \App\libary\BaseConfig::getInstance($config);
$configContainer->loadConfig($config);
$config = null;
initPath([
    $configContainer->getConfig('logs')['log_path'],
    $configContainer->getConfig('logs')['pid_path'],
    WEB_PATH
]);
$http = new Swoole\Http\Server($configContainer->getConfig('server')['host'], $configContainer->getConfig('server')['port']);
//$http->listen('127');---通过监听，我们可以对外创建一个http协议和websocket协议
$http->set($configContainer->getConfig('server'));
//事件执行顺序
//所有事件回调均在$server->start后发生
//服务器关闭程序终止时最后一次事件是onShutdown
//服务器启动成功后，onStart/onManagerStart/onWorkerStart会在不同的进程内并发执行
//onReceive/onConnect/onClose在Worker进程中触发
//Worker/Task进程启动/结束时会分别调用一次onWorkerStart/onWorkerStop
//onTask事件仅在task进程中发生
//onFinish事件仅在worker进程中发生
//onStart/onManagerStart/onWorkerStart 3个事件的执行顺序是不确定的
$http->on('start', function (swoole_server $server) use($configContainer) {
    echo 'jswoole web host#', $configContainer->getConfig('server')['host'], ' port#', $configContainer->getConfig('server')['port'], PHP_EOL;
//    在此事件之前Server已进行了如下操作
//    已创建了manager进程
//    已创建了worker子进程
//    已监听所有TCP/UDP/UnixSocket端口，但未开始Accept连接和请求
//    已监听了定时器
//    接下来要执行
//    主Reactor开始接收事件，客户端可以connect到Server
//    onStart回调中，仅允许echo、打印Log、修改进程名称。不得执行其他操作。onWorkerStart和onStart回调是在不同进程中并行执行的，不存在先后顺序。
//    可以在onStart回调中，将$serv->master_pid和$serv->manager_pid的值保存到一个文件中。这样可以编写脚本，向这两个PID发送信号来实现关闭和重启的操作。
//    onStart事件在Master进程的主线程中被调用
});
//$http->on('ManagerStart', function(swoole_server $serv) {
////    当管理进程启动时调用它
////    在这个回调函数中可以修改管理进程的名称
////    onManagerStart触发时，说明：
////          Task和Worker进程已创建
////Master进程状态不明，因为Manager与Master是并行的，onManagerStart回调发生是不能确定Master进程是否已就绪
//});

//$http->on('WorkStart', function(swoole_server $server,int $work_id) {
//    //此事件在Worker进程/Task进程启动时发生。这里创建的对象可以在进程生命周期内使用
//    //onWorkerStart/onStart是并发执行的，没有先后顺序
//    //可以通过$server->taskworker属性来判断当前是Worker进程还是Task进程
//    //设置了worker_num和task_worker_num超过1时，每个进程都会触发一次onWorkerStart事件，可通过判断$worker_id区分不同的工作进程
//    //由 worker 进程向 task 进程发送任务，task 进程处理完全部任务之后通过onFinish回调函数通知 worker 进程。例如，我们在后台操作向十万个用户群发通知邮件，操作完成后操作的状态显示为发送中，这时我们可以继续其他操作。等邮件群发完毕后，操作的状态自动改为已发送。
////    如果想使用Reload机制实现代码重载入，必须在onWorkerStart中require你的业务文件，而不是在文件头部。在onWorkerStart调用之前已包含的文件，不会重新载入代码。
//});

$http->on('Connect', function (swoole_server $server, int $fd, int $reactorId) {
//    有新的连接进入时，在worker进程中回调
    $fdinfo = $server->getClientInfo($fd);
    $connect_time = date('Y-m-d H:i:s', $fdinfo['connect_time']);
    $last_time = date('Y-m-d H:i:s', $fdinfo['last_time']);
    $msg = "fid#{$fd}reactorId#{$reactorId},  remote_ip#{$fdinfo['remote_ip']},  remote_port#{$fdinfo['remote_port']},  connect_time#{$connect_time},  last_time#{$last_time}";
    echo $msg, PHP_EOL;
});

$http->on('receive', function (swoole_server $serv, int $fd, int $reactor_id, $data) {
});

//$http->on('Request', [App\libary\Http::class, 'receive']);
$http->on('Request', function (\swoole_http_request $req, \swoole_http_response $resp) use ($configContainer) {
    return call_user_func_array([\App\libary\Http::class, 'receive'], [
        $req,
        $resp,
        $configContainer
    ]);
});

$http->on('Close', function (swoole_server $server, int $fd, int $reactorId) {

});

$http->start();

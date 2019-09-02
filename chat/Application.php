<?php declare(strict_types=1);
/**
 *
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-27 14:16:53
 */

namespace chat;

use App\component\Singleton;
use chat\helper\Color;
use chat\core\BaseSwoole;

class Application
{
//    private static $_instance;
    use Singleton;

    private static $config;

    private static $rootPath;

    private static $appFlag = 'chat';

    private static $classPath = [];

    private static $modes = [
        'RedisChatClient' => "chat\\client\\RedisChatClient",
        'SwooleTableChatClient' => "chat\\client\\SwooleTableChatClient",
        'ImClient' => "client\\ImClient",
    ];

    public function __construct($config)
    {
        self::$config = $config;
    }

    public static function getInstance($config)
    {
        if (is_null(self::$_instance) || !(self::$_instance instanceof self)) {
            self::$_instance = new self($config);
        }

        return self::$_instance;
    }

    public function run()
    {
        self::$rootPath = ROOT_PATH;
        spl_autoload_register(__CLASS__ . '::autoLoader');//get_class()
        $this->mkdir();
        $this->errorHandler();
        $this->draw();
        $params = getopt('m:d:');
        if (empty($params['m']) || (!array_key_exists($params['m'], self::$modes))) {
            Color::showError('please chose: RedisChatClient/SwooleTableChatClient/ImClient three modes');
            echo PHP_EOL, PHP_EOL;
            return;
        }

        $client = self::$modes[$params['m']];
        if (isset($params['d']) && $params['d'] === '1') {
            self::$config['socket']['daemonize'] = true;
        }

        $server = new BaseSwoole(self::$config['socket']);
        $server->setClient(new $client());
        $server->run();

    }

    private function draw()
    {
        echo <<<IMG
                    .::::.
                       .::::::::.
                      :::::::::::  JSwoole
                  ..:::::::::::'
                '::::::::::::'
                  .::::::::::
             '::::::::::::::..
                  ..::::::::::::.
                ``::::::::::::::::
                 ::::``:::::::::'        .:::.
                ::::'   ':::::'       .::::::::.
              .::::'      ::::     .:::::::'::::.
             .:::'       :::::  .:::::::::' ':::::.
            .::'        :::::.:::::::::'      ':::::.
           .::'         ::::::::::::::'         ``::::.
       ...:::           ::::::::::::'              ``::.
      ```` ':.          ':::::::::'                  ::::..
                         '.:::::'                    ':'````..
IMG;
        echo PHP_EOL, PHP_EOL;
    }


    // get sys config
    public static function getSwooleConfig(): array
    {
        return self::$config['swoole'];
    }

    public static function getRedisConfig(): array
    {
        return self::$config['redis'];
    }

    public static function getUserConfig(): array
    {
        return self::$config['user'];
    }

    public static function getAesConfig(): array
    {
        return self::$config['aes'];
    }


    /**
     * 创建框架启动的必要目录（日志、swoole real data）
     */
    public function mkdir(): void
    {
        if (!is_dir(self::$config['swoole']['log']['path'])) {
            mkdir(self::$config['swoole']['log']['path'], 0777, true);
        }

    }

    private function errorHandler(): void
    {
        if (SCHAT_DEBUG) {
            set_exception_handler(__CLASS__ . '::exceptionHandler');
        } else {
            error_reporting(E_ALL);
            ini_set('display_errors', 'Off');
            ini_set('log_errors', 'On');
            ini_set('error_log', self::$config['swoole']['log']['path'] . DIRECTORY_SEPARATOR . 'error.log');
        }
    }

    final public static function exceptionHandler($exception): void
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
        if (self::$config['swoole']['log']['trace']) {
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
        }
        print_r($exceptionHash);
    }

    /**
     * @param $class
     * 自动注册
     */
    final public static function autoLoader($class): void
    {
        if (isset(self::$classPath[$class])) {
            require_once "" . self::$classPath[$class] . "";
            return;
        }

        $baseClassPath = str_replace('\\', DIRECTORY_SEPARATOR, $class) . '.php';
        $class = substr($baseClassPath, strpos($baseClassPath, self::$appFlag) + strlen(self::$appFlag) + 1);
        $classPath = str_replace('\\', DIRECTORY_SEPARATOR, self::$rootPath . DIRECTORY_SEPARATOR . $class);
        if (is_file($classPath)) {
            self::$classPath[$class] = $classPath;
            require_once "{$classPath}";
            return;
        }
    }
}
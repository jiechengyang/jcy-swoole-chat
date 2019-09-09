<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 15:49
 */

namespace App\libary;


class Http
{
    public static $request;
    public static $response;
    public static $containers;
    private static $router;

    public static function receive(\swoole_http_request $request, \swoole_http_response $response, BaseConfig $configContainer)
    {
        if ($request->server['path_info'] == '/favicon.ico' || $request->server['request_uri'] == '/favicon.ico') {
            return $response->end();
        }

        // $response->header('Content-Type', 'text/html;charset=utf-8');
        $response->header('Server', 'JswooleServer');
        self::$request = $request;
        self::$response = $response;
        self::$containers['configContainer'] = $configContainer;
        unset($configContainer);
        return self::registerRoute();
    }

    public static function registerRoute()
    {
        if (self::$router === null)  {
            self::$router = Route::getInstance();
        }
        
        return self::$router->run(self::$request, self::$response, self::$containers);
    }

    public static function response(swoole_server $server, int $fd, $data)
    {
    }
}
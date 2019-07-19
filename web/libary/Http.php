<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 15:49
 */

namespace App\Http;


class Http
{
    public static $request;
    public static $response;
    private static $router = null;

    public static function receive(swoole_http_request $request, swoole_http_response $response)
    {
        if ($request->server['path_info'] == '/favicon.ico' || $request->server['request_uri'] == '/favicon.ico') {
            return $response->end();
        }
        self::$request = $request;
        self::$response = $response;
        self::registerRoute();
    }

    public static function registerRoute()
    {
        if (self::$router === null) {
            self::$router = Route::getInstance(self::$request, self::$response);
            self::$router->run();
        }

    }

    public static function response(swoole_server $server, int $fd, $data)
    {
    }
}
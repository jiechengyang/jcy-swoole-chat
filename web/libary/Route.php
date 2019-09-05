<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:11
 */

namespace App\libary;

use App\controller\UserController;
use App\controller\FileController;
use \FastRoute;

class Route
{
    private static $_instance = null;

    protected static $request;

    protected static $response;

    private $header;

    private $server;

    private $queryParams;

    private $postData;

    private $__FILES;

    protected $httpMethod;

    protected $uri;

    private $routeInfo;

    private $dispatcher;

    private $currentController;

    public function __construct()
    {
        $this->dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
            $r->addRoute('GET', '/', function(){
                return 'Hello, World';
            });

            $r->addGroup('/user', function(FastRoute\RouteCollector $r) {
                $this->currentController = new UserController();
                $r->addRoute(['GET', 'POST'], '/login', [$this->currentController, 'actionLogin']);
                $r->addRoute(['GET', 'POST'], '/reg', [$this->currentController, 'actionReg']);
                $r->addRoute(['GET'], '/view/{id:\d+}', [$this->currentController, 'actionView']);
                $r->addRoute(['POST'], '/delete/{id:\d+}', [$this->currentController, 'actionDelete']);
            });

            $r->addGroup('/file', function(FastRoute\RouteCollector $r) {
                $this->currentController = new FileController();
                $r->addRoute('GET', '/index[/{id:\d+}[/{name}]]',  [$this->currentController, 'actionIndex']);
                $r->addRoute('POST', '/upload/{type}', [$this->currentController, 'actionUpload']);
            });
        });
    }

    public static function getInstance()
    {
        if (! self::$_instance instanceof  self) {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function run($request, $response)
    {
        self::$request = $request;
        self::$response = $response;
        $this->initData();
        if (false !== $pos = strpos($this->uri, '?')) {
            $uri = substr($this->uri, 0, $pos);
        }
        $uri = rawurldecode($this->uri);
        $this->routeInfo = $this->dispatcher->dispatch($this->httpMethod, $uri);
        switch ($this->routeInfo[0])  {
            case FastRoute\Dispatcher::NOT_FOUND:
                // ... 404 Not Found 没找到对应的方法
                self::$response->status(404);
                self::$response->end("404 Not Found ");
                break;
            case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
                $allowedMethods = $this->routeInfo[1];
                // ... 405 Method Not Allowed  方法不允许
                self::$response->status(405);
                self::$response->end("405 Method Not Allowed");
                break;
            case FastRoute\Dispatcher::FOUND: // 找到对应的方法
                $handler = $this->routeInfo[1]; // 获得处理函数
                $actionDefaultParams = $this->routeInfo[2]; // 获取请求参数
                // ... call $handler with $vars // 调用处理函数
//                $controller = new \ReflectionClass($handler[0]);
//                $instance  = $controller->newInstanceArgs(); // 相当于实例化Person 类
//                $method = $controller->getMethod('init');
////                $method->invoke($instance);
//                $method->invokeArgs($instance, [$vars, $request, $response]);
                is_object($this->currentController) && $this->currentController->init($request, $response);
                self::$response->end(call_user_func($handler, $actionDefaultParams));//[$vars, self::$request]
                break;
        }
    }

    private function initData()
    {
        $this->header = self::$request->header;
        $this->server = self::$request->server;
        $this->queryParams = self::$request->get;
        $this->postData = self::$request->post;
        $this->__FILES = self::$request->files;
        $this->httpMethod = $this->server['request_method'];
        $this->uri = $this->server['request_uri'];
    }

    public function getIsGet():bool
    {
        return 'GET' === strtoupper($this->httpMethod);
    }

    public function getIsPost():bool
    {
        return 'POST' === strtoupper($this->httpMethod);
    }

    public function getRouteInfo():array
    {
        return $this->routeInfo;
    }
}
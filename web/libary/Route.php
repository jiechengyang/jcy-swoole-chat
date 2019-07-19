<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:11
 */

namespace App\Http;

use App\Controller\UserController;
use App\Controller\FileController;
use \FastRoute;

class Route
{
    private static $_instance = null;

    protected $request;

    protected $response;

    private $header;

    private $server;

    private $queryParams;

    private $postData;

    private $__FILES;

    protected $httpMethod;

    protected $uri;

    private $routeInfo;

    public function __construct($request, $response)
    {
        $this->request = $request;
        $this->$response = $response;
        $this->header = $this->request['header'];
        $this->server = $this->request['server'];
        $this->queryParams = $this->request->get;
        $this->postData = $this->request->post;
        $this->__FILES = $this->request->files;
        $this->httpMethod = $this->server['request_method'];
        $this->uri = $this->server['request_uri'];
    }

    public static function getInstance($request, $response)
    {
        if (! self::$_instance instanceof  self) {
            self::$_instance = new self($request, $response);
        }

        return self::$_instance;
    }

    public function run()
    {
        $dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
            $r->addGroup('/user', function(FastRoute\RouteCollector $r) {
                $userController = new UserController();
                $r->addRoute(['GET', 'POST'], 'login', [$userController, 'actionLogin']);
                $r->addRoute(['GET', 'POST'], 'reg', [$userController, 'actionReg']);
                $r->addRoute(['GET'], 'view/{id:\d+}', [$userController, 'actionView']);
                $r->addRoute(['POST'], 'delete/{id:\d+}', [$userController, 'actionDelete']);
            });

            $r->addGroup('/file', function(FastRoute\RouteCollector $r) {
                $fileController = new FileController();
                $r->addRoute('GET', 'index', [$fileController, 'actionIndex']);
                $r->addRoute('POST', 'upload', [$fileController, 'actionUpload']);
            });
        });

        $this->routeInfo = $dispatcher->dispatch($this->httpMethod, $this->uri);
        switch ($this->routeInfo[0]) {
            case FastRoute\Dispatcher::NOT_FOUND:
                // ... 404 Not Found 没找到对应的方法
                return "404 Not Found ";
                break;
            case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
                $allowedMethods = $this->routeInfo[1];
                // ... 405 Method Not Allowed  方法不允许
                return "405 Method Not Allowed ";
                break;
            case FastRoute\Dispatcher::FOUND: // 找到对应的方法
                $handler = $this->routeInfo[1]; // 获得处理函数
                $vars = $this->routeInfo[2]; // 获取请求参数
                // ... call $handler with $vars // 调用处理函数
                call_user_func($handler, $vars);
                break;
        }
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

    private function render(string $view, array $params = []):void
    {
    }


}
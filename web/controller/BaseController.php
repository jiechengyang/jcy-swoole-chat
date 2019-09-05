<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/24 0024
 * Time: 下午 16:59
 */

namespace App\controller;

use App\libary\BaseHelper;

class BaseController
{
    public $request;

    public $response;

    protected  $header;

    protected  $server;

    protected  $queryParams;

    protected  $postData;

    protected  $__FILES;

    protected  $httpMethod;

    protected  $uri;

    public function __construct()
    {
    }

    public function init($request, $response):void
    {
        $this->request = $request;
        $this->response = $response;
        $this->header = $this->request->header;
        $this->server = $this->request->server;
        $this->queryParams = $this->request->get;
        $this->postData = $this->request->post;
        $this->__FILES = $this->request->files;
        $this->httpMethod = $this->server['request_method'];
        $this->uri = $this->server['request_uri'];
    }

    public function render():string
    {
        // TODO: 加载模板引擎
    }

    public function callback($data, $status = 200):string
    {
        $this->response->status($status);

        return json_encode($data);
    }
}
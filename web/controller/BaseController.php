<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/24 0024
 * Time: 下午 16:59
 */

namespace App\controller;


class BaseController
{
    public $request;

    public $response;

    public $vars;

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

    public function init($vars, $request, $response):void
    {
        $this->vars = $vars;
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

    public function callback($data):string
    {
        return json_encode($data);
    }
}
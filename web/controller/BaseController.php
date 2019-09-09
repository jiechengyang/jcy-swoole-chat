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

    protected $containers;

    public function __construct()
    {
    }

    public function init($request, $response, $containers):void
    {
        $this->request = $request;
        $this->response = $response;
        $this->containers = $containers;
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

    public function getContainer($key)
    {
        if (!isset($this->containers[$key])) {
            throw new \Exception("This class not exists!");
        }

        return $this->containers[$key];
    }

    public function getHostInfo(): ?string
    {
        if (!empty($this->server['http_host'])) {
            return $this->server['http_host'];
        }

        if (isset($this->server['server_addr'])) {
            $serverTag = $this->server['server_addr'];
        } elseif (isset($this->server['server_name'])) {
            $serverTag = $this->server['server_name'];
        } else {
            $serverTag = $this->getContainer('configContainer')->getConfig('server')['addr'];
        }
        return $serverTag . ':' . $this->server['server_port'];
    }
}
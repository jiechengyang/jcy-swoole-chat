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

    public function __construct()
    {
    }

    public function init($vars, $request, $response):void
    {
        $this->vars = $vars;
        $this->request = $request;
        $this->response = $response;
    }

    public function render():string
    {

    }

    public function callback():string
    {

    }
}
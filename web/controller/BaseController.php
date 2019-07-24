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

    public function init($vars):void
    {
        isset($vars[0]) && $this->vars = $vars[0];
        isset($vars[1]) && $this->request = $vars[1];
        isset($vars[2]) && $this->response = $vars[2];
    }

    public function render():string
    {

    }

    public function callback():string
    {

    }
}
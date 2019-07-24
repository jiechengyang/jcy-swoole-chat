<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:53
 */

namespace App\controller;


class FileController extends BaseController
{
    public function actionIndex($vars = null)
    {
    	// var_dump(get_class_methods(get_class()));
    	return "<h1>Hello World</h1>";
    }

    public function actionUpload()
    {
    	$this->response->header('content-type', 'application/json; charset=UTF-8', true);
    	return  $this->callback(['statusCode'  => 100,  'data'  =>  ['url'  =>  'uploads/2019/07/23/1111222.jpg', 'name'  =>  'aaaa'],  'msg'  =>  'upload sucess']);
    }
}
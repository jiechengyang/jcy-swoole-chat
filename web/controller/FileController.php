<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:53
 */

namespace App\controller;


class FileController
{
    public function actionIndex($vars = null)
    {
    	// var_dump(get_class_methods(get_class()));
    	var_dump($vars);
    	return "<h1>Hello World</h1>"; 
    }

    public function actionUpload()
    {

    }
}
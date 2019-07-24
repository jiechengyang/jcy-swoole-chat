<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:50
 */

namespace App\controller;


class UserController extends BaseController
{
    public function actionIndex()
    {
        var_dump(get_class_methods(self));
    }

    public function actionLogin()
    {
        var_dump(get_class_methods(self));
    }

    public function actionReg()
    {
        var_dump(get_class_methods(self));
    }

    public function actionView()
    {
        var_dump(get_class_methods(self));
    }

    public function actionDelete()
    {
        var_dump(get_class_methods(self));
    }
}
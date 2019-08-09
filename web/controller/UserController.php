<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:50
 */

namespace App\controller;


/**
 * Class UserController
 * @package App\controller
 */
class UserController extends BaseController
{
    /**
     *
     */
    public function actionIndex()
    {
        // TODO: user list
        var_dump(get_class_methods(self));
    }

    /**
     *
     */
    public function actionLogin()
    {
        // TODO: user login
        var_dump(get_class_methods(self));
    }

    /**
     *
     */
    public function actionReg()
    {
        // TODO: user register
        var_dump(get_class_methods(self));
    }

    /**
     *
     */
    public function actionView()
    {
        // TODO: user info
        var_dump(get_class_methods(self));
    }

    /**
     *
     */
    public function actionDelete()
    {
        // TODO: delete user
        var_dump(get_class_methods(self));
    }
}
<?php
declare(strict_types=1);
/**
 * Created by PhpStorm
 * User: Administrator
 * Author: JieChengYang
 * Date: 2019/9/5
 * Time: 21:35
 */

namespace App\libary;


class BaseHelper
{
    public static function dump(...$params)
    {
        var_dump($params);
    }
}
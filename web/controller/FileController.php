<?php declare(strict_types = 1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:53
 */

namespace App\controller;


/**
 * Class FileController
 * @package App\controller
 */
class FileController extends BaseController
{
    /**
     * @param null $vars
     * @return string
     */
    public function actionIndex($vars = null): string
    {
    	return "<h1>Hello World</h1>";
    }

    /**
     * @return string
     */
    public function actionUpload($params = null): ?string
    {
    	$this->response->header('content-type', 'application/json; charset=UTF-8', true);
    	list('type' => $uploadType) = $params;
    	if ('image' === $uploadType) {
            return  $this->callback(['statusCode'  => 100,  'data'  =>  ['url'  =>  'uploads/2019/07/23/1111222.jpg', 'name'  =>  'aaaa'],  'msg'  =>  'upload sucess']);

        } elseif ('file' === $uploadType) {
            return  $this->callback(['statusCode'  => 100,  'data'  =>  ['url'  =>  'uploads/2019/07/23/1111222.jpg', 'name'  =>  'aaaa'],  'msg'  =>  'upload sucess']);

        } else {
            return $this->callback([
                'statusCode'  => 101,
                'data'  =>  null,
                'msg'  =>  '找不到该类型'
            ], 404);

        }
    }
}
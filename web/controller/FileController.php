<?php declare(strict_types=1);
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/7/19 0019
 * Time: 下午 16:53
 */

namespace App\controller;


use App\libary\Uploader;

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
            $uploadConfig = $this->getContainer('configContainer')->getconfig('uploadConfig');
            $uploadConfig['maxSize'] = $uploadConfig['imageMaxSize'];
            $uploadConfig['allowFiles'] = $uploadConfig['imageAllowFiles'];
            if (empty($this->__FILES['uploadFile'])) {
                return $this->callback([
                    'statusCode' => 101,
                    'data' => null,
                    'msg' => '请选择文件上传'
                ]);
            }

            $uploadFile = $this->__FILES['uploadFile'];
            $uploader = new Uploader($uploadFile, $uploadConfig);
            $res = $uploader->upload();
            return $this->callback([
                'statusCode' => $res['statusCode'],
                'data' => [
                    'url' => $this->getHostInfo() . DIRECTORY_SEPARATOR . $res['fullname'],
                    'name' => $res['title']
                ],
                'msg' => $res['state']]);

        } elseif ('file' === $uploadType) {
            return $this->callback(['statusCode' => 100, 'data' => ['url' => 'uploads/2019/07/23/1111222.jpg', 'name' => 'aaaa'], 'msg' => 'upload sucess']);

        } else {
            return $this->callback([
                'statusCode' => 101,
                'data' => null,
                'msg' => '找不到该类型'
            ], 404);

        }
    }
}
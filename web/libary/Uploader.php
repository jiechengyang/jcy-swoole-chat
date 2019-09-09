<?php
declare(strict_types=1);
/**
 * Created by PhpStorm
 * User: Administrator
 * Author: JieChengYang
 * Date: 2019/9/5
 * Time: 22:28
 */

namespace App\libary;


class Uploader
{
    //上传状态映射表，国际化用户需考虑此处数据的国际化
    private $stateMap = [
        "SUCCESS",
        '文件大小超出 upload_max_filesize 限制',
        '文件大小超出 MAX_FILE_SIZE 限制',
        '文件未被完整上传',
        '没有文件被上传',
        '上传文件为空',
        "ERROR_TMP_FILE" => '临时文件错误',
        "ERROR_TMP_FILE_NOT_FOUND" => '找不到临时文件',
        "ERROR_SIZE_EXCEED" => '文件大小超出网站限制',
        "ERROR_TYPE_NOT_ALLOWED" => '文件类型不允许',
        "ERROR_CREATE_DIR" => '目录创建失败',
        "ERROR_DIR_NOT_WRITEABLE" => '目录没有写权限',
        "ERROR_FILE_MOVE" => '文件保存时出错',
        "ERROR_FILE_NOT_FOUND" => '找不到上传文件',
        "ERROR_WRITE_CONTENT" => '写入文件内容错误',
        "ERROR_UNKNOWN" => '未知错误',
        "ERROR_DEAD_LINK" => '链接不可用',
        "ERROR_HTTP_LINK" => '链接不是http链接',
        "ERROR_SAVE_MYSQL" => '保存数据库失败',
        "ERROR_HTTP_CONTENTTYPE" => '链接contentType不正确'
    ];
    // 默认的文件mimetype
    private $mimeMap = [
        //applications
        // 'application/postscript',
        // 'application/postscript',
        // 'application/octet-stream',
        'application/vnd.ms-word',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'application/vnd.ms-powerpoint',
        'application/pdf',
        'application/xml',
        'application/vnd.oasis.opendocument.text',
        // 'application/x-shockwave-flash',
        // archives
        // 'application/x-gzip',
        // 'application/x-gzip',
        // 'application/x-bzip2',
        // 'application/x-bzip2',
        // 'application/x-bzip2',
        'application/zip',
        'application/x-rar',
        // 'application/x-tar',
        'application/x-7z-compressed',
        // texts
        // 'text/plain',
        // 'text/x-php',
        // 'text/html',
        // 'text/html',
        // 'text/javascript',
        // 'text/css',
        // 'text/rtf',
        // 'text/rtfd',
        // 'text/x-python',
        // 'text/x-java-source',
        // 'text/x-ruby',
        // 'text/x-shellscript',
        // 'text/x-perl',
        // 'text/x-sql',
        // images
        'image/x-ms-bmp',
        'image/jpeg',
        'image/jpeg',
        'image/gif',
        'image/png',
        'image/tiff',
        'image/tiff',
        'image/x-targa',
        'image/vnd.adobe.photoshop',
        //audio
        'audio/mpeg',
        'audio/midi',
        'audio/ogg',
        'audio/mp4',
        'audio/wav',
        'audio/x-ms-wma',
        // video
        'video/x-msvideo',
        'video/x-dv',
        'video/mp4',
        'video/mpeg',
        'video/mpeg',
        'video/quicktime',
        'video/x-ms-wmv',
        'video/x-flv',
        'video/x-matroska'
    ];

    // 上传类型
    private $type;

    //上传的目录
    private $uploadPath;

    // 上传的绝对路径
    private $savePath;

    // 上传的相对位置
    private $fullName;

    // 上传后的新文件名
    private $fileName;

    // 上传前的文件名
    private $oldFileName;

    // 文件hash散列算法
    private $hashType = 'md5_file';

    //上传对象 表单上传 $_FILES base64
    private $uploadedFile;

    // 上传参数
    private $config;

    // 上传状态信息
    private $stateInfo;

    // 文件类型
    private $fileType;

    // 文件大小
    private $fileSize;

    // 文件mimeType
    private $fileMime;

    // 用于base64上传
    private $base64Str = '';

    // 是否允许裁剪图片
    private $enableThumb = false;

    // 是否替换成裁剪的路径
    private $replacePath = false;

    // 裁剪图片后的宽度
    private $enableWidth = 220;

    // 裁剪图片后的高度
    private $enableHeight = 160;

    // 缩略图的文件路径
    private $thumbPath;

    private $attachment_id = 0;

    public function __construct($uploadedFile, $config, $path = '', $type = 'upload')
    {
        $this->config = $config;
        $this->type = $type;
        $this->uploadedFile = $uploadedFile;
        $this->mimeMap = isset($this->config['mimeMap']) ? $this->config['mimeMap'] : $this->mimeMap;
        $path = $path ? $path : date('Ym');
        $this->uploadPath = WEB_PATH . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $path;
    }

    public function upload()
    {
        if ('base64' === $this->type) {
            return $this->upBase64();
        } else {
            return $this->uploadOneFile();
        }
    }

    /**
     * 上传错误检查
     * @param $errCode
     * @return string
     */
    private function returnStateInfo($errCode)
    {
        return !$this->stateMap[$errCode] ? $this->stateMap["ERROR_UNKNOWN"] : $this->stateMap[$errCode];
    }

    /**
     * 文件类型检测
     * @return bool
     */
    private function checkType()
    {
        return in_array(strtolower($this->fileType), $this->config["allowFiles"]);
    }

    /**
     * 文件大小检测
     * @return bool
     */
    private function checkSize()
    {
        return $this->fileSize <= ($this->config["maxSize"]);
    }

    private function checkIsUploadImg()
    {
        return strpos($this->fileMime, 'image') === 0 ? true : false;
    }

    /**
     * [checkMime 文件mime检查]
     * @return [type] [description]
     */
    private function checkMime($mime = null)
    {
        $mime = empty($mime) ? $this->fileMime : $mime;
        return in_array(strtolower($mime), $this->mimeMap);
    }

    private function checkRealType()
    {
        if (function_exists('getimagesize')) {
            return !@getimagesize($this->savePath) ? false : true;
        }

        return false;
    }

    /**
     * 文件MIME
     */
    private function getFileMime()
    {
        $finfo = finfo_open(FILEINFO_MIME);
        $fileMime = finfo_file($finfo, $this->savePath);
        finfo_close($finfo);

        return explode(';', $fileMime)[0];
    }

    /**
     * [getStateInfo 返回错误信息]
     * @return [type] [description]
     */
    public function getStateInfo()
    {
        return $this->stateInfo;
    }

    /**
     * [uniqidFilename 创建新文件名]
     * @return [type] [description]
     */
    private function uniqidFilename()
    {
        return md5(strval(time())) . uniqid();
    }

    /**
     * [getFileSizeFormat 文件大小格式化]
     * @return [type] [description]
     */
    private function getFileSizeFormat()
    {
        $arr = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $e = floor(log($this->fileSize) / log(1024));

        return number_format(($this->fileSize / pow(1024, floor($e))), 2, '.', '') . ' ' . $arr[$e];
    }

    // 自动转换字符集 支持数组转换
    private function autoCharset($fContents, $from = 'gbk', $to = 'utf-8')
    {
        $from = strtoupper($from) == 'UTF8' ? 'utf-8' : $from;
        $to = strtoupper($to) == 'UTF8' ? 'utf-8' : $to;
        if (strtoupper($from) === strtoupper($to) || empty($fContents) || (is_scalar($fContents) && !is_string($fContents))) {
            //如果编码相同或者非字符串标量则不转换
            return $fContents;
        }
        if (function_exists('mb_convert_encoding')) {
            return mb_convert_encoding($fContents, $to, $from);
        } elseif (function_exists('iconv')) {
            return iconv($from, $to, $fContents);
        } else {
            return $fContents;
        }
    }

    /**
     * 文件散列值
     */
    private function getFileHash()
    {
        if (function_exists($this->hashType)) {
            $fun = $this->hashType;
            return $fun($this->autoCharset($this->savePath, 'utf-8', 'gbk'));
        }
    }

    private function uploadOneFile()
    {
        if (empty($this->uploadedFile)) {
            $this->stateInfo = $this->returnStateInfo('ERROR_UNKNOWN');
            return false;
        }


        $this->fileSize = $this->uploadedFile['size'];
        $fileMime = $this->uploadedFile['type'];
        $types = explode('/', $fileMime);
        $ext = end($types);
        $this->fileType = '.' . $ext;
        $this->fileMime = $this->uploadedFile['type'];
        $this->oldFileName = $this->uploadedFile['name'];

        if ($this->uploadedFile['error'] > 0) {
            $this->stateInfo = $this->returnStateInfo($this->uploadedFile['error']);
            return false;
        }

        //检查文件大小是否超出限制
        if (!$this->checkSize()) {
            $this->stateInfo = $this->returnStateInfo("ERROR_SIZE_EXCEED");
            return false;
        }

        //检查是否不允许的文件格式
        if (!$this->checkType()) {
            $this->stateInfo = $this->returnStateInfo("ERROR_TYPE_NOT_ALLOWED");
            return false;
        }

        //检查是否不允许的文件格式
        if (!$this->checkMime()) {
            $this->stateInfo = $this->returnStateInfo("ERROR_TYPE_NOT_ALLOWED");
            return false;
        }


        //创建目录失败
        if (!file_exists($this->uploadPath) && !mkdir($this->uploadPath, 0777, true)) {
            $this->stateInfo = $this->getStateInfo("ERROR_CREATE_DIR");
            return false;
        } else if (!is_writeable($this->uploadPath)) {
            $this->stateInfo = $this->getStateInfo("ERROR_DIR_NOT_WRITEABLE");
            return false;
        }

        $this->fileName = $this->uniqidFilename() . $this->fileType;
        $this->savePath = $this->uploadPath . DIRECTORY_SEPARATOR . $this->fileName;
        $this->fullName = $this->getRelativePath($this->savePath);
        //移动文件 savePath
        if (!(move_uploaded_file($this->uploadedFile["tmp_name"], $this->savePath) && file_exists($this->savePath))) { //移动失败
            $this->stateInfo = $this->getStateInfo("ERROR_FILE_MOVE");
        } else { //移动成功
            $this->stateInfo = $this->stateMap[0];
            $this->fileMime = $this->getFileMime();
            $this->fileHash = $this->getfileHash();
        }

        //检查上传后的文件的mimetype，防止修改文件后缀的文件上传
        $real_mime = $this->getFileMime();
        if (!$this->checkMime($real_mime)) {
            $this->stateInfo = $this->returnStateInfo("ERROR_TYPE_NOT_ALLOWED");
            @unlink($this->savePath);
            return false;
        }

        //图片文件再一次防止修改文件后缀的文件上传
        if ($this->checkIsUploadImg() && !$this->checkRealType()) {
            $this->stateInfo = $this->returnStateInfo("ERROR_TYPE_NOT_ALLOWED");
            @unlink($this->savePath);
            return false;
        }

        $this->stateInfo = $this->stateMap[0];
        return $this->getFileInfo();
    }

    public function getFileInfo()
    {
        return [
            "state" => $this->stateInfo,
            "statusCode" => 200,
            "url" => '',
            "fullname" => $this->fullName,
            "title" => $this->oldFileName,
            "mimeType" => $this->fileMime,
            "size" => $this->fileSize,
            "savePath" => $this->savePath
        ];
    }

    public function getRelativePath(string $absolutePath, string $needle = 'uploads')
    {
        if (false !== $fIndex = stripos($absolutePath, $needle))
            return substr($absolutePath, $fIndex);

        return false;
    }
}
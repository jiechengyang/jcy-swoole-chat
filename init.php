<?php
/**
 * init 程序入口
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-27 14:02:56
 */

defined('ROOT_PATH') or define('ROOT_PATH', __DIR__);
defined('SCHAT_DEBUG') or define('SCHAT_DEBUG', true);// true or false
defined('SCHAT_ENV') or define('SCHAT_ENV', 'dev');// dev or prod

$config = array_merge(
	require_once __DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'common.php',
	require_once __DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'common-local.php'
);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'chat' . DIRECTORY_SEPARATOR . 'Application.php';

(chat\Application::getInstance($config))->run();

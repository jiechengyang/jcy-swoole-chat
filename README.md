# jcy-swoole-chat

# 需求背景
  基于swoole4开发的聊天demo，未使用swoole协程

###基本操作
配置本地文件：
------------
#### touch [/config/common-local.php],内容如下:
```php
return [
    'aes'  => [
        'key' => 'yK6DS3Rh@e1cXgg1',//自己修改
        'iv' => 'T%E3jQIml#9CDJ!g'//自己修改
    ]
];
```
Server运行命令：
--------------
```bash
php init.php -m redisChatClient
```
```bash
php init.php -m SwooleTableChatClient
```
```bash
php init.php -m imChat
```
参数说明：
----------
	-m: 表示三个版本，分别使用三种技术交互
	-d: 守护进程模式运行 如果：php init.php -m redisChatClient -d 就会以守护进程运行服务具体参考swoole文档
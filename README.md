# Swoole-Chat

来源 http://hdj.me/im-server-by-swoole/
Swoole实现即时聊天服务
# 需求背景
就技术面而言，即时通讯对很多人或公司来说已经没有什么门槛，技术方案有如雨后春笋，也各有千秋，也有不少专业提供第三方服务的公司，如云信、融云等等，几个大厂（阿里云、腾讯云）也有提供云服务。

这里要讲一下的是第三方功能非常强大，也兼容各个平台，但是灵活性不够个性需求无法定制。

刚提到技术上已经没有门槛，开源的项目也有不少，基本都是基于长连接+轮询或websocket，长连接的代表有iComet，而websocket的代表有Swoole。

###基本操作
Server运行命令：php init.php -m redisChatClient
			   php init.php -m SwooleTableChatClient
			   php init.php -m imChat

参数说明：
	-m: 表示三个版本，分别使用三种技术交互
	-d: 守护进程模式运行 如果：php init.php -m redisChatClient -d 就会以守护进程运行服务具体参考swoole文档
<?php declare(strict_types=1);
/**
 * SwoolTable版聊天
 * @Authors jiechengyang (2064320087@qq.com)
 * @Link    http://www.boomyang.cn
 * @addTime    2019-06-26 18:16:50
 */

namespace chat\Client;

class SwoolTableChatClient implements BaseClient
{
    public function onStart(\Server $server)
    {

    }

    public function onManagerStart(\swoole_server $serv)
    {

    }

    public function onWorkerStart(\swoole_server $server, int $worker_id)
    {

    }

    public function onConnect(\swoole_server $server, int $fd, int $reactorId)
    {

    }

    public function onOpen($ws, $request)
    {
        var_dump($request->fd, $request->get, $request->server);
    }

    public function onMessage($ws, $frame)
    {
        echo "Message: {$frame->data}\n";
    }

    public function onClose($ws, $fd)
    {
        echo "client-{$fd} is closed\n";
    }
}
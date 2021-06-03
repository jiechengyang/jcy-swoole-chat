<?php


namespace chat\client\helper;


class ServerHelper extends \Swoole\Server\Helper
{
    public static function getAllOptions()
    {
        return self::__allOptions();
    }

    public static function getAllOptionKeys()
    {
        $allOptions = self::__allOptions();

        return array_keys($allOptions);
    }

    protected static function __allOptions()
    {
        return self::GLOBAL_OPTIONS + self::SERVER_OPTIONS + self::PORT_OPTIONS + self::HELPER_OPTIONS;
    }
}
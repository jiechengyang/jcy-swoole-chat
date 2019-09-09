<?php
declare(strict_types=1);
/**
 * Created by PhpStorm
 * User: Administrator
 * Author: JieChengYang
 * Date: 2019/9/9
 * Time: 21:57
 */

namespace App\libary;


use App\component\Singleton;

class BaseConfig
{
    use Singleton;

    private $config;

    public function getConfig(string $key = null)
    {
        return isset($this->config[$key]) ? $this->config[$key] : $this->config;
    }

    public function loadConfig(array $config): void
    {
        $this->config = $config;
    }

    public function setConfig(string $key, ?array $config): void
    {
        $this->config[$key] = $config;
    }

    public function deleteConfig(string $key): void
    {
        $this->config[$key] = null;
    }

    public function existConfig(string $key): bool
    {
        return isset($this->config[$key]);
    }
}
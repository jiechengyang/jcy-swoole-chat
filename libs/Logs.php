<?php declare(strict_types=1);

namespace chat\libs;

class Logs
{
    const LOGGILE = 'action.log';
    const MAX_FILE_SIZE = 1024 * 1024 * 5;

    public static function writeLog(string $contents, ?string $filename = null): void
    {
        $log_file = self::isBack($filename);
        $contents .= PHP_EOL;
        $fp = fopen($log_file, 'a+');
        fwrite($fp, $contents);
        fclose($fp);
    }

    private static function backup($path, $file): bool
    {
        $new_file = $path . DIRECTORY_SEPARATOR . 'action' . '.bak';
        $i = 1;
        while (is_file($new_file)) {
            $new_file = $path . '/action' . $i++ . '.bak';
        }

        return rename($file, $new_file);
    }


    private static function isBack(?string $log_file = null): ?string
    {
        $path = EASYSWOOLE_LOG_DIR . DIRECTORY_SEPARATOR . 'action' . DIRECTORY_SEPARATOR;
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }

        $file = $log_file ? $path . $log_file : $path . self::LOGGILE;
        if (!file_exists($file)) {
            touch($file);

            return $file;
        }

        $file_size = filesize($file);
        clearstatcache(true, $file);
        if (self::MAX_FILE_SIZE >= $file_size) {
            return $file;
        }

        $back_file = self::backup($path, $file);
        // 如果需要备份日志，则$file变成一个新文件touch
        if ($back_file) {
            touch($file);
            return $file;
        }

        return $file;
    }
}
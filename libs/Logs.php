<?php declare(strict_types=1);

namespace chat\libs;

class Logs
{
    const LOGGILE = 'app.log';
    public static $max_file_size = 1024 * 1024 * 5;

    public static function writeLog($contents, $path, $filename = null)
    {
        $log_file = self::isBack($path, $filename);
        $contents .= "\r\n";
        $fp = fopen($log_file, 'a+');
        fwrite($fp, $contents);
        fclose($fp);
    }

    private static function backup($path, $file)
    {
        $res = BytFileHelper::findFiles($path);
        $last_file = end($res);
        preg_match('/action(\d+)/', $last_file, $num);
        if (is_array($num) && !empty($num[1])) {
            $index = $num[1] + 1;
        } else {
            $index = 1;
        }

        $new_file = $path . 'action' . $index . '.bak';

        return rename($file, $new_file);
    }

    private static function isBack($path, $log_file = null)
    {
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
        if (self::$max_file_size >= $file_size) {
            return $file;
        }

        $back_file = self::backup($path, $file);
        if ($back_file) {
            touch($back_file);
            return $back_file;
        }

        return $file;
    }
}
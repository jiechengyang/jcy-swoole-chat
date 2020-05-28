<?php declare(strict_types=1);

namespace chat\libs;

class Aes
{
    use Singleton;
//    private static $_instance = null;
    /**
     * var string $method 加解密方法，可通过openssl_get_cipher_methods()获得,如aes192，aes-128-ecb，aes-256-cbc等
     */
    protected $method;

    /**
     * var string $secret_key 加解密的密钥
     */
    protected $key;

    /**
     * var string $iv 加解密的初始向量，有些方法需要设置比如CBC
     */
    protected $iv;

    /**
     * var string $options
     */
    protected $options;

    /**
     * 构造函数
     *
     * @param string $key 密钥
     * @param string $method 加密方式
     * @param string $iv iv向量
     * @param mixed $options 还不是很清楚
     *
     */
    public function __construct($key, $method = 'aes-128-cbc', $iv = '', $options = OPENSSL_RAW_DATA)
    {
        $this->method = trim($method);
        $this->key = $key;
        $this->iv = $iv;
        $this->options = $options;
    }

//    public static function getInstance($key, $method = 'aes-128-cbc', $iv = '', $options = OPENSSL_RAW_DATA)
//    {
//        if (!(self::$_instance instanceof self)) {
//            self::$_instance = new self($key, $method, $iv, $options);
//        }
//
//        return self::$_instance;
//    }

    /**
     * 加密方法，对数据进行加密，返回加密后的数据
     *
     * @param string $data 要加密的数据
     *
     * @return string
     *
     */
    public function encrypt($data)
    {
        return openssl_encrypt($data, $this->method, $this->key, $this->options, $this->iv);
    }

    /**
     * 解密方法，对数据进行解密，返回解密后的数据
     *
     * @param string $data 要解密的数据
     *
     * @return string
     *
     */
    public function decrypt($data)
    {
        $key = md5($this->key);
        // base64_decode($data)
        return openssl_decrypt($data, $this->method, $this->key, $this->options, $this->iv);
    }

    public function decryptMd5($data)
    {
        $data = base64_decode($data);
        $hash = md5($this->key);
        $cipherText = substr($data, 16);
        $salt = substr($data, 8, 8);
        $rounds = 3;
        $hashSalt = $hash . $salt;
        $md5Hash[] = md5($hashSalt, true);
        $result = $md5Hash[0];
        for ($i = 1; $i < $rounds; $i++) {
            $md5Hash[$i] = md5($md5Hash[$i - 1] . $hashSalt, true);
            $result .= $md5Hash[$i];
        }
        $key = substr($result, 0, 32);
        $iv = substr($result, 32, 16);

        return openssl_decrypt($cipherText, $this->method, $key, $this->options, $iv);//aes-256-cbc true
    }

    public function encryptMd5($data, $options)
    {
        $options = $options || $this->options;
        $hash = md5($this->key);
        $salt = openssl_random_pseudo_bytes(8);
        $salted = '';
        $dx = '';
        while (strlen($salted) < 48) {
            $dx = md5($dx . $hash . $salt, true);
            $salted .= $dx;
        }
        $key = substr($salted, 0, 32);
        $iv = substr($salted, 32, 16);
        $encryptedData = openssl_encrypt($data, $this->method, $key, $options, $iv);//'aes-256-cbc' OPENSSL_RAW_DATA

        return base64_encode('Salted__' . $salt . $encryptedData);
    }

    public function strt2Hex($str)
    {
        $hex = '';
        for ($i = 0; $i < strlen($str); $i++) {
            $hex .= dechex(ord($str[$i]));
        }
        return $hex;
    }

    public function hex2String($hex)
    {
        $string = '';
        for ($i = 0; $i < strlen($hex) - 1; $i += 2) {
            $string .= chr(hexdec($hex[$i] . $hex[$i + 1]));
        }
        return $string;
    }

    private function pkcs7Pad($string, $blocksize = 32)
    {
        $len = strlen($string);
        $pad = $blocksize - ($len % $blocksize);
        $string .= str_repeat(chr($pad), $pad);
        return $string;
    }

    private function pkcs7Unpad($string)
    {
        $pad = ord($string{strlen($string) - 1});
        if ($pad > strlen($string)) {
            return false;
        }
        if (strspn($string, chr($pad), strlen($string) - $pad) != $pad) {
            return false;
        }
        return substr($string, 0, -1 * $pad);
    }

    public function hexParse($hexstring)
    {
        $hexStrLength = strlen($hexstring);
        $words = [];
        for ($i = 0; $i < $hexStrLength; $i += 2) {
            $key = $this->uright($i, 3);
            $words[$key] |= $this->strt2Hex($hexStrLength, $i, 2) << (24 - ($i % 8) * 4);
        }

        return $words;
    }

    private function uright($a, $n)
    {
        $c = 2147483647 >> ($n - 1);

        return $c & ($a >> $n);
    }
}
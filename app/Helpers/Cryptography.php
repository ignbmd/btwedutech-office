<?php

namespace App\Helpers;

class Cryptography
{
    private string $encryptMethod = 'AES-256-CBC';
    private string $key;
    private string $iv;

    public function __construct()
    {
        $mykey = 'ACupOfCoffee';
        $myiv = 'FromForeee';
        $this->key = substr(hash('sha256', $mykey), 0, 32);
        $this->iv = substr(hash('sha256', $myiv), 0, 16);
    }

    public function encrypt(string $value): string
    {
        $base64Value = openssl_encrypt($value, $this->encryptMethod, $this->key, 0, $this->iv);
        $hexValue = bin2hex($base64Value);
        return $hexValue;
    }
}

<?php

namespace App\Helpers;

class Redis
{
  private static $redis;

  private static function init()
  {
    self::$redis = new \Predis\Client([
      'scheme' => 'tcp',
      'host' => env('REDIS_HOST'),
      'port' => env('REDIS_PORT'),
      'password' => env('REDIS_PASSWORD'),
    ]);
  }

  public static function get(array|string $key)
  {
    self::init();
    return self::$redis->get($key);
  }

  public static function delete(array|string $key)
  {
    self::init();
    return self::$redis->del($key);
  }

  public static function set(string $key, string $value, int $ttl = 0)
  {
    self::init();
    return !$ttl ? self::$redis->set($key, $value) : self::$redis->set($key, $value, 'ex', $ttl);
  }

  public static function getList(array|string $key, int $start = 0, int $end = -1)
  {
    self::init();
    return self::$redis->lrange($key, $start, $end);
  }
}

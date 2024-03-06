<?php

namespace App\Helpers;

class Url
{
  public static function combineQueryString(string $url, array $queryAssoc)
  {
    $query = preg_replace('/%5B(?:[0-9]|[1-9][0-9]+)%5D=/', '=', http_build_query($queryAssoc));
    return "{$url}?{$query}";
  }
}

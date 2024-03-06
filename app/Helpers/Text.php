<?php

namespace App\Helpers;

class Text
{
  public static function removeSpecialChars($string)
  {
    $string = str_replace(' ', '_', $string);
    return preg_replace('/[^A-Za-z0-9_.]/', '', $string);
  }
}

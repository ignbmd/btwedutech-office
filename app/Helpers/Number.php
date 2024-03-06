<?php

namespace App\Helpers;

class Number
{
  public static function penyebut($num)
  {
    $num = abs($num);
    $word = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    $temp = "";
    if ($num < 12) {
      $temp = " " . $word[$num];
    } else if ($num < 20) {
      $temp = self::penyebut($num - 10) . " belas";
    } else if ($num < 100) {
      $temp = self::penyebut($num / 10) . " puluh" . self::penyebut($num % 10);
    } else if ($num < 200) {
      $temp = " seratus" . self::penyebut($num - 100);
    } else if ($num < 1000) {
      $temp = self::penyebut($num / 100) . " ratus" . self::penyebut($num % 100);
    } else if ($num < 2000) {
      $temp = " seribu" . self::penyebut($num - 1000);
    } else if ($num < 1000000) {
      $temp = self::penyebut($num / 1000) . " ribu" . self::penyebut($num % 1000);
    } else if ($num < 1000000000) {
      $temp = self::penyebut($num / 1000000) . " juta" . self::penyebut($num % 1000000);
    } else if ($num < 1000000000000) {
      $temp = self::penyebut($num / 1000000000) . " milyar" . self::penyebut(fmod($num, 1000000000));
    } else if ($num < 1000000000000000) {
      $temp = self::penyebut($num / 1000000000000) . " trilyun" . self::penyebut(fmod($num, 1000000000000));
    }
    return $temp;
  }

  public static function terbilang($num)
  {
    if ($num < 0) {
      $result = "minus " . trim(self::penyebut($num));
    } else {
      $result = trim(self::penyebut($num));
    }
    return $result;
  }
}

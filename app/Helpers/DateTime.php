<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateTime
{
  public static function convertToISOString(string|null $date = null, string|null $timezone = null)
  {
    $parsedDate = Carbon::parse($date)->setTimezone($timezone);
    return $parsedDate->format('Y-m-d\TH:i:s.uP');
  }
}

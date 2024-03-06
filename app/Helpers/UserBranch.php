<?php
namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class UserBranch {

  public static function isCentralBranchUser()
  {
    return Auth::user()->branch_code == "PT0000" || Auth::user()->branch_code == null;
  }

  public static function isNonCentralBranchUser()
  {
    return Auth::user()->branch_code != "PT0000" && Auth::user()->branch_code != null;
  }
}

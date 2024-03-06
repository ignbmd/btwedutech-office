<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class UserRole
{

  public static function getAllowed($configKey)
  {
    $positionAllowed = self::getPositionAllowed($configKey);
    $individualAllowed = self::getIndividualAllowed($configKey);
    return array_merge($positionAllowed, $individualAllowed);
  }

  public static function isAdmin()
  {
    return self::isInRoles(['admin']);
  }

  public static function isMentor()
  {
    return self::isInRoles(['mentor']);
  }

  public static function isBranchAdmin()
  {
    return self::isInRoles(['admin_cabang']);
  }

  public static function isBranchHead()
  {
    return self::isInRoles(['kepala_cabang']);
  }

  public static function isKeuangan()
  {
    return self::isInRoles(["keuangan"]);
  }

  public static function isMarketing()
  {
    return self::isInRoles(['internal_marketing', 'admin_marketing', 'marketing_internal', 'marketing_to', 'marketing']) ? 1 : 0;
  }

  public static function isBranchUser()
  {
    $user = Auth::user();
    $centralBranchCodes = ["PT0000", null];
    return !self::isAdmin() && !in_array($user->branch_code, $centralBranchCodes) ? 1 : 0;
  }

  private static function isInRoles(array $roles)
  {
    $user = Auth::user();
    $sameItem = array_intersect($roles, $user->roles ?? []);
    return count($sameItem) > 0;
  }

  private static function getPositionAllowed($configKey)
  {
    $roleConfig = config($configKey);
    $userRoles = Auth::user()->roles ?? [];
    $allowed = [];
    foreach ($userRoles as $role) {
      if (array_key_exists($role, $roleConfig['user'])) {
        $allowed = array_merge($allowed, $roleConfig['user'][$role]['allowed']);
      }
    }
    return $allowed;
  }

  private static function getIndividualAllowed($configKey)
  {
    $module = explode('.', $configKey);
    $module = $module[count($module) - 1];
    if (!$module) return [];
    $userActions = Auth::user()->resources ?? [];
    $allowed = [];
    $moduleAction = "office_v2.$module.";
    foreach ($userActions as $action) {
      if (str_contains($action, $moduleAction)) {
        $allowed[] = str_replace($moduleAction, "", $action);
      }
    }
    return $allowed;
  }
}

<?php

namespace App\Helpers;

class Breadcrumb
{

  private $firstBreadcrumb;

  public static function setFirstBreadcrumb($name, $link) {
    $GLOBALS['firstBreadcrumb'] = [
      'name' => $name,
      'link' => $link
    ];
  }

  public static function getFirstPageBreadcrumb($withLink = false) {
    if($withLink) {
      return $GLOBALS['firstBreadcrumb'];
    }

    $breadcrumbs = [
      'name' => $GLOBALS['firstBreadcrumb']['name']
    ];

    return $breadcrumbs;
  }
}

<?php

namespace App\Http\Controllers\CompetitionMap;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class SkdRankController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Perangkingan SKD', '/peta-persaingan/perangkingan-skd');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/skd-rank/index', compact('breadcrumbs'));
  }
}

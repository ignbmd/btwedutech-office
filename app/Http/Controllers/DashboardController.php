<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Dashboard', '/dashboard');
  }

  public function userRetention() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/dashboard/index', compact('breadcrumbs'));
  }
}

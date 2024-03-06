<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AffiliateDashboardController extends Controller
{
  private $url;
  public function __construct()
  {
    $this->url = "/dashboard-mitra";
  }

  public function index()
  {
    $breadscrumbs = [['name' => 'DashBoard Mitra']];
    return view('pages.affiliate.affiliate-dashboard', compact('breadscrumbs'));
  }
}

<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;


class CompetitionMapController extends Controller
{


  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Peta Persaingan', '/peta-persaingan');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view(
      '/pages/competition-map/index',
      compact('breadcrumbs')
    );
  }
}

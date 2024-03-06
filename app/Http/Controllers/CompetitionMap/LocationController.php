<?php

namespace App\Http\Controllers\CompetitionMap;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class LocationController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Lokasi', '/peta-persaingan/lokasi');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/location/index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah']];
    return view('/pages/location/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit']];
    return view('/pages/location/edit', compact('breadcrumbs'));
  }

  public function detail()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail']];
    return view('/pages/location/detail', compact('breadcrumbs'));
  }
}

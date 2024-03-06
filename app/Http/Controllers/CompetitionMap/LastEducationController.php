<?php

namespace App\Http\Controllers\CompetitionMap;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class LastEducationController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Pendidikan Terakhir', '/peta-persaingan/pendidikan-terakhir');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/last-education/index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah']];
    return view('/pages/last-education/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit']];
    return view('/pages/last-education/edit', compact('breadcrumbs'));
  }
}

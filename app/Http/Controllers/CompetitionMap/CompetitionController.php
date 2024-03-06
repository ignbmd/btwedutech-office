<?php

namespace App\Http\Controllers\CompetitionMap;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class CompetitionController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Kompetisi', '/peta-persaingan/kompetisi');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/competition/index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah']];
    return view('/pages/competition/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit']];
    return view('/pages/competition/edit', compact('breadcrumbs'));
  }
}

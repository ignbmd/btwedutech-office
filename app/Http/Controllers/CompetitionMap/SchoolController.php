<?php

namespace App\Http\Controllers\CompetitionMap;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class SchoolController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Sekolah', '/peta-persaingan/sekolah');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/school/index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah']];
    return view('/pages/school/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit']];
    return view('/pages/school/edit', compact('breadcrumbs'));
  }
}

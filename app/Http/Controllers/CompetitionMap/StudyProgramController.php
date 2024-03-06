<?php

namespace App\Http\Controllers\CompetitionMap;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class StudyProgramController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Program Studi', '/peta-persaingan/program-studi');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/study-program/index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah']];
    return view('/pages/study-program/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit']];
    return view('/pages/study-program/edit', compact('breadcrumbs'));
  }
}

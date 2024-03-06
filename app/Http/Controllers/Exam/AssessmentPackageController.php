<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class AssessmentPackageController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Modul Paket Assessment', 'ujian/paket-assessment');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/exam/assessment-package/index', compact('breadcrumbs'));
  }

  public function showCreateForm()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Modul Paket Assessment']];
    return view('/pages/exam/assessment-package/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Modul Paket Assessment']];
    return view('/pages/exam/assessment-package/edit', compact('breadcrumbs'));
  }
}

<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ModuleController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Modul', 'ujian/modul');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/exam/module/index', compact('breadcrumbs'));
  }

  public function showCreateForm()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Modul']];
    return view('/pages/exam/module/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Modul']];
    return view('/pages/exam/module/edit', compact('breadcrumbs'));
  }

  public function previewQuestion()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Pratinjau Modul Soal']];
    return view('/pages/exam/module/preview', compact('breadcrumbs'));
  }
}

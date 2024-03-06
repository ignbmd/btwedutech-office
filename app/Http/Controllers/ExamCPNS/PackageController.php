<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class PackageController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Modul Paket Soal CPNS', 'ujian-cpns/paket-soal');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/exam-cpns/package/index', compact('breadcrumbs'));
  }

  public function showCreateForm()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Paket Modul Soal CPNS']];
    return view('/pages/exam-cpns/package/create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Modul Paket Soal CPNS']];
    return view('/pages/exam-cpns/package/edit', compact('breadcrumbs'));
  }
}

<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class PackageController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Modul Paket Soal', 'ujian/paket-soal');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam/package/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Modul Paket Soal']];
      return view('/pages/exam/package/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Modul Paket Soal']];
      return view('/pages/exam/package/edit', compact('breadcrumbs'));
    }
}

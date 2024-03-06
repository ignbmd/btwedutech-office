<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;

class PreTestPackageController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Paket Pre-Test', 'ujian/paket-pre-test');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam/pre-test-package/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Paket Pre-Test']];
      return view('/pages/exam/pre-test-package/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Paket Pre-Test']];
      return view('/pages/exam/pre-test-package/edit', compact('breadcrumbs'));
    }
}

<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;

class PostTestPackageController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Paket Post-Test', 'ujian/paket-post-test');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam/post-test-package/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Paket Post-Test']];
      return view('/pages/exam/post-test-package/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Paket Post-Test']];
      return view('/pages/exam/post-test-package/edit', compact('breadcrumbs'));
    }
}

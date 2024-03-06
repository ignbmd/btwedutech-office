<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Http\Controllers\Controller;
use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;

class PostTestPackageController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Paket Post-Test CPNS', 'ujian-cpns/paket-post-test');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam-cpns/post-test-package/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Paket Post-Test CPNS']];
      return view('/pages/exam-cpns/post-test-package/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Paket Post-Test CPNS']];
      return view('/pages/exam-cpns/post-test-package/edit', compact('breadcrumbs'));
    }
}

<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class TryoutPremiumController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Tryout Premium CPNS', 'ujian-cpns/tryout-premium');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam-cpns/tryout-premium/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Tryout Premium CPNS']];
      return view('/pages/exam-cpns/tryout-premium/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Tryout Premium CPNS']];
      return view('/pages/exam-cpns/tryout-premium/edit', compact('breadcrumbs'));
    }
}

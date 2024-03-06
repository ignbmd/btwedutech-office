<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class TryoutPremiumController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Tryout Premium', 'ujian/tryout-premium');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam/tryout-premium/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Tryout Premium']];
      return view('/pages/exam/tryout-premium/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Tryout Premium']];
      return view('/pages/exam/tryout-premium/edit', compact('breadcrumbs'));
    }
}

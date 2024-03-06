<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ModuleController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Modul CPNS', 'ujian-cpns/modul');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam-cpns/module/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Modul CPNS']];
      return view('/pages/exam-cpns/module/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Modul CPNS']];
      return view('/pages/exam-cpns/module/edit', compact('breadcrumbs'));
    }

    public function previewQuestion() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Pratinjau Soal Modul CPNS']];
      return view('/pages/exam-cpns/module/preview', compact('breadcrumbs'));
    }
}

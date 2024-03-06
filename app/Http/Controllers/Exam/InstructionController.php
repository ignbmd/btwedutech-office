<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class InstructionController extends Controller
{
    public function __construct() {
      Breadcrumb::setFirstBreadcrumb('Instruksi', 'ujian/instruksi');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam/instruction/index', compact('breadcrumbs'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Instruksi']];
      return view('/pages/exam/instruction/create', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Instruksi']];
      return view('/pages/exam/instruction/edit', compact('breadcrumbs'));
    }
}

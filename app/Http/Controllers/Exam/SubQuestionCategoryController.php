<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SubQuestionCategoryController extends Controller
{
  public function __construct() {
    Breadcrumb::setFirstBreadcrumb('Sub Kategori Soal', 'ujian/sub-kategori-soal');
  }

  public function index() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/exam/sub-question-category/index', compact('breadcrumbs'));
  }

  public function showCreateForm() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Sub Kategori Soal']];
    return view('/pages/exam/sub-question-category/create', compact('breadcrumbs'));
  }

  public function edit() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Sub Kategori Soal']];
    return view('/pages/exam/sub-question-category/edit', compact('breadcrumbs'));
  }
}

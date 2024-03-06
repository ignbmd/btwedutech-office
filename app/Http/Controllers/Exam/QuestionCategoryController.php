<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class QuestionCategoryController extends Controller
{
  public function __construct() {
    Breadcrumb::setFirstBreadcrumb('Kategori Soal', 'ujian/kategori-soal');
  }

  public function index() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/exam/question-category/index', compact('breadcrumbs'));
  }

  public function showCreateForm() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Kategori Soal']];
    return view('/pages/exam/question-category/create', compact('breadcrumbs'));
  }

  public function edit() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Kategori Soal']];
    return view('/pages/exam/question-category/edit', compact('breadcrumbs'));
  }
}

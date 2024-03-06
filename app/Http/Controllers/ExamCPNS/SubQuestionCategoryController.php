<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class SubQuestionCategoryController extends Controller
{
    public function __construct(){
        Breadcrumb::setFirstBreadcrumb('Sub Kategori Soal CPNS', 'ujian-cpns/sub-kategori-soal');
    }

    public function index()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('/pages/exam-cpns/sub-question-category/index', compact('breadcrumbs'));
    }

    public function showCreateForm(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Sub Kategori CPNS']];
        return view('/pages/exam-cpns/sub-question-category/create', compact('breadcrumbs'));
    }

    public function edit(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Sub Kategori CPNS']];
        return view('/pages/exam-cpns/sub-question-category/edit', compact('breadcrumbs'));
    }
}
<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;


class QuestionCategoryController extends Controller
{
    public function __construct()
    {
        Breadcrumb::setFirstBreadcrumb('Kategori Soal CPNS','ujian-cpns/kategori-soal');
    }

    public function index(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('/pages/exam-cpns/question-category/index', compact('breadcrumbs'));
    }

    public function showCreateForm(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true),['name' => 'Buat Kategori Soal CPNS']];
        return view('/pages/exam-cpns/question-category/create', compact('breadcrumbs'));
    }

    public function edit(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true),['name' => 'Edit Kategori Soal CPNS']];
        return view('/pages/exam-cpns/question-category/edit', compact('breadcrumbs'));
    }
}
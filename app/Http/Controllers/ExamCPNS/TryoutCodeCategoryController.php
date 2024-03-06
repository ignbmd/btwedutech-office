<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TryoutCodeCategoryController extends Controller
{
    public function __construct()
    {
        Breadcrumb::setFirstBreadcrumb('Kategori Tryout Kode CPNS', 'ujian-cpns/kategori-tryout-kode');
    }

    public function index()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('/pages/exam-cpns/tryout-code-category/index', compact('breadcrumbs'));
    }

    public function showCreateForm()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Kategori Tryout Kode CPNS']];
        return view('/pages/exam-cpns/tryout-code-category/create', compact('breadcrumbs'));
    }

    public function edit()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Kategori Tryout Kode CPNS']];
        return view('/pages/exam-cpns/tryout-code-category/edit', compact('breadcrumbs'));
    }
}

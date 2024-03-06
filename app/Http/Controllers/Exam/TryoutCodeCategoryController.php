<?php

namespace App\Http\Controllers\Exam;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TryoutCodeCategoryController extends Controller
{
    public function __construct()
    {
        Breadcrumb::setFirstBreadcrumb('Kategori Tryout Kode', 'ujian/kategori-tryout-kode');
    }

    public function index()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('/pages/exam/tryout-code-category/index', compact('breadcrumbs'));
    }

    public function showCreateForm()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Kategori Tryout Kode']];
        return view('/pages/exam/tryout-code-category/create', compact('breadcrumbs'));
    }

    public function edit()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Kategori Tryout Kode']];
        return view('/pages/exam/tryout-code-category/edit', compact('breadcrumbs'));
    }
}

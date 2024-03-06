<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class PreTestPackageController extends Controller
{
    public function __construct(){
        Breadcrumb::setFirstBreadcrumb('Paket Pre-Test CPNS', 'ujian-cpns/paket-pre-test');
    }

    public function index(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('/pages/exam-cpns/pre-test-package/index', compact('breadcrumbs'));
    }

    public function showCreateForm(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name'=>'Tambah Paket Pre-Test CPNS']];
        return view('/pages/exam-cpns/pre-test-package/create', compact('breadcrumbs'));
    }

    public function edit(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name'=>'Edit Paket Pre-Test CPNS']];
        return view('/pages/exam-cpns/pre-test-package/edit', compact('breadcrumbs'));
    }
}
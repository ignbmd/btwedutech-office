<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;

class InstructionController extends Controller
{
    public function __construct()
    {
        Breadcrumb::setFirstBreadcrumb('Instruksi Soal CPNS', 'ujian-cpns/instruksi');
    }

    public function index(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('/pages/exam-cpns/instruction/index', compact('breadcrumbs'));
    }

    public function showCreateForm(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Instruksi CPNS']];
        return view('/pages/exam-cpns/instruction/create', compact('breadcrumbs'));
    }

    public function edit(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name'=>'Edit Instruksi CPNS']];
        return view('/pages/exam-cpns/instruction/edit', compact('breadcrumbs'));
    }
}
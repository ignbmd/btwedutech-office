<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;

class ExamController extends Controller
{

    public function __construct()
    {
      Breadcrumb::setFirstBreadcrumb('Bank Soal', '/ujian/bank-soal');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam/index', compact('breadcrumbs'));
    }

    public function detail() {
      $breadcrumbs = [
        Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail Soal']
      ];
      return view('/pages/exam/detail-question', compact('breadcrumbs'));
    }

    public function showCreateQuestion() {
      $breadcrumbs = [
        Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Soal']
      ];
      return view('/pages/exam/create-question', compact('breadcrumbs'));
    }

    public function connectQuestion() {
      $breadcrumbs = [
        Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Hubungkan Soal']
      ];
      return view('/pages/exam/connect-question', compact('breadcrumbs'));
    }

    public function smartBTWPreview() {
      $breadcrumbs = [
        Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Pratinjau Tampilan Smart BTW']
      ];
      return view('/pages/exam/smartbtw-preview', compact('breadcrumbs'));
    }

    public function edit() {
      $breadcrumbs = [
        Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Soal']
      ];
      return view('/pages/exam/edit-question', compact('breadcrumbs'));
    }
}

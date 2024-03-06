<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Services\ExamService\StudyMaterial;

class StudyMaterialController extends Controller
{
    private StudyMaterial $studyMaterialService;

    public function __construct(StudyMaterial $studyMaterialService) {
      Breadcrumb::setFirstBreadcrumb('Materi Belajar', 'ujian/materi-belajar');
      $this->studyMaterialService = $studyMaterialService;
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/exam/study-material/index', compact('breadcrumbs'));
    }

    public function create() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Materi Belajar']];
      $s3AWSURL = env("AWS_URL");
      return view('/pages/exam/study-material/create', compact('breadcrumbs', 's3AWSURL'));
    }

    public function edit() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Materi Belajar']];
      $s3AWSURL = env("AWS_URL");
      return view('/pages/exam/study-material/edit', compact('breadcrumbs', 's3AWSURL'));
    }

    public function indexDocument($studyMaterialId) {
      $studyMaterial = $this->studyMaterialService->show((int)$studyMaterialId);
      if(!$studyMaterial) {
        request()->session()->flash("flash-message", [
          "title" => "Terjadi kesalahan",
          "type" => "Error",
          "message" => "Data materi belajar tidak ditemukan"
        ]);
        return redirect()->back();
      };
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Dokumen']];
      return view('/pages/exam/study-material/index-document', compact('breadcrumbs', 'studyMaterial'));
    }

    public function createDocument($studyMaterialId) {
      $studyMaterial = $this->studyMaterialService->show((int)$studyMaterialId);
      if(!$studyMaterial) {
        request()->session()->flash("flash-message", [
          "title" => "Terjadi kesalahan",
          "type" => "Error",
          "message" => "Data materi belajar tidak ditemukan"
        ]);
        return redirect()->back();
      };
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Dokumen', 'link' => "/ujian/materi-belajar/dokumen/$studyMaterialId"], ['name' => 'Tambah Dokumen']];
      $s3AWSURL = env("AWS_URL");
      return view('/pages/exam/study-material/create-document', compact('breadcrumbs', 's3AWSURL', 'studyMaterialId', 'studyMaterial'));
    }

    public function editDocument($studyMaterialId, $documentId) {
      $studyMaterial = $this->studyMaterialService->show((int)$studyMaterialId);
      if(!$studyMaterial) {
        request()->session()->flash("flash-message", [
          "title" => "Terjadi kesalahan",
          "type" => "Error",
          "message" => "Data materi belajar tidak ditemukan"
        ]);
        return redirect()->back();
      };
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Dokumen', 'link' => "/ujian/materi-belajar/dokumen/$studyMaterialId"], ['name' => 'Edit Dokumen']];
      $s3AWSURL = env("AWS_URL");
      return view('/pages/exam/study-material/edit-document', compact('breadcrumbs', 's3AWSURL', 'studyMaterialId', 'studyMaterial'));
    }
}

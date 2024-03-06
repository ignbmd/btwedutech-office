<?php

namespace App\Http\Controllers\StudentProgress;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StudentReportController extends Controller
{
  public function index(Request $request, string $classroom_id, int $student_id)
  {
    $module_type = $request->has('module_type') ? $request->get('module_type') : "ALL_MODULE";
    $stage_type = $request->has('stage_type') ? $request->get('stage_type') : "UMUM";
    $cid = $request->has('cid') ? $request->get('cid') : null;

    $breadcrumbs = [
      [
        "name" => "Laporan Perkembangan Siswa",
        "link" => "/rapor-performa-belajar?stage_type=$stage_type&module_type=$module_type&cid=$cid"
      ],
      ["name" => "Detail Rapor"]
    ];
    return view("pages.student-progress.student-report", compact('classroom_id', 'student_id', 'breadcrumbs'));
  }
}

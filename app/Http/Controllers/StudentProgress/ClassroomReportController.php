<?php

namespace App\Http\Controllers\StudentProgress;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassroomReportController extends Controller
{
  public function index(Request $request)
  {
    $breadcrumbs = [["name" => "Laporan Perkembangan Siswa"]];
    $branch_code = Auth::user()?->branch_code ?? null;
    if (!$branch_code) {
      return redirect('/rapor-performa-belajar');
    }

    return view("pages.student-progress.classroom-report", compact('branch_code', 'breadcrumbs'));
  }
}

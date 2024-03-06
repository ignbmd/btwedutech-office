<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class TrialModuleController extends Controller
{
  public function index()
  {
    $breadcrumbs = [["name" => "Tryout Coba Modul CPNS"]];
    return view("pages.exam-cpns.trial-module.index", compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [["name" => "Tryout Coba Modul CPNS", "link" => "/ujian-cpns/coba-modul"], ["name" => 'Tambah']];
    return view("pages.exam-cpns.trial-module.create", compact('breadcrumbs'));
  }

  public function edit($id)
  {
    $breadcrumbs = [["name" => "Tryout Coba Modul CPNS", "link" => "/ujian-cpns/coba-modul"], ["name" => 'Edit']];
    return view("pages.exam-cpns.trial-module.edit", compact('breadcrumbs'));
  }
}

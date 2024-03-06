<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class TrialModuleController extends Controller
{
  public function index()
  {
    $breadcrumbs = [["name" => "Tryout Coba Modul"]];
    return view("pages.trial-module.index", compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [["name" => "Tryout Coba Modul", "link" => "/ujian/coba-modul"], ["name" => 'Tambah']];
    return view("pages.trial-module.create", compact('breadcrumbs'));
  }

  public function edit($id)
  {
    $breadcrumbs = [["name" => "Tryout Coba Modul", "link" => "/ujian/coba-modul"], ["name" => 'Edit']];
    return view("pages.trial-module.edit", compact('breadcrumbs'));
  }
}

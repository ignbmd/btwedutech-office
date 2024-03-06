<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProyeksiPantukhirScoreController extends Controller
{
  public function index()
  {
    $breadcrumbs = [["name" => "Proyeksi Nilai Pantukhir"]];
    return view("proyeksi-nilai-pantukhir.index", compact("breadcrumbs"));
  }
}

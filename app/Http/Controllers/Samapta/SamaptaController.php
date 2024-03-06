<?php

namespace App\Http\Controllers\Samapta;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SamaptaController extends Controller
{
  private $url;
  public function __construct()
  {
    $this->url = "/samapta";
  }

  public function index()
  {
    $breadcrumbs = [['name' => 'Rapor Penilaian Samapta', 'url' => $this->url]];
    return view('pages.samapta.dashboard', compact('breadcrumbs'));
  }
  public function listClass()
  {
    $breadcrumbs = [['name' => 'Rapor Penilaian Samapta', 'url' => $this->url]];
    return view('pages.samapta.list-class', compact('breadcrumbs'));
  }
  public function studentList()
  {
    $breadcrumbs = [['name' => 'Rapor Penilaian Samapta', 'url' => $this->url]];
    return view('pages.samapta.student-list', compact('breadcrumbs'));
  }
  public function studentReport()
  {
    $breadcrumbs = [['name' => 'Rapor Penilaian Samapta', 'url' => $this->url]];
    return view('pages.samapta.student-report', compact('breadcrumbs'));
  }
  public function detailSession()
  {
    $breadcrumbs = [['name' => 'Detail Sesi Samapta', 'url' => $this->url]];
    return view('pages.samapta.detail-session', compact('breadcrumbs'));
  }
  public function createGlobalExerciseScoreForm()
  {
    $breadcrumbs = [['name' => 'Nilai Samapta Global', 'url' => $this->url], ["name" => "Tambah"]];
    return view('pages.samapta.global-exercise-score.create', compact('breadcrumbs'));
  }

  public function createSessionScoreForm()
  {
    $breadcrumbs = [['name' => 'Nilai Sesi Latihan', 'url' => $this->url], ["name" => "Tambah"]];
    return view('pages.samapta.session-score.create', compact('breadcrumbs'));
  }

  public function editSessionScoreForm()
  {
    $breadcrumbs = [['name' => 'Nilai Sesi Latihan', 'url' => $this->url], ["name" => "Edit"]];
    return view('pages.samapta.session-score.edit', compact('breadcrumbs'));
  }
}

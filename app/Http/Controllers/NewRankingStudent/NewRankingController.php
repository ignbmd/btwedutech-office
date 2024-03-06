<?php

namespace App\Http\Controllers\NewRankingStudent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NewRankingController extends Controller
{
  private $url;
  public function __construct()
  {
    $this->url = "/ranking-siswa";
  }

  public function indexRanking()
  {
    $breadcrumbs = [['name' => 'Ranking Siswa', 'url' => $this->url]];
    return view('pages.ranking-ui.index', compact('breadcrumbs'));
  }
  public function indexFilterProgram()
  {
    $breadcrumbs = [['name' => 'Ranking Siswa', 'url' => $this->url]];
    return view('pages.ranking-ui.filter-program', compact('breadcrumbs'));
  }
}

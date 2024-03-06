<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WithdrawController extends Controller
{
  private $url;
  public function __construct()
  {
    $this->url = "/withdraw";
  }

  public function index()
  {
    $breadcrumbs = [['name' => 'Withdraw', 'url' => $this->url]];
    return view('pages.affiliate.index-withdraw', compact('breadcrumbs'));
  }
  public function process()
  {
    $breadcrumbs = [['name' => 'Withdraw', 'link' => $this->url], ['name' => 'Proses']];
    return view('pages.affiliate.process', compact('breadcrumbs'));
  }
}
<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TaxPaymentController extends Controller
{
  private $url;
  public function __construct()
  {
    $this->url = "/pembayaran-pajak";
  }

  public function index()
  {
    $breadcrumbs = [['name' => 'Pembayaran Pajak', 'url' => $this->url]];
    return view('pages.affiliate.index-tax-payment', compact('breadcrumbs'));
  }
  public function process()
  {
    $breadcrumbs = [['name' => 'Pembayaran Pajak', 'link' => $this->url], ['name' => 'Formulir Tindak Lanjut Pembayaran Pajak']];
    return view('pages.affiliate.process-tax-payment', compact('breadcrumbs'));
  }
}
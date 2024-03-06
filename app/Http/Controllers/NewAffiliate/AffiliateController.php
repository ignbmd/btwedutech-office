<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
  private $url;
  private $affiliateFirstPageBreadcrumbTitle;

  public function __construct()
  {
    $this->affiliateFirstPageBreadcrumbTitle = "Data Mitra";
    $this->url = "/mitra";
  }

  public function index()
  {
    $breadcrumbs = [['name' => $this->affiliateFirstPageBreadcrumbTitle]];
    return view('pages.affiliate.index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [['name' => $this->affiliateFirstPageBreadcrumbTitle, 'link' => $this->url], ['name' => 'Tambah']];
    return view('pages.affiliate.create', compact('breadcrumbs'));
  }

  public function edit()
  {
    $breadcrumbs = [['name' => $this->affiliateFirstPageBreadcrumbTitle, 'link' => $this->url], ['name' => 'Edit']];
    return view('pages.affiliate.edit', compact('breadcrumbs'));
  }

  public function wallet()
  {
    $breadcrumbs = [['name' => $this->affiliateFirstPageBreadcrumbTitle, 'link' => $this->url], ['name' => 'Wallet']];
    return view('pages.affiliate.wallet', compact('breadcrumbs'));
  }

  public function transactionHistory()
  {
    $breadcrumbs = [
      ['name' => $this->affiliateFirstPageBreadcrumbTitle, 'link' => $this->url],
      ['name' => 'Riwayat Transaksi']
    ];
    return view('pages.affiliate.transaction-history', compact('breadcrumbs'));
  }

  public function verification()
  {
    $breadcrumbs = [
      ['name' => $this->affiliateFirstPageBreadcrumbTitle, 'link' => $this->url],
      ['name' => 'Verifikasi']
    ];
    return view('pages.affiliate.verification', compact('breadcrumbs'));
  }

  public function indexBankAccountRequest()
  {
    $breadcrumbs = [['name' => 'Request Update Rekening Bank Mitra']];
    return view('pages.affiliate.bank-account-request', compact('breadcrumbs'));
  }

  public function formProcessBankAccountRequest()
  {
    $breadcrumbs = [['name' => 'Request Update Rekening Bank Mitra'], ["name" => "Proses"]];
    return view('pages.affiliate.bank-account-request-form', compact('breadcrumbs'));
  }
}

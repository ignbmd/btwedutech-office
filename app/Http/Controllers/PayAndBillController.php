<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PayAndBillController extends Controller
{
  public function __construct() {
    Breadcrumb::setFirstBreadcrumb('Bayar & Tagih', 'bayar-dan-tagih');
  }

  public function index() {
    $user = Auth::user();
    $userBranchCode = $user->branch_code;
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];

    if(!$userBranchCode || $userBranchCode == 'PT0000') {
      return view('/pages/pay-and-bill/index', compact('breadcrumbs'));
    } else {
      return view('/pages/pay-and-bill/branch-debt-credit', compact('userBranchCode'));
    }
  }

  public function centralPayDebt() {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), [
      'name' => 'Hutang ke Cabang'
    ]];
    return view('/pages/pay-and-bill/central-pay-debt', compact('breadcrumbs', 'user'));
  }

  public function centralCollectReceivable() {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), [
      'name' => 'Piutang ke Cabang'
    ]];
    return view('/pages/pay-and-bill/central-collect-receivable', compact('breadcrumbs', 'user'));
  }

  public function centralUpadateCollectReceivable() {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), [
      'name' => 'Perbarui Penagihan Piutang'
    ]];
    return view('/pages/pay-and-bill/central-update-collect-receivable', compact('breadcrumbs', 'user'));
  }

  public function showBranchDebtCredit() {

  }

  public function showBranchPaysDebt() {
    return view('/pages/pay-and-bill/branch-pays-debt');
  }

  public function showBranchPaysDebtNow() {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), [
      'name' => 'Bayar Utang ke Pusat'
    ]];
    return view('/pages/pay-and-bill/branch-pays-debt-now', compact('breadcrumbs', 'user'));
  }
}

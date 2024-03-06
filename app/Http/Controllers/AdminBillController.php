<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\BranchService\Branch;
use App\Services\FinanceService\Bill;
use Illuminate\Support\Facades\Auth;

class AdminBillController extends Controller
{
  private Bill $billService;
  private Branch $branchService;

  public function __construct(Bill $billService, Branch $branchService)
  {
    $this->middleware('acl');
    $this->billService = $billService;
    $this->branchService = $branchService;
    Breadcrumb::setFirstBreadcrumb('Tagihan', 'tagihan');
  }

  public function index()
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/bill/admin/index', compact('breadcrumbs', 'allowed', 'user'));
  }

  public function showEditTransaction(string $billId, string $transactionId)
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Detail Tagihan', 'link' => "tagihan/detail/{$billId}"],
      ['name' => 'Perbarui Transaksi Tagihan']
    ];
    return view(
      '/pages/bill/admin/edit-transaction',
      compact('breadcrumbs', 'user', 'allowed', 'billId', 'transactionId')
    );
  }

  public function editFinalDiscount(string $billId)
  {
    $bill = $this->billService->getById($billId);

    $approvedBillTransactionCount = collect($bill->transaction)->where("transaction_status", "APPROVED")->count();
    $isBillHasAnyApprovedTransaction = $approvedBillTransactionCount > 0;
    if($isBillHasAnyApprovedTransaction) {
      return redirect('/tagihan/detail/'.$billId)->with('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Diskon pada tagihan ini tidak dapat diubah'
      ]);
    }

    $user = collect(Auth::user())->first();
    $is_user_pusat = $user['branch_code'] === "PT0000" || $user['brach_code'] == null;
    $allowed = UserRole::getAllowed('roles.bill');

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Detail Tagihan', 'link' => "tagihan/detail/{$billId}"],
      ['name' => 'Edit Diskon Tagihan']
    ];

    if(!$is_user_pusat) {
      return redirect('/tagihan/detail/'.$billId)->with('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Halaman edit diskon hanya bisa diakses oleh user pusat'
      ]);
    }

    return view(
      '/pages/bill/admin/edit-final-discount',
      compact('breadcrumbs', 'user', 'allowed', 'billId')
    );

  }
}

<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\BranchService\Branch;
use App\Services\FinanceService\Bill;
use App\Services\ProfileService\Profile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class BillController extends Controller
{

  private Bill $billService;
  private Branch $branchService;
  private Profile $profileService;

  public function __construct(Bill $billService, Branch $branchService, Profile $profileService)
  {
    $this->billService = $billService;
    $this->branchService = $branchService;
    $this->profileService = $profileService;
    Breadcrumb::setFirstBreadcrumb('Tagihan', 'tagihan');
  }

  public function index(Request $request)
  {
    $this->middleware('acl');
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $is_user_pusat = $user['branch_code'] == "PT0000" || $user['branch_code'] == null;
    $hasTypeQueryParam = $request->has('type');
    $hasBranchCodeQueryParam = $request->has('branch_code');
    $userBranch = $this->branchService->getBranchByCode($user['branch_code']);
    $userBranchTag = property_exists($userBranch, 'tag') && isset($userBranch?->tag) ? $userBranch->tag : "CENTRAL";
    $view = $is_user_pusat ? '/pages/bill/admin/index' : '/pages/bill/index';
    return view($view, compact('breadcrumbs', 'allowed', 'user', 'hasTypeQueryParam', 'hasBranchCodeQueryParam', 'userBranchTag'));
  }

  public function showAll()
  {
    $this->middleware('acl');
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');
    $isAuthorized = count(array_intersect(["*", "show_all_bill"], $allowed)) > 0;

    if (!$isAuthorized) return redirect('/tagihan')->with('flash-message', [
      'title' => 'Warning',
      'type' => 'warning',
      'message' => 'Not Authorized'
    ]);

    $breadcrumbs = [["name" => "Tagihan", 'link' => '/tagihan'], ["name" => "Seluruh Transaksi Tagihan"]];
    return view('/pages/bill/index-all', compact('breadcrumbs', 'allowed', 'user'));
  }

  public function showDetail(string $billId)
  {
    $this->middleware('acl');
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill_detail');
    $bill = $this->billService->getById($billId);
    $approvedBillTransactionCount = collect($bill->transaction)->where("transaction_status", "APPROVED")->count();
    $pendingBillTransactionCount = collect($bill->transaction)->where("transaction_status", "PENDING")->count();
    $student = $this->profileService->getSingleStudent($bill->smartbtw_id);
    $trimmedLowercaseBillTitle = strtolower(preg_replace('/\s+/', '', $bill?->title)) ?? '';

    $isBillHasAnyApprovedTransaction = $approvedBillTransactionCount > 0;
    $isBillHasAnyPendingTransaction = $pendingBillTransactionCount > 0;
    $isBinsusBill = str_contains($trimmedLowercaseBillTitle, 'binsus');
    $isSiplahBill = $bill->product_type === "SIPLAH";
    $isAssessmentProductBill = in_array(
      $bill->product_type,
      [
        "SIPLAH",
        "ASSESSMENT_BUNDLE_PRODUCT",
        "ASSESSMENT_PSYCHOLOG_PRODUCT",
        "BUNDLE_PSYCHOLOG_PRODUCT",
        "ASSESSMENT_PRODUCT",
        " ASSESSMENT_EVENT_PRODUCT"
      ]
    );
    $isReconcile = $bill->is_reconcile;
    $isBillClosed = $bill->status === "CLOSED";
    $isOfflineProduct = $bill->product_type === "OFFLINE_PRODUCT";
    $isCentralBranch = $bill->branch_code === "PT0000" || $bill->branch_tag === "CENTRAL";
    $isFranchiseBranch = $bill->branch_tag === "FRANCHISE";
    $isValidUserRole = UserRole::isAdmin() || UserRole::isKeuangan();
    $isBillReconcileable = !$isReconcile
      && $isBillClosed
      && $isOfflineProduct
      && $isCentralBranch
      && $isValidUserRole;
    $isBillAlreadyReconciled = $isReconcile
      && $isBillClosed
      && $isOfflineProduct
      && $isCentralBranch;
    $isBillReturnable = $isFranchiseBranch
      ? !$isBillHasAnyPendingTransaction && $isValidUserRole
      : !$isReconcile && !$isBillHasAnyPendingTransaction && $isValidUserRole;
    $canEditBillDiscount = $isValidUserRole && !$isBillHasAnyApprovedTransaction;
    $canEditBillStatus = in_array("edit_bill_status", $allowed);
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Detail Transaksi']
    ];
    return view(
      '/pages/bill/detail',
      compact(
        'breadcrumbs',
        'user',
        'allowed',
        'bill',
        'student',
        'billId',
        'isBinsusBill',
        'isOfflineProduct',
        'isBillReconcileable',
        'isBillAlreadyReconciled',
        'isBillHasAnyApprovedTransaction',
        'isBillReturnable',
        'canEditBillDiscount',
        'canEditBillStatus',
        'isSiplahBill',
        'isAssessmentProductBill'
      )
    );
  }

  public function showEdit(string $billId)
  {
    $this->middleware('acl');
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Edit Transaksi'],
    ];
    return view(
      '/pages/bill/edit',
      compact('breadcrumbs', 'user', 'allowed', 'billId'),
    );
  }

  public function showInvoice(string $billId)
  {
    $this->middleware('acl');
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');
    $bill = $this->billService->getById($billId);
    $branch = $this->branchService->getBranchByCode($bill->branch_code);
    $student = $this->profileService->getSingleStudent($bill->smartbtw_id);
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(), ['name' => 'Invoice']];
    $trimmedLowercaseBillTitle = strtolower(preg_replace('/\s+/', '', $bill?->title)) ?? '';
    $isBinsusBill = str_contains($trimmedLowercaseBillTitle, 'binsus');
    $isSiplahBill = $bill->product_type === "SIPLAH";
    $isAssessmentProductBill = in_array($bill->product_type, ["SIPLAH", "ASSESSMENT_BUNDLE_PRODUCT"]);
    return view(
      '/pages/bill/invoice',
      compact('breadcrumbs', 'user', 'allowed', 'bill', 'billId', 'branch', 'student', 'isBinsusBill', 'isSiplahBill', 'isAssessmentProductBill')
    );
  }

  public function showInvoicePdf(string $billId)
  {
    $this->middleware('acl');
    $pdf = $this->billService->getInvoicePdf($billId);
    $pdf->setOption('enable-javascript', true);
    $pdf->setOption('javascript-delay', 13500);
    $pdf->setOption('enable-smart-shrinking', true);
    $pdf->setOption('no-stop-slow-scripts', true);
    return $pdf->stream("invoice-pembayaran-" . time() . ".pdf");
  }

  public function showBillLetterPdf(string $billId)
  {
    $this->middleware('acl');
    $pdf = $this->billService->getBillLetterPdf($billId);
    $pdf->setOption('enable-javascript', true);
    $pdf->setOption('javascript-delay', 13500);
    $pdf->setOption('enable-smart-shrinking', true);
    $pdf->setOption('no-stop-slow-scripts', true);
    return $pdf->stream("tagihan-pembayaran-" . time() . ".pdf");
  }

  public function showCreateTransaction(string $billId)
  {
    $this->middleware('acl');
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');

    $branchCode = $user['branch_code'];
    $branchDetail = $this->branchService->getBranchByCode($branchCode);
    $tag = $branchDetail->tag;

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Detail Tagihan', 'link' => "tagihan/detail/$billId"],
      ['name' => 'Buat Transaksi Baru']
    ];
    return view(
      '/pages/bill/create',
      compact('breadcrumbs', 'user', 'allowed', 'billId', 'tag')
    );
  }

  public function printInvoice(string $billId)
  {
    $this->middleware('acl');
    $bill = $this->billService->getById($billId);
    $branch = $this->branchService->getBranchByCode($bill->branch_code);
    $trimmedLowercaseBillTitle = strtolower(preg_replace('/\s+/', '', $bill?->title)) ?? '';
    $isBinsusBill = str_contains($trimmedLowercaseBillTitle, 'binsus');
    $isSiplahBill = $bill->product_type === "SIPLAH";
    $isAssessmentProductBill = in_array($bill->product_type, ["SIPLAH", "ASSESSMENT_BUNDLE_PRODUCT"]);
    return view('/pages/bill/invoice-print', [
      'bill' => $bill,
      'branch' => $branch,
      'type' => 'print',
      'isBinsusBill' => $isBinsusBill,
      'isSiplahBill' => $isSiplahBill,
      'isAssessmentProductBill' => $isAssessmentProductBill
    ]);
  }

  public function showReceiptPdf(string $transactionId)
  {
    $pdf = $this->billService->getReceiptPdf($transactionId);
    return $pdf->stream("kwitansi-pembayaran-" . time() . ".pdf");
  }

  public function printReceipt(string $transactionId)
  {
    $this->middleware('acl');
    return $this->billService->getReceiptViewHtml($transactionId, 'print');
  }

  public function showEditTransaction(string $billId, string $transactionId)
  {
    $this->middleware('acl');
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.bill');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Detail Tagihan', 'link' => "tagihan/detail/{$billId}"],
      ['name' => 'Perbarui Transaksi Tagihan']
    ];
    return view(
      '/pages/bill/edit-transaction',
      compact('breadcrumbs', 'user', 'allowed', 'billId', 'transactionId')
    );
  }

  public function editBillDueDate($billId)
  {
    $this->middleware('acl');
    $bill = $this->billService->getById($billId);

    $isOwnBranch = $bill->branch_code == auth()->user()->branch_code;
    $isAdmin = auth()->user()->branch_code == "PT0000" || auth()->user()->branch_code == null;

    $canProceed = $isOwnBranch || $isAdmin;

    if (!$canProceed) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/tagihan');
    }

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Detail Tagihan', 'link' => "tagihan/detail/{$billId}"],
      ['name' => 'Perbarui Tanggal Jatuh Tempo Tagihan']
    ];

    return view('/pages/bill/edit-due-date', compact('breadcrumbs', 'billId', 'bill'));
  }

  public function updateBillDueDate(Request $request, $billId)
  {
    $response = $this->billService->updateBillDueDate(["id" => (int)$billId, "due_date" => Carbon::parse($request->due_date)->timezone("Asia/Jakarta")->subtract('hour', 1)->toISOString()]);
    $responseBody = json_decode($response?->body());
    $responseStatus = $response->status();

    if ($responseStatus !== Response::HTTP_CREATED) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => $responseBody?->message
      ]);
    } else {
      request()->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data tanggal jatuh tempo tagihan berhasil diubah'
      ]);
    }
    return redirect('/tagihan');
  }

  public function reconcile($billId)
  {
    $bill = $this->billService->getById($billId);
    if (!$bill) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Proses gagal, silakan coba lagi nanti"
      ]);
      return redirect('/tagihan');
    }

    $isReconcile = $bill->is_reconcile;
    $isBillClosed = $bill->status === "CLOSED";
    $isOfflineProduct = $bill->product_type === "OFFLINE_PRODUCT";
    $isCentralBranch = $bill->branch_code === "PT0000" || $bill->branch_tag === "CENTRAL";
    $isValidUserRole = UserRole::isAdmin() || UserRole::isKeuangan();
    $isBillReconcileable = $isValidUserRole && !$isReconcile && $isBillClosed && $isOfflineProduct && $isCentralBranch;
    $isBillAlreadyReconciled = $isValidUserRole && $isReconcile && $isBillClosed && $isOfflineProduct && $isCentralBranch;

    if ($isBillAlreadyReconciled) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Tagihan ini sudah direkonsiliasi"
      ]);
      return redirect('/tagihan');
    }

    if (!$isBillReconcileable) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Tagihan ini belum dapat direkonsiliasi"
      ]);
      return redirect('/tagihan');
    }

    $reconcileResponse = $this->billService->reconcileBill((int)$billId);
    $reconcileResponseBody = json_decode($reconcileResponse?->body());
    $reconcileResponseStatus = $reconcileResponse->status();

    if ($reconcileResponseStatus !== Response::HTTP_CREATED) {
      Log::error("Fail on attempting to reconcile bill with id: $billId", ["response" => json_encode($reconcileResponseBody)]);
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => $reconcileResponseBody?->message
      ]);
    } else {
      request()->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Proses rekonsiliasi tagihan berhasil'
      ]);
    }
    return redirect('/tagihan');
  }

  public function returnPaymentForm($billId)
  {
    $isAuthorizedUser = UserRole::isAdmin() || UserRole::isKeuangan();
    if (!$isAuthorizedUser) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/tagihan');
    }

    $bill = $this->billService->getById($billId);
    if (!$bill) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Data tagihan tidak ditemukan'
      ]);
      return redirect('/tagihan');
    }

    $hasAnyApprovedTransaction = collect($bill?->transaction)->contains(function ($value, $key) {
      return $value->transaction_status === "APPROVED";
    });

    $hasAnyPendingTransaction = collect($bill?->transaction)->contains(function ($value, $key) {
      return $value->transaction_status === "PENDING";
    });

    $isReconcile = $bill->is_reconcile;
    $isFranchiseBill = $bill->branch_tag === "FRANCHISE";

    if (!$hasAnyApprovedTransaction) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Tagihan belum memiliki transaksi lunas'
      ]);
      return redirect('/tagihan');
    }

    if ($hasAnyPendingTransaction) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Tagihan memiliki transaksi yang masih pending'
      ]);
      return redirect('/tagihan');
    }

    $canProceed = $isFranchiseBill
      ? !$hasAnyPendingTransaction && $isAuthorizedUser
      : !$isReconcile && !$hasAnyPendingTransaction && $isAuthorizedUser;
    if (!$canProceed) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Tagihan sudah direkonsiliasi'
      ]);
      return redirect('/tagihan');
    }

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ["name" => "Detail Tagihan", 'link' => "/tagihan/detail/$billId"],
      ["name" => "Tambah Retur/Diskon Tagihan"]
    ];
    return view("/pages/bill/create-return-payment", compact("breadcrumbs", "billId"));
  }

  public function editBillStatusForm($billId)
  {
    $allowedActions = UserRole::getAllowed('roles.bill');
    $isAuthorized = in_array("edit_bill_status", $allowedActions);
    if (!$isAuthorized) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/tagihan');
    }

    $bill = $this->billService->getById($billId);
    if (!$bill) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Data tagihan tidak ditemukan'
      ]);
      return redirect('/tagihan');
    }
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ["name" => "Detail Tagihan", 'link' => "/tagihan/detail/$billId"],
      ["name" => "Edit Status Tagihan"]
    ];
    return view("/pages/bill/edit-status", compact("breadcrumbs", "bill", "billId"));
  }

  public function updateBillStatus(Request $request, $billId)
  {
    $validator = Validator::make($request->all(), ["status" => 'required'], ["status.required" => "Status harus dipilih"]);
    if ($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();

    $payload = collect($request->all())->only(["status"])->toArray();
    $response = $this->billService->updateBillStatus((int)$billId, $payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if (!$response->successful()) {
      Log::error("An error occured when trying to update bill status", ["payload" => $payload, "response" => $body, "status_code" => $status]);
      return redirect("/tagihan/detail/$billId")->with('flash-message', ['title' => 'Terjadi Kesalahan!', 'type' => 'error', 'message' => 'Proses gagal, silakan coba lagi nanti']);
    }
    return redirect("/tagihan/detail/$billId")->with('flash-message', ['title' => 'Berhasil', 'type' => 'success', 'message' => 'Status tagihan berhasil diperbarui']);
  }

  public function editBillNoteForm($billId)
  {
    $allowedActions = UserRole::getAllowed('roles.bill');
    $isAuthorized = in_array("edit_bill_note", $allowedActions);
    if (!$isAuthorized) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/tagihan');
    }

    $bill = $this->billService->getById($billId);
    if (!$bill) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Data tagihan tidak ditemukan'
      ]);
      return redirect('/tagihan');
    }

    $user = Auth::user();
    $userBranchCode = $user->branch_code;
    if ($userBranchCode !== "PT0000" && $userBranchCode !== $bill->branch_code) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak berhak mengakses halaman ini'
      ]);
      return redirect('/tagihan');
    }

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ["name" => "Detail Tagihan", 'link' => "/tagihan/detail/$billId"],
      ["name" => "Edit Catatan Tagihan"]
    ];
    return view("/pages/bill/edit-note", compact("breadcrumbs", "bill", "billId"));
  }

  public function updateBillNote(Request $request, $billId)
  {
    $validator = Validator::make($request->all(), ["note" => 'required'], ["note.required" => "Catatan harus diisi"]);
    if ($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();

    $response = $this->billService->updateBillNote((int)$billId, $request->note);
    $body = json_decode($response->body());
    $status = $response->status();

    if (!$response->successful()) {
      Log::error("An error occured when trying to update bill note", ["payload" => ["bill_id" => $billId, "note" => $request->note], "response" => $body, "status_code" => $status]);
      return redirect()->back()->with('flash-message', ['title' => 'Terjadi Kesalahan!', 'type' => 'error', 'message' => 'Proses gagal, silakan coba lagi nanti']);
    }
    return redirect("/tagihan/detail/$billId")->with('flash-message', ['title' => 'Berhasil', 'type' => 'success', 'message' => 'Catatan tagihan berhasil diperbarui']);
  }
}

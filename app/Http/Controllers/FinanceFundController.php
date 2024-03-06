<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Helpers\UserRole;
use App\Helpers\Breadcrumb;
use App\Services\FinanceService\TransferFund;
use App\Services\BranchService\Branch;

class FinanceFundController extends Controller
{
  private TransferFund $service;
  private Branch $branchService;

  public function __construct(TransferFund $service, Branch $branchService)
  {
    $this->service = $service;
    $this->branchService = $branchService;
  }

  public function index()
  {
    $breadCrumbTitle = !UserRole::isBranchUser() ? "Transfer Dana" : "Tarik Dana";
    $breadcrumbs = [["name" => $breadCrumbTitle, "link" => null]];
    $page = '';

    $isAuthorized = !UserRole::isBranchUser() || UserRole::isBranchHead();
    if(!$isAuthorized) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/home");
    }
    if (!UserRole::isBranchUser()) $page = '/pages/finance/central-dashboard';
    if (UserRole::isBranchHead()) {
      $userBranch = $this->branchService->getBranchByCode(Auth::user()->branch_code);
      if($userBranch->tag !== "FRANCHISE") {
        request()->session()->flash('flash-message', [
          'title' => 'Terjadi Kesalahan!',
          'type' => 'error',
          'message' => "Anda tidak dapat mengakses halaman ini"
        ]);
        return redirect("/home");
      }
      $page = '/pages/finance/branch-dashboard';
    }
    $user = collect(Auth::user())->first();
    return view($page, compact('user', 'breadcrumbs'));
  }

  public function fundTransfer()
  {
    $breadcrumbs = [["name" => "Transfer Dana", "link" => "/keuangan"], ["name" => "Transfer Dana Pusat", "link" => null]];
    if(UserRole::isBranchUser()) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/keuangan");
    }
    return view('/pages/finance/fund-transfer', compact('breadcrumbs'));
  }

  public function fundWithdraw()
  {
    $breadcrumbs = [["name" => "Tarik Dana", "link" => "/keuangan"], ["name" => "Tarik Dana Cabang", "link" => null]];
    if(!UserRole::isBranchHead()) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/keuangan");
    }

    $userBranch = $this->branchService->getBranchByCode(Auth::user()->branch_code);
    if($userBranch->tag !== "FRANCHISE") {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/home");
    }

    $user = collect(Auth::user())->first();
    return view('/pages/finance/fund-withdraw', compact('user', 'breadcrumbs'));
  }

  public function editFundWithdraw($id)
  {
    $breadcrumbs = [["name" => "Tarik Dana", "link" => "/keuangan"], ["name" => "Ubah Data Penarikan Dana", "link" => null]];
    if(!UserRole::isBranchHead()) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/keuangan");
    }

    $userBranch = $this->branchService->getBranchByCode(Auth::user()->branch_code);
    if($userBranch->tag !== "FRANCHISE") {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/home");
    }

    $user = collect(Auth::user())->first();
    $fundResponse = $this->service->getById($id);
    $fundBody = json_decode($fundResponse->body());
    if($fundBody?->data?->status !== "PENDING") {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Data ini tidak dapat diedit"
      ]);
      return redirect("/keuangan");
    }
    return view('/pages/finance/edit-fund-withdraw', compact('user', 'breadcrumbs'));
  }

  public function fundWithdrawConfirmation($id)
  {
    $breadcrumbs = [["name" => "Transfer Dana", "link" => "/keuangan"], ["name" => "Konfirmasi Penagihan Dana", "link" => null]];
    if(UserRole::isBranchUser()) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/keuangan", compact('breadcrumbs'));
    }
    $fundResponse = $this->service->getById($id);
    $fundBody = json_decode($fundResponse->body());
    if($fundBody?->data?->status !== "PENDING" && $fundBody?->data?->status !== "APPROVED") {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Data ini tidak dapat diedit"
      ]);
      return redirect("/keuangan");
    }
    $user = collect(Auth::user())->first();
    return view('/pages/finance/fund-withdraw-confirmation', compact('user', 'breadcrumbs'));
  }
}

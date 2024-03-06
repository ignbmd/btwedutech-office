<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Services\BranchService\Branch;
use App\Services\SSOService\SSO;

class BranchController extends Controller
{
  private Branch $service;
  private SSO $serviceSSO;

  public function __construct(Branch $branchService, SSO $ssoService) {
    $this->service = $branchService;
    $this->serviceSSO = $ssoService;
    Breadcrumb::setFirstBreadcrumb('Cabang', 'cabang');
  }

  private function checkIsBranchHasOwner($code) {
    $response = $this->serviceSSO->checkBranchHasOwner($code);
    $body = json_decode($response?->body());
    $isBranchHasOwner = $body->data->has_owner;

    return $isBranchHasOwner;
  }

  public function index(Request $request) {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/branch/index', compact('breadcrumbs'));
  }

  public function showAddBranch() {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Cabang']];
    return view('/pages/branch/add', compact('breadcrumbs'));
  }

  public function showAddBranchUser($branchCode) {
    $isBranchHasOwner = $this->checkIsBranchHasOwner($branchCode);
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Cabang']];
    return view('/pages/branch/add-user', compact('breadcrumbs', 'isBranchHasOwner'));
  }

  public function detail(Request $request, $branchCode) {
    $branch = $this->service->getBranchByCode($branchCode);
    $isBranchHasOwner = $this->checkIsBranchHasOwner($branchCode);

    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail Cabang']];
    return view('/pages/branch/detail', compact('breadcrumbs', 'branch', 'isBranchHasOwner'));
  }

  public function showEditBranch(Request $request, $brancId) {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Cabang']];
    return view('/pages/branch/edit', compact('breadcrumbs'));
  }

  public function showEditBranchUser(Request $request, $branchCode, $ssoId) {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Pengguna Cabang']];
    return view('/pages/branch/edit-user', compact('breadcrumbs', 'branchCode'));
  }

  public function listPaymentMethod(Request $request, $branchCode)
  {
    $branch = $this->service->getBranchByCode($branchCode);
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Metode Pembayaran Cabang ' . $branch->name]];
    return view('/pages/branch/list-payment-method', compact('breadcrumbs', 'branch'));
  }

  public function createPaymentMethod(Request $request, $branchCode)
  {
    $branch = $this->service->getBranchByCode($branchCode);
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Metode Pembayaran Cabang '  . $branch->name, 'link' => "/cabang/metode-pembayaran/$branchCode"], ["name" => "Tambah"]];
    return view('/pages/branch/create-payment-method', compact('breadcrumbs', 'branchCode'));
  }
}

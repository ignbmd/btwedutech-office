<?php

namespace App\Http\Controllers;

use App\Helpers\UserRole;
use App\Helpers\Breadcrumb;
use Illuminate\Support\Facades\Auth;
use App\Services\BranchService\Branch;

class SaleController extends Controller
{
  private Branch $serviceBranch;

  public function __construct(Branch $branchService)
  {
    Breadcrumb::setFirstBreadcrumb('Penjualan', 'penjualan');
    $this->serviceBranch = $branchService;
  }

  public function index()
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.sale');
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];

    $branchCode = $user['branch_code'];
    $branchDetail = $this->serviceBranch->getBranchByCode($branchCode);
    $tag = $branchDetail->tag;
    $branchDiscountMethod = $branchDetail->discount_method ? $branchDetail->discount_method : "ALL";

    return view('/pages/sale/index', compact('breadcrumbs', 'user', 'allowed', 'tag', 'branchDiscountMethod'));
  }

  public function indexSiplah()
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.sale');
    $canProceed = in_array("show_index_siplah_sale_page", $allowed);
    if (!$canProceed) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/home");
    }

    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $branchCode = $user['branch_code'];
    $branchDetail = $this->serviceBranch->getBranchByCode($branchCode);
    $tag = $branchDetail->tag;
    $branchDiscountMethod = $branchDetail->discount_method ? $branchDetail->discount_method : "ALL";

    return view(
      '/pages/sale/index-siplah',
      compact('breadcrumbs', 'user', 'allowed', 'tag', 'branchDiscountMethod')
    );
  }

  public function indexAssessment()
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.sale');
    $canProceed = in_array("show_index_assessment_sale_page", $allowed);
    if (!$canProceed) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Anda tidak dapat mengakses halaman ini"
      ]);
      return redirect("/home");
    }

    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $branchCode = $user['branch_code'];
    $branchDetail = $this->serviceBranch->getBranchByCode($branchCode);
    $tag = $branchDetail->tag;
    $branchDiscountMethod = $branchDetail->discount_method ? $branchDetail->discount_method : "ALL";

    return view(
      '/pages/sale/index-assessment',
      compact('breadcrumbs', 'user', 'allowed', 'tag', 'branchDiscountMethod')
    );
  }
}

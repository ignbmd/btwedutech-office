<?php

namespace App\Http\Controllers;

use App\Services\BranchService\Branch;
use App\Services\FinanceService\Bill;
use App\Helpers\Breadcrumb;

class BranchBillController extends Controller
{
  private Branch $branchService;
  private Bill $billFinanceService;

  public function __construct(Branch $branchService, Bill $billFinanceService)
  {
    $this->branchService = $branchService;
    $this->billFinanceService = $billFinanceService;
    Breadcrumb::setFirstBreadcrumb('Tagihan Cabang', 'tagihan-cabang');
  }

  public function index()
  {
    $branches = collect($this->branchService->getBranchs());
    $bills = collect($this->billFinanceService->getByProductType("OFFLINE_PRODUCT"));
    $branchBillCount = $bills->filter(fn ($bill) => $bill->status === "OPEN")->groupBy('branch_code')->map(function ($item, $key) {
      return [
        'count' => $item->count()
      ];
    })->toArray();
    $branches = $branches->map(function ($branch) use ($branchBillCount) {
      $branch->unpaid_bill_count = $branchBillCount[$branch->code]['count'] ?? 0;
      return $branch;
    })->sortByDesc('unpaid_bill_count')->values();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/bill/admin/branch-unpaid-bill', compact('branches', 'breadcrumbs'));
  }
}

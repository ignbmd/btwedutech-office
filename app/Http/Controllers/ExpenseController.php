<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Services\FinanceService\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{

  private Expense $expenseService;

  public function __construct(Expense $expenseService)
  {
    $this->expenseService = $expenseService;
    Breadcrumb::setFirstBreadcrumb('Biaya', '/biaya');
  }

  public function index()
  {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/expense/index', compact('breadcrumbs', 'user'));
  }

  public function showCreateForm()
  {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Tambah Biaya']
    ];
    return view('/pages/expense/create', compact('breadcrumbs', 'user'));
  }

  public function showEditForm($id)
  {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Edit']
    ];
    return view('/pages/expense/edit', compact('breadcrumbs', 'user', 'id'));
  }


  public function showDetail($id)
  {
    $expense = $this->expenseService->getById($id);
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Detail']
    ];
    return view('/pages/expense/detail', compact('breadcrumbs', 'expense'));
  }

  public function printSlip($id)
  {
    $expense = $this->expenseService->getById($id);
    return view('/pages/expense/slip-print', compact('expense'));
  }
}

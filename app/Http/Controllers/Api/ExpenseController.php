<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinanceService\Expense;

class ExpenseController extends Controller
{
  private Expense $expenseService;

  public function __construct(Expense $expenseService)
  {
    $this->expenseService = $expenseService;
  }

  public function getByBranchCode($branchCode)
  {
    $expenses = $this->expenseService->getAllByBranchCode($branchCode);
    return $expenses;
  }

  public function getCalculationByBranchCode($branchCode)
  {
    $calculation = $this->expenseService->getCalculationByBranchCode($branchCode);
    return $calculation;
  }

  public function getById($id)
  {
    $expense = $this->expenseService->getById($id);
    return response()->json($expense);
  }

  public function create(Request $request)
  {
    $response = $this->expenseService->create(
      (array)json_decode($request->get('payload')),
      $request->file('files')
    );
    return response()->json(
      json_decode($response->body()),
      $response->status()
    );
  }

  public function update(Request $request)
  {
    $response = $this->expenseService->update(
      (array)json_decode($request->get('payload')),
      $request->file('files')
    );
    return response()->json(
      json_decode($response->body()),
      $response->status()
    );
  }
}

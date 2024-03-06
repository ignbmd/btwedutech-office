<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinanceService\Account;

class COAController extends Controller
{
  private Account $account;

  public function __construct(Account $account)
  {
    $this->account = $account;
  }

  public function getAccountCategories()
  {
    $categories = $this->account->getAccountCategories();
    return $categories;
  }

  public function getAccounts()
  {
    $accounts = $this->account->getAccounts();
    return $accounts;
  }

  public function getSingleAccount($id)
  {
    $account = $this->account->getSingleAccount($id);
    return $account;
  }

  public function createAccount(Request $request)
  {
    $payload = $request->all();
    $payload["branch_code"] = auth()->user()->branch_code;
    $account = $this->account->createAccount($payload);
    return $account;
  }

  public function updateAccount(Request $request, $id)
  {
    $payload = $request->all();
    $account = $this->account->updateAccount($id, $payload);
    return $account;
  }

  public function getByBranchAndCategoryIds(Request $request)
  {
    $branchCode = $request->get('branch_code');
    $categoryIds = collect($request->get('category_ids'))->map(fn ($id) => (int)$id)->toArray();
    $accounts = $this->account->getByBranchAndCategoryIds($branchCode, $categoryIds);
    return response()->json($accounts);
  }
}

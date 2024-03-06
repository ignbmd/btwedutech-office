<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinanceService\Finance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JournalRecordController extends Controller
{
  private Finance $service;

  public function __construct(Finance $service)
  {
    $this->service = $service;
  }

  public function getAccountTotalAmount(Request $request)
  {
    $query = ["branch_code" => Auth::user()->branch_code, "account_code" => $request->get("account_code")];
    $response = $this->service->getAccountTotalAmount($query);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getAccountTotalAmountByAccountID(string $account_id)
  {
    $response = $this->service->getAccountTotalAmountByAccountID($account_id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

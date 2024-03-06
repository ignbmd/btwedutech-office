<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinanceService\ReturnPayment;

class ReturnPaymentController extends Controller
{
  private ReturnPayment $returnPaymentService;

  public function __construct(ReturnPayment $returnPaymentService)
  {
    $this->returnPaymentService = $returnPaymentService;
  }

  public function store(Request $request)
  {
    $response = $this->returnPaymentService->create($request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

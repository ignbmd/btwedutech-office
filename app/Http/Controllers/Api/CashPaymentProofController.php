<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinanceService\PaymentProof;
use Illuminate\Support\Facades\Auth;

class CashPaymentProofController extends Controller
{
  private PaymentProof $paymentProof;

  public function __construct(PaymentProof $paymentProof)
  {
    $this->paymentProof = $paymentProof;
  }

  public function get()
  {
    $response = $this->paymentProof->get();
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getByBranchCode($branch_code)
  {
    $response = $this->paymentProof->getByBranchCode($branch_code);
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getByID($id)
  {
    $response = $this->paymentProof->getByID($id);
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function create(Request $request)
  {
    $payload = [
      "name" => $request->name,
      "phone" => $request->phone,
      "address" => $request->address,
      "branch_code" => $request->branch_code,
      "amount" => (int)$request->amount,
      "amount_text" => $request->amount_text,
      "payment_for" => $request->payment_for,
      "created_by" => Auth::user()->name
    ];

    $response = $this->paymentProof->create($payload);
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

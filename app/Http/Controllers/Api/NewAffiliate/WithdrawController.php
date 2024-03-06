<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\NewAffiliateService\Withdraw;
use Illuminate\Http\JsonResponse;
use App\Services\SSOService\SSO;
use App\Helpers\S3;


class WithdrawController extends Controller
{
  private Withdraw $withdrawService;
  private SSO $ssoService;

  public function __construct(Withdraw $withdrawService, SSO $ssoService)
  {
    $this->withdrawService = $withdrawService;
    $this->ssoService = $ssoService;
  }

  public function getAll(Request $request)
  {
    $withdrawStatus = $request->has('status') ? $request->get('status') : null;
    $validWithdrawStatuses = ["PENDING", "SUCCESS", "REJECTED"];
    $filterByWithdrawStatus = (bool)$withdrawStatus;
    $isValidStatus = in_array($withdrawStatus, $validWithdrawStatuses);
    if ($filterByWithdrawStatus && !$isValidStatus) {
      $withdrawStatus = "PENDING";
    }

    $response = $this->withdrawService->get($withdrawStatus);
    $body = json_decode($response->body());
    $responseStatus = $response->status();
    return response()->json($body, $responseStatus);
  }

  public function getByStatus()
  {
    $response = $this->withdrawService->getWithdrawStatusPending();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getById(int $id)
  {
    $response = $this->withdrawService->getById($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function processWithdraw(Request $request, int $id): JsonResponse
  {
    $payment_photo_file = $request->file('payment_photo');
    $payment_photo_url = null;

    if ($payment_photo_file) {
      $payment_photo_url = S3::storeOriginal("/uploads/office/affiliate/withdraw/payment/photo", $payment_photo_file);
    }
    $payload = [
      "amount" => (int)$request->amount,
      "payment_photo" => $payment_photo_url,
      "status" => $request->status_transaction,
      "affiliate_id" => (int)$request->affiliate_id,
      "created_by" => $request->created_by,
      "updated_by" => $request->updated_by,
      "reason" => $request->reason
    ];
    $response = $this->withdrawService->updateStatusWithdraw($id, $payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

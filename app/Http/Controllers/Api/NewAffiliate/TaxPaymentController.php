<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\NewAffiliateService\TaxPayment;
use Illuminate\Http\JsonResponse;
use App\Helpers\S3;

class TaxPaymentController extends Controller
{
  private TaxPayment $taxPaymentService;

  public function __construct(TaxPayment $taxPaymentService)
  {
    $this->taxPaymentService = $taxPaymentService;
  }

  public function get(Request $request)
  {
    $taxPaymentStatus = $request->has('status') ? $request->get('status') : null;
    $validTaxPaymentStatuses = ["PENDING", "COMPLETE"];
    $isValidTaxPaymentStatus = in_array($taxPaymentStatus, $validTaxPaymentStatuses);
    if (!is_null($taxPaymentStatus) && !$isValidTaxPaymentStatus) {
      $taxPaymentStatus = "PENDING";
    }
    $response = $this->taxPaymentService->getTaxPayment($taxPaymentStatus);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getById(int $id)
  {
    $response = $this->taxPaymentService->getById($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getByStatus()
  {
    $response = $this->taxPaymentService->getTaxPaymentPending();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function processTaxPayment(Request $request): JsonResponse
  {
    $payment_photo_file = $request->file('payment_photo');
    $payment_photo_url = null;

    if ($payment_photo_file) {
      $payment_photo_url = S3::storeOriginal("/uploads/office/affiliate/tax-payment/payment/photo", $payment_photo_file);
    }
    $payload = [
      "id" => (int)$request->id,
      "tax_photo" => $payment_photo_url,
    ];
    $response = $this->taxPaymentService->update($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\NewAffiliateService\DiscountCode;
use App\Services\FinanceService\Bill;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DiscountCodeController extends Controller
{
  private DiscountCode $discountCode;
  private Bill $bill;

  public function __construct(DiscountCode $discountCode, Bill $bill)
  {
    $this->discountCode = $discountCode;
    $this->bill = $bill;
  }

  public function getAll()
  {
    try {
      $response = $this->discountCode->getAll();
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when getting all discount code', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function getById($id)
  {
    try {
      $response = $this->discountCode->getById((int)$id);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when getting discount code by id', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function getByIdentifier($identifier)
  {
    try {
      $response = $this->discountCode->getByIdentifier($identifier);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when getting discount code by identifier', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function getUsages($id)
  {
    try {
      // Get discount code data from API
      $discountCodeResponse = $this->discountCode->getById((int)$id);
      $discountCodeBody = json_decode($discountCodeResponse->body());
      $discountCodeStatus = $discountCodeResponse->status();
      if (!$discountCodeResponse->successful()) {
        Log::error('Error when getting discount code usages -- Could not get discount code data', ["response" => $discountCodeBody, "status" => $discountCodeStatus]);
        return response()->json($discountCodeBody, $discountCodeStatus);
      }

      // Get offline & online product bills
      $offlineProductBills = collect($this->bill->getByProductType("OFFLINE_PRODUCT"));
      $onlineProductBills = collect($this->bill->getByProductType("ONLINE_PRODUCT"));

      // Merge offline & online product bills
      $mergedBills = $offlineProductBills->merge($onlineProductBills);

      // Filter merged bills by discount_code
      $filteredBills = $mergedBills
        ->filter(fn ($item, $key) => $item->discount_code === $discountCodeBody->data->code && $item->branch_code === $discountCodeBody->data->identifier)
        ->sortBy('id')
        ->values()
        ->toArray();

      // Define the response
      $usageCount = count($filteredBills);
      $statusCode = $usageCount > 0 ? 200 : 404;
      $isSuccess = $usageCount > 0 ? true : false;
      $message = $usageCount > 0 ? 'Discount code usage data has been retrieved successfully' : 'This discount code has not been used yet';
      $response = ["success" => $isSuccess, "usage_count" => $usageCount, "data" => $filteredBills, 'message' => $message];
      return response()->json($response, $statusCode);
    } catch (\Exception $e) {
      Log::error('Error when getting discount code usages', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function checkEligibility(Request $request)
  {
    try {
      $payload = $request->except('_token');
      $response = $this->discountCode->checkEligibility($payload, null);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when checking discount code eligibility', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function checkAffiliateDiscountCode(Request $request)
  {
    $response = $this->discountCode->checkAffiliateDiscountCode($request->affiliate_code);
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function checkEligibilityV2(Request $request)
  {
    $response = $this->discountCode->checkDiscountCodeForMultipleProducts($request->all());
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function createForCentral(Request $request)
  {
    try {
      $user = Auth::user();
      $payload = $request->except(['_token', 'cancelToken']);
      $payload["created_by"] = $user->name;
      $payload["expired_at"] = $payload["expired_at"] ? Carbon::parse($payload["expired_at"])->utc()->toISOString() : null;
      $payload["product_code"] = count($payload["product_code"]) > 0 ? $payload["product_code"] : null;
      $response = $this->discountCode->createForCentral($payload);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when creating discount code for central', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function createForBranch(Request $request)
  {
    try {
      $user = Auth::user();
      $payload = $request->except(['_token', 'cancelToken']);
      $payload["created_by"] = $user->name;
      $payload["expired_at"] = $payload["expired_at"] ? Carbon::parse($payload["expired_at"])->utc()->toISOString() : null;
      $response = $this->discountCode->createForBranch($payload);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when creating discount code for branch', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function update(Request $request)
  {
    try {
      $payload = $request->except(['_token', 'cancelToken']);
      $payload["expired_at"] = $payload["expired_at"] ? Carbon::parse($payload["expired_at"])->utc()->toISOString() : null;
      $payload["product_code"] = count($payload["product_code"]) > 0 ? $payload["product_code"] : null;
      $response = $this->discountCode->update($payload);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when updating discount code', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }

  public function delete(Request $request, $id)
  {
    try {
      $payload = $request->except('_token');
      $response = $this->discountCode->delete((int)$id, $payload);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when deleting discount code', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses gagal, silakan coba lagi nanti'], 500);
    }
  }
}

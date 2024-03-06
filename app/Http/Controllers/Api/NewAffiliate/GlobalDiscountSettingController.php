<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\NewAffiliateService\DiscountAffiliateSetting;
use Illuminate\Support\Facades\Log;



class GlobalDiscountSettingController extends Controller
{
  private DiscountAffiliateSetting $discountAffiliateSetting;
  private $errorMessage;

  public function __construct(DiscountAffiliateSetting $discountAffiliateSetting)
  {
    $this->discountAffiliateSetting = $discountAffiliateSetting;
    $this->errorMessage = "Proses gagal, silakan coba lagi nanti";
  }

  public function getAll()
  {
    try {
      $response = $this->discountAffiliateSetting->getAll();
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when getting all portion setting', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => $this->errorMessage], 500);
    }
  }

  public function getById($id)
  {
    try {
      $response = $this->discountAffiliateSetting->getById((int)$id);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when getting portion setting by id', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => $this->errorMessage], 500);
    }
  }
  public function create(Request $request)
  {
    try {
      $discountAffiliateSettingsResponse = $this->discountAffiliateSetting->getAll();
      $discountAffiliateSettings = json_decode($discountAffiliateSettingsResponse->body())?->data ?? [];

      if (count($discountAffiliateSettings) > 0) {
        $isProductDiscountAffiliateSettingAlreadyExists = collect($discountAffiliateSettings)
          ->where('product_code', $request->product_code)
          ->count() > 0;
        if ($isProductDiscountAffiliateSettingAlreadyExists) {
          $this->errorMessage = "discount affiliate settings data already exists";
          return response()->json([
            'success' => false,
            'error' => $this->errorMessage,
            'message' => $this->errorMessage
          ], 500);
        }
      }

      $payload = $request->except(['_token', 'cancelToken']);
      $response = $this->discountAffiliateSetting->createDiscount($payload);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when creating discount code for central', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => $this->errorMessage], 500);
    }
  }

  public function update(Request $request, $id)
  {
    try {
      $discountAffiliateSettingsResponse = $this->discountAffiliateSetting->getAll();
      $discountAffiliateSettings = json_decode($discountAffiliateSettingsResponse->body())?->data ?? [];

      if (count($discountAffiliateSettings)) {
        $currentDiscountAffiliateSetting = collect($discountAffiliateSettings)->where('id', '=', $id)->first();

        if ($request->product_code !== $currentDiscountAffiliateSetting->product_code) {
          $isProductDiscountAffiliateSettingAlreadyExists = collect($discountAffiliateSettings)
            ->where('product_code', $request->product_code)
            ->count() > 0;

          if ($isProductDiscountAffiliateSettingAlreadyExists) {
            $this->errorMessage = "discount affiliate setting data already exists";
            return response()->json([
              'success' => false,
              'error' => $this->errorMessage,
              'message' => $this->errorMessage
            ], 500);
          }
        }
      }

      $payload = $request->except(['_token', 'cancelToken']);
      $response = $this->discountAffiliateSetting->update($id, $payload);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when updating portion setting', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => $this->errorMessage], 500);
    }
  }
}

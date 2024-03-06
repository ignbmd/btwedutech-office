<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\NewAffiliateService\PortionSetting;
use Illuminate\Support\Facades\Log;



class PortionSettingController extends Controller
{
  private PortionSetting $portionSetiing;
  private $errorMessage;

  public function __construct(PortionSetting $portionSetiing)
  {
    $this->portionSetiing = $portionSetiing;
    $this->errorMessage = "Proses gagal, silakan coba lagi nanti";
  }

  public function getAll()
  {
    try {
      $response = $this->portionSetiing->getAll();
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
      $response = $this->portionSetiing->getById((int)$id);
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
      $portionSettingsResponse = $this->portionSetiing->getAll();
      $portionSettings = json_decode($portionSettingsResponse->body())?->data ?? [];

      if (count($portionSettings) > 0) {
        $isProductPortionSettingAlreadyExists = collect($portionSettings)
          ->where('product_code', $request->product_code)
          ->where('type', $request->type)
          ->count() > 0;
        if ($isProductPortionSettingAlreadyExists) {
          $this->errorMessage = "portion settings data already exists";
          return response()->json([
            'success' => false,
            'error' => $this->errorMessage,
            'message' => $this->errorMessage
          ], 500);
        }
      }

      $payload = $request->except(['_token', 'cancelToken']);
      $response = $this->portionSetiing->createPortion($payload);
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

      $portionSettingsResponse = $this->portionSetiing->getAll();
      $portionSettings = json_decode($portionSettingsResponse->body())?->data ?? [];

      if (count($portionSettings) > 0) {
        $currentPortionSetting = collect($portionSettings)->where('id', '=', $id)->first();

        if (
          $request->product_code !== $currentPortionSetting->product_code ||
          $request->type !== $currentPortionSetting->type
        )
        {
          $isProductPortionSettingAlreadyExists = collect($portionSettings)
            ->where('product_code', $request->product_code)
            ->where('type', $request->type)
            ->count() > 0;

          if ($isProductPortionSettingAlreadyExists) {
            $this->errorMessage = "portion setting data already exists";
            return response()->json([
              'success' => false,
              'error' => $this->errorMessage,
              'message' => $this->errorMessage
            ], 500);
          }
        }
      }
      $payload = $request->except(['_token', 'cancelToken']);
      $response = $this->portionSetiing->update($id, $payload);
      $body = json_decode($response?->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error('Error when updating portion setting', ['success' => false, 'message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => $this->errorMessage], 500);
    }
  }
}

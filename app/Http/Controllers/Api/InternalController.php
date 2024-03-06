<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApiGatewayService\Internal;
use App\Helpers\Redis;
use Illuminate\Http\Request;

class InternalController extends Controller
{

  private Internal $service;

  public function __construct(Internal $service)
  {
    $this->service = $service;
  }

  public function getOnlineLegacyProductById($id)
  {
    $data = $this->service->getPremiumPackageById($id);
    return response()->json($data);
  }

  public function getOfflineLegacyProductById($id)
  {
    $data = $this->service->getTatapMukaById($id);
    return response()->json($data);
  }

  public function getPrograms(Request $request)
  {
    $data = $this->service->getPrograms();
    return response()->json($data);
  }

  public function getCodeTryoutSchedules()
  {
    $response = $this->service->getCodeTryoutSchedules();
    $status = $response->status();
    $body = json_decode($response->body());
    return response()->json($body, $status);
  }

  public function getCodeTryoutBreakTime($tryoutCode)
  {
    $cacheKey = "code-tryout_" . $tryoutCode . "_break-time";
    $data = json_decode(Redis::get($cacheKey));
    return response()->json(['message' => 'Get code tryout break time', 'data' => $data], 200);
  }

  public function updateOnlineLegacyProduct(Request $request, $id)
  {
    $response = $this->service->updatePremiumPackage($request->all(), $id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function updateOfflineLegacyProduct(Request $request, $id)
  {
    $response = $this->service->updateTatapMuka($request->all(), $id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

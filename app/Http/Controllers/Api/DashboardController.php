<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ApiGatewayService\Internal;

class DashboardController extends Controller
{

  private Internal $internalService;

  public function __construct(Internal $serviceInternal)
  {
    $this->internalService = $serviceInternal;
  }

  public function getUserRetentionChart(Request $request)
  {
    $package_id = $request->package_id;
    $date_start = $request->date_start;
    $date_end = $request->date_end;
    $range_type = $request->range_type;

    $response = $this->internalService->getSettlementOrganicTransaction([
      'package_id' => $package_id,
      'date_start' => $date_start,
      'date_end' => $date_end,
      'range_type' => $range_type,
    ]);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }
}

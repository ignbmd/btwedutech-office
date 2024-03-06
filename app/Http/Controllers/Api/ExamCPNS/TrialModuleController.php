<?php

namespace App\Http\Controllers\Api\ExamCPNS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\ExamCPNSService\TrialModule;
use App\Services\ApiGatewayService\Internal;

class TrialModuleController extends Controller
{
  private TrialModule $service;
  private Internal $apiGatewayService;

  public function __construct(TrialModule $service, Internal $apiGatewayService)
  {
    $this->service = $service;
    $this->apiGatewayService = $apiGatewayService;
  }

  public function index(Request $request)
  {
    $response = $this->service->get($request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function show(int $id)
  {
    $response = $this->service->show($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function store(Request $request)
  {
    $createLegacyTaskResponse = $this->apiGatewayService->createLegacyTask([
      "name" => $request->module_name,
      "waktu" => $request->duration,
      "kode_modul" => $request->module_code
    ]);
    $createLegacyTaskBody = json_decode($createLegacyTaskResponse->body());
    if ($createLegacyTaskResponse->failed()) {
      Log::error('Failed create legacy task! ' . $createLegacyTaskResponse->body());
      return response()->json(['message' => $createLegacyTaskBody->data->errors[0]], 400);
    }
    $request['legacy_task_id'] = $createLegacyTaskBody->data->inserted_tugas_id;
    unset($request['module_name']);
    unset($request['module_code']);

    $response = $this->service->create($request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function update(Request $request, int $id)
  {
    $response = $this->service->update($id, $request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

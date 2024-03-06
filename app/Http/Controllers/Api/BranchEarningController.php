<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\FinanceService\BranchEarning;

class BranchEarningController extends Controller
{

  private BranchEarning $branchEarningService;

  public function __construct(BranchEarning $branchEarningService)
  {
    $this->branchEarningService = $branchEarningService;
  }

  public function getByBranchCode(Request $request, $branchCode)
  {
    $data = $this->branchEarningService->getByBranchCode($branchCode);
    return response()->json($data ?? []);
  }

  public function getDefaultByBranchCode(Request $request, $branchCode)
  {
    $data = $this->branchEarningService->getDefaultByBranchCode($branchCode);
    return response()->json($data ?? null);
  }

  public function create(Request $request)
  {
    $response = $this->branchEarningService->create($request->all());
    return response()->json(json_decode($response->body()), $response->status());
  }

  public function update(Request $request, $id)
  {
    $payload = array_merge($request->all(), ['id' => (int)$id]);
    $response = $this->branchEarningService->update($payload);
    return response()->json(json_decode($response->body()), $response->status());
  }

  public function getById(Request $request, $id)
  {
    $data = $this->branchEarningService->getById($id);
    return response()->json($data);
  }

  public function delete(Request $request, $id)
  {
    $response = $this->branchEarningService->deleteById($id);
    return response()->json(json_decode($response->body()), $response->status());
  }
}

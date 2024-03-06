<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\BranchService\Branch;

class BranchController extends Controller
{

  private Branch $service;

  public function __construct(Branch $branchService)
  {
    $this->service = $branchService;
  }

  public function getAllBranch()
  {
    $data = $this->service->getBranchs();
    return response()->json(['data' => $data]);
  }

  public function getBranch($code)
  {
    $data = $this->service->getBranchByCode($code);
    return response()->json(['data' => $data]);
  }

  public function getMultipleBranches()
  {
    $auth_branch_code = auth()->user()->branch_code;
    $data = $this->service->getMultipleBranches($auth_branch_code);
    return response()->json(['data' => $data]);
  }

  public function create(Request $request)
  {
    $payload = [
      'name' => $request->name,
      'address' => $request->address,
      'geolocation' => [
        "lat" => $request->lat,
        "lng" => $request->lng
      ],
      'level' => $request->level,
      "tag" => $request->tag,
      'discount_method' => $request->discount_method,
      'branch_code' => $request->branch_code
    ];

    $earning = (object)[
      'amount' => $request->get('amount'),
      'amount_type' => $request->get('amount_type'),
      'earning_position' => $request->get('earning_position')
    ];

    $data = $this->service->createBranch($payload, $earning);
    return response()->json(['data' => $data]);
  }

  public function update(Request $request, $code)
  {
    $branchCode = $request->branch_code ?? $code;
    $payload = [
      'name' => $request->name,
      'address' => $request->address,
      'geolocation' => [
        "lat" => $request->lat,
        "lng" => $request->lng
      ],
      'tag' => $request->tag,
      'level' => $request->level,
      'discount_method' => $request->discount_method,
      'branch_code' => $branchCode
    ];
    $earning = (object)[
      'branch_code' => $branchCode,
      'amount' => $request->get('amount'),
      'amount_type' => $request->get('amount_type'),
      'earning_position' => $request->get('earning_position')
    ];

    $response = $this->service->updateBranch($code, $payload, $earning);
    $responseStatus = $response->status();
    if ($responseStatus == 201 || $responseStatus == 200) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data cabang berhasil diperbarui'
        ]
      );
      $data = json_decode($response->body());
      return response()->json(['data' => $data], $responseStatus);
    } else {
      return response()->json(['data' => $response], $responseStatus);
    }
  }
}

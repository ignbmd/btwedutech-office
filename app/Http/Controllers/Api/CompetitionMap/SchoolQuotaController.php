<?php

namespace App\Http\Controllers\Api\CompetitionMap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CompetitionMapService\SchoolQuota;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class SchoolQuotaController extends Controller
{
  private SchoolQuota $service;

  public function __construct(SchoolQuota $service)
  {
    $this->service = $service;
  }

  public function index()
  {
    $response = $this->service->get();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function show($id)
  {
    $response = $this->service->getById($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function store(Request $request)
  {
    $validation = Validator::make($request->all(), [
      "school_id" => ["required"],
      "quota" => ["required"],
      "year" => ["required"]
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "school_id" => (int)$request->school_id,
      "quota" => (int)$request->quota,
      "year" => (int)$request->year,
    ];
    $response = $this->service->store($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data kuota sekolah berhasil ditambah!'
      ]);
    }

    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $validation = Validator::make($request->all(), [
      "school_id" => ["required"],
      "quota" => ["required"],
      "year" => ["required"],
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "id" => (int)$id,
      "school_id" => (int)$request->school_id,
      "quota" => (int)$request->quota,
      "year" => (int)$request->year,
    ];
    $response = $this->service->update($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data kuota sekolah berhasil diperbarui!'
      ]);
    }

    return response()->json($body, $status);
  }

  public function delete($id)
  {
    $response = $this->service->delete($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

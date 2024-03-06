<?php

namespace App\Http\Controllers\Api\CompetitionMap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CompetitionMapService\Location;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class LocationController extends Controller
{
  private Location $service;

  public function __construct(Location $service)
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

  public function provinces()
  {
    $response = $this->service->getProvinces();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function region()
  {
    $response = $this->service->getRegion();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getRegionByParentId($id)
  {
    $response = $this->service->getRegionByParentId($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function store(Request $request)
  {
    $validation = Validator::make($request->all(), [
      "name" => ["required"],
      "type" => ["required"],
      "parent_id" => ["nullable"]
    ]);
    if ($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "name" => $request->name,
      "type" => $request->type,
      "parent_id" => $request->parent_id
    ];
    $response = $this->service->store($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data lokasi berhasil ditambah!'
      ]);
    }

    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $validation = Validator::make($request->all(), [
      "name" => ["required"],
      "type" => ["required"],
      "parent_id" => ["nullable"]
    ]);
    if ($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "id" => (int)$id,
      "name" => $request->name,
      "type" => $request->type,
      "parent_id" => $request->parent_id
    ];

    $response = $this->service->update($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data lokasi berhasil diperbarui!'
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

<?php

namespace App\Http\Controllers\Api\CompetitionMap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CompetitionMapService\LastEducation;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class LastEducationController extends Controller
{
  private LastEducation $service;

  public function __construct(LastEducation $service)
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
      "name" => ["required"],
      "type" => ["required"],
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "name" => $request->name,
      "type" => $request->type,
    ];
    $response = $this->service->store($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data pendidikan terakhir berhasil ditambah!'
      ]);
    }

    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $validation = Validator::make($request->all(), [
      "name" => ["required"],
      "type" => ["required"],
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "id" => (int)$id,
      "name" => $request->name,
      "type" => $request->type,
    ];

    $response = $this->service->update($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data pendidikan terakhir berhasil diperbarui!'
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

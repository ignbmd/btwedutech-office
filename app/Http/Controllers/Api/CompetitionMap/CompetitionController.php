<?php

namespace App\Http\Controllers\Api\CompetitionMap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CompetitionMapService\Competition;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class CompetitionController extends Controller
{
  private Competition $service;

  public function __construct(Competition $service)
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
      "study_program_id" => ["required"],
      "location_id" => ["required"],
      "polbit_type" => ["required"],
      "year" => ["required"],
      "quota" => ["required"],
      "registered" => ["required"],
      "lowest_score" => ["required"],
      "lowest_position" => ["required"],
      "lowest_status" => ["required"]
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "study_program_id" => (int)$request->study_program_id,
      "location_id" => (int)$request->location_id,
      "polbit_type" => $request->polbit_type,
      "year" => (int)$request->year,
      "quota" => (int)$request->quota,
      "registered" => (int)$request->registered,
      "lowest_score" => (int)$request->lowest_score,
      "lowest_position" => (int)$request->lowest_position,
      "lowest_status" => $request->lowest_status
    ];
    $response = $this->service->store($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data kompetisi berhasil ditambah!'
      ]);
    }

    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $validation = Validator::make($request->all(), [
      "study_program_id" => ["required"],
      "location_id" => ["required"],
      "polbit_type" => ["required"],
      "year" => ["required"],
      "quota" => ["required"],
      "registered" => ["required"],
      "lowest_score" => ["required"],
      "lowest_position" => ["required"],
      "lowest_status" => ["required"]
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "id" => (int)$id,
      "study_program_id" => (int)$request->study_program_id,
      "location_id" => (int)$request->location_id,
      "polbit_type" => $request->polbit_type,
      "year" => (int)$request->year,
      "quota" => (int)$request->quota,
      "registered" => (int)$request->registered,
      "lowest_score" => (int)$request->lowest_score,
      "lowest_position" => (int)$request->lowest_position,
      "lowest_status" => $request->lowest_status
    ];

    $response = $this->service->update($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data kompetisi berhasil diperbarui!'
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

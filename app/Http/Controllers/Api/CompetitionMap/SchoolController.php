<?php

namespace App\Http\Controllers\Api\CompetitionMap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CompetitionMapService\School;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class SchoolController extends Controller
{
  private School $service;

  public function __construct(School $service)
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
      "ministry" => ["required"],
      "address" => ["required"],
      "link" => ["required"],
      "leg_x" => ["required"],
      "leg_o" => ["required"],
      "eye_min" => ["required"],
      "eye_plus" => ["required"],
      "eye_cylinder" => ["required"]
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "name" => $request->name,
      "ministry" => $request->ministry,
      "address" => $request->address,
      "link" => $request->link,
      "leg_x" => (int)$request->leg_x,
      "leg_o" => (int)$request->leg_o,
      "eye_min" => (int)$request->eye_min,
      "eye_plus" => (int)$request->eye_plus,
      "eye_cylinder" => (int)$request->eye_cylinder
    ];
    $response = $this->service->store($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data sekolah berhasil ditambah!'
      ]);
    }

    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $validation = Validator::make($request->all(), [
      "name" => ["required"],
      "ministry" => ["required"],
      "address" => ["required"],
      "link" => ["required"],
      "leg_x" => ["required"],
      "leg_o" => ["required"],
      "eye_min" => ["required"],
      "eye_plus" => ["required"],
      "eye_cylinder" => ["required"]
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "id" => (int)$id,
      "name" => $request->name,
      "ministry" => $request->ministry,
      "address" => $request->address,
      "link" => $request->link,
      "leg_x" => (int)$request->leg_x,
      "leg_o" => (int)$request->leg_o,
      "eye_min" => (int)$request->eye_min,
      "eye_plus" => (int)$request->eye_plus,
      "eye_cylinder" => (int)$request->eye_cylinder
    ];

    $response = $this->service->update($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data sekolah berhasil diperbarui!'
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

  public function getSchoolOriginEducations(string $school_type)
  {
    $response = $this->service->getSchoolOriginEducations($school_type);
    $body = json_decode($response->body());
    $status = $response->status();
    if(isset($body->data)) {
      return response()->json(
        [
            'status' => 200,
            'data' => $body->data,
            'messages' => ['Success']
        ],
        200
      );
    }
    return response()->json($body, $status);
  }
}

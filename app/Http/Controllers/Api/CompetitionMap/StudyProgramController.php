<?php

namespace App\Http\Controllers\Api\CompetitionMap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CompetitionMapService\StudyProgram;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class StudyProgramController extends Controller
{
  private StudyProgram $service;

  public function __construct(StudyProgram $service)
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

  public function getBySchoolId($id)
  {
    $response = $this->service->getBySchoolId($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function store(Request $request)
  {
    $validation = Validator::make($request->all(), [
      "school_id" => ["required"],
      "name" => ["required"],
      "gender" => ["required"],
      "min_age_male" => ["required"],
      "min_age_female" => ["required"],
      "birth_date_specific" => ["required"],
      "min_height_male" => ["required"],
      "min_height_female" => ["required"],
      "avg_report_score" => ["required"],
      "last_ed_type" => ["required"],
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "school_id" => (int)$request->school_id,
      "name" => $request->name,
      "gender" => $request->gender,
      "min_age_male" => (int)$request->min_age_male,
      "min_age_female" => (int)$request->min_age_female,
      "birth_date_specific" => $request->birth_date_specific,
      "min_height_male" => (int)$request->min_height_male,
      "min_height_female" => (int)$request->min_height_female,
      "avg_report_score" => (int)$request->avg_report_score,
      "last_ed_type" => $request->last_ed_type,
      "last_ed_ids" => $request->last_ed_ids
    ];
    $response = $this->service->store($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data program studi berhasil ditambah!'
      ]);
    }

    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $validation = Validator::make($request->all(), [
      "school_id" => ["required"],
      "name" => ["required"],
      "gender" => ["required"],
      "min_age_male" => ["required"],
      "min_age_female" => ["required"],
      "birth_date_specific" => ["required"],
      "min_height_male" => ["required"],
      "min_height_female" => ["required"],
      "avg_report_score" => ["required"],
      "last_ed_type" => ["required"],
      "is_last_ed_updated" => ["required"]
    ]);
    if($validation->fails()) return response()->json(["success" => false, "errors" => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    $payload = [
      "id" => (int)$id,
      "school_id" => (int)$request->school_id,
      "name" => $request->name,
      "gender" => $request->gender,
      "min_age_male" => (int)$request->min_age_male,
      "min_age_female" => (int)$request->min_age_female,
      "birth_date_specific" => $request->birth_date_specific,
      "min_height_male" => (int)$request->min_height_male,
      "min_height_female" => (int)$request->min_height_female,
      "avg_report_score" => (int)$request->avg_report_score,
      "last_ed_type" => $request->last_ed_type,
      "last_ed_ids" => $request->last_ed_ids,
      "is_last_ed_update" => $request->is_last_ed_updated
    ];
    $response = $this->service->update($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data program studi berhasil diperbarui!'
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

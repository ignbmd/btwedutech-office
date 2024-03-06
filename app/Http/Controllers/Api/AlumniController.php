<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AlumniService\Alumni;
use App\Helpers\S3;
use Illuminate\Http\Request;

class AlumniController extends Controller
{
  private Alumni $alumniService;

  public function __construct(Alumni $alumniService)
  {
    $this->alumniService = $alumniService;
  }

  public function getAll(string $program, string $selection)
  {
    $response = $this->alumniService->getAll($program, $selection);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }

  public function getByID(string $program, string $selection, string $id)
  {
    $response = $this->alumniService->getByID($program, $selection, $id);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }

  public function create(Request $request, string $program, string $selection)
  {
    $path = null;
    if($request->formal_picture) {
      $fileExtension = $request->formal_picture->extension();
      $fileMimeType = $request->formal_picture->getMimeType();

      $validImageExtensions = ["jpg", "jpeg", "png", "gif"];
      $validImageMimeType = ["image/jpeg", "image/png", "image/gif"];

      $isImageFile = in_array($fileExtension, $validImageExtensions) && in_array($fileMimeType, $validImageMimeType);
      if(!$isImageFile) return response()->json(["success" => false, "message" => "File gambar tidak valid. Silakan masukkan file gambar "], 422);
      $path = S3::storeOriginal("/uploads/office/alumni/$request->name", $request->formal_picture);
    }

    $payload = [
      "name" => $request->name,
      "email" => !!$request->email ? $request->email : null,
      "phone" => !!$request->phone ? $request->phone : null,
      "school_origin" => !!$request->school_origin ? $request->school_origin : null,
      "social_ig" => !!$request->social_ig ? $request->social_ig : null,
      "major" => !!$request->major ? $request->major : null,
      "formal_picture" => $path ?? null,
      "twk" => !!$request->twk ? (int)$request->twk : null,
      "tiu" => !!$request->tiu ? (int)$request->tiu : null,
      "tkp" => !!$request->tkp ? (int)$request->tkp : null,
      "total_score" => !!$request->total_score ? (int)$request->total_score : null,
      "is_skd_passed" => (bool)$request->is_skd_passed,
      "is_all_passed" => (bool)$request->is_all_passed,
      "is_online_program" => (bool)$request->is_online_program,
      "is_offline_program" => (bool)$request->is_offline_program,
      "joined_year" => !!$request->joined_year ? (int)$request->joined_year : null,
      "passed_year" => !!$request->passed_year ? (int)$request->passed_year : null,
      "testimony" => !!$request->testimony ? $request->testimony : null
    ];
    if($selection == "sekdin") $payload["instance"] = !!$request->instance ? $request->instance : null;
    if($selection == "cpns") $payload["formation"] = !!$request->formation ? $request->formation : null;

    $response = $this->alumniService->create($program, $selection, $payload);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }

  public function update(Request $request, string $program, string $selection, string $id)
  {
    $path = null;
    if($request->formal_picture) {
      $fileExtension = $request->formal_picture->extension();
      $fileMimeType = $request->formal_picture->getMimeType();

      $validImageExtensions = ["jpg", "jpeg", "png", "gif"];
      $validImageMimeType = ["image/jpeg", "image/png", "image/gif"];

      $isImageFile = in_array($fileExtension, $validImageExtensions) && in_array($fileMimeType, $validImageMimeType);
      if(!$isImageFile) return response()->json(["success" => false, "message" => "File gambar tidak valid. Silakan masukkan file gambar "], 422);
      $path = S3::storeOriginal("/uploads/office/alumni/$request->name", $request->formal_picture);
    }

    $payload = [
      "name" => $request->name,
      "email" => !!$request->email ? $request->email : null,
      "phone" => !!$request->phone ? $request->phone : null,
      "school_origin" => !!$request->school_origin ? $request->school_origin : null,
      "instance" => !!$request->instance ? $request->instance : null,
      "social_ig" => !!$request->social_ig ? $request->social_ig : null,
      "major" => !!$request->major ? $request->major : null,
      "twk" => !!$request->twk ? (int)$request->twk : null,
      "tiu" => !!$request->tiu ? (int)$request->tiu : null,
      "tkp" => !!$request->tkp ? (int)$request->tkp : null,
      "total_score" => !!$request->total_score ? (int)$request->total_score : null,
      "is_skd_passed" => (bool)$request->is_skd_passed,
      "is_all_passed" => (bool)$request->is_all_passed,
      "is_online_program" => (bool)$request->is_online_program,
      "is_offline_program" => (bool)$request->is_offline_program,
      "joined_year" => !!$request->joined_year ? (int)$request->joined_year : null,
      "passed_year" => !!$request->passed_year ? (int)$request->passed_year : null,
      "testimony" => !!$request->testimony ? $request->testimony : null,
      "created_at" => $request->created_at,
    ];
    if($selection == "sekdin") $payload["instance"] = !!$request->instance ? $request->instance : null;
    if($selection == "cpns") $payload["formation"] = !!$request->formation ? $request->formation : null;

    if($path) $payload['formal_picture'] = $path;
    else $payload["formal_picture"] = $request->has('old_formal_picture') ? $request->old_formal_picture : null;

    $response = $this->alumniService->update($program, $selection, $id, $payload);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }

  public function delete(string $program, string $selection, string $id)
  {
    $response = $this->alumniService->delete($program, $selection, $id);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }
}

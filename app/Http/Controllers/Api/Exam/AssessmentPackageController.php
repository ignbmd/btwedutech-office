<?php

namespace App\Http\Controllers\Api\Exam;

use App\Helpers\DateTime as DateTimeHelper;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use Symfony\Component\HttpFoundation\Response;
use App\Services\ExamService\AssessmentPackage as Package;
use Carbon\Carbon;

class AssessmentPackageController extends Controller
{
  private Package $examAssessmentPackage;

  public function __construct(Package $examAssessmentPackage)
  {
    $this->examAssessmentPackage = $examAssessmentPackage;
  }

  public function getAll()
  {
    $data = $this->examAssessmentPackage->getAll();
    return response()->json($data, 200);
  }

  public function getById($id)
  {
    $data = $this->examAssessmentPackage->getById((int)$id);
    return $data
      ? response()->json(['success' => true, 'message' => "Data found", 'data' => $data], Response::HTTP_OK)
      : response()->json(['success' => false, 'message' => "Data not found", 'data' => $data], Response::HTTP_BAD_REQUEST);
  }

  public function createBulk(Request $request)
  {
    try {
      $premiumPackagePayload = [];
      foreach ($request->data as $data) {
        if ($data["start_date"]) {
          $parsedStartDate = Carbon::parse($data["start_date"])->timezone("Asia/Jakarta")->addHour()->format("Y-m-d\TH:i:s.uP");
          $data["start_date"] = $parsedStartDate;
        }
        if ($data["end_date"]) {
          $parsedEndDate = Carbon::parse($data["end_date"])->timezone("Asia/Jakarta")->addHour()->format("Y-m-d\TH:i:s.uP");
          $data["end_date"] = $parsedEndDate;
        }
        $premiumPackagePayload[] = $data;
      }

      $premiumPackageResponse = $this->examAssessmentPackage->createBulk(["data" => $premiumPackagePayload]);
      $premiumPackageResponseStatus = $premiumPackageResponse->status();
      $premiumPackageResponseBody = json_decode($premiumPackageResponse->body());

      if ($premiumPackageResponseStatus !== Response::HTTP_CREATED) return response()->json(['success' => false, 'message' => "Proses gagal, silakan coba lagi nanti", "data" => $premiumPackageResponseBody], $premiumPackageResponseStatus);
      return response()->json(['success' => true, 'status_code' => $premiumPackageResponseStatus, 'message' => "Data berhasil ditambah"], $premiumPackageResponseStatus);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }

  public function update(Request $request, $id)
  {
    $payload = $request->data;
    if ($payload["start_date"]) {
      $parsedStartDateTimezoneName = Carbon::parse($payload["start_date"])->timezoneAbbreviatedName;
      $payload["start_date"] = $parsedStartDateTimezoneName == "Z"
        ? Carbon::parse($payload["start_date"])->timezone("Asia/Jakarta")->addHour()->format("Y-m-d\TH:i:s.uP")
        : $payload["start_date"];
    }
    if ($payload["end_date"]) {
      $parsedEndDateTimezoneName = Carbon::parse($payload["end_date"])->timezoneAbbreviatedName;
      $payload["end_date"] = $parsedEndDateTimezoneName == "Z"
        ? Carbon::parse($payload["end_date"])->timezone("Asia/Jakarta")->addHour()->format("Y-m-d\TH:i:s.uP")
        : $payload["end_date"];
    }
    $premiumPackageResponse = $this->examAssessmentPackage->update($id, $payload);
    $premiumPackageResponseStatus = $premiumPackageResponse->status();
    $premiumPackageResponseBody = json_decode($premiumPackageResponse->body());

    if ($premiumPackageResponseStatus !== Response::HTTP_CREATED) return response()->json(['success' => false, 'message' => "Proses gagal, silakan coba lagi nanti", "data" => $premiumPackageResponseBody], $premiumPackageResponseStatus);
    return response()->json(['success' => true, 'status_code' => $premiumPackageResponseStatus, 'message' => "Data berhasil diperbarui"], $premiumPackageResponseStatus);
  }
}

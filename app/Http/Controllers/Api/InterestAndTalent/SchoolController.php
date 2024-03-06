<?php

namespace App\Http\Controllers\Api\InterestAndTalent;

use App\Helpers\RabbitMq;
use App\Helpers\S3;
use App\Http\Controllers\Controller;
use App\Services\InterestAndTalentService\InterestAndTalent;
use App\Services\SchoolService\School;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Rap2hpoutre\FastExcel\FastExcel;

class SchoolController extends Controller
{
  private School $schoolService;
  private InterestAndTalent $interestAndTalentService;

  public function __construct(School $schoolService, InterestAndTalent $interestAndTalentService)
  {
    $this->schoolService = $schoolService;
    $this->interestAndTalentService = $interestAndTalentService;
  }

  public function get(Request $request): JsonResponse
  {
    $schoolResponse = $this->schoolService->get($request->all());
    $schoolBody = json_decode($schoolResponse->body());
    $schoolStatus = $schoolResponse->status();

    $schoolIds = collect($schoolBody->data->schools)->map(fn ($item) => $item->id)->values()->toArray();

    $instanceExamCodeResponse = $this->interestAndTalentService->getInstanceExamCodeCountByInstanceIDs($schoolIds);
    $instanceExamCodeBody = json_decode($instanceExamCodeResponse->body());

    $instanceStudentResponse = $this->interestAndTalentService->getInstanceStudentCountByInstanceIDs($schoolIds);
    $instanceStudentBody = json_decode($instanceStudentResponse->body());

    $schoolBody->data->schools = collect($schoolBody->data->schools)->map(function($item) use ($instanceExamCodeBody, $instanceStudentBody) {
      $item->exam_codes_used = $instanceExamCodeBody->data->{$item->id}->used ?? 0;
      $item->exam_codes_total = $instanceExamCodeBody->data->{$item->id}->total ?? 0;
      $item->exam_codes = $instanceExamCodeBody->data->{$item->id}->exam_codes ?? [];
      $item->student_count = $instanceStudentBody->data->{$item->id} ?? 0;
      return $item;
    })->values()->toArray();

    return response()->json($schoolBody, $schoolStatus);
  }

  public function getById(string $id): JsonResponse
  {
    $schoolResponse = $this->schoolService->getById($id);
    $schoolBody = json_decode($schoolResponse->body());
    $schoolStatus = $schoolResponse->status();
    $instanceExamCodeResponse = $this->interestAndTalentService->getInstanceExamCodeCountByInstanceIDs([$schoolBody->data->id]);
    $instanceExamCodeBody = json_decode($instanceExamCodeResponse->body());

    $instanceStudentResponse = $this->interestAndTalentService->getInstanceStudentCountByInstanceIDs([$schoolBody->data->id]);
    $instanceStudentBody = json_decode($instanceStudentResponse->body());

    $schoolBody->data->exam_codes_used = $instanceExamCodeBody->data->{$schoolBody->data->id}->used ?? 0;
    $schoolBody->data->exam_codes_total = $instanceExamCodeBody->data->{$schoolBody->data->id}->total ?? 0;
    $schoolBody->data->exam_codes = $instanceExamCodeBody->data->{$schoolBody->data->id}->exam_codes ?? [];
    $schoolBody->data->student_count = $instanceStudentBody->data->{$schoolBody->data->id} ?? 0;

    return response()->json($schoolBody, $schoolStatus);
  }

  public function create(Request $request): JsonResponse
  {
    try {
      $school = json_decode($request->school);
      $school_logo = $request->file('school_logo');
      if($school_logo) $school->logo = S3::storeOriginal("/uploads/office/peminatan/sekolah/logo", $school_logo);
      else $school->logo = null;

      $school->start_datetime = Carbon::parse($school->start_datetime)->toISOString();
      $school->end_datetime = Carbon::parse($school->end_datetime)->toISOString();

      $admin = json_decode($request->get('admin'));
      $payload = ["school" => $school, "admin" => $admin];

      $response = $this->schoolService->create($payload);
      $body = json_decode($response->body());
      $status = $response->status();

      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error("Failed when attempting to create peminatan school", ['message' => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Terjadi kesalahan, silakan coba lagi nanti'], 500);
    }
  }

  public function update(Request $request): JsonResponse
  {
    $school = json_decode($request->school);
    $school_logo = $request->file('school_logo');
    if($school_logo) {
      $school->logo = S3::storeOriginal("/uploads/office/peminatan/sekolah/logo", $school_logo);
    }
    else {
      $school_logo = $request->get('school_logo');
      $school->logo = $school_logo;
    };
    $response = $this->schoolService->update((array)$school);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getSchoolAdminBySchoolId(string $school_id): JsonResponse
  {
    $response = $this->schoolService->getSchoolAdminBySchoolId($school_id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function createSchoolAdmin(Request $request): JsonResponse
  {
    $response = $this->schoolService->createSchoolAdmin($request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function deleteSchoolAdmin(string $school_id, string $school_admin_id): JsonResponse
  {
    $schoolResponse = $this->schoolService->getById($school_id);
    $schoolResponseBody = json_decode($schoolResponse->body());
    $schoolResponseStatus = $schoolResponse->status();
    if(!$schoolResponse->successful()) {
      Log::error("An error occured when trying to delete school admin", ['response' => $schoolResponseBody, 'status' => $schoolResponseStatus]);
      return response()->json(['success' => false, 'message' => 'Terjadi kesalahan, silakan coba lagi nanti'], $schoolResponseStatus);
    }
    $response = $this->schoolService->deleteSchoolAdmin($school_admin_id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function assignAccessCodes(Request $request)
  {
    $user = Auth::user();
    $codeRequest = $request->has('codeRequest') && $request->codeRequest !== "null" ? json_decode($request->codeRequest) : null;
    $accessCodes = [$request->access_code];
    $accessCodeFile = $request->file("access_code_file");
    $accessCodeStartDate = Carbon::parse($request->start_date)->toISOString();
    $accessCodeExpireDate = Carbon::parse($request->expire_date)->toISOString();
    if($accessCodeFile) {
      // Validate file extension and mime type
      $fileExtension = $accessCodeFile->extension();
      $fileMimeType = $accessCodeFile->getMimeType();
      $validFileExtension = "xlsx";
      $validFileMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      $isValidFile = $fileExtension === $validFileExtension && $fileMimeType === $validFileMimeType;
      if(!$isValidFile) return response()->json(["success" => false, "message" => "File tidak valid. Silakan masukkan file xlsx"], 422);

      $accessCodeFileCollection = (new FastExcel)->import($accessCodeFile);
      $accessCodes = $accessCodeFileCollection->map(fn ($item) => strtoupper(trim($item["kode_akses"])))->values()->toArray();
    }
    if($codeRequest) {
      $accessCodeRequestAmount = $codeRequest->amount;
      $accessCodesCount = count($accessCodes);
      if($accessCodesCount < $accessCodeRequestAmount) return response()->json(['success' => false, 'message' => "Kode akses yang di-input kurang dari jumlah kode akses yang di-request"], 400);
    }
    $school = json_decode($request->school);
    $payloadData = collect($accessCodes)->map(function($item) use ($school, $user, $codeRequest, $accessCodeStartDate, $accessCodeExpireDate) {
      $newItem = new \stdClass();
      $newItem->instance_name = $school->name;
      $newItem->instance_id = $school->id;
      $newItem->code = $item;
      $newItem->created_by = $user->name;
      $newItem->request_id = $codeRequest->_id ?? $codeRequest;
      $newItem->logo = $school->logo;
      $newItem->start_date = $accessCodeStartDate;
      $newItem->expired_date = $accessCodeExpireDate;
      return $newItem;
    })->values()->toArray();
    $brokerPayload = [
      "version" => 1,
      "data" => $payloadData
    ];
    RabbitMq::send("peminatan.exam-code.create-bulk", json_encode($brokerPayload));
    return response()->json(['success' => true, 'message' => 'Kode akses sedang di-assign'], 200);
  }

  public function updateAssignAccessCodes(Request $request){

    $user = Auth::user()->name;
    $accessCodes = $request->amount_code;
    $codeHistory = $request->has('codeHistory') && $request->codeHistory !== "null" ? json_decode($request->codeHistory) : null;
    $groupTestId = $codeHistory->group_test_id;
    $instanceName = $codeHistory->instance_name;
    $instanceId = $codeHistory->instance_id;
    $accessCodeStartDate = Carbon::parse($request->start_datetime)->toISOString();
    $accessCodeExpireDate = Carbon::parse($request->expire_datetime)->toISOString();
    $payloadDataUpdate = [
      "start_datetime" => $accessCodeStartDate,
      "end_datetime" => $accessCodeExpireDate,
      "code_amount" => (int)$accessCodes,
      "instance_id" => $instanceId,
      "instance_name" => $instanceName,
      "created_by" => $user,
    ];
    if (!empty($groupTestId)) {
      // Menjalankan Jika ada Group Test ID
      $response = $this->interestAndTalentService->updateAssignAccessCode($groupTestId, $payloadDataUpdate);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    } else {
        // Menjalankan Ketika tidak ada Group Test ID
        return response()->json(['error' => 'Group test id is missing'], 400);
    }
  }

}

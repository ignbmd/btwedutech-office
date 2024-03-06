<?php

namespace App\Http\Controllers\Api\Exam;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\ExamService\TryoutPremium;
use App\Services\ApiGatewayService\Internal;
use App\Services\ExamService\QuestionCategory;
use Carbon\Carbon;
use Error;

class TryoutPremiumController extends Controller
{

  private TryoutPremium $examTryoutPremiumService;
  private QuestionCategory $examQuestionCategory;
  private Internal $apiGatewayService;

  public function __construct(TryoutPremium $examTryoutPremiumService, Internal $apiGatewayService, QuestionCategory $examQuestionCategory)
  {
    $this->examTryoutPremiumService = $examTryoutPremiumService;
    $this->apiGatewayService = $apiGatewayService;
    $this->examQuestionCategory = $examQuestionCategory;
  }

  public function index()
  {
    $response = $this->examTryoutPremiumService->getAll();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function show($id)
  {
    $response = $this->examTryoutPremiumService->getById($id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  // public function create(Request $request)
  // {
  //   try {
  //     $specificProgram = ["skd", "tps", "tps-2022", "tka-saintek", "tka-soshum"];
  //     $payload = [];
  //     $schedulePayload = null;
  //     $specificTryoutCacheKey = null;
  //     foreach($request->all() as $data) {
  //       $startSectionTimestamp = Carbon::parse($data["start_date"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;
  //       $endSectionTimestamp = Carbon::parse($data["end_date"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;

  //       $startClusterTimestamp = Carbon::parse($data["cluster_data"][0]["start_datetime"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;
  //       $endClusterTimestamp = Carbon::parse($data["cluster_data"][0]["end_datetime"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;

  //       $isStartSectionTimestampNotValid = $startSectionTimestamp >= $endSectionTimestamp;
  //       $isEndSectionTimestampNotValid = $endSectionTimestamp <= $startSectionTimestamp;

  //       $isStartClusterTimestampNotValid = $startClusterTimestamp < $startSectionTimestamp
  //       || ($startClusterTimestamp >= $startSectionTimestamp && $startClusterTimestamp <= $endSectionTimestamp)
  //       || $startClusterTimestamp >= $endClusterTimestamp;
  //       $isEndClusterTimestampNotValid = $endClusterTimestamp < $startSectionTimestamp
  //       || ($endClusterTimestamp >= $startSectionTimestamp && $endClusterTimestamp <= $endSectionTimestamp)
  //       || $endClusterTimestamp <= $startClusterTimestamp;

  //       $errorMessage = null;
  //       if($isStartSectionTimestampNotValid || $isEndSectionTimestampNotValid) {
  //         $errorMessage = "Data Tanggal Pendaftaran tidak valid";
  //       } else if($isStartClusterTimestampNotValid || $isEndClusterTimestampNotValid) {
  //         $errorMessage = "Data Waktu Dimulai/Waktu Berakhir tidak valid";
  //       }

  //       if($errorMessage) return response()->json(['success' => false, 'message' => $errorMessage], 400);

  //       $data["start_date"] = Carbon::parse($data["start_date"])->timezone("Asia/Jakarta")->addHour(1);
  //       $data["end_date"] = Carbon::parse($data["end_date"])->timezone("Asia/Jakarta")->addHour(1);
  //       $data["cluster_data"][0]["start_datetime"] = Carbon::parse($data["cluster_data"][0]["start_datetime"])->timezone("Asia/Jakarta")->addHour(1);
  //       $data["cluster_data"][0]["end_datetime"] = Carbon::parse($data["cluster_data"][0]["end_datetime"])->timezone("Asia/Jakarta")->addHour(1);

  //       // Create legacy task id
  //       $responseLegacySection = $this->apiGatewayService->createLegacyTryoutFree([
  //         "title" => $data["title"],
  //         "modul_id" => $data["modules_id"],
  //         "is_private" => ($data["privacy_type"] == 'private') ? 1 : 0,
  //         "date_start" => $data["start_date"],
  //         "date_end" => $data["end_date"],
  //         "status" => $data["status"],
  //         "program" => $data["program"],
  //         "description" => "-",
  //         "link_tele" => "-",
  //         "persyaratan" => "-",
  //       ]);
  //       $responseBodyLegacySection = json_decode($responseLegacySection->body());
  //       $responseStatusLegacySection = $responseLegacySection->status();
  //       if ($responseLegacySection->failed()) {
  //         Log::error("Fail on attempt to create legacy tryout section for tryout premium", ["error" => $responseBodyLegacySection]);
  //         return response()->json($responseBodyLegacySection, $responseStatusLegacySection);
  //       }
  //       $data['section_id'] = $responseBodyLegacySection->data->section_id;

  //       // Create legacy task id
  //       $responseLegacyTask = $this->apiGatewayService->createLegacyTask([
  //         "name" => $data['title'],
  //         "waktu" => $data['duration'],
  //         "kode_modul" => $data['modules_code'],
  //         "section_id" => $data['section_id']
  //       ]);
  //       $responseBodyLegacyTask = json_decode($responseLegacyTask->body());
  //       $responseStatusLegacyTask = $responseLegacyTask->status();
  //       if ($responseLegacyTask->failed()) {
  //         Log::error("Fail on attempt to create legacy task for tryout premium", ["error" => $responseBodyLegacyTask]);
  //         return response()->json($responseBodyLegacyTask, $responseStatusLegacyTask);
  //       }
  //       $data['legacy_task_id'] = $responseBodyLegacyTask->data->inserted_tugas_id;
  //       array_push($payload, $data);
  //     }
  //     $payload = $payload[0];

  //     $response = $this->examTryoutPremiumService->create($payload);
  //     $body = json_decode($response->body());
  //     $status = $response->status();

  //     if ($response->successful()) {
  //       // Send code tryout schedule payload to firebase
  //       if (in_array($data["program"], $specificProgram)) {
  //         $schedulePayload = $this->generateSchedulePayload($body?->data);
  //         $setScheduleResponse = $this->apiGatewayService->setTryoutSchedule($schedulePayload);
  //         if ($setScheduleResponse->failed()) throw new Error('Failed on create tryout schedule to firebase! ' . $setScheduleResponse->body());
  //         if ($data["program"] === "tps" || $data["program"] === "tps-2022") {
  //           $specificTryoutCacheKey = $body?->data?->id . "-" . $body?->data?->tryout_clusters[0]?->id;
  //           $this->examTryoutPremiumService->syncTryoutGeneratedStatus(["new_keys" => $specificTryoutCacheKey, "value" => ["generated_status" => null]]);
  //         }
  //       }
  //     }

  //     return response()->json($body, $status);
  //   } catch (\Exception $e) {
  //     Log::error("Error has occured when trying to create tryout premium", ["error" => $e->getMessage()]);
  //     return response()->json(['success' => false, 'message' => 'Proses tambah tryout premium gagal, silakan coba lagi nanti', 'error' => $e->getMessage()]);
  //   }
  // }

  // public function update(Request $request, $id)
  // {
  //   $specificProgram = ["skd", "tps", "tps-2022", "tka-saintek", "tka-soshum"];
  //   $schedulePayload = null;
  //   $specificTryoutCacheKey = null;

  //   $startSectionTimestamp = Carbon::parse($request["start_date"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;
  //   $endSectionTimestamp = Carbon::parse($request["end_date"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;

  //   $startClusterTimestamp = Carbon::parse($request["cluster_data"][0]["start_datetime"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;
  //   $endClusterTimestamp = Carbon::parse($request["cluster_data"][0]["end_datetime"])->timezone("Asia/Jakarta")->addHour(1)->timestamp;

  //   $isStartSectionTimestampNotValid = $startSectionTimestamp >= $endSectionTimestamp;
  //   $isEndSectionTimestampNotValid = $endSectionTimestamp <= $startSectionTimestamp;

  //   $isStartClusterTimestampNotValid = $startClusterTimestamp < $startSectionTimestamp
  //   || ($startClusterTimestamp >= $startSectionTimestamp && $startClusterTimestamp <= $endSectionTimestamp)
  //   || $startClusterTimestamp >= $endClusterTimestamp;
  //   $isEndClusterTimestampNotValid = $endClusterTimestamp < $startSectionTimestamp
  //   || ($endClusterTimestamp >= $startSectionTimestamp && $endClusterTimestamp <= $endSectionTimestamp)
  //   || $endClusterTimestamp <= $startClusterTimestamp;

  //   $errorMessage = null;
  //   if($isStartSectionTimestampNotValid || $isEndSectionTimestampNotValid) {
  //     $errorMessage = "Data Tanggal Pendaftaran tidak valid";
  //   } else if($isStartClusterTimestampNotValid || $isEndClusterTimestampNotValid) {
  //     $errorMessage = "Data Waktu Dimulai/Waktu Berakhir tidak valid";
  //   }

  //   if($errorMessage) return response()->json(['success' => false, 'message' => $errorMessage], 400);

  //   $payload = [
  //     "id" => $id,
  //     "title" => $request->title,
  //     "branch_code" => $request->branch_code,
  //     "program" => $request->program,
  //     "legacy_task_id" => $request->legacy_task_id,
  //     "product_code" => $request->product_code,
  //     "duration" => $request->duration,
  //     "status" => $request->status,
  //     "modules_id" => $request->modules_id,
  //     "modules_code" => $request->modules_code,
  //     "instructions_id" => $request->instructions_id,
  //     "privacy_type" => $request->privacy_type,
  //     "start_date" => Carbon::parse($request["start_date"])->timezone("Asia/Jakarta")->addHour(1),
  //     "end_date" => Carbon::parse($request["end_date"])->timezone("Asia/Jakarta")->addHour(1),
  //     "cluster_data" => [
  //       [
  //         "id" => $request["cluster_data"][0]["id"],
  //         "title" => $request["cluster_data"][0]["title"],
  //         "max_capacity" => $request["cluster_data"][0]["max_capacity"],
  //         "status" => $request["cluster_data"][0]["status"],
  //         "start_datetime" => Carbon::parse($request["cluster_data"][0]["start_datetime"])->timezone("Asia/Jakarta")->addHour(1),
  //         "end_datetime" => Carbon::parse($request["cluster_data"][0]["end_datetime"])->timezone("Asia/Jakarta")->addHour(1),
  //       ]
  //     ]
  //   ];
  //   $response = $this->examTryoutPremiumService->update($id, $payload);
  //   $body = json_decode($response->body());
  //   $status = $response->status();

  //   if ($response->successful()) {
  //     // Send code tryout schedule payload to firebase
  //     $tryoutResponse = $this->examTryoutPremiumService->getById($id);
  //     $tryoutBody = json_decode($tryoutResponse)?->data ?? null;

  //     if ($tryoutBody && in_array($payload["program"], $specificProgram)) {
  //       $schedulePayload = $this->generateSchedulePayload($tryoutBody);
  //       $setScheduleResponse = $this->apiGatewayService->setTryoutSchedule($schedulePayload);
  //       if ($setScheduleResponse->failed()) throw new Error('Failed on create tryout schedule to firebase! ' . $setScheduleResponse->body());
  //       if ($payload["program"] === "tps" || $payload["program"] === "tps-2022") {
  //         $specificTryoutCacheKey = $tryoutBody?->id . "_" . $tryoutBody?->tryout_clusters[0]?->id;
  //         $this->examTryoutPremiumService->syncTryoutGeneratedStatus(["old_keys" => $specificTryoutCacheKey, "new_keys" => $specificTryoutCacheKey, "value" => ["generated_status" => null]]);
  //       }
  //     }
  //   }

  //   return response()->json($body, $status);
  // }

  // private function generateSchedulePayload($payload)
  // {
  //   // Create tryout schedule payload
  //   $body = collect($payload);
  //   $programQuestionCategoriesResponse = $this->examQuestionCategory->get($body["program"] === "tps-2022" ? "tps" : $body["program"]);
  //   $programQuestionCategories = json_decode($programQuestionCategoriesResponse->body())?->data ?? [];
  //   if($body["program"] === "tps-2022") {
  //     $categorySlugs = [
  //       "potensi_kognitif",
  //       "penalaran_matematika",
  //       "literasi_bahasa_indonesia",
  //       "literasi_bahasa_inggris",
  //     ];
  //     $programQuestionCategories = collect($programQuestionCategories)->filter(function($value, $key) use ($categorySlugs) {
  //       return in_array($value->category, $categorySlugs);
  //     })->values()->toArray();
  //   }

  //   if($body["program"] === "tps") {
  //     $categorySlugs = [
  //       "potensi_kognitif",
  //       "penalaran_matematika",
  //       "literasi_bahasa_indonesia",
  //       "literasi_bahasa_inggris",
  //     ];
  //     $programQuestionCategories = collect($programQuestionCategories)->filter(function($value, $key) use ($categorySlugs) {
  //       return !in_array($value->category, $categorySlugs);
  //     })->values()->toArray();
  //   }

  //   $schedulePayload = [];
  //   $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id] = [
  //     "tryout_title" => $body["title"],
  //     "program" => $body["program"] === "tps-2022" ? "tps" : $body["program"]
  //   ];

  //   if ($body["program"] === "skd") {
  //     $startExamDate = Carbon::parse($body["tryout_clusters"][0]?->start_datetime);
  //     $endExamDate = Carbon::parse($body["tryout_clusters"][0]?->end_datetime);
  //     $duration = $body["duration"];

  //     foreach ($programQuestionCategories as $key => $value) {
  //       $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id][strtolower($value->category) . "_category"] = ["name" => $value->description, "passing_grade" => $value->passing_grade];
  //     }

  //     $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id]["start"] = $startExamDate->timestamp;
  //     $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id]["end"] = $endExamDate->timestamp;
  //     $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id]["duration"] = $duration * 60000; // Convert duration to miliseconds
  //     return $schedulePayload;
  //   }

  //   $startExamDate = Carbon::parse($body["tryout_clusters"][0]?->start_datetime);
  //   foreach ($programQuestionCategories as $key => $value) {
  //     $keyNum = $key + 1;
  //     $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id]["category_" . $keyNum] = [
  //       "start" => $startExamDate->timestamp,
  //       "end" => Carbon::parse($startExamDate)->addSecond($value->duration)->timestamp
  //     ];
  //     $startExamDate = Carbon::parse($startExamDate)->addSecond($value->duration)->addSecond($request['intervals'][$key]["value"] ?? 0);
  //   }
  //   $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id]["category_total"] = count($programQuestionCategories);
  //   foreach ($programQuestionCategories as $key => $value) {
  //     $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id][$value->category . "_name"] = $value->description;
  //   }
  //   foreach ($programQuestionCategories as $key => $value) {
  //     $schedulePayload["uka_" . $body["tryout_clusters"][0]?->id][$value->category] = $value->duration * 1000; // Convert duration to miliseconds
  //   }
  //   return $schedulePayload;
  // }

  public function create(Request $request)
  {
    try {
      $payload = [];
      foreach($request->all() as $data) {
        // Create legacy task id
        $responseLegacySection = $this->apiGatewayService->createLegacyTryoutFree([
          "title" => $data["title"],
          "modul_id" => $data["modules_id"],
          "is_private" => ($data["privacy_type"] == 'private') ? 1 : 0,
          "date_start" => Carbon::now(),
          "date_end" => Carbon::now(),
          "status" => $data["status"],
          "program" => $data["program"],
          "description" => "-",
          "link_tele" => "-",
          "persyaratan" => "-",
        ]);
        $responseBodyLegacySection = json_decode($responseLegacySection->body());
        $responseStatusLegacySection = $responseLegacySection->status();
        if ($responseLegacySection->failed()) {
          Log::error("Fail on attempt to create legacy tryout section for tryout premium", ["error" => $responseBodyLegacySection]);
          return response()->json($responseBodyLegacySection, $responseStatusLegacySection);
        }
        $data['section_id'] = $responseBodyLegacySection->data->section_id;

        // Create legacy task id
        $responseLegacyTask = $this->apiGatewayService->createLegacyTask([
          "name" => $data['title'],
          "waktu" => $data['duration'],
          "kode_modul" => $data['modules_code'],
          "section_id" => $data['section_id']
        ]);
        $responseBodyLegacyTask = json_decode($responseLegacyTask->body());
        $responseStatusLegacyTask = $responseLegacyTask->status();
        if ($responseLegacyTask->failed()) {
          Log::error("Fail on attempt to create legacy task for tryout premium", ["error" => $responseBodyLegacyTask]);
          return response()->json($responseBodyLegacyTask, $responseStatusLegacyTask);
        }
        $data['legacy_task_id'] = $responseBodyLegacyTask->data->inserted_tugas_id;
        array_push($payload, $data);
      }
      $response = $this->examTryoutPremiumService->createBulk(["data" => $payload]);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      Log::error("Error has occured when trying to create tryout premium", ["error" => $e->getMessage()]);
      return response()->json(['success' => false, 'message' => 'Proses tambah tryout premium gagal, silakan coba lagi nanti', 'error' => $e->getMessage()]);
    }
  }

  public function update(Request $request, $id)
  {
    $payload = [
      "id" => $id,
      "title" => $request->title,
      "branch_code" => $request->branch_code,
      "program" => $request->program,
      "legacy_task_id" => $request->legacy_task_id,
      "product_code" => $request->product_code,
      "duration" => $request->duration,
      "status" => $request->status,
      "modules_id" => $request->modules_id,
      "modules_code" => $request->modules_code,
      "instructions_id" => $request->instructions_id,
      "privacy_type" => $request->privacy_type,
      "start_date" => $request->start_date,
      "end_date" => $request->end_date,
      "tags" => $request->tags,
    ];
    $response = $this->examTryoutPremiumService->update($id, $payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

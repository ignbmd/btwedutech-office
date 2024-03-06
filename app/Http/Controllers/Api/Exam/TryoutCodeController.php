<?php

namespace App\Http\Controllers\Api\Exam;

use App\Http\Controllers\Controller;
use App\Services\ApiGatewayService\Internal;
use App\Services\ExamService\TryoutCode;
use App\Services\ExamService\QuestionCategory;
use App\Services\CompetitionMapService\SkdRank;
use App\Helpers\Redis;
use App\Helpers\UserRole;
use Carbon\Carbon;
use Error;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TryoutCodeController extends Controller
{
  private TryoutCode $examTryoutCode;
  private QuestionCategory $examQuestionCategory;
  private Internal $internalService;
  private SkdRank $skdRankService;

  public function __construct(TryoutCode $examTryoutCode, QuestionCategory $examQuestionCategory, Internal$serviceInternal, SkdRank $skdRankService)
  {
    $this->examTryoutCode = $examTryoutCode;
    $this->examQuestionCategory = $examQuestionCategory;
    $this->internalService = $serviceInternal;
    $this->skdRankService = $skdRankService;
  }

  public function getAll(Request $request)
  {
    $response = $this->examTryoutCode->getAll($request->all());
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getByTag($tag)
  {
    $response = $this->examTryoutCode->getByTag($tag);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getCodeCategory()
  {
    $response = $this->examTryoutCode->getCodeCategory();
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getDetail($id)
  {
    $response = $this->examTryoutCode->detail($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getSkdRankTryout(Request $request)
  {
    $task_id = (int)$request->task_id;
    $year = (int)$request->year;

    $response = $this->skdRankService->getSkdRankTryout(['task_id' => $task_id, 'year' => $year]);
    $body = json_decode($response?->body());
    $status = $response?->status();

    return response()->json($body, $status);
  }

  public function create(Request $request)
  {
    try {
      $specificProgram = ["skd", "skb", "tps", "tps-2022", "utbk", "pppk", "tka-saintek", "tka-soshum"];
      $schedulePayload = null;

      $payload = $request->all();
      $payload['duration'] = (int) $payload['duration'];
      $payload['tryout_code'] = strtoupper($payload['tryout_code']);

      $program = $request->get('program');
      // Add default btwedutech tags
      if ($program === "skd" || $program === "tps" || $program === "tps-2022" || $program === "utbk") {
        $payload["tags"][] = "btwedutech";
      }

      if (in_array($program, $specificProgram) && $payload["is_live"]) {
        $schedulePayload = $this->generateSchedulePayload($request);
        $endDateTimestamp = Carbon::parse($payload['end_date'])->timestamp;
        $irtCacheKey = strtoupper("IRT-PKG_" . $endDateTimestamp . "_" . $payload['tryout_code']);
        $tryoutBreakTimeCacheKey = "code-tryout_" . $payload['tryout_code'] . "_break-time";
        $tryoutBreakTime = Redis::get($tryoutBreakTimeCacheKey);
        if ($tryoutBreakTime) Redis::delete($tryoutBreakTime);
      }

      if (UserRole::isMarketing()) $payload['tags'][] = "marketing";
      if ($payload["tryout_session"] && $payload["enable_uka_challenge_session"]) {
        array_push($payload["tags"], "uka_session_" . $payload["tryout_session"]["session"]);
      }
      if ($payload["program"] === "tps-2022") {
        $payload["tags"][] = "tps-2022";
        $payload["program"] = "tps";
      }
      $payload["tags"] = array_unique($payload["tags"]);
      if($payload["tryout_session"] && $payload["enable_uka_challenge_session"]) {
        $payload["tags"] = array_filter($payload["tags"], function ($element) {
          return !preg_match('/^uka_session_\d+$/', $element);
        });
        $payload["tags"] = array_merge($payload["tags"], ["uka_session_" . $payload["tryout_session"]["session"]]);
      }
      $responseLegacy = $this->internalService->createLegacyTask([
        "name" => $payload['title'],
        "waktu" => $payload['duration'],
        "kode_modul" => $payload['modules_code']
      ]);
      $responseBodyLegacy = json_decode($responseLegacy->body());
      if ($responseLegacy->failed()) {
        // Log::error('Failed create legacy task! ' . $responseLegacy->body());
        return response()->json(['message' => $responseBodyLegacy->data->errors[0]], 400);
      }
      $payload['legacy_task_id'] = $responseBodyLegacy->data->inserted_tugas_id;

      $responseLegacyCode = $this->internalService->createLegacyTryoutCode([
        "tugas_id" => $payload['legacy_task_id'],
        "name" => $payload['title'],
        "kode_kupon" => $payload['tryout_code'],
        "date_start" => $payload["start_exam_date"] ? $payload["start_exam_date"] : $payload['start_date'],
        "date_end" => $payload['end_date'],
        "program" => $payload["program"] === "tps-2022" ? "tps" : $payload["program"],
        "type" => "to_khusus",
        "is_live" => $payload['is_live'],
      ]);
      if ($responseLegacyCode->failed()) {
        $responseLegacyCodeBody = json_decode($responseLegacyCode->body());
        // Log::error('Failed create legacy tryout code! ' . $responseLegacyCode->body());
        return response()->json(['message' => $responseLegacyCodeBody->data->errors[0]], 400);
      }
      $response = $this->examTryoutCode->save($payload);
      $responseBody = json_decode($response->body());
      $responseStatus = $response->status();

      if ($response->successful()) {
        // Send code tryout schedule payload to firebase
        if (in_array($program, $specificProgram) && $payload["is_live"]) {
          $setScheduleResponse = $this->internalService->setTryoutCodeSchedule($schedulePayload);
          if ($setScheduleResponse->failed()) throw new Error('Failed on create tryout code schedule to firebase! ' . $setScheduleResponse->body());
          if ($program === "tps" || $program === "tps-2022" || $program === "utbk") $this->examTryoutCode->syncTryoutGeneratedStatus(["new_keys" => $irtCacheKey, "value" => ["generated_status" => null]]);
          if ($program === "tps" || $program === "tps-2022" || $program === "utbk") Redis::set($tryoutBreakTimeCacheKey, json_encode($payload['intervals']));
        }
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Tryout Kode berhasil dibuat!'
        ]);
      }
    } catch (\Throwable $th) {
      throw $th;
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function update(Request $request)
  {
    $specificProgram = ["skd", "skb", "tps", "utbk", "tps-2022", "tka-saintek", "pppk", "tka-soshum"];
    $schedulePayload = null;

    $payload = $request->all();
    $payload['duration'] = (int) $payload['duration'];
    $payload['tryout_code'] = strtoupper($payload['tryout_code']);
    $program = $request->get('program');

    if (UserRole::isMarketing()) $payload['tags'][] = "marketing";
    $tryoutCodeResponse = $this->examTryoutCode->getById($payload['id']);
    $tryoutCode = json_decode($tryoutCodeResponse->body()) ?? null;
    if (!$tryoutCode) return response()->json(['message' => 'Telah terjadi kesalahan dalam proses update data.. Silakan coba lagi..'], 500);
    if (in_array("marketing", $tryoutCode->data->packages->tags)) $payload['tags'][] = "marketing";

    $tcStartTimestamp = Carbon::parse($tryoutCode->data->start_exam_date)->timezone('Asia/Jakarta')->timestamp;
    $tcEndTimestamp = Carbon::parse($tryoutCode->data->packages->end_date)->timezone('Asia/Jakarta')->timestamp;

    $payloadStartTimestamp = Carbon::parse($payload['start_exam_date'])->timezone('Asia/Jakarta')->timestamp;
    $payloadEndTimestamp = Carbon::parse($payload['end_date'])->timezone('Asia/Jakarta')->timestamp;

    $oldIrtCacheKey = "IRT-PKG_" . $tcEndTimestamp . "_" . $payload["tryout_code"];
    $newIrtCacheKey = "IRT-PKG_" . $payloadEndTimestamp . "_" . $payload["tryout_code"];

    $isTryoutTimestampChanged = $payloadStartTimestamp !== $tcStartTimestamp || $payloadEndTimestamp !== $tcEndTimestamp;
    $isTryoutCodeActive = $tryoutCode->data->status;

    if (in_array($program, $specificProgram) &&  $isTryoutTimestampChanged && $isTryoutCodeActive) {
      $currentTimestamp = Carbon::now()->timezone('Asia/Jakarta')->timestamp;
      $startExamTimestamp = Carbon::parse($tryoutCode->data->start_exam_date)->timezone('Asia/Jakarta')->timestamp;
      $endExamTimestamp = Carbon::parse($tryoutCode->data->packages->end_date)->timezone('Asia/Jakarta')->timestamp;
      if (($currentTimestamp >= $startExamTimestamp && $endExamTimestamp > $currentTimestamp) && $payload["is_live"]) return response()->json(['message' => 'Tryout sedang berlangsung, tidak dapat mengubah waktu tryout'], 400);
    }

    if(!$payload["enable_uka_challenge_session"]) {
      $payload["tags"] = array_filter($payload["tags"], function ($element) {
        return !preg_match('/^uka_session_\d+$/', $element);
      });
    }

    // Add default btwedutech tags
    if ($program === "skd" || $program === "tps" || $program === "tps-2022" || $program === "utbk") {
      $payload["tags"][] = "btwedutech";
    }

    if (in_array($program, $specificProgram) && $payload["is_live"]) {
      $schedulePayload = $this->generateSchedulePayload($request);
      $tryoutBreakTimeCacheKey = "code-tryout_" . $payload['tryout_code'] . "_break-time";
      $tryoutBreakTime = Redis::get($tryoutBreakTimeCacheKey);
      if ($tryoutBreakTime) Redis::delete($tryoutBreakTime);
    }
    if ($payload["tryout_session"] && $payload["enable_uka_challenge_session"]) {
      array_push($payload["tags"], "uka_session_" . $payload["tryout_session"]["session"]);
    }
    if ($payload["program"] === "tps-2022") {
      $payload["tags"][] = "tps-2022";
      $payload["program"] = "tps";
    }
    $payload["tags"] = array_unique($payload["tags"]);
    if($payload["tryout_session"] && $payload["enable_uka_challenge_session"]) {
      $payload["tags"] = array_filter($payload["tags"], function ($element) {
        return !preg_match('/^uka_session_\d+$/', $element);
      });
      $payload["tags"] = array_merge($payload["tags"], ["uka_session_" . $payload["tryout_session"]["session"]]);
    }
    $response = $this->examTryoutCode->update($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      // Send code tryout schedule payload to firebase
      if (in_array($program, $specificProgram) && $payload["is_live"]) {
        $setScheduleResponse = $this->internalService->setTryoutCodeSchedule($schedulePayload);
        if ($setScheduleResponse->failed()) throw new Error('Failed on create tryout code schedule to firebase! ' . $setScheduleResponse->body());
        if ($program === "tps" || $program === "tps-2022" || $program === "utbk") {
          Redis::set($tryoutBreakTimeCacheKey, json_encode($payload['intervals']));
          $this->examTryoutCode->syncTryoutGeneratedStatus([
            "old_keys" => $oldIrtCacheKey,
            "new_keys" => $newIrtCacheKey,
            "value" => ["generated_status" => null]
          ]);
        }
      }
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Tryout Kode berhasil diperbarui!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function delete($id)
  {
    // Get deleted tryout code data
    $tryoutDetail = $this->getDetail($id)?->getData(true);
    $code = $tryoutDetail["data"]["tryout_code"];

    // Remove code tryout schedule on firebase
    $this->internalService->removeTryoutCodeSchedule($code);

    // Remove code tryout data on exam service
    $response = $this->examTryoutCode->delete($id);
    $responseBody = json_decode($response?->body());
    $responseStatus = $response->status();
    return response()->json($responseBody, $responseStatus);
  }

  private function generateSchedulePayload(Request $request)
  {
    // Create code tryout schedule payload
    $requestBody = collect($request->all());
    $programQuestionCategoriesResponse = $this->examQuestionCategory->get($requestBody["program"] === "tps-2022" ? "tps" : $requestBody["program"]);
    $programQuestionCategories = json_decode($programQuestionCategoriesResponse->body())?->data ?? [];

    if($requestBody["program"] === "tps-2022") {
      $categorySlugs = [
        "potensi_kognitif",
        "penalaran_matematika",
        "literasi_bahasa_indonesia",
        "literasi_bahasa_inggris",
      ];
      $programQuestionCategories = collect($programQuestionCategories)->filter(function($value, $key) use ($categorySlugs) {
        return in_array($value->category, $categorySlugs);
      })->values()->toArray();
    }

    if($requestBody["program"] === "tps") {
      $categorySlugs = [
        "potensi_kognitif",
        "penalaran_matematika",
        "literasi_bahasa_indonesia",
        "literasi_bahasa_inggris",
      ];
      $programQuestionCategories = collect($programQuestionCategories)->filter(function($value, $key) use ($categorySlugs) {
        return !in_array($value->category, $categorySlugs);
      })->values()->toArray();
    }

    $schedulePayload = [];
    $schedulePayload[$requestBody["tryout_code"]] = [
      "tryout_title" => $requestBody["title"],
      "program" => $requestBody["program"] === "tps-2022" ? "tps" : $requestBody["program"]
    ];

    if ($requestBody["program"] === "skd" || $requestBody["program"] === "pppk" || $requestBody["program"] === "skb") {
      $startExamDate = Carbon::parse($requestBody["start_exam_date"]);
      $endExamDate = Carbon::parse($requestBody["end_date"]);
      $duration = $requestBody["duration"];

      foreach ($programQuestionCategories as $key => $value) {
        $schedulePayload[$requestBody["tryout_code"]][strtolower($value->category) . "_category"] = ["name" => $value->description, "passing_grade" => $value->passing_grade];
      }

      $schedulePayload[$requestBody["tryout_code"]]["start"] = $startExamDate->timestamp;
      $schedulePayload[$requestBody["tryout_code"]]["end"] = $endExamDate->timestamp;
      $schedulePayload[$requestBody["tryout_code"]]["duration"] = $duration * 60000; // Convert duration to miliseconds
      return $schedulePayload;
    }

    $startExamDate = Carbon::parse($requestBody["start_exam_date"]);
    foreach ($programQuestionCategories as $key => $value) {
      $keyNum = $key + 1;
      $schedulePayload[$requestBody["tryout_code"]]["category_" . $keyNum] = [
        "start" => $startExamDate->timestamp,
        "end" => Carbon::parse($startExamDate)->addSecond($value->duration)->timestamp
      ];
      $startExamDate = Carbon::parse($startExamDate)->addSecond($value->duration)->addSecond($request['intervals'][$key]["value"] ?? 0);
    }
    $schedulePayload[$requestBody["tryout_code"]]["category_total"] = count($programQuestionCategories);
    foreach ($programQuestionCategories as $key => $value) {
      $schedulePayload[$requestBody["tryout_code"]][$value->category . "_name"] = $value->description;
    }
    foreach ($programQuestionCategories as $key => $value) {
      $schedulePayload[$requestBody["tryout_code"]][$value->category] = $value->duration * 1000; // Convert duration to miliseconds
    }
    return $schedulePayload;
  }
}

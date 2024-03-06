<?php

namespace App\Http\Controllers\Api\ExamCPNS;

use App\Http\Controllers\Controller;
use App\Services\ApiGatewayService\Internal;
use App\Services\ExamCPNSService\TryoutCode;
use App\Services\ExamCPNSService\QuestionCategory;
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

  public function __construct(TryoutCode $examTryoutCode, QuestionCategory $examQuestionCategory, Internal$serviceInternal)
  {
    $this->examTryoutCode = $examTryoutCode;
    $this->examQuestionCategory = $examQuestionCategory;
    $this->internalService = $serviceInternal;
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

  public function create(Request $request)
  {
    try {
      $specificProgram = ["skd", "skb"];
      $schedulePayload = null;

      $payload = $request->all();
      $payload['duration'] = (int) $payload['duration'];
      $payload['tryout_code'] = strtoupper($payload['tryout_code']);

      $program = $request->get('program');

      // Add default btwedutech tags
      $payload["tags"][] = "btwedutech";

      if (in_array($program, $specificProgram) && $payload["is_live"]) $schedulePayload = $this->generateSchedulePayload($request);

      if (UserRole::isMarketing()) $payload['tags'][] = "marketing";
      if ($payload["tryout_session"] && $payload["enable_uka_challenge_session"]) {
        array_push($payload["tags"], "uka_session_" . $payload["tryout_session"]["session"]);
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
        "date_start" => $payload['start_date'],
        "date_end" => $payload['end_date'],
        "program" => $payload["program"],
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
    $specificProgram = ["skd", "skb"];
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

    $isTryoutTimestampChanged = $payloadStartTimestamp !== $tcStartTimestamp || $payloadEndTimestamp !== $tcEndTimestamp;
    $isTryoutCodeActive = $tryoutCode->data->status;

    if (in_array($program, $specificProgram) &&  $isTryoutTimestampChanged && $isTryoutCodeActive) {
      $currentTimestamp = Carbon::now()->timezone('Asia/Jakarta')->timestamp;
      $startExamTimestamp = Carbon::parse($tryoutCode->data->start_exam_date)->timezone('Asia/Jakarta')->timestamp;
      $endExamTimestamp = Carbon::parse($tryoutCode->data->packages->end_date)->timezone('Asia/Jakarta')->timestamp;
      if ($currentTimestamp >= $startExamTimestamp && $endExamTimestamp > $currentTimestamp) return response()->json(['message' => 'Tryout sedang berlangsung, tidak dapat mengubah waktu tryout'], 400);
    }

    if(!$payload["enable_uka_challenge_session"]) {
      $payload["tags"] = array_filter($payload["tags"], function ($element) {
        return !preg_match('/^uka_session_\d+$/', $element);
      });
    }

    // Add default btwedutech tags
    $payload["tags"][] = "btwedutech";

    if (in_array($program, $specificProgram) && $payload["is_live"]) {
      $schedulePayload = $this->generateSchedulePayload($request);
    }
    if ($payload["tryout_session"] && $payload["enable_uka_challenge_session"]) {
      array_push($payload["tags"], "uka_session_" . $payload["tryout_session"]["session"]);
    }
    $payload["tags"] = array_unique($payload["tags"]);
    if($payload["tryout_session"] && $payload["enable_uka_challenge_session"]) {
      $payload["tags"] = array_filter($payload["tags"], function ($element) {
        return !preg_match('/^uka_session_\d+$/', $element);
      });
      $payload["tags"] = array_merge($payload["tags"], ["uka_session_" . $payload["tryout_session"]["session"]]);
    }
    $response = $this->examTryoutCode->update((int)$payload["id"], $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();
    if ($response->successful()) {
      // Send code tryout schedule payload to firebase
      if (in_array($program, $specificProgram) && $payload["is_live"]) {
        $setScheduleResponse = $this->internalService->setTryoutCodeSchedule($schedulePayload);
        if ($setScheduleResponse->failed()) throw new Error('Failed on create tryout code schedule to firebase! ' . $setScheduleResponse->body());
      }
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Tryout Kode berhasil diperbarui!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  private function generateSchedulePayload(Request $request)
  {
    // Create code tryout schedule payload
    $requestBody = collect($request->all());
    $programQuestionCategoriesResponse = $this->examQuestionCategory->get($requestBody["program"]);
    $programQuestionCategories = json_decode($programQuestionCategoriesResponse->body())?->data ?? [];

    $schedulePayload = [];
    $schedulePayload[$requestBody["tryout_code"]] = [
      "tryout_title" => $requestBody["title"],
      "program" => $requestBody["program"]
    ];
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

    // if ($requestBody["program"] === "skd" || $requestBody["program"] === "pppk" || $requestBody["program"] === "skb") {
    //   $startExamDate = Carbon::parse($requestBody["start_exam_date"]);
    //   $endExamDate = Carbon::parse($requestBody["end_date"]);
    //   $duration = $requestBody["duration"];

    //   foreach ($programQuestionCategories as $key => $value) {
    //     $schedulePayload[$requestBody["tryout_code"]][strtolower($value->category) . "_category"] = ["name" => $value->description, "passing_grade" => $value->passing_grade];
    //   }

    //   $schedulePayload[$requestBody["tryout_code"]]["start"] = $startExamDate->timestamp;
    //   $schedulePayload[$requestBody["tryout_code"]]["end"] = $endExamDate->timestamp;
    //   $schedulePayload[$requestBody["tryout_code"]]["duration"] = $duration * 60000; // Convert duration to miliseconds
    //   return $schedulePayload;
    // }

    // $startExamDate = Carbon::parse($requestBody["start_exam_date"]);
    // foreach ($programQuestionCategories as $key => $value) {
    //   $keyNum = $key + 1;
    //   $schedulePayload[$requestBody["tryout_code"]]["category_" . $keyNum] = [
    //     "start" => $startExamDate->timestamp,
    //     "end" => Carbon::parse($startExamDate)->addSecond($value->duration)->timestamp
    //   ];
    //   $startExamDate = Carbon::parse($startExamDate)->addSecond($value->duration)->addSecond($request['intervals'][$key]["value"] ?? 0);
    // }
    // $schedulePayload[$requestBody["tryout_code"]]["category_total"] = count($programQuestionCategories);
    // foreach ($programQuestionCategories as $key => $value) {
    //   $schedulePayload[$requestBody["tryout_code"]][$value->category . "_name"] = $value->description;
    // }
    // foreach ($programQuestionCategories as $key => $value) {
    //   $schedulePayload[$requestBody["tryout_code"]][$value->category] = $value->duration * 1000; // Convert duration to miliseconds
    // }
    // return $schedulePayload;
  }
}

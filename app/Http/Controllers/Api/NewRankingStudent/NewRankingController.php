<?php

namespace App\Http\Controllers\Api\NewRankingStudent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\SSOService\SSO;
use App\Helpers\S3;
use App\Services\NewRankingService\StudentRanking;
use App\Services\ExamService\Package;
use App\Services\GenerateResultService\GenerateResult;
use App\Services\ExamCPNSService\CPNSRanking;
use App\Services\ExamService\Exam;
use App\Services\ApiGatewayService\Internal;

class NewRankingController extends Controller
{
  private StudentRanking $studentRanking;
  private Package $package;
  private GenerateResult $generateResult;
  private CPNSRanking $cpnsRanking;
  private Exam $examService;
  private Internal $service;

  public function __construct(
    StudentRanking $studentRanking,
    Package $package,
    GenerateResult $generateResult,
    CPNSRanking $cpnsRanking,
    Exam $examService,
    Internal $service

  ) {
    $this->studentRanking = $studentRanking;
    $this->package = $package;
    $this->generateResult = $generateResult;
    $this->cpnsRanking = $cpnsRanking;
    $this->examService = $examService;
    $this->service = $service;
  }

  public function getStudentRanking(string $program, int $taskId)
  {

    $response = $this->studentRanking->getRankingsByTaksId($program, $taskId);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getAllUKAList(string $program, string $category)
  {
    $response = ($program === "cpns")
      ? $this->cpnsRanking->getRankingCPNS($category)
      : $this->package->getAllUKAList($program, $category);
    $body = json_decode($response->body());
    $status = $response->status();

    return response()->json($body, $status);
  }

  public function generatePDF(string $program, int $taskId)
  {
    if ($program === "skd") {
      $program = "ptk";
    } elseif ($program === "utbk") {
      $program = "ptn";
    } else {
      $program = "cpns";
    }
    $response = $this->generateResult->generatePDFRanking($program, $taskId);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getUKAListByTaskId(string $program, int $taskId)
  {
    if ($program === "cpns") {
      $response = $this->cpnsRanking->getSingleUKACPNS($taskId);
    } else {
      $response =  $this->package->getUkaByTaskId($taskId);
    }
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function recalculateIRTScore(string $tryoutCode)
  {
    // Cek schedule generating
    $response = $this->service->getCodeTryoutSchedules();
    $body = json_decode($response->body());

    $tryoutSchedule = $body->data->{$tryoutCode} ?? null;

    if ($tryoutSchedule && $tryoutSchedule->calculation_status === 'GENERATING') {
      return response()->json(['message' => 'Sedang di kalkulasi']);
    }

    $payload = ["tryout_code" => $tryoutCode];

    $response = $this->examService->recalculateIRT($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function recalculateIRTUKAStage(int $package_id, int $session)
  {

    $payload = [
      "package_id" => $package_id,
      "cluster_id" => $session
    ];

    $response = $this->examService->recalculateIRT($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LearningService\Student;
use App\Services\ApiGatewayService\Internal;
use App\Services\CompetitionMapService\SkdRank;
use App\Services\ProfileService\Profile;
use App\Services\ProductService\Product;
use App\Services\FinanceService\Bill;
use App\Services\StudentResultService\ClassroomResult;
use App\Services\StudentResultService\Ranking;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class StudentController extends Controller
{
  private Student $service;
  private Internal $apiGatewayService;
  private Profile $profileService;
  private Product $productService;
  private Bill $billFinanceService;
  private SkdRank $skdRankService;
  private Ranking $rankingService;

  public function __construct(Student $studentService, Internal $apiGatewayService, Profile $profileService, Product $productService, Bill $billFinanceService, SkdRank $skdRankService, Ranking $rankingService)
  {
    $this->service = $studentService;
    $this->apiGatewayService = $apiGatewayService;
    $this->profileService = $profileService;
    $this->productService = $productService;
    $this->billFinanceService = $billFinanceService;
    $this->skdRankService = $skdRankService;
    $this->rankingService = $rankingService;
  }

  public function getAll(Request $request)
  {
    $branch_code = Auth::user()->branch_code ?? "PT0000";
    $is_admin = $branch_code == "PT0000";

    $draw = $request->get('draw');

    if ($draw == 1) {
      return response()->json([
        "draw" => intval($draw),
        "recordsTotal" => 0,
        "recordsFiltered" => 0,
        "data" => []
      ], 200);
    }

    $limit = $request->get("length");
    $skip = $request->get('start');

    $search = $request->get('search')['value'] ?? "";
    $students = $is_admin
      ? $this->profileService->getStudentsByBranchCode($branch_code, $limit, $skip, $search)
      : $this->profileService->getStudentsByMultipleBranchCode($branch_code, $limit, $skip, $search);

    $studentIds = collect($students?->data ?? [])->pluck('smartbtw_id')->all();
    $classrooms = count($studentIds) > 0
      ? $this->service->getBySmartbtwIds($studentIds)
      : [];
    $studentClassrooms = count($classrooms) > 0
      ? collect($classrooms)
      ->mapWithKeys(function ($item) {
        return [$item->smartbtw_id => $item->classroom_names ?? []];
      })
      ->toArray()
      : [];
    foreach ($students?->data ?? [] as $student) {
      // $onlineProducts = $this->productService->getAOPPerStudent($student->smartbtw_id, null, null);
      // $onlineProductTitles = array_column($onlineProducts, 'product');
      // $studentOnlineProducts = array_values(array_unique(array_column($onlineProductTitles, 'title')));

      // $offlineProducts = $this->billFinanceService->getBySmartBTWID($student->smartbtw_id);
      // $filteredOfflineProducts = array_filter($offlineProducts, function ($value) {
      //   return $value->paid_bill > 0;
      // });
      // $studentOfflineProducts = array_values(array_unique(array_map(function ($value) {
      //   return $value->title;
      // }, $filteredOfflineProducts)));
      $student->products = [];
      $student->offline_products = [];
      $student->classroom_names = array_key_exists($student->smartbtw_id, $studentClassrooms)
        ? $studentClassrooms[$student->smartbtw_id]
        : [];
    }

    return response()->json([
      "draw" => intval($draw),
      "recordsTotal" => $students?->total ?? 0,
      "recordsFiltered" => $students?->filtered ?? 0,
      "data" => $students?->data ?? []
    ], 200);
  }

  public function getStudentById($studentId)
  {
    $student_profile = $this->profileService->getSingleStudent((int) $studentId);
    return response()->json(['data' => $student_profile]);
  }


  public function getStudentIDForSaleData($studentId)
  {
    $student_profile_elastic = $this->profileService->getSingleStudentFromElastic((int) $studentId);

    // Get student address and parent data
    $student_profile_mongo = $this->profileService->getSingleStudent((int) $studentId);
    $student_profile_elastic->address = $student_profile_mongo->address ? $student_profile_mongo->address : "";
    $student_profile_elastic->parent_name = $student_profile_mongo->parent_datas ? $student_profile_mongo->parent_datas->parent_name : "";
    $student_profile_elastic->parent_number = $student_profile_mongo->parent_datas ? $student_profile_mongo->parent_datas->parent_number : "";

    return response()->json(['data' => $student_profile_elastic]);
  }

  public function getStudentClassroomsByStudentIds(Request $request)
  {
    $studentIds = $request->student_ids;
    $classrooms = $this->service->getBySmartbtwIds($studentIds);
    $studentClassrooms = !isset($classrooms->errors) ? $classrooms[0]->classroom_names : [];

    return response()->json(['data' => $studentClassrooms]);
  }

  public function getSkdRankStudent(Request $request)
  {
    $score = (int)$request->score;
    $year = (int)$request->year;

    $response = $this->skdRankService->getSkdRankStudent(['score' => $score, 'year' => $year]);
    $body = json_decode($response?->body());
    $status = $response?->status();

    return response()->json($body, $status);
  }

  public function getExamResult(Request $request)
  {
    $task_id = $request->task_id;
    $smartbtw_id = $request->smartbtw_id;

    $response = $this->rankingService->getExamResult(['task_id' => $task_id, 'smartbtw_id' => $smartbtw_id]);
    $body = json_decode($response?->body());
    $status = $response?->status();

    return response()->json($body, $status);
  }

  public function search(Request $request)
  {
    $branch_code = $request->get('branch_code') ?? Auth::user()->branch_code;
    $search_value = $request->get('value') ?? "";

    $response = $this->apiGatewayService->searchStudents(['branch_code' => $branch_code, 'value' => $search_value]);
    return response()->json($response, 200);
  }

  public function result(Request $request, $studentId)
  {
    $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/student-result/module-summary';
    $request_params = ['student_id' => $studentId, 'program' => $request->get('program') ?? 'skd'];
    if ($request->has('exam_type') && $request->get('exam_type') !== null) $request_params['exam_type'] = $request->get('exam_type');
    $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url, $request_params);
    try {
      $student_result = json_decode($response)->data->report;
      foreach ($student_result as $result) {
        $parsedStartDate = \Carbon\Carbon::parse($result->start)->timezone('Asia/Jakarta');
        $parsedEndDate = \Carbon\Carbon::parse($result->end)->timezone('Asia/Jakarta');

        $result->start = $parsedStartDate < $parsedEndDate
          ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . " WIB"
          : '-';

        $result->end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . " WIB";

        $result->doneInterval = $parsedStartDate < $parsedEndDate
          ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE])
          : '-';
      }

      return response()->json(['status' => 200, 'data' => $student_result], 200);
    } catch (\Exception $e) {
      return $response->throw()->json();
    }
  }

  // public function resultPDF(Request $request, $studentId)
  // {
  //   $program = $request->program;
  //   $exam_type = $request->exam_type;
  //   $isIRT = $program == "tps_irt";

  //   $classroomResultService = new ClassroomResult();
  //   $profileService = new Profile();

  //   $profile = $profileService->getSingleStudent($studentId);
  //   if(!$profile) dd('Profile not found for student with smartbtw_id: ' . $studentId . ' or server error when getting data from profile service');

  //   $parentPhone = $profile && property_exists($profile, "parent_datas") ? $profile?->parent_datas?->parent_number : $profile?->parent_number;
  //   if(!$parentPhone) dd('Parent phone number not found for student with smartbtw_id: ' . $studentId . ' or server error when getting data from profile service');

  //   $studentResult = $isIRT
  //   ? $classroomResultService->getIRTSummary([$studentId], $exam_type)
  //   : $classroomResultService->getSummary([$studentId], $request->program, $exam_type);

  //   if(($studentResult && $studentResult[0]->done > 0)) {
  //     $startDate = Carbon::now()->subWeek()->format('Y-m-d');
  //     $endDate = Carbon::now()->format('Y-m-d');
  //     $payload = [
  //       'user' => $studentResult[0]->student,
  //       'report' => $studentResult[0],
  //       'program' => $program,
  //       'program_title' => implode(' ', explode('-', $program)),
  //       'start_date' => $startDate,
  //       'end_date' => $endDate,
  //       'is_last_week_report' => false
  //     ];

  //     $html = view($isIRT ? "pages.student-result.print-irt-tryout-report" : "pages.student-result.print-tryout-report", $payload);
  //     $pdf  = SnappyPdf::loadHTML($html)
  //     ->setPaper('a4')
  //     ->setOrientation($isIRT ? 'landscape' : 'potrait')
  //     ->setOption('margin-top', 0)
  //     ->setOption('margin-left', 0)
  //     ->setOption('margin-right', 0)
  //     ->setOption('margin-bottom', 0);
  //     return $pdf->stream("Student Report.pdf");
  //   }
  // }

  public function presenceLog($studentId)
  {
    $url = env('SERVICE_LEARNING_ADDRESS') . '/student-presence/student-presence-log';
    $params = ['smartbtw_id' => $studentId];
    $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url, $params);
    try {
      $student_presence_log = json_decode($response)->data;
      return response()->json(['status' => 200, 'data' => $student_presence_log], 200);
    } catch (\Exception $e) {
      return $response->throw()->json();
    }
  }

  public function transaction($studentId)
  {
    $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/students/' . $studentId . '/transaction';
    $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url);
    try {
      $student_transaction = json_decode($response)->data;
      return response()->json(['status' => 200, 'data' => $student_transaction], 200);
    } catch (\Exception $e) {
      return $response->throw()->json();
    }
  }

  public function syncStudent(Request $request)
  {
    $payload = [
      "smartbtw_id" => $request->smartbtw_id,
      "branch_code" =>
      preg_match('/KB.+|PV.+|PT.+/', $request->branch_code)
        ? $request->branch_code
        : null,
      "email" => $request->email,
      "name" => $request->name,
      "address" => $request->address,
      "photo" => $request->photo,
      "whatsapp_no" => $request->whatsapp_no,
      "parent_phone" => $request->parent_phone
    ];
    $response = $this->service->createUpdateStudent($payload);
    $responseBody = json_decode($response?->body());
    $status = $response->status();

    return response()->json([
      'data' => $responseBody->data,
      'messages' => $responseBody->messages
    ], $status);
  }

  public function delete(Request $request)
  {
    try {
      $response = $this->apiGatewayService->deleteStudent($request->get('smartbtw_id'));
      $responseBody = json_decode($response?->body());
      $status = $response->status();
      return response()->json([
        "success" => true,
        "message" => $responseBody->message
      ], $status);
    } catch (\Exception $e) {
      return response()->json([
        "success" => false,
        "message" => $e->getMessage()
      ], 500);
    }
  }

  public function getStudentTargetFromElasticByEmail(string $student_email, string $type)
  {
    // Cari btwedutech_id siswa berdasarkan email
    $btwEdutechStudentsResponse = $this->profileService->getInterviewByStudentEmails(["email" => [$student_email], "year" => Carbon::now()->year]);
    $btwEdutechStudents = json_decode($btwEdutechStudentsResponse->body())->data ?? [];
    if (!count($btwEdutechStudents)) {
      return response()->json(['success' => false, 'message' => "Student with email $student_email was not found on elastic 'student_profiles' index"], 400);
    }

    // Mengecek apakah siswa memiliki akun BTW Edutech atau tidak
    $btwEdutechStudent = $btwEdutechStudents[0];
    if ($btwEdutechStudent->btwedutech_id === 0) {
      return response()->json(['success' => false, 'message' => "The student does not have BTW Edutech account. Please make sure he/she has one"], 400);
    }

    $response = $this->profileService->getStudentTargetFromElastic($btwEdutechStudent->btwedutech_id, $type);
    $body = json_decode($response->getBody());
    $status = $response->getStatusCode();
    return response()->json($body, $status);
  }

  public function getUKACodeScoresByEmail(string $studentEmail)
  {
    $response = $this->profileService->getUKACodeScoresByEmail($studentEmail);
    $body = json_decode($response->getBody()) ?? null;

    if (isset($body->data->ptn_histories) && count($body->data->ptn_histories)) {
      $body->data->ptn_histories = collect($body->data->ptn_histories)
        ->map(function ($item) use ($studentEmail) {

          $item->student_email = $studentEmail;
          $item->exam_code = $this->generateExamCode($item->exam_name);
          $item->start = $this->generateLocaleDate($item->start);
          return $item;
        })
        ->values()
        ->toArray();
    }

    if (isset($body->data->ptk_histories) && count($body->data->ptk_histories)) {
      $body->data->ptk_histories = collect($body->data->ptk_histories)
        ->map(function ($item) use ($studentEmail) {
          $item->student_email = $studentEmail;
          $item->exam_code = $this->generateExamCode($item->exam_name);
          $item->start = Carbon::parse($item->start)->locale("id")->format("d F Y");
          return $item;
        })
        ->values()
        ->toArray();
    }

    $status = $response->getStatusCode();
    return response()->json($body, $status);
  }

  public function getAllSingleStudentTarget(int $student_id, string $target_type)
  {
    $response = $this->profileService->getAllSingleStudentTarget($student_id, $target_type);
    $body = json_decode($response->getBody());
    $status = $response->getStatusCode();
    return response()->json($body, $status);
  }

  private function generateLocaleDate($date)
  {
    return Carbon::parse($date)
      ->locale('id')
      ->settings(['formatFunction' => 'translatedFormat'])
      ->format('j F Y');
  }

  private function generateExamCode($exam_name)
  {
    $trimmed_exam_name = str_replace(" ", "", trim($exam_name));
    $exploded_exam_name = explode("|", $trimmed_exam_name);
    $exam_code = $exploded_exam_name[1];
    return $exam_code ? $exam_code : "-";
  }
}

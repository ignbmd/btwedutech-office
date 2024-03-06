<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GenerateResultService\GenerateResult;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use Illuminate\Http\Request;

class GenerateResultController extends Controller
{
  private GenerateResult $generateResultService;
  private ClassRoom $learningClassroomService;
  private ClassMember $learningClassMemberService;
  public function __construct(
    GenerateResult $generateResultService,
    ClassRoom $learningClassroomService,
    ClassMember $learningClassMemberService
  ) {
    $this->generateResultService = $generateResultService;
    $this->learningClassroomService = $learningClassroomService;
    $this->learningClassMemberService = $learningClassMemberService;
  }

  public function getStudentPTKReportPDFLink(Request $request, string $student_id)
  {
    $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : null;
    $response = $this->generateResultService->getStudentPTKReportPDFLink($student_id, $filter);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getStudentPTKResumePDFLink(Request $request, string $student_id)
  {
    $filter = $request->has('filter') && $request->get('filter') ? $request->get('filter') : null;
    $response = $this->generateResultService->getStudentPTKResumePDFLink($student_id, $filter);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getPerformaKelasPDFLink(Request $request)
  {
    $classroom = $this->learningClassroomService->getSingle($request->classroom_id);
    if (!$classroom) {
      return response()->json(['success' => false, 'data' => null, 'message' => "Classroom was not found"]);
    }

    $classroomProgram = "ptk";
    $classroomTags = collect($classroom->tags)
      ->map(fn ($tag) => strtoupper($tag))
      ->toArray() ?? [];

    $isPTNClassroomProgram = in_array("PTN", $classroomTags)
      || in_array("UTBK", $classroomTags)
      || in_array("SNBT", $classroomTags);
    $isCPNSClassroomProgram = in_array("CPNS", $classroomTags);
    if ($isPTNClassroomProgram) {
      $classroomProgram = "ptn";
    }
    if ($isCPNSClassroomProgram) {
      $classroomProgram = "cpns";
    }

    $classMembers = $this->learningClassMemberService->getByClassroomId($request->classroom_id);
    if (count($classMembers) == 0) {
      return response()->json(['success' => false, 'data' => null, 'message' => "This classroom has no member"]);
    }

    $classMembersIDs = collect($classMembers)
      ->pluck('smartbtw_id')
      ->all();

    $payload = [
      "smartbtw_id" => $classMembersIDs,
      "program" => $classroomProgram,
      "type_stages" => $request->type_stages,
      "type_module" => $request->type_module,
      "class_name" => $request->class_name,
      "category_uka" => $request->category_uka
    ];
    $response = $this->generateResultService->generatePDFPerformaKelas($payload);
    $body = json_decode($response->body());
    $streamFile = $request->has('stream_file') ? $request->get('stream_file') : false;
    if (isset($body->data->link) && $streamFile) {
      $explodedLink = explode("/", $body->data->link);
      $fileNameWithExtension = $explodedLink[count($explodedLink) - 1];
      $fileNameWithoutExtension = str_replace(".pdf", "", $fileNameWithExtension);
      $body->data->file_name = $fileNameWithoutExtension;
      $body->data->link = "/api/generate-result/pdf-performa-kelas/$fileNameWithoutExtension";
    }
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function streamPerformaKelasPDFDocument(string $file_name)
  {
    $basePath = env('PERFORMA_REPORT_PDF_BASE_PATH') ?? "https://btw-cdn.com/uploads/student-reports-performa";
    $pdfContent = file_get_contents($basePath . "/" . $file_name . ".pdf");
    $headers = [
      'Content-Disposition' => "inline; filename=" . $file_name . "pdf",
      'Content-Type' => 'application/pdf',
    ];

    // Stream the PDF content as a response
    return response()->make($pdfContent, 200, $headers);
  }

  public function streamStudentProgressReportPDFDocument(string $file_name)
  {
    $basePath = env("PROGRESS_REPORT_PDF_BASE_PATH") ?? "https://btw-cdn.com/uploads/student-reports-progress";
    $pdfContent = file_get_contents($basePath . "/" . $file_name . ".pdf");
    $headers = [
      'Content-Disposition' => "inline; filename=" . $file_name . "pdf",
      'Content-Type' => 'application/pdf',
    ];

    // Stream the PDF content as a response
    return response()->make($pdfContent, 200, $headers);
  }

  public function streamStudentUKAStageReportPDFDocument(string $file_name)
  {
    $basePath = env("UKA_STAGE_REPORT_PDF_BASE_PATH") ?? "https://btw-cdn.com/uploads/student-reports-uka";
    $pdfContent = file_get_contents($basePath . "/" . $file_name . ".pdf");
    $headers = [
      'Content-Disposition' => "inline; filename=" . $file_name . "pdf",
      'Content-Type' => 'application/pdf',
    ];

    // Stream the PDF content as a response
    return response()->make($pdfContent, 200, $headers);
  }
}

<?php

namespace App\Http\Controllers\Api\StudentProgress;

use App\Helpers\RabbitMq;
use App\Http\Controllers\Controller;
use App\Services\ProfileService\Profile;
use Carbon\Carbon;
use Illuminate\Http\Request;
use ZipArchive;

class StudentReportController extends Controller
{
  private Profile $profileService;

  public function __construct()
  {
    $this->profileService = new Profile;
  }

  public function getStudentProfile(int $student_id)
  {
    $student_profile_elastic = $this->profileService->getSingleStudentFromElastic((int)$student_id);
    $student_profile_mongo = $this->profileService->getSingleStudent((int)$student_id);
    $student_profile_elastic->parent_number = isset($student_profile_mongo->parent_datas)
      ? $student_profile_mongo->parent_datas->parent_number
      : "";
    return response()->json(['success' => true, "data" => $student_profile_elastic], 200);
  }

  public function getStudentProgressReports(Request $request, int $student_id, string $program = "ptk")
  {
    $module_type = $request->has('module_type') ? $request->get('module_type') : "ALL_MODULE";
    $stage_type = $request->has('stage_type') ? $request->get('stage_type') : "UMUM";

    $response = $this->profileService->getSingleStudentReportV2($program, $student_id, $stage_type, $module_type);
    $body = json_decode($response?->body());
    $status  = $response->status();

    return response()->json($body, $status);
  }

  public function generateStudentProgressReportsDocumentLink(Request $request, int $student_id, string $program = "ptk")
  {
    $module_type = $request->has('module_type') ? $request->module_type : "ALL";
    $stage_type = $request->has('stage_type') ? $request->stage_type : "UMUM";
    $stream_file = $request->has('stream_file') ? $request->stream_file : false;
    $params = [
      "smartbtw_id" => [$student_id],
      "program" => strtoupper($program),
      "uka_type" => $module_type,
      "stage_type" => $stage_type
    ];
    $response = $this->profileService->getMultipleStudentsProgressReportDocuments($params);
    $body = json_decode($response->body());
    $body->data = collect($body?->data ?? null)->first();
    if (isset($body?->data?->link) && $stream_file) {
      $explodedLink = explode("/", $body->data->link);
      $fileNameWithExtension = $explodedLink[count($explodedLink) - 1];
      $fileNameWithoutExtension = str_replace(".pdf", "", $fileNameWithExtension);
      $body->data->file_name = $fileNameWithoutExtension;
      $body->data->link = "/api/generate-result/pdf-student-progress-report/$fileNameWithoutExtension";
    }
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function generateMultipleStudentsProgressReportsDocumentLinks(Request $request)
  {
    $program = $request->has('program') ? strtoupper($request->program) : "PTK";
    $module_type = $request->has('module_type') ? $request->module_type : "ALL";
    $stage_type = $request->has('stage_type') ? $request->stage_type : "UMUM";
    $student_ids = $request->has('smartbtw_id') ? $request->smartbtw_id : [];

    if (!is_array($student_ids)) {
      return response()->json(['success' => false, 'data' => null, 'message' => 'Parameter tidak valid'], 400);
    }

    if (count($student_ids) == 0) {
      return response()->json([
        'success' => false,
        'data' => null,
        'message' => 'Silakan pilih siswa yang ingin di download rapor nya'
      ], 400);
    }

    $params = [
      "smartbtw_id" => $student_ids,
      "program" => strtoupper($program),
      "uka_type" => $module_type,
      "stage_type" => $stage_type
    ];
    $response = $this->profileService->getMultipleStudentsProgressReportDocuments($params);
    $body = json_decode($response->body());
    $status = $response->status();
    if (count($body?->data ?? []) > 0) {
      $timestamp = Carbon::now()->format('Y-m-d H:i:s');
      $zipFileName = "Rapor Perkembangan Siswa - $timestamp.zip";
      $zipFilePath = storage_path($zipFileName);
      $zip = new ZipArchive();
      $pdfLinks = collect($body->data)->map(fn ($item) => $item->link)->values()->toArray();
      if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
        // Loop through the PDF links and download each file
        foreach ($pdfLinks as $pdfLink) {
          $pdfContents = file_get_contents($pdfLink);
          $explodedLink = explode("/", $pdfLink);
          $fileNameWithExtension = $explodedLink[count($explodedLink) - 1];
          if ($pdfContents !== false) {
            // Add the PDF file to the zip archive
            $zip->addFromString($fileNameWithExtension, $pdfContents);
          }
        }

        // Close the zip archive
        $zip->close();

        // Set the appropriate headers for the response
        return response()
          ->download($zipFilePath, $zipFileName, ["X-File-Name" => $zipFileName])
          ->deleteFileAfterSend(true);
      } else {
        return response()->json(['success' => false, 'message' => 'Unable to create zip archive'], 500);
      }
    }
    return response()->json($body, $status);
  }

  public function sendStudentProgressReport(Request $request)
  {
    // Get student progress reports
    $student_ids = $request->has('smartbtw_id') ? $request->smartbtw_id : [];
    $program = $request->has('program') ? $request->program : "ptk";
    $stage_type = $request->has('stage_type') ? $request->stage_type : "UMUM";
    $module_type = $request->has('uka_type') ? $request->uka_type : "ALL_MODULE";

    if (!is_array($student_ids)) {
      return response()->json(['success' => false, 'data' => null, 'message' => 'Parameter tidak valid'], 400);
    }

    if (count($student_ids) == 0) {
      return response()->json([
        'success' => false,
        'data' => null,
        'message' => 'Silakan pilih siswa yang ingin di download rapor nya'
      ], 400);
    }

    $params = [
      "smartbtw_id" => $student_ids,
      "program" => strtoupper($program),
      "uka_type" => $module_type,
      "stage_type" => $stage_type
    ];
    $report_response = $this->profileService->getMultipleStudentsProgressReportDocuments($params);
    $report = collect(json_decode($report_response->body())?->data ?? [])->first();
    if (!$report) {
      return response()->json([
        'success' => false,
        'data' => null,
        'message' => 'Siswa tidak memiliki rapor, silakan coba lagi nanti'
      ], 400);
    }

    // Construct the necessary payload
    $exploded_link_string = explode("/", $report->link);
    $file_name = $exploded_link_string[count($exploded_link_string) - 1];
    $broker_payload = [
      "version" => 1,
      "data" => [
        "to" => $request->phone_number,
        "name" => $request->student_name,
        "greeting" => $this->generateGreetingTime(),
        "custom_message" => "dokumen rapor perkembangan siswa atas nama " . $request->student_name,
        "file_name" => $file_name,
        "file_url" => $report->link
      ]
    ];
    // Send it with the designated topic and payload to message broker
    RabbitMq::send("message-gateway.whatsapp.raport-result", json_encode($broker_payload));
    return response()->json([
      'success' => true,
      'data' => null,
      'message' => 'Rapor siswa sedang dikirimkan'
    ], 200);
  }

  public function sendStudentUkaReport(Request $request)
  {
    // Get student progress reports
    $student_id = $request->has('smartbtw_id') ? $request->smartbtw_id : null;
    $program = $request->has('program') ? $request->program : "ptk";

    if (!$student_id) {
      return response()->json([
        'success' => false,
        'data' => null,
        'message' => 'Silakan pilih siswa yang ingin di download rapor nya'
      ], 400);
    }

    $params = [
      "smartbtw_id" => $student_id,
      "program" => strtoupper($program),
    ];
    $report_response = $this->profileService->getSingleStudentUKAReportDocuments($params);
    $report = collect(json_decode($report_response->body())?->data ?? []);
    if (!$report->count()) {
      return response()->json([
        'success' => false,
        'data' => null,
        'message' => 'Siswa tidak memiliki rapor, silakan coba lagi nanti'
      ], 400);
    }
    $report = $report->filter(fn ($item) => $item->task_id == $request->task_id)->last();
    if (!$report) {
      return response()->json([
        'success' => false,
        'data' => null,
        'error' => 'Data rapor yang dipilih belum digenerate',
        'message' => 'Proses gagal, silakan coba lagi nanti'
      ], 400);
    }

    // Construct the necessary payload
    $exploded_link_string = explode("/", $report->link);
    $file_name = $exploded_link_string[count($exploded_link_string) - 1];
    $broker_payload = [
      "version" => 1,
      "data" => [
        "to" => $request->phone_number,
        "name" => $request->student_name,
        "greeting" => $this->generateGreetingTime(),
        "custom_message" => "dokumen rapor UKA Stage siswa atas nama " . $request->student_name,
        "file_name" => $file_name,
        "file_url" => $report->link
      ]
    ];
    // Send it with the designated topic and payload to message broker
    RabbitMq::send("message-gateway.whatsapp.raport-result", json_encode($broker_payload));
    return response()->json([
      'success' => true,
      'data' => null,
      'message' => 'Rapor siswa sedang dikirimkan'
    ], 200);
  }


  private function generateGreetingTime()
  {
    $hour = Carbon::now()->format('H');
    if ($hour < 12) {
      return 'pagi';
    }
    if ($hour < 15) {
      return 'siang';
    }
    if ($hour < 18) {
      return 'sore';
    }
    return 'malam';
  }

  public function generateStudentUkaReportsDocumentLink(Request $request)
  {
    $params = [
      "smartbtw_id" => (int)$request->smartbtw_id,
      "program" => strtoupper($request->program),
      "uka_name" => $request->uka_name,
    ];
    $streamFile = $request->has('stream_file') ? $request->stream_file : false;
    $response = $this->profileService->getSingleStudentUKAReportDocuments($params);
    $body = json_decode($response->body());
    $body->data = collect($body?->data ?? [])
      ->filter(fn ($item) => in_array($item->task_id, $request->task_ids))
      ->values()
      ->toArray();
    if (count($body->data) > 0 && $streamFile) {
      foreach ($body->data as $data) {
        $explodedLink = explode("/", $data->link);
        $fileNameWithExtension = $explodedLink[count($explodedLink) - 1];
        $fileNameWithoutExtension = str_replace(".pdf", "", $fileNameWithExtension);
        $data->link = "/api/generate-result/pdf-student-uka-stage-report/$fileNameWithoutExtension";
      }
    }
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function generateMultipleStudentsUkaReportsDocumentLinks(Request $request)
  {
    $params = [
      "smartbtw_id" => (int)$request->smartbtw_id,
      "program" => strtoupper($request->program),
      "uka_name" => $request->uka_name,
    ];
    $response = $this->profileService->getSingleStudentUKAReportDocuments($params);
    $body = json_decode($response->body());
    $body->data = collect($body?->data ?? [])
      ->filter(fn ($item) => in_array($item->task_id, $request->task_ids))
      ->values()
      ->toArray();
    if (count($body->data) > 0) {
      $timestamp = Carbon::now()->format('Y-m-d H:i:s');
      $zipFileName = "Rapor UKA Stage $timestamp.zip";
      $zipFilePath = storage_path($zipFileName);
      $zip = new ZipArchive();
      $pdfLinks = collect($body->data)->map(fn ($item) => $item->link)->values()->toArray();
      if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
        // Loop through the PDF links and download each file
        foreach ($pdfLinks as $pdfLink) {
          $pdfContents = file_get_contents($pdfLink);
          $explodedLink = explode("/", $pdfLink);
          $fileNameWithExtension = $explodedLink[count($explodedLink) - 1];
          if ($pdfContents !== false) {
            // Add the PDF file to the zip archive
            $zip->addFromString($fileNameWithExtension, $pdfContents);
          }
        }

        // Close the zip archive
        $zip->close();

        // Set the appropriate headers for the response
        return response()
          ->download($zipFilePath, $zipFileName, ["X-File-Name" => $zipFileName])
          ->deleteFileAfterSend(true);
      } else {
        return response()->json(['success' => false, 'message' => 'Unable to create zip archive'], 500);
      }
    }
    $status = $response->status();
    return response()->json($body, $status);
  }
}

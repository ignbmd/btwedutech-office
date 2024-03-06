<?php

namespace App\Http\Controllers\Api\Psikotest;

use App\Helpers\RabbitMq;
use App\Helpers\S3;
use App\Http\Controllers\Controller;
use App\Services\PsikotestService\ParticipantList;
use App\Services\InterestAndTalentService\InterestAndTalent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ParticipantListController extends Controller
{
    private ParticipantList $participantList;
    private InterestAndTalent $peminatanService;

    public function __construct(ParticipantList $participantList, InterestAndTalent $peminatanService)
    {
      $this->participantList = $participantList;
      $this->peminatanService = $peminatanService;
    }

    public function getAllParticipants()
    {
      $data = $this->participantList->getAll();
      return response()->json($data, 200);
    }

    public function getStudentResultPDFDownloadLink(string $id)
    {
      $response = $this->peminatanService->getStudentResultPDFDownloadLink($id);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    }

    public function store(Request $request)
    {
      try {
        $user = Auth::user();
        $uploadedFiles = $request->all();
        $uploadedFilesPath = [];

        $validFileExtension = "pdf";
        $validFileMimeType = "application/pdf";

        // Validate all files first
        foreach($uploadedFiles as $file) {
          $fileExtension = $file->getClientOriginalExtension();
          $fileMimeType = $file->getClientMimeType();
          $isValidFile = $fileExtension === $validFileExtension && $fileMimeType === $validFileMimeType;
          if(!$isValidFile) return response()->json(["success" => false, "message" => "File tidak valid. Silakan masukkan file pdf"], 422);
        }

        // After that, upload files to S3
        foreach($uploadedFiles as $file) {
          $s3FilePath = S3::storeOriginalForPeminatan("/uploads/peminatan-raw", $file);
          if($s3FilePath) $uploadedFilesPath[] = $s3FilePath;
          sleep(3);
        }

        $payloadData = collect($uploadedFilesPath)->map(function ($item, $key) use ($user) {
          $payloadObj = new \stdClass();
          $payloadObj->document = $item;
          $payloadObj->request_by = $user->name;
          $payloadObj->request_sso_id = $user->id;
          return $payloadObj;
        })->values()->toArray();
        $brokerPayload = ["version" => 1, "data" => $payloadData];
        RabbitMq::send("peminatan.pdf.stamp-bulk", json_encode($brokerPayload));
        return response()->json(['success' => true, 'message' => 'Upload data hasil peminatan sedang berlangsung', 200]);
      } catch (\Exception $e) {
        Log::error("An error occured when trying to upload peminatan pdf result", ['message' => $e->getMessage()]);
        return response()->json(['success' => false, 'message' => 'Terjadi kesalahan, silakan coba lagi nanti'], 500);
      }
    }

  public function getStudentResultByEmail(string $student_email)
  {
    $response = $this->peminatanService->getStudentResultByEmail($student_email);
    $body = json_decode($response->body());
    if(isset($body->data) && count($body->data) > 0) {
      $body->data = collect($body->data)
        ->map(function($item) {
          $item->date_test = $this->generateLocaleDate($item->date_test);
          return $item;
        })
        ->values()
        ->toArray();
    }
    $status = $response->status();
    return response()->json($body, $status);
  }

  private function generateLocaleDate($date)
  {
    return \Carbon\Carbon::parse($date)
      ->locale('id')
      ->settings(['formatFunction' => 'translatedFormat'])
      ->format('j F Y');
  }
}

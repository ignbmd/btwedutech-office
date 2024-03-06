<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\LearningService\Student;
use App\Services\MedicalCheckupService\MedicalCheckup;

class MedicalCheckupController extends Controller
{

  private MedicalCheckup $medicalCheckupService;

  public function __construct(MedicalCheckup $medicalCheckupService)
  {
    $this->medicalCheckupService = $medicalCheckupService;
  }

  /**
   *  Point
   */

  public function getAllPoint()
  {
    $response = $this->medicalCheckupService->getAllPoint();
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getPointCheckup()
  {
    $response = $this->medicalCheckupService->getPointCheckup();
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getDetail($id) {
    $response = $this->medicalCheckupService->detail($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function createPoint(Request $request)
  {
    $payload = $request->all();

    $response = $this->medicalCheckupService->createPoint($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Poin medical checkup berhasil dibuat!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function updatePoint(Request $request, string $pointId)
  {
    $payload = $request->all();

    $response = $this->medicalCheckupService->updatePoint($pointId, $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Poin medical checkup berhasil diperbarui!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  /**
   *  Record
  */
  public function getAllRecordHistory()
  {
    $response = $this->medicalCheckupService->getAllRecordHistory();
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getRecordHistory(string $studentId)
  {
    $response = $this->medicalCheckupService->getRecordHistory($studentId);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getRecordSummary(string $historyId)
  {
    $response = $this->medicalCheckupService->getRecordSummary($historyId);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function createRecord(Request $request)
  {
    $payload = $request->all();

    $response = $this->medicalCheckupService->createRecord($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Medical checkup berhasil disimpan!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function updateRecord(Request $request, string $historyId)
  {
    $payload = $request->all();

    $response = $this->medicalCheckupService->updateRecord($historyId, $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Hasil Medical checkup berhasil diperbarui!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }
}

<?php

namespace App\Http\Controllers\Api\Exam;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ExamService\StudyMaterial;
use Illuminate\Support\Facades\Log;

class StudyMaterialController extends Controller
{
  private StudyMaterial $studyMaterialService;

  public function __construct(StudyMaterial $studyMaterialService)
  {
    $this->studyMaterialService = $studyMaterialService;
  }

  public function index()
  {
    $data = $this->studyMaterialService->index();
    return response()->json($data);
  }

  public function show($id)
  {
    $data = $this->studyMaterialService->show((int)$id);
    return response()->json($data);
  }

  public function store(Request $request)
  {
    $response = $this->studyMaterialService->store($request->data);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $response = $this->studyMaterialService->update((int)$id, $request->data);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function indexDocument($studyMaterialId)
  {
    $studyMaterial = $this->studyMaterialService->indexDocument((int)$studyMaterialId);
    if(!$studyMaterial) return response()->json(['success' => false, 'message' => 'Data materi belajar tidak ditemukan', 'data' => $studyMaterial], 404);

    $documentResponse = $this->studyMaterialService->indexDocument((int) $studyMaterialId);
    $documentBody = json_decode($documentResponse->body())?->data ?? null;
    $documentStatus = $documentResponse->status();
    return response()->json($documentBody, $documentStatus);
  }

  public function showDocument($studyMaterialId, $documentId)
  {
    $studyMaterial = $this->studyMaterialService->show((int)$studyMaterialId);
    if(!$studyMaterial) return response()->json(['success' => false, 'message' => 'Data materi belajar tidak ditemukan', 'data' => $studyMaterial], 404);

    $documentResponse = $this->studyMaterialService->showDocument($documentId);
    $documentBody = json_decode($documentResponse->body())?->data ?? null;
    $documentStatus = $documentResponse->status();
    return response()->json($documentBody, $documentStatus);
  }

  public function storeDocument(Request $request, $studyMaterialId)
  {
    $studyMaterial = $this->studyMaterialService->show((int)$studyMaterialId);
    if(!$studyMaterial) return response()->json(['success' => false, 'message' => 'Data materi belajar tidak ditemukan', 'data' => $studyMaterial], 404);
    $documentTotalCount = count($request->data);
    foreach($request->data as $index => $data) {
      $currentDocumentNumberCount = $index + 1;
      $documentResponse = $this->studyMaterialService->storeDocument($data);
      $documentBody = json_decode($documentResponse->body());
      $documentStatus = $documentResponse->status();
      if(!$documentBody) {
        Log::error("Attempt to create document number $currentDocumentNumberCount of $documentTotalCount of study material '$studyMaterial->title'", ["body" => $data, "response" => $documentBody, "status" => $documentStatus]);
        return response()->json($documentBody, $documentStatus);
      }
    }
    return response()->json($documentBody, $documentStatus);
  }

  public function updateDocument(Request $request, $studyMaterialId, $documentId)
  {
    $studyMaterial = $this->studyMaterialService->show((int)$studyMaterialId);
    if(!$studyMaterial) return response()->json(['success' => false, 'message' => 'Data materi belajar tidak ditemukan', 'data' => $studyMaterial], 404);

    $documentResponse = $this->studyMaterialService->updateDocument((int)$documentId, $request->data);
    $documentBody = json_decode($documentResponse->body()) ?? null;
    $documentStatus = $documentResponse->status();
    return response()->json($documentBody, $documentStatus);
  }
}

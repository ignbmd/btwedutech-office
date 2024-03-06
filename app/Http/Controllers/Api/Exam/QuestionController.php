<?php

namespace App\Http\Controllers\Api\Exam;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ExamService\Exam;

class QuestionController extends Controller
{
  private Exam $examService;

  public function __construct(Exam $examService)
  {
    $this->examService = $examService;
  }

  public function get(Request $request)
  {
    $search = $request->search ?? '';
    $program = $request->program ?? '';
    $type = $request->type ?? '';
    $module_code = $request->module_code ?? '';
    $limit = $request->limit ?? '';
    $pages = $request->pages ?? '';
    $search_id = $request->search_id ?? '';
    $question_category_id = $request->question_category_id ?? '';

    $response = $this->examService->get($program, $type, $limit, $pages, $module_code, $search, $search_id, $question_category_id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getById($id)
  {
    $response = $this->examService->getById($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function create(Request $request)
  {
    $payload = $request->data;
    $response = $this->examService->saveQuestion($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Soal berhasil dibuat!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function update(Request $request, $id)
  {
    $payload = $request->data;
    $response = $this->examService->update($id, $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Soal berhasil diperbarui!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function connectQuestion(Request $request)
  {
    $payload = $request->all();
    $response = $this->examService->connectQuestion($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Induk soal berhasil dihubungkan!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function delete($id)
  {
    $response = $this->examService->delete($id);
    $responseBody = json_decode($response?->body());
    $responseStatus = $response->status();
    return response()->json($responseBody, $responseStatus);
  }
}

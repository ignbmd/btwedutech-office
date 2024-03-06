<?php

namespace App\Http\Controllers\Api\Exam;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ExamService\QuestionCategory;

class QuestionCategoryController extends Controller
{
  private QuestionCategory $examQuestionCategory;

  public function __construct(QuestionCategory $examQuestionCategory)
  {
    $this->examQuestionCategory = $examQuestionCategory;
  }

  public function get(Request $request, $program = null)
  {
    $response = $this->examQuestionCategory->get($program);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getById($id)
  {
    $response = $this->examQuestionCategory->getById($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function create(Request $request)
  {
    $payload = $request->all();
    $response = $this->examQuestionCategory->create($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Kategori Soal berhasil dibuat!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function update(Request $request, $id)
  {
    $payload = $request->all();
    $response = $this->examQuestionCategory->update($id, $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Kategori Soal berhasil diperbarui!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function delete(Request $request, $id)
  {
    $response = $this->examQuestionCategory->delete($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Kategori soal berhasil dihapus!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }
}

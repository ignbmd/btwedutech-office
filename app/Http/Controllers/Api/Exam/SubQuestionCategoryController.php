<?php

namespace App\Http\Controllers\Api\Exam;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ExamService\SubQuestionCategory;

class SubQuestionCategoryController extends Controller
{
  private SubQuestionCategory $examSubQuestionCategory;

  public function __construct(SubQuestionCategory $examSubQuestionCategory)
  {
    $this->examSubQuestionCategory = $examSubQuestionCategory;
  }

  public function get()
  {
    $response = $this->examSubQuestionCategory->get();
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getById($id)
  {
    $response = $this->examSubQuestionCategory->getById($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getByCategoryId($categoryId)
  {
    $response = $this->examSubQuestionCategory->getCategoryId($categoryId);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function create(Request $request)
  {
    $payload = $request->all();
    $response = $this->examSubQuestionCategory->create($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Sub Kategori Soal berhasil dibuat!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function update(Request $request, $id)
  {
    $payload = $request->all();
    $response = $this->examSubQuestionCategory->update($id, $payload);
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
    $response = $this->examSubQuestionCategory->delete($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Sub kategori soal berhasil dihapus!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }
}

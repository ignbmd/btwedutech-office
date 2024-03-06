<?php

namespace App\Http\Controllers\Api\Exam;

use App\Http\Controllers\Controller;
use App\Services\ExamService\Instruction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InstructionController extends Controller
{
  private Instruction $examInstruction;

  public function __construct(Instruction $examInstruction)
  {
    $this->examInstruction = $examInstruction;
  }

  public function get(Request $request, $program = null)
  {
    $response = $this->examInstruction->get($program);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getById($id)
  {
    $response = $this->examInstruction->getById($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function create(Request $request)
  {
    $payload = $request->all();
    $response = $this->examInstruction->create($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Instruksi berhasil dibuat!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function update(Request $request, $id)
  {
    $payload = $request->all();
    $response = $this->examInstruction->update($id, $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Instruksi berhasil diperbaru!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function delete(Request $request, $id)
  {
    $response = $this->examInstruction->delete($id);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Instruksi berhasil dihapus!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }
}

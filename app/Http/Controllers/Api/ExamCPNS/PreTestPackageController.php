<?php

namespace App\Http\Controllers\Api\ExamCPNS;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use Symfony\Component\HttpFoundation\Response;

use App\Services\ExamCPNSService\Module;
use App\Services\ExamCPNSService\Instruction;
use App\Services\ExamCPNSService\PreTestPackage;
use App\Services\ApiGatewayService\Internal\Task;

class PreTestPackageController extends Controller
{

  private Module $examModule;
  private Instruction $examInstruction;
  private PreTestPackage $examPreTestPackage;
  private Task $task;

  public function __construct(Module $examModule, Instruction $examInstruction, PreTestPackage $examPreTestPackage, Task $task)
  {
    $this->examModule = $examModule;
    $this->examInstruction = $examInstruction;
    $this->task = $task;
    $this->examPreTestPackage = $examPreTestPackage;
  }

  public function getAll()
  {
    $data = $this->examPreTestPackage->getAll();
    return response()->json($data, 200);
  }

  public function getById($id)
  {
    $data = $this->examPreTestPackage->getById((int)$id);
    return $data
      ? response()->json(['success' => true, 'message' => "Data found", 'data' => $data], Response::HTTP_OK)
      : response()->json(['success' => false, 'message' => "Data not found", 'data' => $data], Response::HTTP_BAD_REQUEST);
  }

  public function getByProgram($program)
  {
    $data = $this->examPreTestPackage->getByProgram($program);
    return $data
      ? response()->json(['success' => true, 'message' => "Data found", 'data' => $data], Response::HTTP_OK)
      : response()->json(['success' => false, 'message' => "Data not found", 'data' => $data], Response::HTTP_BAD_REQUEST);
  }

  public function createBulk(Request $request)
  {
    try {
      $preTestPackagePayload = [];
      $taskPayload = [];

      foreach($request->data as $data) {
        $moduleCode = $this->examModule->getById($data["modules_id"])?->module_code;
        if(!$moduleCode) {
          Log::error("Error when attempting to get module from new exam service");
          return response()->json(['success' => false, 'message' => 'Terjadi kesalahan saat proses penambahan paket, silakan coba lagi nanti'], 404);
        }

        $instructionResponse = $this->examInstruction->getById($data["instructions_id"]);
        $instructionBody = json_decode($instructionResponse->body());
        if(!$instructionBody?->data?->instruction) {
          Log::error("Error when attempting to get instruction data from new exam service", $instructionResponse);
          return response()->json(['success' => false, 'message' => 'Data instruksi tidak ditemukan, silakan coba lagi nanti'], 404);
        }

        $taskPayload[] = [
          "judul_tugas" => $data["title"],
          "kode_modul" => $moduleCode,
          "waktu" => $data["duration"],
          "intruksi" => $instructionBody?->data?->instruction,
        ];
      }
      $taskResponse = $this->task->createMultiple($taskPayload);
      $taskResponseStatus = $taskResponse->status();
      $taskResponseBody = json_decode($taskResponse->body());
      if($taskResponseStatus !== Response::HTTP_CREATED) return response()->json($taskResponseBody, $taskResponseStatus);

      $legacy_task_ids = collect($taskResponseBody->data)->pluck('id_tugas')->toArray();
      foreach($request->data as $index => $data) {
        $data["legacy_task_id"] = $legacy_task_ids[$index];
        $preTestPackagePayload[] = $data;
      }

      $preTestPackageResponse = $this->examPreTestPackage->createBulk(["data" => $preTestPackagePayload]);
      $preTestPackageResponseStatus = $preTestPackageResponse->status();
      $preTestPackageResponseBody = json_decode($preTestPackageResponse->body());

      if($preTestPackageResponseStatus !== Response::HTTP_CREATED) return response()->json(['success' => false, 'message' => "Proses gagal, silakan coba lagi nanti", "data" => $preTestPackageResponseBody], $preTestPackageResponseStatus);
      return response()->json(['success' => true, 'status_code' => $preTestPackageResponseStatus, 'message' => "Data berhasil ditambah"], $preTestPackageResponseStatus);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }

  public function update(Request $request, $id)
  {
    $preTestPackageResponse = $this->examPreTestPackage->update($id, $request->data);
    $preTestPackageResponseStatus = $preTestPackageResponse->status();
    $preTestPackageResponseBody = json_decode($preTestPackageResponse->body());
    if($preTestPackageResponseStatus !== Response::HTTP_OK) return response()->json(['success' => false, 'message' => "Proses gagal, silakan coba lagi nanti", "data" => $preTestPackageResponseBody], $preTestPackageResponseStatus);
    return response()->json(['success' => true, 'status_code' => $preTestPackageResponseStatus, 'message' => "Data berhasil diperbarui"], $preTestPackageResponseStatus);
  }
}

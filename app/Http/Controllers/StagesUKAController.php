<?php

namespace App\Http\Controllers;

use App\Services\BranchService\Branch;
use App\Services\StagesService\Stages;
use App\Services\LearningService\ClassRoom;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class StagesUKAController extends Controller
{
  private Stages $stagesService;
  private Branch $branchService;
  private ClassRoom $learningClassroomService;

  public function __construct(Stages $stagesService, Branch $branchService, ClassRoom $learningClassroomService)
  {
    $this->stagesService = $stagesService;
    $this->branchService = $branchService;
    $this->learningClassroomService = $learningClassroomService;
  }

  public function generateAccessCodeForm()
  {
    $stagesPTKResponse = $this->stagesService->getClassStagesByType("PTK");
    $stagesPTK = json_decode($stagesPTKResponse->body())?->data ?? [];

    $stagesPTNResponse = $this->stagesService->getClassStagesByType("PTN");
    $stagesPTN = json_decode($stagesPTNResponse->body())?->data ?? [];

    $stagesCPNSResponse = $this->stagesService->getClassStagesByType("CPNS");
    $stagesCPNS = json_decode($stagesCPNSResponse->body())?->data ?? [];

    $user = Auth::user();
    if (!$user) {
      Log::warning("Fail on getting class stages uka access code - Authenticated user data was not found");
      return redirect()->back()->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    $classroomQuery = ["status" => "ONGOING"];
    if ($user->branch_code !== "PT0000") {
      $classroomQuery["branch_code"] = $user->branch_code;
    }
    $classrooms = $this->learningClassroomService->getAll($classroomQuery);
    if (!count($classrooms)) {
      Log::warning("Fail on getting class stages uka access code - Fail to list available classrooms");
      return redirect()->back()->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    $stages = collect($stagesPTK)
      ->merge($stagesPTN)
      ->merge($stagesCPNS)
      ->reject(fn ($item) => $item->module_type == "PLATINUM")
      ->sortBy('stage')
      ->values()
      ->toArray();
    return view("/pages/stages-uka-access/generate-access-code", compact('stages', 'classrooms'));
  }

  public function generateAccessCode(Request $request)
  {
    $validator = Validator::make($request->all(), [
      "stage" => 'required',
      "session" => "required",
      "classroom" => "required",
    ], [
      "*.required" => ":attribute harus dipilih",
    ], [
      "stage" => "Stage",
      "session" => "Sesi",
      "classroom" => "Kelas"
    ]);

    if ($validator->fails()) {
      return redirect()->back()->withErrors($validator);
    }

    $user = Auth::user();
    if (!$user) {
      Log::warning("Fail on getting class stages uka access code - Authenticated user data was not found");
      return redirect()->back()->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    $userBranchCode = $user->branch_code;
    $branchDetail = $this->branchService->getBranchByCode($userBranchCode);
    if (!$branchDetail) {
      Log::warning("Fail on getting class stages uka access code - Branch detail data was not found");
      return redirect()->back()->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    $stage = json_decode($request->stage);
    $classroom = json_decode($request->classroom);
    $session = $request->session;
    if (!$session) {
      return redirect("/akses-uka-stages/generate-kode-akses");
    }
    return redirect("/akses-uka-stages/kode-akses/$userBranchCode/$classroom->_id/$stage->_id/$session");
  }

  public function showAccessCode(string $branchCode, string $classroomId, string $stageId, string $session)
  {
    $breadcrumbs = [["name" => "Generated Kode Akses"]];

    $user = Auth::user();
    if (!$user) {
      Log::warning("Fail on getting class stages uka access code - Authenticated user data was not found");
      return redirect("/akses-uka-stages/generate-kode-akses")->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    $userBranchCode = $user->branch_code;
    $branchDetail = $this->branchService->getBranchByCode($userBranchCode);
    if (!$branchDetail) {
      Log::warning("Fail on getting class stages uka access code - Branch detail data was not found");
      return redirect("/akses-uka-stages/generate-kode-akses")->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    $stageResponse = $this->stagesService->getClassStageById($stageId);
    $stage = json_decode($stageResponse->body())?->data ?? null;
    if (!$stage) {
      Log::warning("Fail on getting class stages uka access code - Stage with ID: $stageId data was not found");
      return redirect("/akses-uka-stages/generate-kode-akses")->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    $classroom = $this->learningClassroomService->getSingle($classroomId);
    if (!$classroom) {
      Log::warning("Fail on getting class stages uka access code - Classroom with ID: $classroomId data was not found");
      return redirect("/akses-uka-stages/generate-kode-akses")->with('flash-message', [
        'title' => 'Info',
        'type' => 'info',
        'message' => 'Silakan coba lagi'
      ]);
    }

    if (!$session) {
      return redirect("/akses-uka-stages/generate-kode-akses");
    }
    $stage->session = (int)$session;

    $pusherAppKey = env("PUSHER_APP_KEY");
    if (!$pusherAppKey) {
      Log::warning("Fail on getting class stages uka access code - PUSHER_APP_KEY is not defined");
      return redirect("/akses-uka-stages/generate-kode-akses")->with('flash-message', [
        'title' => 'Terjadi Kesalahan',
        'type' => 'error',
        'message' => 'Sedang terjadi perbaikan, silakan coba lagi nanti'
      ]);
    }

    $pusherAppCluster = env("PUSHER_APP_CLUSTER");
    if (!$pusherAppCluster) {
      Log::warning("Fail on getting class stages uka access code - PUSHER_APP_CLUSTER is not defined");
      return redirect("/akses-uka-stages/generate-kode-akses")->with('flash-message', [
        'title' => 'Terjadi Kesalahan',
        'type' => 'error',
        'message' => 'Sedang terjadi perbaikan, silakan coba lagi nanti'
      ]);
    }

    $pusherAppHost = env("PUSHER_APP_HOST");
    if (!$pusherAppHost) {
      Log::warning("Fail on getting class stages uka access code - PUSHER_APP_HOST is not defined");
      return redirect("/akses-uka-stages/generate-kode-akses")->with('flash-message', [
        'title' => 'Terjadi Kesalahan',
        'type' => 'error',
        'message' => 'Sedang terjadi perbaikan, silakan coba lagi nanti'
      ]);
    }

    return view(
      "/pages/stages-uka-access/access-code",
      compact(
        'breadcrumbs',
        'branchDetail',
        'stage',
        'classroom',
        'session',
        'pusherAppKey',
        'pusherAppCluster',
        'pusherAppHost'
      )
    );
  }
}

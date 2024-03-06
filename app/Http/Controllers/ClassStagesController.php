<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\StagesService\Stages;
use App\Services\ExamService\Package;
use App\Services\ExamService\TryoutPremium;
use App\Services\ExamCPNSService\Package as CPNSPackage;
use App\Services\ExamCPNSService\TryoutPremium as CPNSTryoutPremium;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class ClassStagesController extends Controller
{
  private Stages $stagesService;
  private Package $examPackageService;
  private TryoutPremium $examTryoutPremiumService;
  private CPNSPackage $cpnsExamPackageService;
  private CPNSTryoutPremium $cpnsExamTryoutPremiumService;

  public function __construct(
    Stages $stagesService,
    Package $examPackageService,
    TryoutPremium $examTryoutPremiumService,
    CPNSPackage $cpnsExamPackageService,
    CPNSTryoutPremium $cpnsExamTryoutPremiumService
  ) {
    $this->stagesService = $stagesService;
    $this->examPackageService = $examPackageService;
    $this->examTryoutPremiumService = $examTryoutPremiumService;
    $this->cpnsExamPackageService = $cpnsExamPackageService;
    $this->cpnsExamTryoutPremiumService = $cpnsExamTryoutPremiumService;
  }

  public function index(string $type)
  {
    $breadcrumbs = [["name" => "Stage Kelas $type", "link" => null]];
    $stagesResponse = $this->stagesService->getClassStagesByType($type);
    $stages = json_decode($stagesResponse->body())?->data ?? [];

    $isStagesLocked = collect($stages)->contains(fn ($value, $key) => $value->is_locked) ?? false;
    $colspanAmount = $isStagesLocked ? 9 : 10;

    $platinumPackages = $type !== "CPNS"
      ? $this->examPackageService->getAll()
      : $this->cpnsExamPackageService->getAll();
    $premiumPackageResponse = $type !== "CPNS"
      ? $this->examTryoutPremiumService->getAll()
      : $this->cpnsExamTryoutPremiumService->getAll();
    $premiumPackageBody = json_decode($premiumPackageResponse->body())?->data ?? [];
    $packages = collect(array_merge($platinumPackages, $premiumPackageBody))
      ->sortBy('id')
      ->mapWithKeys(function ($item) {
        return [$item->id => $item];
      })
      ->toArray();
    return view(
      'pages/class-stages/index',
      compact(
        'stages',
        'type',
        'breadcrumbs',
        'isStagesLocked',
        'colspanAmount',
        'packages'
      )
    );
  }

  public function create(Request $request, string $type)
  {
    $stagesResponse = $this->stagesService->getClassStagesByType($type);
    $stages = json_decode($stagesResponse->body())?->data ?? [];
    $isStagesLocked = collect($stages)->contains(fn ($value, $key) => $value->is_locked) ?? false;
    if ($isStagesLocked) {
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Stage dikunci, tidak dapat mengakses halaman ini"
      ]);
      return redirect("/stages-kelas/$type");
    }

    $breadcrumbs = [["name" => "Stage Kelas $type", "link" => "/stages-kelas/$type"], ["name" => "Tambah Stage Baru", "link" => null]];
    $moduleTypes = ["PLATINUM", "PREMIUM_TRYOUT"];

    $platinumPackages = $type !== "CPNS"
      ? $this->examPackageService->getAll()
      : $this->cpnsExamPackageService->getAll();
    $premiumPackageResponse = $type !== "CPNS"
      ? $this->examTryoutPremiumService->getAll()
      : $this->cpnsExamTryoutPremiumService->getAll();
    $premiumPackageBody = json_decode($premiumPackageResponse->body())?->data ?? [];
    $packages = collect(array_merge($platinumPackages, $premiumPackageBody))
      ->sortBy('id')
      ->values()
      ->toArray();
    return view("pages/class-stages/create", compact('type', 'moduleTypes', 'packages', 'breadcrumbs'));
  }

  public function store(Request $request, $type)
  {
    $validation = Validator::make($request->all(), [
      'stage' => 'required|numeric',
      'level' => 'required|numeric',
      'required_stage' => 'required|numeric',
      'module_type' => 'required',
      'package' => 'required',
      'stage_type' => 'required',
      'start_date' => 'required',
      'end_date' => 'required',
    ], ['required' => 'Harus diisi', 'numeric' => 'Nilai tidak valid']);
    if ($validation->fails()) return redirect()->back()->withErrors($validation)->withInput();

    $package = json_decode($request->package);
    $payload = array_merge(
      $request->except(['_token', 'package']),
      [
        "stage" => (int)$request->stage,
        "level" => (int)$request->level,
        "required_stage" => (int)$request->required_stage,
        "module_type" => $request->module_type,
        "package_id" => $package->id,
        "type" => $type,
        "stage_type" => $request->stage_type,
        "start_date" => Carbon::parse($request->start_date)->toISOString(true),
        "end_date" => Carbon::parse($request->end_date)->toISOString(true)
      ]
    );
    $response = $this->stagesService->createClassStage($payload);
    $toast = $response->successful()
      ? ["title" => "Berhasil", "type" => "success", "message" => "Data stage berhasil ditambah"]
      : ["title" => "Terjadi kesalahan", "type" => "error", "message" => "Proses tambah data stage gagal, silakan coba lagi nanti"];
    $request->session()->flash('flash-message', [
      'title' => $toast["title"],
      'type' => $toast["type"],
      'message' => $toast["message"]
    ]);
    return redirect("/stages-kelas/$type");
  }

  public function edit(Request $request, string $type, string $id)
  {
    // Get single stage by $id
    $stageResponse = $this->stagesService->getClassStageById($id);
    $stage = json_decode($stageResponse->body())?->data ?? null;
    if (!$stage) return abort(404);

    $isStageLocked = property_exists($stage, "is_locked") ? $stage->is_locked : false;
    if ($isStageLocked) {
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Stage dikunci, tidak dapat mengakses halaman ini"
      ]);
      return redirect("/stages-kelas/$type");
    }
    $stage->start_date = Carbon::parse($stage->start_date)->timezone("Asia/Jakarta")->format("Y-m-d H:i");
    $stage->end_date = Carbon::parse($stage->end_date)->timezone("Asia/Jakarta")->format("Y-m-d H:i");

    $breadcrumbs = [["name" => "Stage Kelas $stage->type", "link" => "/stages-kelas/$stage->type"], ["name" => "Edit Stage", "link" => null]];
    $moduleTypes = ["PLATINUM", "PREMIUM_TRYOUT"];

    $platinumPackages = $type !== "CPNS"
      ? $this->examPackageService->getAll()
      : $this->cpnsExamPackageService->getAll();
    $premiumPackageResponse = $type !== "CPNS"
      ? $this->examTryoutPremiumService->getAll()
      : $this->cpnsExamTryoutPremiumService->getAll();
    $premiumPackageBody = json_decode($premiumPackageResponse->body())?->data ?? [];
    $packages = collect(array_merge($platinumPackages, $premiumPackageBody))->sortBy('id')->values()->toArray();

    return view("pages/class-stages/edit", compact('moduleTypes', 'packages', 'stage', 'type', 'breadcrumbs'));
  }

  public function update(Request $request, string $type, string $id)
  {
    $validation = Validator::make($request->all(), [
      'stage' => 'required|numeric',
      'level' => 'required|numeric',
      'required_stage' => 'required|numeric',
      'module_type' => 'required',
      'package' => 'required',
      'stage_type' => 'required',
      'start_date' => 'required',
      'end_date' => 'required',
    ], ['required' => 'Harus diisi', 'numeric' => 'Nilai tidak valid']);
    if ($validation->fails()) return redirect()->back()->withErrors($validation)->withInput();

    $package = json_decode($request->package);
    $payload = array_merge(
      $request->except(['_token', '_method', 'package']),
      [
        "stage" => (int)$request->stage,
        "level" => (int)$request->level,
        "required_stage" => (int)$request->required_stage,
        "module_type" => $request->module_type,
        "package_id" => $package->id,
        "type" => $type,
        "stage_type" => $request->stage_type,
        "start_date" => Carbon::parse($request->start_date)->toISOString(true),
        "end_date" => Carbon::parse($request->end_date)->toISOString(true)
      ]
    );
    $response = $this->stagesService->updateClassStage($id, $payload);
    $toast = $response->successful()
      ? ["title" => "Berhasil", "type" => "success", "message" => "Data stage berhasil diperbarui"]
      : ["title" => "Terjadi kesalahan", "type" => "error", "message" => "Proses update stage gagal, silakan coba lagi nanti"];
    $request->session()->flash('flash-message', [
      'title' => $toast["title"],
      'type' => $toast["type"],
      'message' => $toast["message"]
    ]);
    return redirect("/stages-kelas/$type");
  }

  public function updateLockStatus(Request $request, $type)
  {
    $payload = ["type" => $type, "is_locked" => (bool)$request->is_locked];
    $response = $this->stagesService->updateClassStageLockStatus($payload);
    $toast = $response->successful()
      ? ["title" => "Berhasil", "type" => "success", "message" => "Data status stage berhasil diperbarui"]
      : ["title" => "Terjadi kesalahan", "type" => "error", "message" => "Proses gagal, silakan coba lagi nanti"];
    $request->session()->flash('flash-message', [
      'title' => $toast["title"],
      'type' => $toast["type"],
      'message' => $toast["message"]
    ]);
    return redirect("/stages-kelas/$type");
  }
}

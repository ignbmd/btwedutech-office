<?php

namespace App\Http\Controllers;

use App\Helpers\UserRole;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\ProfileService\Profile;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SamaptaTryoutScoreController extends Controller
{
  private ClassRoom $learningClassRoomService;
  private ClassMember $learningClassMemberService;
  private Profile $profileService;
  private Branch $branchService;

  public function __construct(
    ClassRoom $learningClassRoomService,
    ClassMember $learningClassMemberService,
    Profile $profileService,
    Branch $branchService
  )
  {
    $this->learningClassRoomService = $learningClassRoomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->profileService = $profileService;
    $this->branchService = $branchService;
  }

  public function index(Request $request)
  {
    $user = Auth::user();
    $userBranchCode = $user->branch_code ?? null;
    if(!$userBranchCode) {
      return redirect("/nilai-tryout-samapta")->with("flash-message", [
        "type" => "info",
        "title" => "Info",
        "message" => "Silakan refresh halaman dan coba lagi"
      ]);
    }

    $userAllowedAccess = UserRole::getAllowed('roles.samapta_tryout_score');
    $showActionButton = count(array_intersect(["*", "show_action_button"], $userAllowedAccess)) > 0;

    $breadcrumbs = [["name" => "Nilai Tryout Samapta Siswa"]];
    $classroomId = $request->has('classroom_id') && $request->get('classroom_id') ? $request->get('classroom_id') : null;
    $branchCode = $request->has('branch_code') && $request->get('branch_code') ? $request->get('branch_code') : null;
    $isCentralUser = $userBranchCode === "PT0000";
    if (
      ($request->has('branch_code') && is_null($request->get('branch_code'))) ||
      ($request->has('classroom_id') && is_null($request->get('classroom_id')))
    )
    {
      return redirect("/nilai-tryout-samapta")->with("flash-message", [
        "type" => "warning",
        "title" => "Peringatan",
        "message" => "Pastikan untuk memilih cabang atau kelas"
      ]);
    }

    if (!$isCentralUser && ($branchCode && $branchCode !== $userBranchCode)) {
      return redirect("/nilai-tryout-samapta");
    }

    $classRoom = null;
    $branch = null;
    $pageTitle = "Nilai Tryout Samapta Siswa";
    $classMembers = [];
    $classMembersIds = [];
    $classMembersEmails = [];

    if ($classroomId && $classroomId === "ALL") {
      $branch = $this->branchService->getBranchByCode($branchCode);
      $pageTitle = ($branch)
        ? "Nilai Tryout Samapta Siswa - Semua Kelas Cabang $branch->name"
        : "Nilai Tryout Samapta Siswa";
      $classRooms = collect($this->learningClassMemberService->getByBranchCodes([$branchCode]))
        ->filter(fn($classRoom) => $classRoom->year === Carbon::now()->year && $classRoom->status === "ONGOING")
        ->values();
      $classMembers = $classRooms->pluck('class_members')->flatten()->unique('smartbtw_id')->sort()->values()->toArray();
      $classMembersIds = $classRooms->pluck('class_members')->flatten()->pluck('smartbtw_id')->unique()->sort()->values()->toArray();
      $classMembersEmails = $classRooms->pluck('class_members')->flatten()->pluck('email')->unique()->sort()->values()->toArray();
    }

    if ($classroomId && $classroomId !== "ALL") {
      $classRoom = $this->learningClassRoomService->getSingle($classroomId);
      if(!$classRoom) {
        Log::warning("Could not getting Samapta Tryout Score Data - Classroom data with classroom ID: $classroomId was not found");
        return redirect("/nilai-tryout-samapta");
      }
      if(!$isCentralUser && ($classRoom->branch_code !== $userBranchCode)) {
        Log::warning("Could not getting Samapta Tryout Score Data - Classroom data with classroom ID: $classroomId was found, but the classroom branch code does not match the authenticated user's branch code");
        return redirect("/nilai-tryout-samapta");
      }
      $pageTitle = $classRoom
        ? "Nilai Tryout Samapta Siswa - $classRoom->title ($classRoom->year)"
        : "Nilai Tryout Samapta Siswa";
      $classMembers = $classRoom
        ? $this->learningClassMemberService->getByClassroomId($classroomId)
        : [];
      $classMembersIds = count($classMembers)
        ? collect($classMembers)->pluck('smartbtw_id')->all()
        : [];
      $classMembersEmails = count($classMembers)
        ? collect($classMembers)->pluck('email')->unique()->all()
        : [];
    }

    $samaptaTryoutScoreResponse = $this->profileService->getSamaptaScoreByMultipleStudentEmails(["email" => $classMembersEmails, "year" => Carbon::now()->year]);
    $studentSamaptaTryoutScore = json_decode($samaptaTryoutScoreResponse->body())->data ?? [];
    return view("/pages/samapta-tryout-score/index", compact('breadcrumbs', 'studentSamaptaTryoutScore', 'pageTitle', 'showActionButton', 'userBranchCode'));
  }

  public function upsert(Request $request)
  {
    // Form Input Validation
    $validator = Validator::make($request->all(), [
      "smartbtw_id" => ["required", "numeric"],
      "gender" => ["required", "numeric"],
      "run_score" => ["required", "numeric", "min:0", "max:100"],
      "pull_up_score" => ["required", "numeric", "min:0", "max:100"],
      "push_up_score" => ["required", "numeric", "min:0", "max:100"],
      "sit_up_score" => ["required", "numeric", "min:0", "max:100"],
      "shuttle_score" => ["required", "numeric", "min:0", "max:100"],
      "total" => ["required", "numeric", "min:0", "max:500"],
    ], [
      "required" => ":attribute harus diisi",
      "numeric" => ":attribute tidak valid",
      "min" => ":attribute minimal :min",
      "max" => ":attribute maksimal :max"
    ], [
      "smartbtw_id" => "ID Siswa",
      "gender" => "Jenis Kelamin",
      "run_score" => "Nilai Samapta Lari",
      "pull_up_score" => "Nilai Samapta Pull Up",
      "push_up_score" => "Nilai Samapta Push Up",
      "sit_up_score" => "Nilai Samapta Sit Up",
      "shuttle_up_score" => "Nilai Samapta Shuttle",
      "total" => "Nilai Total",
    ]);

    if($validator->fails()) {
      return back()->with('flash-message', [
        'title' => 'Peringatan!',
        'type' => 'warning',
        'message' => $validator->errors()->first()
      ]);
    }

    if((int)$request->smartbtw_id === 0) {
      return back()->with('flash-message', [
        'title' => 'Peringatan!',
        'type' => 'warning',
        'message' => "Akun siswa tidak ditemukan. Pastikan siswa memiliki akun btwedutech"
      ]);
    }

    // Construct payload and send it to service
    $payload = [
      "smartbtw_id" => (int)$request->smartbtw_id,
      "gender" => $request->gender == "1" ? true : false,
      "run_score" => (float)$request->run_score,
      "pull_up_score" => (float)$request->pull_up_score,
      "push_up_score" => (float)$request->push_up_score,
      "sit_up_score" => (float)$request->sit_up_score,
      "shuttle_score" => (float)$request->shuttle_score,
      "total" => (float)$request->total,
      "year" => Carbon::now()->year,
    ];
    $upsertSamaptaTryoutScoreResponse = $this->profileService->upsertSamaptaScore($payload);
    $upsertSamaptaTryoutScoreResponseBody = json_decode($upsertSamaptaTryoutScoreResponse->body());
    if(!$upsertSamaptaTryoutScoreResponse->successful()) {
      Log::error("An error occured when trying to upsert Samapta Tryout Score", ["response" => $upsertSamaptaTryoutScoreResponseBody]);
      return back()->with('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Terjadi Kesalahan, silakan coba lagi nanti"
      ]);
    }
    return back()->with('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => "Data nilai tryout samapta berhasil disimpan"
    ]);
  }
}

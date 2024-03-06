<?php

namespace App\Http\Controllers;

use App\Helpers\UserRole;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\ProfileService\Profile;
use App\Services\CompetitionMapService\Competition;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BKNScoreController extends Controller
{
  private ClassRoom $learningClassRoomService;
  private ClassMember $learningClassMemberService;
  private Profile $profileService;
  private Branch $branchService;
  private Competition $competitionCompMapService;

  public function __construct(
    ClassRoom $learningClassRoomService,
    ClassMember $learningClassMemberService,
    Profile $profileService,
    Branch $branchService,
    Competition $competitionCompMapService
  )
  {
    $this->learningClassRoomService = $learningClassRoomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->profileService = $profileService;
    $this->branchService = $branchService;
    $this->competitionCompMapService = $competitionCompMapService;
  }

  public function index(Request $request)
  {
    $user = Auth::user();
    $userBranchCode = $user->branch_code ?? null;
    if(!$userBranchCode) {
      return redirect("/pembelajaran/nilai-bkn")->with("flash-message", [
        "type" => "info",
        "title" => "Info",
        "message" => "Silakan refresh halaman dan coba lagi"
      ]);
    }

    $userAllowedAccess = UserRole::getAllowed('roles.learning_bkn_score');
    $showActionButton = count(array_intersect(["*", "show_action_button"], $userAllowedAccess)) > 0;

    $breadcrumbs = [["name" => "Nilai BKN Siswa"]];
    $classroomId = $request->has('classroom_id') && $request->get('classroom_id') ? $request->get('classroom_id') : null;
    $branchCode = $request->has('branch_code') && $request->get('branch_code') ? $request->get('branch_code') : null;
    $isCentralUser = $userBranchCode === "PT0000";
    if (
      ($request->has('branch_code') && is_null($request->get('branch_code'))) ||
      ($request->has('classroom_id') && is_null($request->get('classroom_id')))
    )
    {
      return redirect("/pembelajaran/nilai-bkn")->with("flash-message", [
        "type" => "warning",
        "title" => "Peringatan",
        "message" => "Pastikan untuk memilih cabang atau kelas"
      ]);
    }

    if (!$isCentralUser && ($branchCode && $branchCode !== $userBranchCode)) {
      return redirect("/pembelajaran/nilai-bkn");
    }

    $classRoom = null;
    $branch = null;
    $pageTitle = "Nilai BKN Siswa";
    $classMembers = [];
    $classMembersIds = [];
    $classMembersEmails = [];

    if ($classroomId && $classroomId === "ALL") {
      $branch = $this->branchService->getBranchByCode($branchCode);
      $pageTitle = ($branch)
        ? "Nilai BKN Siswa - Semua Kelas Cabang $branch->name"
        : "Nilai BKN Siswa";
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
        Log::warning("Could not getting BKN Score Data - Classroom data with classroom ID: $classroomId was not found");
        return redirect("/pembelajaran/nilai-bkn");
      }
      if(!$isCentralUser && ($classRoom->branch_code !== $userBranchCode)) {
        Log::warning("Could not getting BKN Score Data - Classroom data with classroom ID: $classroomId was found, but the classroom branch code does not match the authenticated user's branch code");
        return redirect("/pembelajaran/nilai-bkn");
      }
      $pageTitle = $classRoom
        ? "Nilai BKN Siswa - $classRoom->title ($classRoom->year)"
        : "Nilai BKN Siswa";
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

    $bknScoresResponse = $this->profileService->getBKNScoreByMultipleStudentEmails(["email" => $classMembersEmails, "year" => Carbon::now()->year]);
    $studentBknScores = json_decode($bknScoresResponse->body())->data ?? [];

    $competitionsResponse = $this->competitionCompMapService->getCacheData();
    $competitions = json_decode($competitionsResponse->body())->data ?? [];

    $competitionSchools = [];
    if(count($competitions)) $competitionSchools = collect($competitions)->unique('sekolah_id')->values()->toArray();

    $skdQuestionCategoriesMaximumScore = ["TWK" => "150", "TIU" => "175", "TKP" => "225", "SKD" => "550"];
    return view("/pages/bkn-score/index", compact('breadcrumbs', 'studentBknScores', 'skdQuestionCategoriesMaximumScore', 'pageTitle', 'showActionButton', 'userBranchCode', 'competitions', 'competitionSchools'));
  }

  public function upsert(Request $request)
  {
    // Form Input Validation
    $skdQuestionCategoriesMaximumScore = ["TWK" => "150", "TIU" => "175", "TKP" => "225", "SKD" => "550"];
    $validator = Validator::make($request->all(), [
      "smartbtw_id" => ["required", "numeric"],
      "twk" => ["required", "numeric", "min:0", "max:".$skdQuestionCategoriesMaximumScore['TWK']],
      "tiu" => ["required", "numeric", "min:0", "max:".$skdQuestionCategoriesMaximumScore['TIU']],
      "tkp" => ["required", "numeric", "min:0", "max:".$skdQuestionCategoriesMaximumScore['TKP']],
      "total" => ["required", "numeric", "min:0", "max:".$skdQuestionCategoriesMaximumScore['SKD']],
      "bkn_rank" => ["required", "numeric", "min:0"],
      "is_continue" => ["required"],
      "ptk_school_id" => ["required", "numeric"],
      "ptk_school" => ["required"],
      "ptk_major_id" => ["required", "numeric"],
      "ptk_major" => ["required"],
      "bkn_test_number" => ["required"]
    ], [
      "required" => ":attribute harus diisi",
      "numeric" => ":attribute tidak valid",
      "min" => ":attribute minimal :min",
      "max" => ":attribute maksimal :max"
    ], [
      "smartbtw_id" => "ID Siswa",
      "twk" => "Nilai TWK",
      "tiu" => "Nilai TIU",
      "tkp" => "Nilai TKP",
      "total" => "Nilai Total",
      "bkn_rank" => "Ranking BKN",
      "is_continue" => "Status Kelanjutan",
      "bkn_test_number" => "Nomor Peserta",
      "ptk_school" => "Sekolah",
      "ptk_major" => "Jurusan/Prodi",
      "ptk_school_id" => "ID Sekolah",
      "ptk_major_id" => "ID Jurusan/Prodi"
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
      "twk" => (int)$request->twk,
      "tiu" => (int)$request->tiu,
      "tkp" => (int)$request->tkp,
      "total" => (int)$request->total,
      "bkn_rank" => (int)$request->bkn_rank,
      "year" => Carbon::now()->year,
      "is_continue" => $request->is_continue == "1" ? true : false,
      "bkn_test_number" => $request->bkn_test_number,
      "ptk_school_id" => (int)$request->ptk_school_id,
      "ptk_school" => $request->ptk_school,
      "ptk_major_id" => (int)$request->ptk_major_id,
      "ptk_major" => $request->ptk_major
    ];
    $upsertBKNScoreResponse = $this->profileService->upsertBKNScore($payload);
    $upsertBKNScoreResponseBody = json_decode($upsertBKNScoreResponse->body());
    if(!$upsertBKNScoreResponse->successful()) {
      Log::error("An error occured when trying to upsert BKN Score", ["response" => $upsertBKNScoreResponseBody]);
      return back()->with('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => "Terjadi Kesalahan, silakan coba lagi nanti"
      ]);
    }
    return back()->with('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => "Data nilai BKN berhasil disimpan"
    ]);
  }
}

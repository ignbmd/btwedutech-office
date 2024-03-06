<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\BranchService\Branch;
use App\Services\CompetitionMapService\Competition;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\ClassRoom;
use App\Services\ProfileService\Profile;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class InterviewScoreController extends Controller
{
  private ClassRoom $learningClassRoomService;
  private ClassMember $learningClassMemberService;
  private Profile $profileService;
  private Branch $branchService;
  private Competition $competitionCompMapService;

  public function __construct(
    Profile $profileService,
    Branch $branchService,
    Competition $competitionCompMapService,
    ClassRoom $learningClassRoomService,
    ClassMember $learningClassMemberService,
  )
  {
    $this->learningClassRoomService = $learningClassRoomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->profileService = $profileService;
    $this->branchService = $branchService;
    $this->competitionCompMapService = $competitionCompMapService;
    Breadcrumb::setFirstBreadcrumb('Nilai Wawancara', '');
  }

  public function index(Request $request)
  {
    $user = Auth::user();
    $userBranchCode = $user->branch_code ?? null;
    if(!$userBranchCode) {
      return redirect("nilai-wawancara")->with("flash-message", [
        "type" => "info",
        "title" => "Info",
        "message" => "Silakan refresh halaman dan coba lagi"
      ]);
    }

    $breadcrumbs = [["name" => "Nilai Wawancara"]];
    $classroomId = $request->has('classroom_id') && $request->get('classroom_id') ? $request->get('classroom_id') : null;
    $branchCode = $request->has('branch_code') && $request->get('branch_code') ? $request->get('branch_code') : null;
    $isCentralUser = $userBranchCode === "PT0000";

    if (
      ($request->has('branch_code') && is_null($request->get('branch_code'))) ||
      ($request->has('classroom_id') && is_null($request->get('classroom_id')))
    )
    {
      return redirect("/nilai-wawancara")->with("flash-message", [
        "type" => "warning",
        "title" => "Peringatan",
        "message" => "Pastikan untuk memilih cabang atau kelas"
      ]);
    }

    if (!$isCentralUser && ($branchCode && $branchCode !== $userBranchCode)) {
      return redirect("/nilai-wawancara");
    }

    $classRoom = null;
    $branch = null;
    $pageTitle = "Nilai Wawancara";
    $classMembers = [];
    $classMembersIds = [];
    $classMembersEmails = [];

    if ($classroomId && $classroomId === "ALL") {
      $branch = $this->branchService->getBranchByCode($branchCode);
      $pageTitle = ($branch)
        ? "Nilai Wawancara - Semua Kelas Cabang $branch->name"
        : "Nilai Wawancara";
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
        Log::warning("Could not getting Interview Score - Classroom data with classroom ID: $classroomId was not found");
        return redirect("/nilai-wawancara");
      }
      if(!$isCentralUser && ($classRoom->branch_code !== $userBranchCode)) {
        Log::warning("Could not getting Interview Score - Classroom data with classroom ID: $classroomId was found, but the classroom branch code does not match the authenticated user's branch code");
        return redirect("/nilai-wawancara");
      }
      $pageTitle = $classRoom
        ? "Nilai Wawancara - $classRoom->title ($classRoom->year)"
        : "Nilai Wawancara";
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


    $interviewResponse = $this->profileService->getInterviewByStudentEmails(["email" => $classMembersEmails, "year" => Carbon::now()->year]);
    $interview = json_decode($interviewResponse->body())->data ?? [];

    $competitionsResponse = $this->competitionCompMapService->getCacheData();
    $competitions = json_decode($competitionsResponse->body())->data ?? [];

    $competitionSchools = [];
    if(count($competitions)) $competitionSchools = collect($competitions)->unique('sekolah_id')->values()->toArray();

    return view('pages.interview-tryout-form.index', compact('breadcrumbs', 'interview','pageTitle', 'userBranchCode', 'competitions', 'competitionSchools'));
  }

  public function createInterview($smartbtw_id)
  {
    try {
      $breadcrumbs = [["name" => "Nilai Wawancara", "link" => url()->previous()],["name" => "Tambah", "link" => null]];
      $decryptedSmartbtwID = Crypt::decrypt($smartbtw_id);
      if(!$decryptedSmartbtwID) {
        return back()->with("flash-message", [
          "type" => "warning",
          "title" => "Peringatan",
          "message" => "Akun siswa tidak memiliki akun BTW Edutech"
        ]);
      }
      $studentProfile = $this->profileService->getSingleStudent($decryptedSmartbtwID);
      $pageTitle = $studentProfile ? "Tambah Nilai Wawancara $studentProfile->name" : "Tambah Nilai Wawancara";
      return view('pages.interview-tryout-form.add-form', ['smartbtw_id' => $decryptedSmartbtwID, 'breadcrumbs' => $breadcrumbs, 'pageTitle' => $pageTitle]);
    } catch (\Illuminate\Contracts\Encryption\DecryptException $de) {
      $previousURL = Request::create(url()->previous())->getUri();
      if ($previousURL === route('nilai-wawancara')) return back();
      return redirect("/nilai-wawancara");
    }
  }

  public function editInterview($smartbtw_id)
  {
    try {
      $breadcrumbs = [["name" => "Nilai Wawancara", "link" => url()->previous()],["name" => "Edit", "link" => null]];
      $decryptedSmartbtwID = Crypt::decrypt($smartbtw_id);
      $interviewScore = $this->profileService->getSingleInterviewBySmartbtwAndYear($decryptedSmartbtwID, Carbon::now()->year);
      $studentName = $interviewScore ? $interviewScore->name : null;
      $pageTitle = $studentName ? "Edit Nilai Wawancara $studentName" : "Edit Nilai Wawancara";

      return view('pages.interview-tryout-form.edit-form', ["interviewScore" => $interviewScore, "smartbtw_id" => $decryptedSmartbtwID, "breadcrumbs" => $breadcrumbs, "pageTitle" => $pageTitle]);
    } catch (\Illuminate\Contracts\Encryption\DecryptException $de) {
      $previousURL = Request::create(url()->previous())->getUri();
      if ($previousURL === route('nilai-wawancara')) return back();
      return redirect("/nilai-wawancara");
    }
  }

  public function upsertInterview(Request $request)
  {
    // Get nilai wawancara url with query string
    $previousUrl = Request::create($request->previous_url)->getUri();
    // Remove the query string from the previous URL
    $previousUrlWithoutQuery = strtok($previousUrl, '?');
    // Determine the redirect link
    $redirectLink = $previousUrlWithoutQuery === route('nilai-wawancara') ? $previousUrl : "/nilai-wawancara";

    try {
      $user = Auth::user();
      $smartbtw_id = Crypt::decrypt($request->smartbtw_id);

      $year = Carbon::now()->year;
      $validator = Validator::make($request->all(), [
          'cara_berpakaian' => 'required',
          'cara_duduk_dan_berjabat' => 'required',
          'praktek_baris_berbaris' => 'required',
          'penilaian_sopan_santun' => 'required',
          'kepercayaan_diri_dan_stabilitas_emosi' => 'required',
          'ketahanan_diri' => 'required',
          'kelebihan_dan_kekurangan' => 'required',
          'motivasi' => 'required',
          'data_keluarga_dan_kondisi_finansial' => 'required',
          'hubungan_dengan_tokoh_nasional' => 'required',
          'jiwa_kepemimpinan' => 'required',
          'kemampuan_berkomunikasi' => 'required',
          'kemampuan_berbahasa_asing' => 'required',
          'kerjasama' => 'required',
          'kemampuan_akademik' => 'required',
          'kemampuan_minat_dan_bakat'  => 'required'
      ],[
          "required" => ":harus diisi"
      ]);

      if($validator->fails()) {
          return back()->with('flash-message', [
            'title' => 'Peringatan!',
            'type' => 'warning',
            'message' => $validator->errors()->first()
          ]);
      }

      $penampilanTotal = array_sum([$request->cara_berpakaian, $request->cara_duduk_dan_berjabat, $request->praktek_baris_berbaris]);
      $sikapKepribadianTotal = array_sum([$request->penilaian_sopan_santun, $request->kepercayaan_diri_dan_stabilitas_emosi, $request->ketahanan_diri, $request->kelebihan_dan_kekurangan, $request->motivasi]);
      $keluargaFinansialTotal = array_sum([$request->data_keluarga_dan_kondisi_finansial, $request->hubungan_dengan_tokoh_nasional]);
      $softSkillTotal = array_sum([$request->jiwa_kepemimpinan, $request->kemampuan_berkomunikasi, $request->kemampuan_berbahasa_asing, $request->kerjasama]);
      $hardSkillTotal = array_sum([$request->kemampuan_akademik, $request->kemampuan_minat_dan_bakat]);
      $totalNilai = $penampilanTotal + $sikapKepribadianTotal + $keluargaFinansialTotal + $softSkillTotal + $hardSkillTotal;
      $nilaiAkhir = ($totalNilai / 48) * 100;
      $nilaiFormat = number_format($nilaiAkhir, 2);

      $payload = [
          "penampilan" => [
              "cara_berpakaian" => (int)$request->cara_berpakaian,
              "cara_duduk_dan_berjabat" => (int)$request->cara_duduk_dan_berjabat,
              "praktek_baris_berbaris" => (int)$request->praktek_baris_berbaris,
              "total" => $penampilanTotal
          ],
          "sikap_dan_kepribadian" => [
              "penilaian_sopan_santun" => (int)$request->penilaian_sopan_santun,
              "kepercayaan_diri_dan_stabilitas_emosi" => (int)$request->kepercayaan_diri_dan_stabilitas_emosi,
              "ketahanan_diri" => (int)$request->ketahanan_diri,
              "kelebihan_dan_kekurangan" => (int)$request->kelebihan_dan_kekurangan,
              "motivasi" => (int)$request->motivasi,
              "total" => $sikapKepribadianTotal
          ],
          "keluarga_dan_kemampuan_finansial" => [
              "data_keluarga_dan_kondisi_finansial" => (int)$request->data_keluarga_dan_kondisi_finansial,
              "hubungan_dengan_tokoh_nasional" => (int)$request->hubungan_dengan_tokoh_nasional,
              "total" => $keluargaFinansialTotal
          ],
          "soft_skill" =>[
              "jiwa_kepemimpinan" => (int)$request->jiwa_kepemimpinan,
              "kemampuan_berkomunikasi" => (int)$request->kemampuan_berkomunikasi,
              "kemampuan_berbahasa_asing" => (int)$request->kemampuan_berbahasa_asing,
              "kerjasama" => (int)$request->kerjasama,
              "total" => $softSkillTotal
          ],
          "hard_skill" => [
              "kemampuan_akademik" => (int)$request->kemampuan_akademik,
              "kemampuan_minat_dan_bakat" => (int)$request->kemampuan_minat_dan_bakat,
              "total" => $hardSkillTotal
          ],
          "total" => (float)$nilaiFormat,
          "smartbtw_id" => (int)$smartbtw_id,
          "created_by" =>  $user->name,
          "year" => $year
      ];
      $upsertInterviewResponse = $this->profileService->upsertInterviewTryout($payload);
      $upsertInterview = json_decode($upsertInterviewResponse->body());

      if(!$upsertInterview->success) {
        return redirect($redirectLink)->with('flash-message', [
          'title' => 'Terjadi Kesalahan!',
          'type' => 'error',
          'message' => "Terjadi Kesalahan, silakan coba lagi nanti"
        ]);
      }
      return redirect($redirectLink)->with('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => "Data Tryout Wawancara berhasil disimpan"
      ]);
    } catch(\Illuminate\Contracts\Encryption\DecryptException $de) {
      return $redirectLink;
    }
  }
}

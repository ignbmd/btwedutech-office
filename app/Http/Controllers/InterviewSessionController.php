<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\ProfileService\Profile;
use App\Services\BranchService\Branch;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class InterviewSessionController extends Controller
{
  private Profile $profileService;
  private Branch $branchService;


  public function __construct(
    Profile $profileService,
    Branch $branchService,
  )
  {
    $this->profileService = $profileService;
    Breadcrumb::setFirstBreadcrumb('Sesi Wawancara', '/sesi-wawancara');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $sessionInterview = $this->profileService->getAllSession();
    $user = Auth::user();
    $allowedActions = UserRole::getAllowed('roles.interview_score');
    $canCreateSession =  in_array('create_session', $allowedActions);
    $canEditSession = in_array('edit_session', $allowedActions);
    $canDeleteSession = in_array('delete_session', $allowedActions);
    $showActionDropdownButton = $canEditSession || $canDeleteSession;
    return view('pages.interview-tryout-form.interview-session.index', compact('breadcrumbs', 'sessionInterview', 'user', 'canCreateSession', 'canEditSession', 'canDeleteSession', 'showActionDropdownButton'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ["name" => "Tambah sesi wawancara"]];
    $allowedActions = UserRole::getAllowed('roles.interview_score');
    $canCreateSession =  in_array('create_session', $allowedActions);
    if(!$canCreateSession) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Anda tidak diizinkan mengakses halaman ini'
      ]);
    }
    return view('pages.interview-tryout-form.interview-session.add-session', compact('breadcrumbs'));
  }

  public function store(Request $request)
  {
    $allowedActions = UserRole::getAllowed('roles.interview_score');
    $canCreateSession =  in_array('create_session', $allowedActions);
    if(!$canCreateSession) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Anda tidak diizinkan untuk melakukan aksi ini'
      ]);
    }
    $validator = Validator::make($request->all(), [
      "name" => "required",
      "description" => "required",
      "number" => "required|numeric|min:1|max:100",
    ], [
      "required" => ":attribute harus diisi",
      "numeric" => ":attribute harus berupa angka",
      "min" => ":attribute minimal :min",
      "max" => ":attribute maksimal :max"
    ], [
      "name" => "Nama sesi",
      "description" => "Deskripsi",
      "number" => "Nomor sesi"
    ]);
    if($validator->fails()) {
      return back()->withErrors($validator->errors())->withInput();
    }
    $payload = [
      "name" => $request->name,
      "description" => $request->description,
      "number" => (int)$request->number
    ];

    $response = $this->profileService->createInterviewSession($payload);
    $body = json_decode($response->body());
    if(!$response->successful()) {
      Log::error("Could not create new interview session", ["body" => json_encode($payload), "response" => $body]);
      return back()->with("flash-message", [
        "type" => "error",
        "title" => "Terjadi Kesalahan",
        "message" => "Proses gagal, silakan coba lagi nanti"
      ]);
    }
    return redirect("/sesi-wawancara")->with("flash-message", [
      "type" => "success",
      "title" => "Berhasil",
      "message" => "Sesi wawancara berhasil disimpan"
    ]);
  }

  public function edit(string $id)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ["name" => "Edit sesi wawancara"]];
    $allowedActions = UserRole::getAllowed('roles.interview_score');
    $canEditSession =  in_array('edit_session', $allowedActions);
    if(!$canEditSession) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Anda tidak diizinkan mengakses halaman ini'
      ]);
    }

    $response = $this->profileService->getInterviewSessionByID($id);
    if(!$response->successful()) {
      return back()->with("flash-message", [
        "type" => "warning",
        "title" => "Peringatan",
        "message" => "Silakan coba lagi"
      ]);
    }

    $data = json_decode($response->body())->data;
    $pageTitle = "Edit Data Sesi Wawancara - $data->name";
    return view('pages.interview-tryout-form.interview-session.edit-session', compact('breadcrumbs', 'data', 'pageTitle'));
  }

  public function update(Request $request, string $id)
  {
    $allowedActions = UserRole::getAllowed('roles.interview_score');
    $canEditSession =  in_array('edit_session', $allowedActions);
    if(!$canEditSession) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Anda tidak diizinkan mengakses halaman ini'
      ]);
    }
    $validator = Validator::make($request->all(), [
      "name" => "required",
      "description" => "required",
      "number" => "required|numeric|min:1|max:100",
    ], [
      "required" => ":attribute harus diisi",
      "numeric" => ":attribute harus berupa angka",
      "min" => ":attribute minimal :min",
      "max" => ":attribute maksimal :max"
    ], [
      "name" => "Nama sesi",
      "description" => "Deskripsi",
      "number" => "Nomor sesi"
    ]);
    if($validator->fails()) {
      return back()->withErrors($validator->errors())->withInput();
    }
    $payload = [
      "name" => $request->name,
      "description" => $request->description,
      "number" => (int)$request->number
    ];

    $response = $this->profileService->updateInterviewSession($id, $payload);
    $body = json_decode($response->body());
    if(!$response->successful()) {
      Log::error("Could not update interview session", ["body" => json_encode($payload), "response" => $body]);
      return back()->with("flash-message", [
        "type" => "error",
        "title" => "Terjadi Kesalahan",
        "message" => "Proses gagal, silakan coba lagi nanti"
      ]);
    }
    return redirect("/sesi-wawancara")->with("flash-message", [
      "type" => "success",
      "title" => "Berhasil",
      "message" => "Sesi wawancara berhasil disimpan"
    ]);
  }

  public function delete(string $id)
  {
    $allowedActions = UserRole::getAllowed('roles.interview_score');
    $canDeleteSession =  in_array('edit_session', $allowedActions);
    if(!$canDeleteSession) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Anda tidak diizinkan melakukan aksi ini'
      ]);
    }

    $response = $this->profileService->deleteInterviewSession($id);
    if(!$response->successful()) {
      return back()->with("flash-message", [
        "type" => "error",
        "title" => "Terjadi kesalahan",
        "message" => "Proses gagal, silakan coba lagi nanti"
      ]);
    }

    return back()->with("flash-message", [
      "type" => "success",
      "title" => "Berhasil",
      "message" => "Sesi wawancara berhasil dihapus"
    ]);
  }

  public function indexResult($session_id, $sso_id)
  {
    $sessionResponse = $this->profileService->getInterviewSessionByID($session_id);
    $sessionBody = json_decode($sessionResponse->body());
    $sessionResponseStatus = $sessionResponse->status();
    if($sessionResponse->clientError()) return redirect()->back();
    if($sessionResponse->serverError()) {
      Log::error("Could not get interview score by session ID and SSO ID - Server Error", ["response" => json_encode($sessionBody)]);
      return redirect("/sesi-wawancara")->flash('flash-message', [
        'type' => 'error',
        'title' => 'Terjadi kesalahan',
        'message' => 'Sistem sedang mengalami perbaikan, silakan coba lagi nanti'
      ]);
    }

    $breadcrumbs = [["name" => "Sesi Wawancara", "link" => "/sesi-wawancara"], ["name" => "Hasil Wawancara"]];
    $resultInterview = $this->profileService->getResultInterviewByIdAndSSO($session_id, $sso_id);
    return view('pages.interview-tryout-form.interview-session.result-interview', compact('breadcrumbs', 'resultInterview'));
  }

  public function createNewInterview()
  {
    $pageTitle = "Tambah Hasil Wawancara";
    $sessionInterview = $this->profileService->getAllSession();
    $breadcrumbs = [["name" => "Hasil Wawancara", "link" => url()->previous()],["name" => "Tambah", "link" => null]];
    return view('pages.interview-tryout-form.add-form', compact('breadcrumbs', 'pageTitle','sessionInterview'));
  }

  public function storeInterviewResult(Request $request)
  {
    // TODO: Validasi
    // Validasi payload dengan validator
    $validator = Validator::make($request->all(), [
      'penampilan'=> 'required',
	    'cara_duduk_dan_berjabat'=> 'required',
	    'praktek_baris_berbaris'=> 'required',
	    'penampilan_sopan_santun'=> 'required',
	    'kepercayaan_diri_dan_stabilitas_emosi'=> 'required',
	    'komunikasi'=> 'required',
	    'pengembangan_diri'=> 'required',
	    'integritas'=> 'required',
	    'kerjasama'=> 'required',
	    'mengelola_perubahan'=> 'required',
	    'perekat_bangsa'=> 'required',
	    'pelayanan_publik'=> 'required',
	    'pengambilan_keputusan'=> 'required',
	    'orientasi_hasil'=> 'required',
	    'prestasi_akademik'=> 'required',
	    'prestasi_non_akademik'=> 'required',
	    'bahasa_asing' => 'required',
      'bersedia_pindah_jurusan' => 'required',
      'closing_statement' => 'required',
    ], [
        "required" => ":attribute harus diisi"
    ]);

    if(!$request->class_member_email) {
      return back()->withInput()->with('flash-message', [
        'title' => 'Peringatan!',
        'type' => 'warning',
        'message' => 'Silakan coba lagi'
      ]);
    }

    if($validator->fails()) {
        return back()->withInput()->with('flash-message', [
          'title' => 'Peringatan!',
          'type' => 'warning',
          'message' => $validator->errors()->first()
        ]);
    }

    // Cari btwedutech_id siswa berdasarkan email
    $btwEdutechStudentsResponse = $this->profileService->getInterviewByStudentEmails(["email" => [$request->class_member_email], "year" => Carbon::now()->year]);
    $btwEdutechStudents = json_decode($btwEdutechStudentsResponse->body())->data ?? [];
    if(!count($btwEdutechStudents)) {
      Log::error("Could not create interview score. Student with email $request->class_member_email was not found on elastic 'student_profiles' index");
      return redirect()->back()->withInput()->with('flash-message', [
        'title' => 'Terjadi kesalahan',
        'type' => 'error',
        'message' => 'Sistem dalam perbaikan, harap mencoba beberapa saat lagi'
      ]);
    }

    // Mengecek apakah siswa memiliki akun BTW Edutech atau tidak
    $btwEdutechStudent = $btwEdutechStudents[0];
    if($btwEdutechStudent->btwedutech_id === 0) {
      return redirect()->back()->withInput()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Siswa yang dipilih belum memiliki akun BTW Edutech. Pastikan siswa memiliki akun BTW Edutech'
      ]);
    }

    // Cek apakah siswa sudah memilih target PTK
    $studentTargetResponse = $this->profileService->getStudentTargetFromElastic($btwEdutechStudent->btwedutech_id, "PTK");
    $studentTarget = json_decode($studentTargetResponse->getBody())->data ?? null;
    if(!$studentTarget) {
      return redirect()->back()->withInput()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Siswa belum memilih tujuan sekolah dan program studi'
      ]);
    }
    if($studentTarget->school_id === 0 && $studentTarget->major_id === 0) {
      return redirect()->back()->withInput()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Siswa belum memilih tujuan sekolah dan program studi'
      ]);
    }

    // Mengecek data authenticated user berhasil didapatkan atau tidak
    $user = Auth::user();
    if(!$user) {
      return redirect()->back()->withInput()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Silakan coba beberapa saat lagi'
      ]);
    }

    // END OF TODO: Validation

    // TODO: Construct the payload
    $total_A = array_sum([
      $request->penampilan,
      $request->cara_duduk_dan_berjabat,
      $request->praktek_baris_berbaris,
      $request->penampilan_sopan_santun,
      $request->kepercayaan_diri_dan_stabilitas_emosi,
      $request->komunikasi,
      $request->pengembangan_diri,
      $request->integritas,
      $request->kerjasama,
      $request->mengelola_perubahan,
      $request->perekat_bangsa,
      $request->pelayanan_publik,
      $request->pengambilan_keputusan,
      $request->orientasi_hasil]);

    $hasil_perhitungan_A = $total_A * 0.15;

    $total_B= array_sum([
      $request->prestasi_akademik,
      $request->prestasi_non_akademik,
      $request->bahasa_asing]);

    $hasilPerhitungan_B = $total_B * 0.10;

    $total = $hasil_perhitungan_A + $hasilPerhitungan_B ;
    $finalScore = number_format(($total / 0.096), 2);

    $payload = [
      "smartbtw_id" => $btwEdutechStudent->btwedutech_id,
      "created_by" => [
        "id" => $user->id,
        "name" => $user->name
      ],
      "final_score" => (float)$finalScore,
      'penampilan'=> (int)$request->penampilan,
	    'cara_duduk_dan_berjabat'=> (int)$request->cara_duduk_dan_berjabat,
	    'praktek_baris_berbaris'=> (int)$request->praktek_baris_berbaris,
	    'penampilan_sopan_santun'=> (int)$request->penampilan_sopan_santun,
	    'kepercayaan_diri_dan_stabilitas_emosi'=> (int)$request->kepercayaan_diri_dan_stabilitas_emosi,
	    'komunikasi'=> (int)$request->komunikasi,
	    'pengembangan_diri'=> (int)$request->pengembangan_diri,
	    'integritas'=> (int)$request->integritas,
	    'kerjasama'=> (int)$request->kerjasama,
	    'mengelola_perubahan'=> (int)$request->mengelola_perubahan,
	    'perekat_bangsa'=> (int)$request->perekat_bangsa,
	    'pelayanan_publik'=> (int)$request->pelayanan_publik,
	    'pengambilan_keputusan'=> (int)$request->pengambilan_keputusan,
	    'orientasi_hasil'=> (int)$request->orientasi_hasil,
	    'prestasi_akademik'=> (int)$request->prestasi_akademik,
	    'prestasi_non_akademik'=> (int)$request->prestasi_non_akademik,
	    'bahasa_asing' => (int)$request->bahasa_asing,
      "session_id" => $request->session_id,
      "note" => $request->note,
      "year" => Carbon::now()->year,
      "bersedia_pindah_jurusan" => $request->bersedia_pindah_jurusan == "true" ? true : false,
      "closing_statement" => $request->closing_statement == "true" ? true : false

    ];

    // END OF TODO: Construct the payload

    $upsertInterviewResponse = $this->profileService->upsertInterviewTryout($payload);
    $upsertInterview = json_decode($upsertInterviewResponse->body());

    $session_id = $request->session_id;
    $previousUrl = ("/hasil-wawancara/$session_id/user/$user->id");

    if(!$upsertInterview->success) {
      $message = "Terjadi Kesalahan, silakan coba lagi nanti";
      $errorType = $upsertInterviewResponse->clientError() ? "warning" : "error";
      $errorTitle = $upsertInterviewResponse->clientError() ? "Peringatan" : "error";
      if($upsertInterview->message === "data nilai wawancara siswa sudah ada di sesi ini") $message = $upsertInterview->message;
      return redirect()->back()->withInput()->with('flash-message', [
        'title' => $errorTitle,
        'type' => $errorType,
        'message' => ucfirst($message)
      ]);
    }

    return redirect($previousUrl)->with('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => "Data Tryout Wawancara berhasil disimpan"
    ]);
  }

  public function editInterview(Request $request, $id)
  {
    $pageTitle = "Edit Hasil Wawancara";
    $interviewScore = $this->profileService->getInterviewScoreByID($id);
    // dd($interviewScore);
    // Cek apakah siswa sudah memilih target PTK
    $studentTargetResponse = $this->profileService->getStudentTargetFromElastic($interviewScore->smartbtw_id, "PTK");
    $studentTarget = json_decode($studentTargetResponse->getBody())->data ?? null;
    if(!$studentTarget) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Siswa belum memilih tujuan sekolah dan program studi'
      ]);
    }
    if($studentTarget->school_id === 0 && $studentTarget->major_id === 0) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Siswa belum memilih tujuan sekolah dan program studi'
      ]);
    }
    // dd($sessionInterview);
    $breadcrumbs = [["name" => "Hasil Wawancara", "link" => url()->previous()],["name" => "Edit", "link" => null]];
    return view('pages.interview-tryout-form.edit-form', compact('breadcrumbs', 'pageTitle','interviewScore','studentTarget'));
  }

  public function updateInterview(Request $request, $id)
  {
    $interviewScore = $this->profileService->getInterviewScoreByID($id);
    if(!$interviewScore) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Silakan coba beberapa saat lagi'
      ]);
    }

    $validator = Validator::make($request->all(), [
      'penampilan'=> 'required',
	    'cara_duduk_dan_berjabat'=> 'required',
	    'praktek_baris_berbaris'=> 'required',
	    'penampilan_sopan_santun'=> 'required',
	    'kepercayaan_diri_dan_stabilitas_emosi'=> 'required',
	    'komunikasi'=> 'required',
	    'pengembangan_diri'=> 'required',
	    'integritas'=> 'required',
	    'kerjasama'=> 'required',
	    'mengelola_perubahan'=> 'required',
	    'perekat_bangsa'=> 'required',
	    'pelayanan_publik'=> 'required',
	    'pengambilan_keputusan'=> 'required',
	    'orientasi_hasil'=> 'required',
	    'prestasi_akademik'=> 'required',
	    'prestasi_non_akademik'=> 'required',
	    'bahasa_asing' => 'required',
      'bersedia_pindah_jurusan' => 'required',
      'closing_statement' => 'required',
    ],[
        "required" => ":attribute harus diisi"
    ]);

    if($validator->fails()) {
        return back()->with('flash-message', [
          'title' => 'Peringatan!',
          'type' => 'warning',
          'message' => $validator->errors()->first()
        ]);
    }

    // Mengecek data authenticated user berhasil didapatkan atau tidak
    $user = Auth::user();
    if(!$user) {
      return redirect()->back()->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Silakan coba beberapa saat lagi'
      ]);
    }

    // END OF TODO: Validation

    // TODO: Construct the payload
    $total_A = array_sum([
      $request->penampilan,
      $request->cara_duduk_dan_berjabat,
      $request->praktek_baris_berbaris,
      $request->penampilan_sopan_santun,
      $request->kepercayaan_diri_dan_stabilitas_emosi,
      $request->komunikasi,
      $request->pengembangan_diri,
      $request->integritas,
      $request->kerjasama,
      $request->mengelola_perubahan,
      $request->perekat_bangsa,
      $request->pelayanan_publik,
      $request->pengambilan_keputusan,
      $request->orientasi_hasil]);

    $hasil_perhitungan_A = $total_A * 0.15;

    $total_B= array_sum([
      $request->prestasi_akademik,
      $request->prestasi_non_akademik,
      $request->bahasa_asing]);

    $hasilPerhitungan_B = $total_B * 0.10;

    $total = $hasil_perhitungan_A + $hasilPerhitungan_B ;
    $finalScore = number_format(($total / 0.096), 2);

    $payload = [
      "smartbtw_id" => $interviewScore->smartbtw_id,
      "created_by" => [
        "id" => $user->id,
        "name" => $user->name
      ],
      "final_score" => (float)$finalScore,
      'penampilan'=> (int)$request->penampilan,
	    'cara_duduk_dan_berjabat'=> (int)$request->cara_duduk_dan_berjabat,
	    'praktek_baris_berbaris'=> (int)$request->praktek_baris_berbaris,
	    'penampilan_sopan_santun'=> (int)$request->penampilan_sopan_santun,
	    'kepercayaan_diri_dan_stabilitas_emosi'=> (int)$request->kepercayaan_diri_dan_stabilitas_emosi,
	    'komunikasi'=> (int)$request->komunikasi,
	    'pengembangan_diri'=> (int)$request->pengembangan_diri,
	    'integritas'=> (int)$request->integritas,
	    'kerjasama'=> (int)$request->kerjasama,
	    'mengelola_perubahan'=> (int)$request->mengelola_perubahan,
	    'perekat_bangsa'=> (int)$request->perekat_bangsa,
	    'pelayanan_publik'=> (int)$request->pelayanan_publik,
	    'pengambilan_keputusan'=> (int)$request->pengambilan_keputusan,
	    'orientasi_hasil'=> (int)$request->orientasi_hasil,
	    'prestasi_akademik'=> (int)$request->prestasi_akademik,
	    'prestasi_non_akademik'=> (int)$request->prestasi_non_akademik,
	    'bahasa_asing' => (int)$request->bahasa_asing,
      "session_id" => $interviewScore->session_id,
      "note" => $request->note,
      "year" => Carbon::now()->year,
      "bersedia_pindah_jurusan" => $request->bersedia_pindah_jurusan == "true" ? true : false,
      "closing_statement" => $request->closing_statement == "true" ? true : false
    ];

    // END OF TODO: Construct the payload

    $upsertInterviewResponse = $this->profileService->updateInterviewScore($payload, $id);
    $upsertInterview = json_decode($upsertInterviewResponse->body());

    $session_id = $interviewScore->session_id;
    $previousUrl = ("/hasil-wawancara/$session_id/user/$user->id");

    if(!$upsertInterview->success) {
      $message = "Terjadi Kesalahan, silakan coba lagi nanti";
      $errorType = $upsertInterviewResponse->clientError() ? "warning" : "error";
      $errorTitle = $upsertInterviewResponse->clientError() ? "Peringatan" : "error";
      if($upsertInterview->message === "data nilai wawancara siswa sudah ada di sesi ini") $message = $upsertInterview->message;
      return redirect()->back()->with('flash-message', [
        'title' => $errorTitle,
        'type' => $errorType,
        'message' => ucfirst($message)
      ]);
    }

    return redirect($previousUrl)->with('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => "Data Tryout Wawancara berhasil disimpan"
    ]);
  }
}

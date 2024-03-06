<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\ProfileService\Profile;
use App\Services\ApiGatewayService\Internal;
use App\Services\LocationService\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Helpers\RabbitMq;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Services\CompetitionMapService\School;
use App\Services\HighSchoolService\HighSchool;

class StudentController extends Controller
{
  private Profile $profileService;
  private Internal $apiGatewayService;
  private Location $locationService;
  private School $schoolService;
  private HighSchool $highSchoolService;

  public function __construct(
    Profile $profileService,
    Internal $apiGatewayService,
    Location $locationService,
    School $schoolService,
    HighSchool $highSchoolService
  ) {
    $this->middleware('acl');
    $this->profileService = $profileService;
    $this->apiGatewayService = $apiGatewayService;
    $this->locationService = $locationService;
    $this->schoolService = $schoolService;
    $this->highSchoolService = $highSchoolService;
    Breadcrumb::setFirstBreadcrumb('Siswa', 'siswa');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $is_user_pusat = UserRole::isAdmin();
    $allowed = UserRole::getAllowed('roles.medical_checkup');
    $studentPageAllowed = UserRole::getAllowed('roles.student');
    return view('/pages/student/index', compact('breadcrumbs', 'is_user_pusat', 'allowed', 'studentPageAllowed'));
  }

  public function detail(Request $request, $studentId)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail Siswa']];

    $student_profile = $this->profileService->getSingleStudent((int)$studentId);
    $student_score_bkn = $this->profileService->getAllScoreBKN((int)$studentId);

    $provinceResponse = $this->locationService->get(['type' => 'PROVINCE']);
    $province = json_decode($provinceResponse)->data ?? [];
    $student_province = collect($province)->where('_id', $student_profile->province_id)->first();
    $regionResponse = $this->locationService->get(["type" => "REGION"]);
    $region =  json_decode($regionResponse)->data ?? [];
    $student_region = collect($region)->where('_id', $student_profile->region_id)->first();
    $regions = $student_profile->region_id ? collect($this->apiGatewayService->getRegion($student_profile->province_id))->pluck('kabupaten_kota', 'id')->all() : null;

    $is_admin_pusat = UserRole::isAdmin();

    return view('/pages/student/detail/index', compact('breadcrumbs', 'is_admin_pusat', 'student_profile', 'student_province', 'student_region', 'studentId', 'student_score_bkn'));
  }

  public function downloadReport(Request $request, $studentId)
  {
    $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/student-result/download-report';
    $params = ['program' => $request->get('program') ?? 'skd', 'student_id' => $studentId];
    if ($request->has('exam_type') && $request->get('exam_type') !== null) $params['exam_type'] = $request->get('exam_type');
    $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url, $params);
    if (!$response->successful()) $response->throw();
    else {
      header('Content-Type:application/pdf');
      header('Content-Disposition:inline');
      file_put_contents('file.pdf', $response);
      readfile('file.pdf');
      unlink('file.pdf');
      exit();
    }
  }

  public function showAddStudent(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Siswa']];
    $auth_user_branch_code = auth()->user()->branch_code;
    $is_user_pusat = $auth_user_branch_code == null || $auth_user_branch_code == "PT0000";

    if ($is_user_pusat) {
      // Get branch lists
      $get_branch_response = Http::get(env('SERVICE_BRANCH_ADDRESS') . '/branch');
      $branches = json_decode($get_branch_response)->data;

      $view_data = ['breadcrumbs' => $breadcrumbs, 'branches' => $branches, 'is_user_pusat' => $is_user_pusat];
    } else {
      $view_data = ['breadcrumbs' => $breadcrumbs, 'is_user_pusat' => $is_user_pusat];
    }

    return view('/pages/student/add-student', $view_data);
  }

  public function showAddStudentScore($smartbtw_id)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Skor BKN Siswa']];
    $view_data = ['breadcrumbs' => $breadcrumbs, 'smartbtw_id' => $smartbtw_id];

    return view('/pages/student/add-student-score', $view_data);
  }

  public function showMedicalCheckupHistory(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Riwayat Pemeriksaan Kesehatan']];
    return view('/pages/student/medical-checkup-history', compact('breadcrumbs'));
  }

  public function showEditStudent(Request $request, $studentId)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Siswa']];
    $auth_user_branch_code = auth()->user()->branch_code;
    $is_user_pusat = ($auth_user_branch_code == null || $auth_user_branch_code == "PT0000") && UserRole::isAdmin();

    $student_profile = $this->profileService->getSingleStudent((int)$studentId);
    $student_profile_elastic = $this->profileService->getSingleStudentFromElastic((int) $studentId);

    // get school location
    $provincesResponse = $this->locationService->get(["type" => "PROVINCE"]);
    $provinces = json_decode($provincesResponse->body())?->data ?? [];

    $regionsResponse  = $this->locationService->get(["type" => "REGION"]);
    $regions = json_decode($regionsResponse->body())?->data ?? [];

    $school_province = null;
    $school_district = null;

    if (isset($student_profile_elastic->last_ed_region_id)) {
      $school_district = collect($regions)->where('_id', $student_profile_elastic->last_ed_region_id)->first();
      $school_province = isset($school_district->parent_id)
        ? collect($provinces)->where('_id', $school_district->parent_id)->first()
        : null;
    }

    // search Major & get school major
    $student_initial_majors = [];
    $student_initial_major = null;
    if (isset($student_profile_elastic->last_ed_type)) {
      $student_initial_majors_response = $this->schoolService->getSchoolOriginEducations($student_profile_elastic->last_ed_type);
      $student_initial_majors = collect(
        json_decode($student_initial_majors_response->body())?->data ?? []
      )
        ->map(function ($item) {
          $item->label = $item->name;
          $item->value = $item->id;
          return $item;
        })
        ->values()
        ->toArray();
      if (isset($student_profile_elastic->last_ed_major_id)) {
        $student_initial_major = collect($student_initial_majors)
          ->where('id', $student_profile_elastic->last_ed_major_id)
          ->first();
      }
    }

    // serach school
    $student_initial_schools = null;

    if (isset($student_profile_elastic->last_ed_id)) {
      $student_initial_schools_response = $this->highSchoolService->getById($student_profile_elastic->last_ed_id);
      $student_initial_schools = json_decode($student_initial_schools_response->body())?->data ?? [];
    }
    $student_profile_api_gateway_response = $this->apiGatewayService->getStudentProfile($studentId);
    $student_profile_api_gateway = json_decode($student_profile_api_gateway_response->body())?->data ?? null;

    if ($is_user_pusat) {
      // Get branch lists
      $get_branch_response = Http::get(env('SERVICE_BRANCH_ADDRESS') . '/branch');
      $branches = json_decode($get_branch_response)->data;
      $view_data = [
        'breadcrumbs' => $breadcrumbs,
        'school_district' => $school_district,
        'school_province' => $school_province,
        'student_initial_major' => $student_initial_major,
        'student_profile' => $student_profile,
        'branches' => $branches,
        'is_user_pusat' => $is_user_pusat,
        'student_profile_api_gateway' => $student_profile_api_gateway,
        'student_initial_schools' => $student_initial_schools
      ];
    } else {
      $view_data = [
        'breadcrumbs' => $breadcrumbs,
        'school_district' => $school_district,
        'school_province' => $school_province,
        'student_initial_major' => $student_initial_major,
        'student_profile' => $student_profile,
        'is_user_pusat' => $is_user_pusat,
        'student_profile_api_gateway' => $student_profile_api_gateway,
        'student_initial_schools' => $student_initial_schools
      ];
    }

    return view('/pages/student/edit-student', $view_data);
  }

  public function showEditScore(
    $studentId,
    $scoreId,
  ) {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Score BKN']];

    $score_bkn = $this->profileService->getSingleScoreBKN($scoreId);

    $view_data = ['breadcrumbs' => $breadcrumbs, 'score_bkn' => $score_bkn, 'smartbtw_id' => $studentId];

    return view('/pages/student/edit-student-score', $view_data);
  }

  public function store(Request $request)
  {
    try {
      $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/students/';
      $jurusanResponse =  json_decode($request->school_major);
      $jurusanName = $jurusanResponse->name;
      $jurusanId = $jurusanResponse->id;
      $schoolResult = json_decode($request->asal_sekolah);
      $schoolName = $schoolResult->name;
      $schoolId = $schoolResult->_id;

      $params = [
        'nama_lengkap' => $request->nama_lengkap,
        'email' => $request->email,
        'no_wa' => $request->no_wa,
        'jk' => $request->jk,
        'ttl' => $request->ttl,
        'nama_ortu' => $request->nama_ortu,
        'hp_ortu' => $request->hp_ortu,
        'alamat' => $request->alamat,
        'id_provinsi' => (int)$request->id_provinsi,
        'kab_kota_id' => (int)$request->kab_kota_id,
        'asal_sekolah' => $schoolName,
        'jurusan' => $jurusanName,
        'pendidikan_terakhir' => $request->pendidikan_terakhir,
        'last_education_id' => $jurusanId,
        'tujuan_tryout' => $request->tujuan_tryout,
        'kode_cabang' => $request->kode_cabang,
        'school_origin_id' => $schoolId,
        'account_type' => "btwedutech",
        'status' => 1,
        'is_guest' => 0,
        'birth_mother_name' => $request->nama_ibu_kandung,
        'nik' => $request->nik,
        'birth_place' => $request->birth_place
      ];
      $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->post($url, $params);

      if ($response->successful()) {
        // $data = json_decode($response?->body())->data;
        // $this->profileService->createParentData(["smartbtw_id" => $data->id, "parent_name" => $request->nama_ortu, "parent_number" => $request->hp_ortu]);

        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data siswa berhasil ditambah'
        ]);
        return redirect('/siswa');
      }

      if ($response->clientError()) {
        $request->session()->flash('errors', json_decode($response)->data->errors);
        return redirect()->back();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => $e->getMessage()
      ]);
      return redirect('/siswa');
    }
  }

  public function addScore(Request $request)
  {
    try {
      $validator = Validator::make($request->all(), [
        'year' => ['required', 'integer', 'min:1990', 'max:' . Carbon::now()->year],
        'score_twk' => ['required', 'integer', 'min:1'],
        'score_tiu' => ['required', 'integer', 'min:1'],
        'score_tkp' => ['required', 'integer', 'min:1'],
        'score_skd' => ['required', 'integer', 'min:1'],
        'score_skd' => ['required', 'integer', 'min:1'],
      ], [
        'year.required' => 'Tahun Ajaran tidak boleh kosong',
        'year.max' => 'Tahun Ajaran tidak boleh melebihi tahun sekarang',
        'score_twk.required' => 'Skor TWK tidak boleh kosong',
        'score_twk.min' => 'Skor TWK tidak boleh 0',
        'score_tiu.required' => 'Skor TIU tidak boleh kosong',
        'score_tiu.min' => 'Skor TIU tidak boleh 0',
        'score_tkp.required' => 'Skor TKP tidak boleh kosong',
        'score_tkp.min' => 'Skor TKP tidak boleh 0',
        'score_skd.required' => 'Skor SKD tidak boleh kosong',
        'score_skd.min' => 'Skor SKD tidak boleh 0',
      ]);

      if ($validator->fails()) {
        return back()->withErrors($validator)->withInput();
      }

      $request_params = [
        'smartbtw_id' => (int)$request->smartbtw_id,
        'year' => (int)$request->year,
        'score_twk' => (int)$request->score_twk,
        'score_tiu' => (int)$request->score_tiu,
        'score_tkp' => (int)$request->score_tkp,
        'score_skd' => (int)$request->score_skd,
      ];
      $response = $this->profileService->addScore($request_params);

      if ($response->success === true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data skor siswa berhasil dibuat'
        ]);
        return redirect('/siswa/detail/' . $request->smartbtw_id);
      }

      if ($response->error) {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => $response->error
        ]);

        return redirect()->back()->withErrors($response->error)->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => $e->getMessage()
      ]);
      return redirect('/siswa');
    }
  }

  public function update(Request $request, $studentId)
  {
    try {
      $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/students/' . $studentId;
      $jurusanResponse =  json_decode($request->school_major);
      $jurusanName = $jurusanResponse->name;
      $jurusanId = $jurusanResponse->id;
      $schoolResult = json_decode($request->asal_sekolah);
      $schoolName = $schoolResult->name;
      $schoolId = $schoolResult->_id;
      $request_params = [
        'nama_lengkap' => $request->nama_lengkap,
        'email' => $request->email,
        'no_wa' => $request->no_wa,
        'jk' => $request->jk,
        'ttl' => $request->ttl,
        'nama_ortu' => $request->nama_ortu,
        'hp_ortu' => $request->hp_ortu,
        'alamat' => $request->alamat,
        'id_provinsi' => (int)$request->id_provinsi,
        'kab_kota_id' => (int)$request->kab_kota_id,
        'asal_sekolah' => $schoolName,
        'jurusan' => $jurusanName,
        'pendidikan_terakhir' => $request->pendidikan_terakhir,
        'last_education_id' => $jurusanId,
        'tujuan_tryout' => $request->tujuan_tryout,
        'kode_cabang' => $request->kode_cabang,
        'school_origin_id' => $schoolId,
        'account_type' => "btwedutech",
        'status' => 1,
        'is_guest' => 0,
        'birth_mother_name' => $request->nama_ibu_kandung,
        'nik' => $request->nik,
        'birth_place' => $request->birth_place
      ];

      $auth_user_branch_code = auth()->user()->branch_code;
      $is_user_pusat = ($auth_user_branch_code == null || $auth_user_branch_code == "PT0000") && UserRole::isAdmin();

      $profile = $this->profileService->getSingleStudent((int)$studentId);
      if (!$is_user_pusat) $request_params["email"] = $profile->email;

      $studentHasParentData = !empty($profile) && property_exists($profile, "parent_datas");
      $parentDataIsFilled = !empty($request->nama_ortu) && !empty($request->parent_number);
      if ($studentHasParentData) {
        $this->profileService->updateParentData(["smartbtw_id" => (int)$studentId, "parent_name" => $request->nama_ortu, "parent_number" => $request->hp_ortu]);
      }
      if (!$studentHasParentData && $parentDataIsFilled) {
        $this->profileService->createParentData(["smartbtw_id" => (int)$studentId, "parent_name" => $request->nama_ortu, "parent_number" => $request->hp_ortu]);
      }

      $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->put($url, $request_params);
      if ($response->successful()) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data siswa berhasil diupdate'
        ]);
        return redirect('/siswa');
      }

      if ($response->clientError()) {
        $request->session()->flash('errors', json_decode($response)->data->errors);
        return redirect()->back();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses update data siswa gagal'
      ]);
      return redirect('/siswa');
    }
  }

  public function updateScore(Request $request, $scoreId)
  {
    try {
      $validator = Validator::make($request->all(), [
        'score_twk' => ['required', 'integer', 'min:1'],
        'score_tiu' => ['required', 'integer', 'min:1'],
        'score_tkp' => ['required', 'integer', 'min:1'],
        'score_skd' => ['required', 'integer', 'min:1'],
      ], [
        'score_twk.required' => 'Skor TWK tidak boleh kosong',
        'score_twk.min' => 'Skor TWK tidak boleh 0',
        'score_tiu.required' => 'Skor TIU tidak boleh kosong',
        'score_tiu.min' => 'Skor TIU tidak boleh 0',
        'score_tkp.required' => 'Skor TTKP tidak boleh kosong',
        'score_tkp.min' => 'Skor TTKP tidak boleh 0',
        'score_skd.required' => 'Skor SKD tidak boleh kosong',
        'score_skd.min' => 'Skor SKD tidak boleh 0',
      ]);

      if ($validator->fails()) {
        return back()->withErrors($validator)->withInput();
      }

      $request_params = [
        'smartbtw_id' => (int)$request->smartbtw_id,
        'score_twk' => (int)$request->score_twk,
        'score_tiu' => (int)$request->score_tiu,
        'score_tkp' => (int)$request->score_tkp,
        'score_skd' => (int)$request->score_skd,
      ];

      $response = $this->profileService->updateScore($request_params, $scoreId);
      if ($response->success === true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data skor siswa berhasil diupdate'
        ]);
        return redirect('/siswa/detail/' . $request->smartbtw_id);
      }

      if ($response->error) {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => $response->error
        ]);

        return redirect()->back()->withErrors($response->error)->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses update data siswa gagal'
      ]);
      return redirect('/siswa');
    }
  }

  public function sendReport(Request $request, $studentId)
  {
    try {
      $validator = Validator::make($request->all(), [
        'whatsapp_no' => ['bail', 'required', 'regex:/\+?([ -]?\d+)+|\(\d+\)([ -]\d+)/'],
      ], [
        'required' => 'Nomor WA tidak boleh kosong',
        'regex' => 'Nomor WA tidak valid'
      ]);

      if ($validator->fails()) {
        $request->session()->flash('flash-message', [
          'title' => 'Peringatan!',
          'type' => 'warning',
          'message' => $validator->errors()->all()[0]
        ]);
        return redirect('/siswa/detail/' . $studentId);
      }

      $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/student-result/download-report';
      $params = ['program' => $request->get('program') ?? 'skd', 'student_id' => $studentId];
      if ($request->has('exam_type') && $request->get('exam_type') !== null) $params['exam_type'] = $request->get('exam_type');
      $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url, $params);
      if (!$response->successful()) $response->throw();
      else {

        $profile = $this->profileService->getSingleStudent((int)$studentId);
        if (!$profile) {
          $request->session()->flash('flash-message', [
            'title' => 'Terjadi kesalahan!',
            'type' => 'error',
            'message' => 'Data profil siswa tidak ditemukan'
          ]);
          return redirect('/siswa/detail/' . $studentId);
        }

        $jam = Carbon::now()->hour;

        if ($jam > 6 && $jam <= 11) {
          $salam = "pagi";
        } elseif ($jam >= 12 && $jam <= 14) {
          $salam = "siang";
        } elseif ($jam >= 15 && $jam <= 18) {
          $salam = "sore";
        } else {
          $salam = "malam";
        }

        $formattedUserName = preg_replace('/[^A-Za-z0-9\-]/', '', $profile->name);
        $removeEndSpaceName = preg_replace('/\s\Z/', '', $profile->name);

        $postfix = date('YmdHis');
        $fileName = "report_{$formattedUserName}_{$postfix}.pdf";
        $uploadPath = "/uploads/office/tryout-report/$fileName";
        $fileUrl = env('AWS_URL') . $uploadPath;
        Storage::disk('s3')->put($uploadPath, $response);

        $profileName = $profile->branch_code ? ucfirst($profile->name) . ' (' . $profile->branch_code . ')' : ucfirst($profile->name);

        Rabbitmq::send('message-gateway.whatsapp.report-parent', json_encode([
          'version' => 1,
          'data' => [
            "to" => $request->whatsapp_no,
            "name" => $profileName,
            "greeting" => $salam,
            "file_name" => $fileName,
            "file_url" => $fileUrl
          ]
        ]));
      }
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Raport berhasil dikirim'
      ]);
      return redirect('/siswa/detail/' . $studentId);
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan!',
        'type' => 'error',
        'message' => 'Proses kirim raport gagal, silakan coba lagi nanti'
      ]);
      return redirect('/siswa/detail/' . $studentId);
    }
  }

  public function deleteScore(Request $request, $scoreId)
  {
    try {
      $response = $this->profileService->deleteScoreBKN($scoreId);
      $responseStatus = $response->status();
      if ($responseStatus == 200) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data nilai berhasil dihapus'
        ]);
        return redirect()->back();
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Proses hapus data nilai gagal, silakan coba lagi nanti'
        ]);
        return redirect()->back();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan!',
        'type' => 'error',
        'message' => 'Proses hapus data nilai gagal, silakan coba lagi nanti'
      ]);
      return redirect()->back();
    }
  }

  public function bannedAccessCreate(Request $request, $smartbtw_id)
  {
    $isCentralAdminUser = UserRole::isAdmin();
    if (!$isCentralAdminUser) {
      $request->session()->flash('flash-message', [
        'title' => 'Peringatan!',
        'type' => 'warning',
        'message' => 'Anda tidak diperbolehkan untuk mengakses halaman ini'
      ]);
      return redirect()->back();
    }

    $studentProfileResponse = $this->apiGatewayService->getStudentProfile($smartbtw_id);
    $studentProfileBody = json_decode($studentProfileResponse->body());
    $studentProfileStatus = $studentProfileResponse->status();

    $studentName = $studentProfileBody->data->nama_lengkap;
    $studentAppType = $studentProfileBody->data->account_type;

    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => "Batas Akses $studentName ($studentAppType)", "link" => "/siswa/$smartbtw_id/banned-access"], ['name' => 'Tambah Batas Akses Siswa']];
    return view("pages.student.banned-access.create", compact('smartbtw_id', 'breadcrumbs', 'studentName', 'studentAppType'));
  }

  public function bannedAccessStore(Request $request, $smartbtw_id)
  {
    try {
      $studentProfileResponse = $this->apiGatewayService->getStudentProfile($smartbtw_id);
      $studentProfileBody = json_decode($studentProfileResponse->body());
      $bannedAccess = $this->profileService->getBannedAccess($smartbtw_id, $studentProfileBody->data->account_type);
      // Declarative
      $bannedAccessNames = collect($bannedAccess)->pluck('disallowed_access')->toArray();
      if (in_array($request->disallowed_access, $bannedAccessNames)) {
        $request->session()->flash('flash-message', [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Batas Akses Ini Sudah Di Tambahkan'
        ]);
        return redirect("/siswa/$smartbtw_id/banned-access");
      }

      $payload = [
        'smartbtw_id' => (int)$smartbtw_id,
        'disallowed_access' => $request->disallowed_access,
        'app_type' => $studentProfileBody->data->account_type
      ];

      $createBannedAccessResponse = $this->profileService->createBannedAccess($payload);
      if ($createBannedAccessResponse->successful()) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Akses siswa berhasil ditambah'
        ]);
        return redirect("/siswa/$smartbtw_id/banned-access");
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => $e->getMessage()
      ]);
      return redirect("/siswa/$smartbtw_id/banned-access");
    }
  }


  public function bannedAccessDelete(Request $request, $studentId)
  {
    try {
      // Membuat payload
      $payload = [
        'disallowed_access' => $request->disallowed_access,
        'app_type' => $request->app_type,
      ];

      // Memanggil method deleteBannedAccess dari profileService
      $response = $this->profileService->deleteBannedAccess($payload, $studentId);

      if ($response) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Batas Akses Siswa berhasil dihapus'
        ]);
        return redirect()->back();
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Proses "hapus Batas Akses Siswa" gagal, silakan coba lagi nanti'
        ]);
        return redirect()->back();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan!',
        'type' => 'error',
        'message' => 'Proses hapus akses dilarang gagal, silakan coba lagi nanti'
      ]);
      return redirect()->back();
    }
  }

  public function bannedAccessIndex(Request $request, string $studentId)
  {
    $isCentralAdminUser = UserRole::isAdmin();
    if (!$isCentralAdminUser) {
      $request->session()->flash('flash-message', [
        'title' => 'Peringatan!',
        'type' => 'warning',
        'message' => 'Anda tidak diperbolehkan untuk mengakses halaman ini'
      ]);
      return redirect()->back();
    }

    $studentResponse = $this->apiGatewayService->getStudentProfile((int)$studentId);
    $studentBody = json_decode($studentResponse->body());
    $studentName = $studentBody->data->nama_lengkap;
    $breadcrumbs = [["name" => "Batas Akses Siswa $studentName", "link" => null]];
    $bannedAccess = $this->profileService->getBannedAccess($studentId, $studentBody->data->account_type);
    return view("pages.student.banned-access.index", compact('bannedAccess', 'breadcrumbs', 'studentId', 'studentBody'));
  }
}

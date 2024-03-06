<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SSOController;
use App\Http\Controllers\COAController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\AlumniController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminBillController;
use App\Http\Controllers\AdminSSO\AdditionalControlsController;
use App\Http\Controllers\AdminSSO\ApplicationController;
use App\Http\Controllers\AdminSSO\ApplicationControlListController;
use App\Http\Controllers\AdminSSO\UserRoleController;
use App\Http\Controllers\AdminSSO\UserController;
use App\Http\Controllers\AffiliateDiscountSettingController;
use App\Http\Controllers\AffiliatePortionController;
use App\Http\Controllers\AssessmentProductController;
use App\Http\Controllers\PayAndBillController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\ClassMemberController;
use App\Http\Controllers\Exam\ModuleController;
use App\Http\Controllers\RevenueShareController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Exam\PackageController;
use App\Http\Controllers\CompetitionMapController;
use App\Http\Controllers\Learning\ClassController;
use App\Http\Controllers\ClassroomResultController;
use App\Http\Controllers\StudentProgressController;
use App\Http\Controllers\Learning\ReportController;
use App\Http\Controllers\Exam\TryoutCodeController;
use App\Http\Controllers\Exam\TryoutFreeController;
use App\Http\Controllers\Exam\InstructionController;
use App\Http\Controllers\Learning\PresenceController;
use App\Http\Controllers\Learning\ScheduleController;
use App\Http\Controllers\TransactionPackageController;
use App\Http\Controllers\Exam\TryoutPremiumController;
use App\Http\Controllers\ImportStudentClassController;
use App\Http\Controllers\ImportStudentProductController;
use App\Http\Controllers\AssignReceivedModuleController;
use App\Http\Controllers\BKNScoreController;
use App\Http\Controllers\FileManagerController;
use App\Http\Controllers\BranchBillController;
use App\Http\Controllers\Exam\QuestionCategoryController;
use App\Http\Controllers\Exam\SubQuestionCategoryController;
use App\Http\Controllers\CashPaymentProofController;
use App\Http\Controllers\CashReceiptController;
use App\Http\Controllers\CashTopUpCoinsController;
use App\Http\Controllers\CentralOperationalItemController;
use App\Http\Controllers\ClassQuestionController;
use App\Http\Controllers\ClassStagesController;
use App\Http\Controllers\Exam\TryoutCodeCategoryController;
use App\Http\Controllers\CompetitionMap\LastEducationController;
use App\Http\Controllers\CompetitionMap\LocationController;
use App\Http\Controllers\CompetitionMap\SchoolController;
use App\Http\Controllers\CompetitionMap\StudentCompetitionController;
use App\Http\Controllers\CompetitionMap\CompetitionController;
use App\Http\Controllers\CompetitionMap\SchoolQuotaController;
use App\Http\Controllers\CompetitionMap\SkdRankController;
use App\Http\Controllers\CompetitionMap\StudyProgramController;
use App\Http\Controllers\DynamicFormController;
use App\Http\Controllers\EbookCode\EbookCodeController;
use App\Http\Controllers\Exam\PostTestPackageController;
use App\Http\Controllers\Exam\PreTestPackageController;
use App\Http\Controllers\Exam\StudyMaterialController;
use App\Http\Controllers\Exam\TrialModuleController;
use App\Http\Controllers\ExamCPNS\QuestionCategoryController as CPNSQuestionCategoryController;
use App\Http\Controllers\ExamCPNS\SubQuestionCategoryController as CPNSSubQuestionCategoryController;
use App\Http\Controllers\ExamCPNS\InstructionController as CPNSInstructionController;
use App\Http\Controllers\ExamCPNS\PackageController as CPNSPackageController;
use App\Http\Controllers\ExamCPNS\PreTestPackageController as CPNSPreTestPackageController;
use App\Http\Controllers\ExamCPNS\PostTestPackageController as CPNSPostTestPackageController;
use App\Http\Controllers\ExamCPNS\StudyMaterialController as CPNSStudyMaterialController;
use App\Http\Controllers\ExamCPNS\ModuleController as CPNSModuleController;
use App\Http\Controllers\ExamCPNS\TryoutCodeController as CPNSTryoutCodeController;
use App\Http\Controllers\ExamCPNS\TrialModuleController as CPNSTrialModuleController;
use App\Http\Controllers\ExamCPNS\TryoutCodeCategoryController as CPNSTryoutCodeCategoryController;
use App\Http\Controllers\ExamCPNS\TryoutPremiumController as CPNSTryoutPremiumController;
use App\Http\Controllers\FinanceFundController;
use App\Http\Controllers\HighSchool\HighSchoolController;
use App\Http\Controllers\MajorMappingController;
use App\Http\Controllers\NewAffiliate\DiscountCodeController;
use App\Http\Controllers\InterestAndTalent\SchoolController as InterestAndTalentSchoolController;
use App\Http\Controllers\InterestAndTalent\AccessCodeController;
use App\Http\Controllers\CodeExamInterestAndTalentController;
use App\Http\Controllers\Exam\AssessmentPackageController;
use App\Http\Controllers\InterestAndTalent\ParticipantController;
use App\Http\Controllers\InterviewScoreController;
use App\Http\Controllers\InterviewSessionController;
use App\Http\Controllers\MultiStageQuestionController;
use App\Http\Controllers\NewAffiliate\AffiliateController;
use App\Http\Controllers\NewAffiliate\AffiliateDashboardController;
use App\Http\Controllers\NewAffiliate\GlobalDiscountSettingController;
use App\Http\Controllers\NewAffiliate\GlobalPortionSettingController;
use App\Http\Controllers\NewAffiliate\PortionSettingController;
use App\Http\Controllers\NewAffiliate\TaxPaymentController;
use App\Http\Controllers\NewAffiliate\TaxSettingController;
use App\Http\Controllers\NewAffiliate\WithdrawController;
use App\Http\Controllers\NewRankingStudent\NewRankingController;
use App\Http\Controllers\ProyeksiPantukhirScoreController;
use App\Http\Controllers\PusherController;
use App\Http\Controllers\RankingCPNSController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\Samapta\SamaptaController;
use App\Http\Controllers\SamaptaTryoutScoreController;
use App\Http\Controllers\StagesController;
use App\Http\Controllers\Utility\RabbitMqController;
use App\Http\Controllers\StageQuestionController;
use App\Http\Controllers\StagesUKAController;
use App\Http\Controllers\StudentProgress\ClassroomReportController;
use App\Http\Controllers\StudentProgress\StudentReportController;
use App\Http\Controllers\StudentResultSummaryController;
use App\Http\Controllers\TrainingQuestionController;
use App\Http\Controllers\TryoutCodeQuestionController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/health', function () {
  return 'OK';
});

Route::group(['middleware' => ['auth.sso']], function () {
  Auth::routes();

  Route::get('/', function () {
    return redirect('/login');
  })->name('/');

  Route::get('/reset-password', [SSOController::class, 'showResetPassword']);
  Route::post('/update-password', [SSOController::class, 'updatePassword']);
});

Route::group(['middleware' => ['auth.sso', 'acl', 'user.new']], function () {

  Route::get('/home', [HomeController::class, 'index'])->name('home');
  Route::get('/dashboard', [DashboardController::class, 'userRetention'])->name('dashboard');
  Route::get('/dashboard-uka', [HomeController::class, 'ukaIndex'])->name('dashboard-uka');

  // ** Peta Persaingan
  Route::get('/peta-persaingan', [CompetitionMapController::class, 'index'])->name('peta-persaingan');

  Route::group(['prefix' => '/peta-persaingan'], function () {
    Route::group(['prefix' => 'sekolah'], function () {
      Route::get('/', [SchoolController::class, 'index'])->name('peta-persaingan.sekolah.index');
      Route::get('/tambah', [SchoolController::class, 'create'])->name('peta-persaingan.sekolah.create');
      Route::get('/edit/{id}', [SchoolController::class, 'edit'])->name('peta-persaingan.sekolah.edit');
    });

    Route::group(['prefix' => 'lokasi'], function () {
      Route::get('/', [LocationController::class, 'index'])->name('peta-persaingan.lokasi.index');
      Route::get('/tambah', [LocationController::class, 'create'])->name('peta-persaingan.lokasi.create');
      Route::get('/edit/{id}', [LocationController::class, 'edit'])->name('peta-persaingan.lokasi.edit');
      Route::get('/detail/{id}', [LocationController::class, 'detail'])->name('peta-persaingan.lokasi.detail');
    });

    Route::group((['prefix' => 'pendidikan-terakhir']), function () {
      Route::get('/', [LastEducationController::class, 'index'])->name('peta-persaingan.pendidikan-terakhir.index');
      Route::get('/tambah', [LastEducationController::class, 'create'])->name('peta-persaingan.pendidikan-terakhir.create');
      Route::get('/edit/{id}', [LastEducationController::class, 'edit'])->name('peta-persaingan.pendidikan-terakhir.edit');
    });

    Route::group(['prefix' => 'program-studi'], function () {
      Route::get('/', [StudyProgramController::class, 'index'])->name('program-studi');
      Route::get('/tambah', [StudyProgramController::class, 'create'])->name('program-studi');
      Route::get('/edit/{id}', [StudyProgramController::class, 'edit'])->name('program-studi');
    });

    Route::group(['prefix' => 'kuota-sekolah'], function () {
      Route::get('/', [SchoolQuotaController::class, 'index'])->name('kuota-sekolah');
      Route::get('/tambah', [SchoolQuotaController::class, 'create'])->name('kuota-sekolah');
      Route::get('/edit/{id}', [SchoolQuotaController::class, 'edit'])->name('kuota-sekolah');
    });

    Route::group(['prefix' => 'kompetisi'], function () {
      Route::get('/', [CompetitionController::class, 'index'])->name('kompetisi');
      Route::get('/tambah', [CompetitionController::class, 'create'])->name('kompetisi');
      Route::get('/edit/{id}', [CompetitionController::class, 'edit'])->name('kompetisi');
    });

    Route::group(['prefix' => 'perangkingan-skd'], function () {
      Route::get('/', [SkdRankController::class, 'index'])->name('perangkingan-skd');
    });

    // Route::group(['prefix' => 'siswa'], function () {
    //   Route::get('/', [StudentCompetitionController::class, 'index'])->name('peta-persaingan.siswa.nilai');
    // });
    Route::get('/siswa/{smartbtw_id}/{task_id}', [StudentCompetitionController::class, 'siswa'])->name('peta-persaingan.tryout.nilai');
    Route::get('/siswa/{smartbtw_id}/{task_id}/download/{year}', [StudentCompetitionController::class, 'siswaDownload'])->name('peta-persaingan.tryout.nilai');
    Route::get('/tryout/{task_id}/{id}', [StudentCompetitionController::class, 'tryout'])->name('peta-persaingan.tryout.nilai');
    Route::get('/tryout/{task_id}/{id}/download/{year}', [StudentCompetitionController::class, 'tryoutDownload'])->name('peta-persaingan.tryout.nilai');
  });

  // ** Learning
  Route::group(['prefix' => 'pembelajaran'], function () {
    Route::get('/', [ClassController::class, 'index'])->name('pembelajaran');
    Route::get('/kelas/edit/{classId}', [ClassController::class, 'showEditClass'])->name('pembelajaran');
    Route::get('/kelas/share/{classId}', [ClassController::class, 'shareClassroomForm'])->name('pembelajaran');
    Route::get('/kelas/share/{classId}/users', [ClassController::class, 'sharedClassroomUsers'])->name('pembelajaran');
    Route::post('/kelas/share/{classId}', [ClassController::class, 'createSharedClassroom']);
    Route::post('/kelas/update/{classId}', [ClassController::class, 'update']);

    Route::post('/kelas/tambah-member', [ClassMemberController::class, 'store']);

    Route::get('/kelas/{classId}/members', [ClassMemberController::class, 'index'])->name('kelas.member.index');
    Route::get('/kelas/{classId}/members/scores', [ClassMemberController::class, 'scores'])->name('kelas.member.scores');
    // Route::get('/kelas/{classId}/members/scores-dd', [ClassMemberController::class, 'scoresDD'])->name('kelas.member.scores');
    Route::get('/kelas/{classId}/members/{memberId}/edit', [ClassMemberController::class, 'edit'])->name('kelas.member.edit');

    /* Update class member/meeting participant email */
    Route::get('/kelas/{classId}/members/{memberId}/edit-zoom-email', [ClassMemberController::class, 'editZoomEmail'])->name('pembelajaran');
    Route::put('/kelas/{classId}/members/{memberId}/zoom-email', [ClassMemberController::class, 'updateZoomEmail'])->name('kelas.member.update-zoom-email');

    Route::put('/kelas/{classId}/members/{memberId}', [ClassMemberController::class, 'update'])->name('kelas.member.update');
    Route::delete('/kelas/{classId}/members/{memberId}', [ClassMemberController::class, 'deleteMember'])->name('class.member.delete');

    Route::get('/kelas/{classId}/members/add-to-class', [ClassMemberController::class, 'addMembersToClassroomForm'])->name('pembelajaran');
    Route::post('/kelas/{classId}/members/add-to-class', [ClassMemberController::class, 'addMembersToClassroom'])->name('kelas.member.add-to-classroom');

    Route::get('/kelas/members/progress', [ClassMemberController::class, 'progress'])->name('performa.class-member.index');
    Route::get('/kelas/members/progress-tryout', [ClassMemberController::class, 'progressTryout'])->name('performa.class-member.index-tryout');
    Route::get('/kelas/members/progress/refresh', [ClassMemberController::class, 'refreshProgress'])->name('performa.class-member.refresh');
    Route::get('/kelas/members/progress/refresh-tryout', [ClassMemberController::class, 'refreshProgressTryout'])->name('performa.class-member.refresh-tryout');
    Route::get('/kelas/members/progress/cache', [ClassMemberController::class, 'cacheProgress'])->name('performa.class-member.cache');
    Route::get('/kelas/members/{studentId}/report', [ClassMemberController::class, 'downloadReport'])->name('performa.class-member.download-report');
    Route::get('/kelas/auth-user/kode', [ClassMemberController::class, 'getAuthenticatedUserBranchCode']);

    Route::get('/kelas/progress-report', [ClassroomResultController::class, 'downloadProgressReport']);
    Route::get('/kelas/{classId}/progress-report-tryout', [ClassroomResultController::class, 'downloadProgressReportTryout']);
    Route::get('/kelas/{classId}/members/assign-received-module', [AssignReceivedModuleController::class, 'assignPerClass']);

    Route::get('/jadwal/{classId}', [ScheduleController::class, 'showSchedule'])->name('pembelajaran');
    Route::get('/jadwal/tambah/{classId}', [ScheduleController::class, 'showAddSchedule'])->name('pembelajaran');
    Route::get('/jadwal/edit/{scheduleId}', [ScheduleController::class, 'showEditSchedule'])->name('pembelajaran');
    Route::post('/jadwal/update/{scheduleId}', [ScheduleController::class, 'updateSchedule'])->name('jadwal.update');

    Route::get('/jadwal/{scheduleId}/meeting-registrant', [ScheduleController::class, 'showMeetingRegistrant'])->name('pembelajaran');
    Route::get('/jadwal/{scheduleId}/meeting-registrant/class-member/create', [ScheduleController::class, 'showAddClassMemberMeetingRegistrant'])->name('pembelajaran');
    Route::get('/jadwal/{scheduleId}/meeting-registrant/non-class-member/create', [ScheduleController::class, 'showAddNonClassMemberMeetingRegistrant'])->name('pembelajaran');
    Route::post('/jadwal/{scheduleId}/meeting-registrant/class-member', [ScheduleController::class, 'createClassMemberMeetingRegistrant'])->name('schedule.meeting-participant.member.create');
    Route::post('/jadwal/{scheduleId}/meeting-registrant/non-class-member', [ScheduleController::class, 'createNonClassMemberMeetingRegistrant'])->name('schedule.meeting-participant.non-member.create');
    Route::post('/jadwal/{scheduleId}/meeting-registrant/approve', [ScheduleController::class, 'approveMeetingRegistrantRegistration'])->name('schedule.meeting-participant.approve');
    Route::post('/jadwal/{scheduleId}/meeting-registrant/cancel', [ScheduleController::class, 'cancelMeetingRegistrantRegistration'])->name('schedule.meeting-participant.cancel');
    Route::post('/jadwal/{scheduleId}/meeting-registrant/deny', [ScheduleController::class, 'denyMeetingRegistrantRegistration'])->name('schedule.meeting-participant.deny');

    Route::get('/laporan/{scheduleId}', [ReportController::class, 'showReport'])->name('pembelajaran');
    Route::get('/laporan/{scheduleId}/tambah', [ReportController::class, 'showAddReport'])->name('pembelajaran');
    Route::get('/laporan/{scheduleId}/edit/{reportId}', [ReportController::class, 'showEditReport'])->name('pembelajaran');
    Route::get('/presensi/{scheduleId}', [PresenceController::class, 'showPresence'])->name('pembelajaran');
    Route::get('/presensi/{scheduleId}/download', [PresenceController::class, 'downloadPresences'])->name('pembelajaran');;

    // Grafik Perkembangan Siswa
    Route::get('/grafik-performa-siswa/{studentId}/{examType?}', [StudentProgressController::class, 'chart']);
    Route::get('/grafik-performa-siswa/tryout-kode/{studentId}/{codeCategory}', [StudentProgressController::class, 'tryoutCodeChart']);
    Route::get('/grafik-performa-siswa/test-data/{classId}/{examType}/send/{sendTo}', [StudentProgressController::class, 'sendTestChartData']);

    Route::get('/grafik-performa-siswa/download/{studentId}/{examType?}', [StudentProgressController::class, 'downloadChart']);
  });

  Route::group(['prefix' => 'nilai-bkn'], function () {
    Route::get("/", [BKNScoreController::class, 'index'])->name('nilai-bkn');
    Route::post("/", [BKNScoreController::class, 'upsert'])->name('nilai-bkn.upsert');
  });

  Route::group(['prefix' => 'nilai-tryout-samapta'], function () {
    Route::get("/", [SamaptaTryoutScoreController::class, 'index'])->name('nilai-tryout-samapta');
    Route::post("/", [SamaptaTryoutScoreController::class, 'upsert'])->name('nilai-tryout-samapta.upsert');
  });

  Route::group(['prefix' => 'samapta'], function () {
    Route::get("/", [SamaptaController::class, "index"])->name("samapta");
    Route::get("/list-class/{id}", [SamaptaController::class, "listClass"])->name("samapta");
    Route::get("/daftar-siswa/{id}", [SamaptaController::class, "studentList"])->name("samapta");
    Route::get("/rapor-siswa/{id}", [SamaptaController::class, "studentReport"])->name("samapta");
    Route::get("/detail-sesi/{id}", [SamaptaController::class, "detailSession"])->name("samapta");
    Route::get(
      "/nilai-latihan-global/tambah",
      [SamaptaController::class, "createGlobalExerciseScoreForm"]
    )->name("samapta");
    Route::get("/nilai-latihan-sesi/tambah", [SamaptaController::class, "createSessionScoreForm"])->name("samapta");
    Route::get("/nilai-latihan-sesi/edit", [SamaptaController::class, "editSessionScoreForm"])->name("samapta");
  });

  Route::group(['prefix' => 'nilai-wawancara'], function () {
    Route::get('/', [InterviewScoreController::class, 'index'])->name('nilai-wawancara');
    Route::get('/{id/tambah', [InterviewScoreController::class, 'createInterview'])->name('nilai-wawancara.tambah');
    Route::get('/{id}/edit', [InterviewScoreController::class, 'editInterview'])->name('nilai-wawancara.edit');
    Route::post('/', [InterviewScoreController::class, 'upsertInterview'])->name('nilai-wawancara.upsert');
  });

  Route::group(['prefix' => 'proyeksi-nilai-pantukhir'], function () {
    Route::get("/", [ProyeksiPantukhirScoreController::class, 'index'])->name('proyeksi-nilai-pantukhir');
  });

  Route::group(['prefix' => 'sesi-wawancara'], function () {
    Route::get("/", [InterviewSessionController::class, 'index'])->name('sesi-wawancara');
    Route::get("/tambah", [InterviewSessionController::class, 'create'])->name('sesi-wawancara');
    Route::get("/edit/{id}", [InterviewSessionController::class, 'edit'])->name('sesi-wawancara');
    Route::post("/", [InterviewSessionController::class, 'store'])->name('store-sesi-wawancara');
    Route::put("/{id}", [InterviewSessionController::class, 'update'])->name('update-sesi-wawancara');
    Route::delete("/{id}", [InterviewSessionController::class, 'delete'])->name('delete-sesi-wawancara');
  });
  Route::group(['prefix' => 'hasil-wawancara'], function () {
    Route::get("/{session_id}/user/{sso_id}", [InterviewSessionController::class, 'indexResult'])->name('sesi-wawancara');
    Route::get("/tambah", [InterviewSessionController::class, 'createNewInterview'])->name('sesi-wawancara');
    Route::get("/edit/{id}", [InterviewSessionController::class, 'editInterview'])->name('sesi-wawancara');
    Route::put("/{id}", [InterviewSessionController::class, 'updateInterview'])->name('update-hasil-wawancara');
    Route::post("/", [InterviewSessionController::class, 'storeInterviewResult'])->name('store-hasil-wawancara');
  });

  // ** Material
  Route::group(['prefix' => 'material'], function () {
    Route::get('/', [MaterialController::class, 'index'])->name('material');
    Route::get('/add', [MaterialController::class, 'add'])->name('add.material');
    Route::get('/{materialId}', [MaterialController::class, 'detail'])->name('detail.material');
    Route::get('/{materialId}/edit', [MaterialController::class, 'edit'])->name('edit.material');
  });

  // ** Student
  Route::group(['prefix' => 'siswa'], function () {
    Route::get('/', [StudentController::class, 'index'])->name('siswa');
    Route::get('/tambah', [StudentController::class, 'showAddStudent'])->name('siswa');
    Route::get('/tambah-skor/{studentId}', [StudentController::class, 'showAddStudentScore'])->name('siswa.tambah-skor');
    Route::get('/riwayat-pemeriksaan-kesehatan/{studentId}', [StudentController::class, 'showMedicalCheckupHistory'])->name('siswa');
    Route::get('/detail/{studentId}', [StudentController::class, 'detail'])->name('siswa.detail')->middleware('student.onbranch');
    Route::get('/edit/{studentId}', [StudentController::class, 'showEditStudent'])->name('siswa.form.edit')->middleware(['student.onbranch', 'student.softdeleted']);
    Route::get('/report/{studentId}/download', [StudentController::class, 'downloadReport'])->name('siswa.report.download')->middleware('student.onbranch');
    Route::get('/report/{studentId}/send', [StudentController::class, 'sendReport'])->name('siswa.report.send')->middleware('student.onbranch');
    Route::post('/', [StudentController::class, 'store'])->name('siswa.store');
    Route::post('/addScore', [StudentController::class, 'addScore'])->name('siswa.add.score');
    Route::put('/{studentId}', [StudentController::class, 'update'])->name('siswa.update');
    Route::put('/score/{scoreId}', [StudentController::class, 'updateScore'])->name('siswa.score.update');
    Route::get('/{studentId}/edit/{scoreId}', [StudentController::class, 'showEditScore'])->name('siswa.score.form.edit');
    Route::delete('/score/delete/{scoreId}', [StudentController::class, 'deleteScore'])->name('siswa.score.delete');
    Route::get("/{smartbtw_id}/banned-access", [StudentController::class, 'bannedAccessIndex'])->name('siswa.indexBannedAccess');
    Route::get("/{smartbtw_id}/banned-access/create", [StudentController::class, 'bannedAccessCreate'])->name('siswa.createBannedAccess');
    Route::post("/{smartbtw_id}/banned-access", [StudentController::class, 'bannedAccessStore'])->name('siswa.storeBannedAccess');
    Route::delete("/{smartbtw_id}/banned-access", [StudentController::class, 'bannedAccessDelete'])->name('siswa.deleteBannedAccess');
  });

  // ** Alumni
  Route::group(['prefix' => "alumni"], function () {
    Route::get('/', [AlumniController::class, 'index'])->name('alumni');
    Route::get('/tambah', [AlumniController::class, 'create'])->name('alumni');
    Route::get('/{program}/{selection}/{id}/detail', [AlumniController::class, 'detail'])->name('alumni');
    Route::get('/{program}/{selection}/{id}/edit', [AlumniController::class, 'edit'])->name('alumni');
  });

  // ** Cabang
  Route::group(['prefix' => 'cabang'], function () {
    Route::get('/', [BranchController::class, 'index'])->name('cabang');
    Route::get('/tambah', [BranchController::class, 'showAddBranch'])->name('cabang');
    Route::get('/tambah-pengguna/{branchCode}', [BranchController::class, 'showAddBranchUser'])->name('cabang');
    Route::get('/detail/{brancCode}', [BranchController::class, 'detail'])->name('cabang');
    Route::get('/metode-pembayaran/{branchCode}', [BranchController::class, 'listPaymentMethod'])->name('cabang');
    Route::get('/metode-pembayaran/tambah/{branchCode}', [BranchController::class, 'createPaymentMethod'])->name('cabang');
    Route::get('/ubah/{branchId}', [BranchController::class, 'showEditBranch'])->name('cabang');
    Route::get('/ubah-pengguna/{branchCode}/{ssoId}', [BranchController::class, 'showEditBranchUser'])->name('cabang');
  });

  // ** Product
  Route::group(['prefix' => 'produk'], function () {
    Route::get('/', [ProductController::class, 'index'])->name('produk');
    Route::get('/detail/{productId}', [ProductController::class, 'showDetail'])->name('produk');
    Route::get('/tambah', [ProductController::class, 'showAddProduct']);
    Route::get('/edit/{productId}', [ProductController::class, 'showEditProduct'])->name('produk');
    Route::post('/tambah', [ProductController::class, 'create']);
    Route::put('/perbarui', [ProductController::class, 'update']);
  });

  // ** Product Pusat Assessment
  Route::group(['prefix' => 'produk-assessment'], function () {
    Route::get('/', [AssessmentProductController::class, 'index'])->name('produk-assessment');
    Route::get('/detail/{productId}', [AssessmentProductController::class, 'showDetail'])->name('produk-assessment');
    Route::get('/tambah', [AssessmentProductController::class, 'showAddProduct']);
    Route::get('/edit/{productId}', [AssessmentProductController::class, 'showEditProduct'])->name('produk-assessment');
    Route::post('/tambah', [AssessmentProductController::class, 'create']);
    Route::put('/perbarui', [AssessmentProductController::class, 'update']);
  });

  // ** Sale
  Route::group(['prefix' => 'penjualan'], function () {
    Route::get('/', [SaleController::class, 'index'])->name('penjualan');
  });

  Route::group(['prefix' => 'penjualan-siplah'], function () {
    Route::get('/', [SaleController::class, 'indexSiplah'])->name('penjualan-siplah');
  });

  Route::group(['prefix' => 'penjualan-assessment'], function () {
    Route::get('/', [SaleController::class, 'indexAssessment'])->name('penjualan-assessment');
  });

  // ** Bill
  Route::group(['prefix' => 'tagihan'], function () {
    Route::get('/', [BillController::class, 'index'])->name('tagihan');
    Route::get('/semua', [BillController::class, 'showAll'])->name('tagihan');
    Route::get('/edit/{billId}', [BillController::class, 'showEdit'])->name('bill.edit');
    Route::get('/{billId}/due-date/edit', [BillController::class, 'editBillDueDate'])->name('tagihan');
    Route::get('/history/update/{billId}', [BillController::class, 'updateHistory'])->name('tagihan');
    Route::get('/detail/{billId}', [BillController::class, 'showDetail'])->name('tagihan');
    Route::get('/detail/{billId}/create', [BillController::class, 'showCreateTransaction'])->name('tagihan');
    Route::get('/detail/{billId}/edit/{transactionId}', [BillController::class, 'showEditTransaction'])->name('tagihan');
    Route::get('/invoice/{billId}', [BillController::class, 'showInvoice'])->name('tagihan');
    Route::get('/invoice/{billId}/pdf', [BillController::class, 'showInvoicePdf']);
    Route::get('/letter/{billId}/pdf', [BillController::class, 'showBillLetterPdf']);
    Route::get('/invoice/{billId}/print', [BillController::class, 'printInvoice'])->name('tagihan');
    Route::get('/{billId}/retur-pembayaran', [BillController::class, 'returnPaymentForm'])->name('tagihan');
    Route::get('/kwitansi/{transactionId}/pdf', [BillController::class, 'showReceiptPdf']);
    Route::get('/kwitansi/{transactionId}/print', [BillController::class, 'printReceipt']);
    Route::put('/{billId}/due-date', [BillController::class, 'updateBillDueDate']);
    Route::get('/{billId}/rekonsiliasi', [BillController::class, 'reconcile']);
    Route::get('/{billId}/edit-status', [BillController::class, 'editBillStatusForm'])->name('tagihan');
    Route::put('/{billId}/status', [BillController::class, 'updateBillStatus']);
    Route::get('/{billId}/edit-note', [BillController::class, 'editBillNoteForm'])->name('tagihan');
    Route::put('/{billId}/note', [BillController::class, 'updateBillNote']);
  });

  Route::group(['prefix' => 'tagihan-cabang'], function () {
    Route::get("/", [BranchBillController::class, 'index'])->name('tagihan-cabang');
  });

  Route::group(['prefix' => 'admin'], function () {
    Route::group(['prefix' => 'tagihan'], function () {
      Route::get('/detail/{billId}/edit/{transactionId}', [AdminBillController::class, 'showEditTransaction'])->name('tagihan');
      Route::get('/{billId}/final-discount/edit', [AdminBillController::class, 'editFinalDiscount'])->name('tagihan');
    });
  });

  // ** Notification
  Route::group(['prefix' => 'notifikasi'], function () {
    Route::group(['prefix' => 'tryout-report'], function () {
      Route::get('/send-to-parent', [NotificationController::class, 'formSendTryoutReport'])->name('notifikasi.form-send-tryout-report');
      Route::post('/send-to-parent', [NotificationController::class, 'sendTryoutReport'])->name('notifikasi.send-tryout-report');
    });
  });

  // ** Expense
  Route::group(['prefix' => 'biaya'], function () {
    Route::get('/', [ExpenseController::class, 'index'])->name('biaya');
    Route::get('/slip/print/{id}', [ExpenseController::class, 'printSlip'])->name('biaya');
    Route::get('/detail/{expenseId}', [ExpenseController::class, 'showDetail'])->name('biaya');
    Route::get('/create', [ExpenseController::class, 'showCreateForm'])->name('biaya');
    Route::get('/edit/{id}', [ExpenseController::class, 'showEditForm'])->name('biaya');
  });

  // ** Mentor
  Route::group(['prefix' => 'mentor'], function () {
    Route::get('/', [MentorController::class, 'index'])->name('mentor');
    Route::get('/create', [MentorController::class, 'create'])->name('mentor');
    Route::post('/', [MentorController::class, 'store'])->name('mentor.store');
    Route::get('/edit/{id}', [MentorController::class, 'edit'])->name('mentor');
    Route::put('/{id}', [MentorController::class, 'update'])->name('mentor.update');
    Route::get('/legacy/create', [MentorController::class, 'createLegacy'])->name('mentor');
    Route::post('/legacy', [MentorController::class, 'storeLegacy'])->name('mentor.store-legacy');
  });

  // ** COA
  Route::group(['prefix' => 'coa'], function () {
    Route::get('/', [COAController::class, 'index'])->name('coa.index');
    Route::get('/create', [COAController::class, 'create'])->name('coa.create');
    Route::get('/edit/{id}', [COAController::class, 'edit'])->name('coa.edit');
  });

  // ** Payment Proof
  Route::group(['prefix' => 'bukti-pembayaran-cash'], function () {
    Route::get('/', [CashPaymentProofController::class, 'index'])->name('bukti-pembayaran-cash');
    Route::get('/tambah/{billId?}', [CashPaymentProofController::class, 'create'])->name('bukti-pembayaran-cash');
    Route::get('/{id}/download', [CashPaymentProofController::class, 'download']);
    Route::post('/', [CashPaymentProofController::class, 'store']);
    Route::post('/lihat', [CashPaymentProofController::class, 'show']);
  });

  Route::group(['prefix' => 'surat-terima-cash'], function () {
    Route::get('/', [CashReceiptController::class, 'index'])->name('surat-terima-cash');
    Route::get('/tambah/{billId?}', [CashReceiptController::class, 'create'])->name('surat-terima-cash');
    Route::get('/{id}/download', [CashReceiptController::class, 'download']);
    Route::post('/', [CashReceiptController::class, 'store']);
    Route::post('/lihat', [CashReceiptController::class, 'show']);
  });

  // ** Transaction
  Route::group(['prefix' => 'transaction'], function () {
    Route::get('/package/pending', [TransactionPackageController::class, 'indexPending'])->name('transaction.package.indexPending');
    Route::get('/package/settlement', [TransactionPackageController::class, 'indexSettlement'])->name('transaction.package.indexSettlement');
    Route::get('/package/pending/edit/{id}', [TransactionPackageController::class, 'edit'])->name('transaction.package.edit');
    Route::put('/package/{id}', [TransactionPackageController::class, 'update'])->name('transaction.package.update');
  });

  // ** Pay And Bill
  Route::group(['prefix' => 'bayar-dan-tagih'], function () {
    Route::get('/', [PayAndBillController::class, 'index'])->name('bayar-tagih');
    Route::get('/bayar/cabang/{branchCode}', [PayAndBillController::class, 'centralPayDebt'])->name('bayar-tagih');
    Route::get('/tagih/cabang/{branchCode}', [PayAndBillController::class, 'centralCollectReceivable'])->name('bayar-tagih');
    Route::get('/tagih/cabang/ubah/{collectReceivableId}', [PayAndBillController::class, 'centralUpadateCollectReceivable'])->name('bayar-tagih');

    Route::get('/cabang/bayar-sekarang/{accountId}', [PayAndBillController::class, 'showBranchPaysDebtNow'])->name('bayar-tagih');
    Route::get('/cabang/bayar/{historyId}', [PayAndBillController::class, 'showBranchPaysDebt'])->name('bayar-tagih');
    // Route::get('/piutang/pusat', [PayAndBillController::class, 'centralPayDebt'])->name('bayar-dan-tagih');
  });

  // ** Sales Bonus
  Route::group(['prefix' => 'porsi-pendapatan'], function () {
    Route::get('/', [RevenueShareController::class, 'index'])->name('porsi-pendapatan');
    Route::get('/create', [RevenueShareController::class, 'showCreate']);
    Route::get('/edit/{id}', [RevenueShareController::class, 'showEdit']);
  });

  // ** Exam
  Route::group(['prefix' => 'ujian'], function () {
    Route::group(['prefix' => 'bank-soal'], function () {
      Route::get('/', [ExamController::class, 'index'])->name('bank-soal');
      Route::get('/detail/{questionId}', [ExamController::class, 'detail'])->name('bank-soal');
      Route::get('/create', [ExamController::class, 'showCreateQuestion'])->name('bank-soal');
      Route::get('/connect/{questionId}', [ExamController::class, 'connectQuestion'])->name('bank-soal');
      Route::get('/smartbtw-preview', [ExamController::class, 'smartBTWPreview'])->name('bank-soal');
      Route::get('/edit/{questionId}', [ExamController::class, 'edit'])->name('bank-soal');
    });
    Route::group(['prefix' => 'modul'], function () {
      Route::get('/', [ModuleController::class, 'index'])->name('modul');
      Route::get('/create', [ModuleController::class, 'showCreateForm'])->name('modul');
      Route::get('/edit/{moduleId}', [ModuleController::class, 'edit'])->name('modul');
      Route::get('/pratinjau-soal/{moduleId}', [ModuleController::class, 'previewQuestion'])->name('modul');
    });
    Route::group(['prefix' => 'tryout-kode'], function () {
      Route::get('/', [TryoutCodeController::class, 'index'])->name('exam.tryout-code');
      Route::get('/create', [TryoutCodeController::class, 'showCreateForm']);
      Route::get('/edit/{packageId}', [TryoutCodeController::class, 'edit']);
    });
    Route::group(['prefix' => 'tryout-gratis'], function () {
      Route::get('/', [TryoutFreeController::class, 'index'])->name('exam.tryout-free');
      Route::get('/create', [TryoutFreeController::class, 'showCreateForm']);
      Route::get('/tambah-sesi/{packageId}', [TryoutFreeController::class, 'showAddSessionForm']);
      Route::get('/detail/{packageId}', [TryoutFreeController::class, 'detail']);
      Route::get('/edit/{packageId}', [TryoutFreeController::class, 'editPackage']);
      Route::get('/{packageId}/edit-sesi/{clusterId}', [TryoutFreeController::class, 'editCluster']);
    });
    Route::group(['prefix' => 'tryout-premium'], function () {
      Route::get('/', [TryoutPremiumController::class, 'index'])->name('exam.tryout-premium');
      Route::get('/create', [TryoutPremiumController::class, 'showCreateForm'])->name('exam.tryout-premium');
      Route::get('/edit/{packageId}', [TryoutPremiumController::class, 'edit'])->name('exam.tryout-premium');
    });
    Route::group(['prefix' => 'paket-soal'], function () {
      Route::get('/', [PackageController::class, 'index'])->name('paket-soal');
      Route::get('/create', [PackageController::class, 'showCreateForm'])->name('paket-soal');
      Route::get('/edit/{packageId}', [PackageController::class, 'edit'])->name('paket-soal');
    });
    Route::group(['prefix' => 'paket-assessment'], function () {
      Route::get('/', [AssessmentPackageController::class, 'index'])->name('paket-assessment');
      Route::get('/create', [AssessmentPackageController::class, 'showCreateForm'])->name('paket-assessment');
      Route::get('/edit/{packageId}', [AssessmentPackageController::class, 'edit'])->name('paket-assessment');
    });
    Route::group(['prefix' => 'paket-pre-test'], function () {
      Route::get('/', [PreTestPackageController::class, 'index'])->name('paket-pre-test');
      Route::get('/create', [PreTestPackageController::class, 'showCreateForm'])->name('paket-pre-test');
      Route::get('/edit/{packageId}', [PreTestPackageController::class, 'edit'])->name('paket-pre-test');
    });

    Route::group(['prefix' => 'paket-post-test'], function () {
      Route::get('/', [PostTestPackageController::class, 'index'])->name('paket-post-test');
      Route::get('/create', [PostTestPackageController::class, 'showCreateForm'])->name('paket-post-test');
      Route::get('/edit/{packageId}', [PostTestPackageController::class, 'edit'])->name('paket-post-test');
    });
    Route::group(['prefix' => 'materi-belajar'], function () {
      Route::get('/', [StudyMaterialController::class, 'index'])->name('materi-belajar');
      Route::get('/create', [StudyMaterialController::class, 'create'])->name('materi-belajar');
      Route::get('/edit/{studyMaterialId}', [StudyMaterialController::class, 'edit'])->name('materi-belajar');

      Route::get("/dokumen/{studyMaterialId}", [StudyMaterialController::class, 'indexDocument'])->name('materi-belajar');
      Route::get("/dokumen/{studyMaterialId}/create", [StudyMaterialController::class, 'createDocument'])->name('materi-belajar');
      Route::get("/dokumen/{studyMateralId}/edit/{documentId}", [StudyMaterialController::class, 'editDocument'])->name('materi-belajar');
    });
    Route::group(['prefix' => 'instruksi'], function () {
      Route::get('/', [InstructionController::class, 'index'])->name('instruksi');;
      Route::get('/create', [InstructionController::class, 'showCreateForm'])->name('instruksi');;
      Route::get('/edit/{instructionId}', [InstructionController::class, 'edit'])->name('instruksi');;
    });
    Route::group(['prefix' => 'kategori-soal'], function () {
      Route::get('/', [QuestionCategoryController::class, 'index'])->name('kategori-soal');
      Route::get('/create', [QuestionCategoryController::class, 'showCreateForm'])->name('kategori-soal');
      Route::get('/edit/{instructionId}', [QuestionCategoryController::class, 'edit'])->name('kategori-soal');
    });
    Route::group(['prefix' => 'kategori-tryout-kode'], function () {
      Route::get('/', [TryoutCodeCategoryController::class, 'index'])->name('kategori-tryout-kode');
      Route::get('/create', [TryoutCodeCategoryController::class, 'showCreateForm'])->name('kategori-tryout-kode');
      Route::get('/edit/{categoryTryoutCodeId}', [TryoutCodeCategoryController::class, 'edit'])->name('kategori-tryout-kode');
    });
    Route::group(['prefix' => 'sub-kategori-soal'], function () {
      Route::get('/', [SubQuestionCategoryController::class, 'index'])->name('sub-kategori-soal');
      Route::get('/create', [SubQuestionCategoryController::class, 'showCreateForm'])->name('sub-kategori-soal');
      Route::get('/edit/{instructionId}', [SubQuestionCategoryController::class, 'edit'])->name('sub-kategori-soal');
    });
    Route::group(['prefix' => 'coba-modul'], function () {
      Route::get('/', [TrialModuleController::class, 'index'])->name('coba-modul');
      Route::get('/create', [TrialModuleController::class, 'create'])->name('coba-modul');
      Route::get('/edit/{id}', [TrialModuleController::class, 'edit'])->name('coba-modul');
    });
  });

  //** EXAM-CPNS */
  Route::group(['prefix' => 'ujian-cpns'], function () {
    Route::group(['prefix' => 'kategori-soal'], function () {
      Route::get('/', [CPNSQuestionCategoryController::class, 'index'])->name('kategori-soal-cpns');
      Route::get('/create', [CPNSQuestionCategoryController::class, 'showCreateForm'])->name('kategori-soal-cpns');
      Route::get('/edit/{instructionId}', [CPNSQuestionCategoryController::class, 'edit'])->name('kategori-soal-cpns');
    });
    Route::group(['prefix' => 'kategori-tryout-kode'], function () {
      Route::get('/', [CPNSTryoutCodeCategoryController::class, 'index'])->name('kategori-tryout-kode-cpns');
      Route::get('/create', [CPNSTryoutCodeCategoryController::class, 'showCreateForm'])->name('kategori-tryout-kode-cpns');
      Route::get('/edit/{categoryTryoutCodeId}', [CPNSTryoutCodeCategoryController::class, 'edit'])->name('kategori-tryout-kode-cpns');
    });
    Route::group(['prefix' => 'sub-kategori-soal'], function () {
      Route::get('/', [CPNSSubQuestionCategoryController::class, 'index'])->name('sub-kategori-soal-cpns');
      Route::get('/create', [CPNSSubQuestionCategoryController::class, 'showCreateForm'])->name('sub-kategori-soal-cpns');
      Route::get('/edit/{instructionId}', [CPNSSubQuestionCategoryController::class, 'edit'])->name('sub-kategori-soal-cpns');
    });
    Route::group(['prefix' => 'instruksi'], function () {
      Route::get('/', [CPNSInstructionController::class, 'index'])->name('instruksi-cpns');;
      Route::get('/create', [CPNSInstructionController::class, 'showCreateForm'])->name('instruksi-cpns');;
      Route::get('/edit/{instructionId}', [CPNSInstructionController::class, 'edit'])->name('instruksi-cpns');;
    });
    Route::group(['prefix' => 'paket-soal'], function () {
      Route::get('/', [CPNSPackageController::class, 'index'])->name('paket-soal-cpns');
      Route::get('/create', [CPNSPackageController::class, 'showCreateForm'])->name('paket-soal-cpns');
      Route::get('/edit/{packageId}', [CPNSPackageController::class, 'edit'])->name('paket-soal-cpns');
    });
    Route::group(['prefix' => 'paket-pre-test'], function () {
      Route::get('/', [CPNSPreTestPackageController::class, 'index'])->name('paket-pre-test-cpns');
      Route::get('/create', [CPNSPreTestPackageController::class, 'showCreateForm'])->name('paket-pre-test-cpns');
      Route::get('/edit/{packageId}', [CPNSPreTestPackageController::class, 'edit'])->name('paket-pre-test-cpns');
    });
    Route::group(['prefix' => 'paket-post-test'], function () {
      Route::get('/', [CPNSPostTestPackageController::class, 'index'])->name('paket-post-test-cpns');
      Route::get('/create', [CPNSPostTestPackageController::class, 'showCreateForm'])->name('paket-post-test-cpns');
      Route::get('/edit/{packageId}', [CPNSPostTestPackageController::class, 'edit'])->name('paket-post-test-cpns');
    });
    Route::group(['prefix' => 'modul'], function () {
      Route::get('/', [CPNSModuleController::class, 'index'])->name('modul-cpns');
      Route::get('/create', [CPNSModuleController::class, 'showCreateForm'])->name('modul-cpns');
      Route::get('/edit/{moduleId}', [CPNSModuleController::class, 'edit'])->name('modul-cpns');
      Route::get('/pratinjau-soal/{moduleId}', [CPNSModuleController::class, 'previewQuestion'])->name('modul-cpns');
    });
    Route::group(['prefix' => 'materi-belajar'], function () {
      Route::get('/', [CPNSStudyMaterialController::class, 'index'])->name('materi-belajar-cpns');
      Route::get('/create', [CPNSStudyMaterialController::class, 'create'])->name('materi-belajar-cpns');
      Route::get('/edit/{studyMaterialId}', [CPNSStudyMaterialController::class, 'edit'])->name('materi-belajar-cpns');

      Route::get("/dokumen/{studyMaterialId}", [CPNSStudyMaterialController::class, 'indexDocument'])->name('materi-belajar-cpns');
      Route::get("/dokumen/{studyMaterialId}/create", [CPNSStudyMaterialController::class, 'createDocument'])->name('materi-belajar-cpns');
      Route::get("/dokumen/{studyMateralId}/edit/{documentId}", [CPNSStudyMaterialController::class, 'editDocument'])->name('materi-belajar-cpns');
    });
    Route::group(['prefix' => 'tryout-kode'], function () {
      Route::get('/', [CPNSTryoutCodeController::class, 'index'])->name('tryout-kode-cpns');
      Route::get('/create', [CPNSTryoutCodeController::class, 'showCreateForm'])->name('tryout-kode-cpns');
      Route::get('/edit/{packageId}', [CPNSTryoutCodeController::class, 'edit'])->name('tryout-kode-cpns');
    });
    Route::group(['prefix' => 'tryout-premium'], function () {
      Route::get('/', [CPNSTryoutPremiumController::class, 'index'])->name('tryout-premium-cpns');
      Route::get('/create', [CPNSTryoutPremiumController::class, 'showCreateForm'])->name('tryout-premium-cpns');
      Route::get('/edit/{packageId}', [CPNSTryoutPremiumController::class, 'edit'])->name('tryout-premium-cpns');
    });
    Route::group(['prefix' => 'coba-modul'], function () {
      Route::get('/', [CPNSTrialModuleController::class, 'index'])->name('coba-modul-cpns');
      Route::get('/create', [CPNSTrialModuleController::class, 'create'])->name('coba-modul-cpns');
      Route::get('/edit/{id}', [CPNSTrialModuleController::class, 'edit'])->name('coba-modul-cpns');
    });
  });

  // ** Import Add Class To Student
  Route::group(['prefix' => 'import'], function () {
    Route::get('/add-class-to-student', [ImportStudentClassController::class, 'importForm'])->name('import-data.student-class.form');
    Route::post('/add-class-to-student', [ImportStudentClassController::class, 'import'])->name('import-data.student-class.import');
    Route::get('/add-product-to-student', [ImportStudentProductController::class, 'importForm'])->name('import-data.student-product.form');
    Route::post('/add-product-to-student', [ImportStudentProductController::class, 'import'])->name('import-data.student-product.import');
  });

  Route::group(['prefix' => 'ranking-siswa'], function () {
    Route::get('/', [NewRankingController::class, 'indexFilterProgram'])->name('ranking-siswa');
    Route::get('/ranking/{program}/kategori/{task_id}', [NewRankingController::class, 'indexRanking'])->name('ranking-siswa');
    Route::get('/ranking/{program}/kategori/{task_id}/tryout-kode/{tryout_code}', [NewRankingController::class, 'indexRanking'])->name('ranking-siswa');
  });
  // ** Ranking
  Route::group(['prefix' => 'ranking'], function () {
    Route::get('/free-tryout', [RankingController::class, 'freeTryoutSection'])->name('ranking.free-tryout.section');
    Route::get('/premium-tryout', [RankingController::class, 'premiumTryoutSection'])->name('ranking.premium-tryout.section');
    Route::get('/package-tryout', [RankingController::class, 'packageTryoutSection'])->name('ranking.package-tryout.section');
    Route::get('/specific-tryout', [RankingController::class, 'specificTryoutSection'])->name('ranking.specific-tryout.section');
    Route::get('/specific-tryout/{tryoutCode}/recalculate-irt', [RankingController::class, 'recalculateIRTScore'])->name('ranking.specific-tryout.recalculate-irt');

    Route::get('/show/{taskId}', [RankingController::class, 'showRanking'])->name('ranking.show');
    Route::get('/show-irt/{taskId}', [RankingController::class, 'showIRTRanking'])->name('ranking.show-irt');
    Route::get('/download/{taskId}', [RankingController::class, 'downloadRanking'])->name('ranking.download');
    Route::get('/download-irt/{taskId}', [RankingController::class, 'downloadIRTRanking'])->name('ranking.download-irt');
    Route::get('/refresh/{taskId}', [RankingController::class, 'refreshRanking'])->name('ranking.refresh');

    // ** Ranking - Exam CPNS
    Route::get('/show-cpns/{taskId}', [RankingCPNSController::class, 'showRankingTryoutCPNS'])->name('ranking-cpns.show');
    Route::get('/refresh-cpns/{taskId}', [RankingCPNSController::class, 'refreshRankingCPNS'])->name('ranking-cpns.refresh');
    Route::get('/download-cpns/{taskId}', [RankingCPNSController::class, 'downloadRankingCPNS'])->name('ranking-cpns.download');

    // Ranking Group Tryout Kode
    Route::get('/group-tryout-kode', [RankingController::class, 'sendGroupTryoutRankingForm']);
    Route::post('/group-tryout-kode/download-pdf', [RankingController::class, 'downloadGroupTryoutRanking']);
    Route::post('/group-tryout-kode/send-pdf', [RankingController::class, 'sendGroupTryoutRanking'])->name('ranking.send-group-ranking');
    Route::get('/group-tryout-kode/test', [RankingController::class, 'sendTestGroupTryoutRankingForm']);
    Route::post('/group-tryout-kode/dump', [RankingController::class, 'dumpGroupTryoutRankingData']);
    Route::post('/group-tryout-kode/send-pdf/test', [RankingController::class, 'sendTestGroupTryoutRanking'])->name('ranking.send-test-group-ranking');
  });


  Route::group(['prefix' => 'kesehatan'], function () {
    Route::get('/cetak-hasil-pengecekan-kesehatan/{historyId}', [HealthCheckController::class, 'printSummary'])->name('kesehatan.check');
    Route::get('/check', [HealthCheckController::class, 'checkForm'])->name('kesehatan.check');
    Route::get('/stakes', [HealthCheckController::class, 'indexStakes'])->name('kesehatan.stakes');
    Route::get('/riwayat-pemeriksaan', [HealthCheckController::class, 'recordHistory'])->name('kesehatan.history');
    Route::get('/stakes/edit/{id}', [HealthCheckController::class, 'editStakes'])->name('kesehatan.stakes.edit');
    Route::get('/stakes/create', [HealthCheckController::class, 'createStakes'])->name('kesehatan.stakes.create');
    Route::get('/hasil-pemeriksaan/{historyId}/{studentId?}', [HealthCheckController::class, 'showMedicalCheckupSummary'])->name('kesehatan.medical-checkup-summary');
  });

  Route::group(['prefix' => 'central-operational-item'], function () {
    Route::get('/', [CentralOperationalItemController::class, 'index'])->name('central-operational-item');
    Route::get('/create', [CentralOperationalItemController::class, 'create'])->name('central-operational-item');
    Route::get('/edit/{id}', [CentralOperationalItemController::class, 'edit'])->name('central-operational-item');
  });

  Route::group(['prefix' => 'keuangan'], function () {
    Route::get('/', [FinanceFundController::class, 'index'])->name('keuangan');
    Route::get('/transfer-dana', [FinanceFundController::class, 'fundTransfer'])->name('keuangan');
    Route::get('/tarik-dana', [FinanceFundController::class, 'fundWithdraw'])->name('keuangan');
    Route::get('/tarik-dana/edit/{id}', [FinanceFundController::class, 'editFundWithdraw'])->name('keuangan');
    Route::get('/konfirmasi-penagihan-dana/{id}', [FinanceFundController::class, 'fundWithdrawConfirmation'])->name('keuangan');
  });

  // File manager routes
  Route::get('/file-manager', [FileManagerController::class, 'index'])->name('file-manager.index');
  Route::post('/file-manager/dir', [FileManagerController::class, 'getDir']);
  Route::post('/file-manager', [FileManagerController::class, 'upload']);
  Route::post('/file-manager/folder', [FileManagerController::class, 'createFolder']);
  Route::post('/file-manager/file', [FileManagerController::class, 'generateFilePreSignedURL']);

  Route::group(['prefix' => 'stages'], function () {
    $currentURL = url()->current();
    $isOnPTKStageURL = preg_match("/PTK/", $currentURL);
    $isOnPTNStageURL = preg_match("/PTN/", $currentURL);
    Route::get('/{type}', [StagesController::class, 'index'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name($isOnPTKStageURL ? "stages-ptk" : ($isOnPTNStageURL ? "stages-ptn" : "stages-cpns"));
    Route::get('/{type}/create', [StagesController::class, 'create'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name($isOnPTKStageURL ? "stages-ptk" : ($isOnPTNStageURL ? "stages-ptn" : "stages-cpns"));
    Route::get('/{type}/{id}/edit', [StagesController::class, 'edit'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name($isOnPTKStageURL ? "stages-ptk" : ($isOnPTNStageURL ? "stages-ptn" : "stages-cpns"));
    Route::post('/{type}', [StagesController::class, 'store'])->name('stages.store');
    Route::put('/{type}/{id}', [StagesController::class, 'update'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name('stages.update');
    Route::put('/{type}/lock-status', [StagesController::class, 'updateLockStatus'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name('stages.update-lock-status');
  });

  Route::group(['prefix' => 'stages-kelas'], function () {
    $currentURL = url()->current();
    $isOnPTKStageURL = preg_match("/PTK/", $currentURL);
    $isOnPTNStageURL = preg_match("/PTN/", $currentURL);
    Route::get('/{type}', [ClassStagesController::class, 'index'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name($isOnPTKStageURL ? "stages-kelas-ptk" : ($isOnPTNStageURL ? "stages-kelas-ptn" : "stages-kelas-cpns"));
    Route::get('/{type}/create', [ClassStagesController::class, 'create'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name($isOnPTKStageURL ? "stages-kelas-ptk" : ($isOnPTNStageURL ? "stages-kelas-ptn" : "stages-kelas-cpns"));
    Route::get('/{type}/{id}/edit', [ClassStagesController::class, 'edit'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name($isOnPTKStageURL ? "stages-kelas-ptk" : ($isOnPTNStageURL ? "stages-kelas-ptn" : "stages-kelas-cpns"));
    Route::post('/{type}', [ClassStagesController::class, 'store'])->name('stages-kelas.store');
    Route::put('/{type}/{id}', [ClassStagesController::class, 'update'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name('stages-kelas.update');
    Route::put('/{type}/lock-status', [ClassStagesController::class, 'updateLockStatus'])
      ->where('type', 'PTK|PTN|CPNS')
      ->name('stages-kelas.update-lock-status');
  });

  Route::group(['prefix' => 'akses-uka-stages'], function () {
    Route::get('/generate-kode-akses', [StagesUKAController::class, 'generateAccessCodeForm'])->name('akses-uka-stages');
    Route::post('/generate-kode-akses', [StagesUKAController::class, 'generateAccessCode'])->name('akses-uka-stages.generate-kode-akses');
    Route::get('/kode-akses/{branchCode}/{classroomId}/{stageId}/{session}', [StagesUKAController::class, 'showAccessCode'])->name('akses-uka-stages');
  });

  Route::group(['prefix' => 'soal-stages'], function () {
    $currentURL = url()->current();
    $isOnPTKStageURL = preg_match("/PTK/", $currentURL);
    Route::get('/{type}', [StageQuestionController::class, 'stages'])
      ->where('type', 'PTK|PTN')
      ->name($isOnPTKStageURL ? "soal-stages-ptk" : "soal-stages-ptn");
    Route::get('/{type}/{id}/soal', [StageQuestionController::class, 'questions'])
      ->where('type', 'PTK|PTN')
      ->name($isOnPTKStageURL ? "soal-stages-ptk" : "soal-stages-ptn");
    Route::get('/{type}/{id}/soal/{questionId}/pembahasan', [StageQuestionController::class, 'questionExplanation'])
      ->where('type', 'PTK|PTN')
      ->name($isOnPTKStageURL ? "soal-stages-ptk" : "soal-stages-ptn");
    Route::get('/{type}/{id}/soal/{questionId}/komentar', [StageQuestionController::class, 'showComments'])
      ->where('type', 'PTK|PTN')
      ->name($isOnPTKStageURL ? "soal-stages-ptk" : "soal-stages-ptn");
  });

  Route::group(['prefix' => 'soal-multistages'], function () {
    Route::get('/', [MultiStageQuestionController::class, 'stages'])
      ->where('type', 'PTK|PTN')
      ->name("soal-multistages");
    Route::get('/{program}/{id}/soal', [MultiStageQuestionController::class, 'questions'])
      ->where('type', 'PTK|PTN')
      ->name("soal-multistages");
    Route::get(
      '/{program}/{id}/soal/{questionId}/pembahasan',
      [MultiStageQuestionController::class, 'questionExplanation']
    )
      ->where('type', 'PTK|PTN')
      ->name("soal-multistages");
    Route::get('/{program}/{id}/soal/{questionId}/komentar', [MultiStageQuestionController::class, 'showComments'])
      ->where('type', 'PTK|PTN')
      ->name("soal-multistages");
  });

  Route::group(['prefix' => 'soal-uka-kode'], function () {
    Route::get('/', [TryoutCodeQuestionController::class, 'indexUKAKode'])->name('soal-uka-kode');
    Route::get('/{tryout_code_id}/soal', [TryoutCodeQuestionController::class, 'index'])->name('soal-uka-kode');
    Route::get('/{tryout_code_id}/soal/{question_id}/pembahasan', [TryoutCodeQuestionController::class, 'questionExplanation']);
  });

  Route::group(['prefix' => 'reward'], function () {
    Route::get('/', [RewardController::class, 'index'])->name('reward');
    Route::get('/create', [RewardController::class, 'create'])->name('reward');
    Route::get('/{id}/edit', [RewardController::class, 'edit'])->name('reward');
    Route::post('/', [RewardController::class, 'store'])->name('reward.store');
    Route::put('/{id}', [RewardController::class, 'update'])->name('reward.update');
  });

  Route::group(['prefix' => 'sekolah'], function () {
    Route::get('/', [HighSchoolController::class, 'index'])->name('sekolah');
    Route::get('/tambah', [HighSchoolController::class, 'create'])->name('sekolah');
    Route::get('/edit/{id}', [HighSchoolController::class, 'edit'])->name('sekolah');
    Route::post('/', [HighSchoolController::class, 'store'])->name('sekolah.store');
    Route::put('/{id}', [HighSchoolController::class, 'update'])->name('sekolah.update');
  });

  Route::group(['prefix' => 'kode-diskon'], function () {
    Route::get('/', [DiscountCodeController::class, 'index'])->name('kode-diskon');
    Route::get('/tambah', [DiscountCodeController::class, 'create'])->name('kode-diskon');
    Route::get('/{id}/edit', [DiscountCodeController::class, 'edit'])->name('kode-diskon');
    Route::get('/{id}/penggunaan', [DiscountCodeController::class, 'indexUsage'])->name('kode-diskon');
  });

  Route::group(['prefix' => 'pengaturan-porsi'], function () {
    Route::group(['prefix' => 'global'], function () {
      Route::get('/', [GlobalPortionSettingController::class, 'index'])->name('pengaturan-porsi-global');
      Route::get('/tambah', [GlobalPortionSettingController::class, 'create'])->name('pengaturan-porsi-global');
      Route::get('/{id}/edit', [GlobalPortionSettingController::class, 'edit'])->name('pengaturan-porsi-global');
    });
    Route::group(['prefix' => 'per-mitra'], function () {
      Route::get('/', [AffiliatePortionController::class, 'index'])
        ->name('pengaturan-porsi-per-mitra');
      Route::get('/tambah', [AffiliatePortionController::class, 'create'])
        ->name('pengaturan-porsi-per-mitra');
      Route::get('/{id}/edit', [AffiliatePortionController::class, 'edit'])
        ->name('pengaturan-porsi-per-mitra');
      Route::post('/', [AffiliatePortionController::class, 'store'])
        ->name('pengaturan-porsi-per-mitra.store');
      Route::put('/{id}/edit', [AffiliatePortionController::class, 'update'])
        ->name('pengaturan-porsi-per-mitra.update');
    });
  });

  Route::group(['prefix' => 'pengaturan-diskon'], function () {
    Route::group(['prefix' => 'global'], function () {
      Route::get('/', [GlobalDiscountSettingController::class, 'index'])->name('pengaturan-diskon-global');
      Route::get('/tambah', [GlobalDiscountSettingController::class, 'create'])->name('pengaturan-diskon-global');
      Route::get('/{id}/edit', [GlobalDiscountSettingController::class, 'edit'])->name('pengaturan-diskon-global');
    });
    Route::group(['prefix' => 'per-mitra'], function () {
      Route::get('/', [AffiliateDiscountSettingController::class, 'index'])
        ->name('pengaturan-diskon-per-mitra');
      Route::get('/tambah', [AffiliateDiscountSettingController::class, 'create'])
        ->name('pengaturan-diskon-per-mitra');
      Route::get('/{id}/edit', [AffiliateDiscountSettingController::class, 'edit'])
        ->name('pengaturan-diskon-per-mitra');
      Route::post('/', [AffiliateDiscountSettingController::class, 'store'])
        ->name('pengaturan-diskon-per-mitra.store');
      Route::put('/{id}/edit', [AffiliateDiscountSettingController::class, 'update'])
        ->name('pengaturan-diskon-per-mitra.update');
    });
  });

  Route::group(['prefix' => 'withdraw'], function () {
    Route::get('/', [WithdrawController::class, 'index'])->name('withdraw');
    Route::get('/{id}/proses', [WithdrawController::class, 'process'])->name('withdraw');
  });

  Route::group(['prefix' => 'dashboard-mitra'], function () {
    Route::get('/', [AffiliateDashboardController::class, 'index'])->name('dashboard-mitra');
  });

  Route::group(['prefix' => 'pembayaran-pajak'], function () {
    Route::get('/', [TaxPaymentController::class, 'index'])->name('pembayaran-pajak');
    Route::get('/{id}/proses', [TaxPaymentController::class, 'process'])->name('pembayaran-pajak');
  });

  Route::group(['prefix' => 'mitra'], function () {
    Route::get('/', [AffiliateController::class, 'index'])->name('mitra');
    Route::get('/tambah', [AffiliateController::class, 'create'])->name('mitra');
    Route::get('/{sso_id}/edit', [AffiliateController::class, 'edit'])->name('mitra');
    Route::get('/{id}/wallet', [AffiliateController::class, 'wallet'])->name('mitra');
    Route::get('/{id}/riwayat-transaksi', [AffiliateController::class, 'transactionHistory'])->name('mitra');
    Route::get('/{id}/verifikasi', [AffiliateController::class, 'verification'])->name('mitra');
    Route::get('/akun-bank/request-update-rekening', [AffiliateController::class, 'indexBankAccountRequest'])->name('mitra.request-update-rekening-bank');
    Route::get('/akun-bank/request-update-rekening/{id}/proses', [AffiliateController::class, 'formProcessBankAccountRequest'])->name('mitra.request-update-rekening-bank');
  });

  Route::group(['prefix' => 'pengaturan-pajak'], function () {
    Route::get("/", [TaxSettingController::class, 'index'])->name('pengaturan-pajak');
    Route::get("/tambah", [TaxSettingController::class, 'create'])->name('pengaturan-pajak');
    Route::get("/{id}/edit", [TaxSettingController::class, 'edit'])->name('pengaturan-pajak');
    Route::post("/", [TaxSettingController::class, 'store'])->name('pengaturan-pajak.store');
    Route::put("/{id}", [TaxSettingController::class, 'update'])->name('pengaturan-pajak.update');
  });

  Route::group(['prefix' => 'kode-buku'], function () {
    Route::get('/', [EbookCodeController::class, 'index'])->name('kode-buku');
    Route::get('/generate', [EbookCodeController::class, 'generateForm'])->name('kode-buku');
    Route::post('/generate', [EbookCodeController::class, 'generate'])->name('kode-buku.generate');
    Route::get('/riwayat-redeem', [EbookCodeController::class, 'redeemHistory'])->name('kode-buku.riwayat-redeem');
    Route::get('/download', [EbookCodeController::class, 'downloadCodeBook'])->name('kode-buku');
  });

  Route::group(['prefix' => 'soal-latihan'], function () {
    Route::get('/{test_type}/{program}/{question_category}', [TrainingQuestionController::class, 'showSubCategoryModules']);
    Route::get('/{test_type}/{program}/{question_category}/{module_code}', [TrainingQuestionController::class, 'showQuestions']);
    Route::get('/{test_type}/{program}/{question_category}/{module_code}/{question_id}/pembahasan', [TrainingQuestionController::class, 'showExplanation']);
    Route::get('/{test_type}/{program}/{question_category}/{module_code}/{question_id}/komentar', [TrainingQuestionController::class, 'showComments']);
  });

  Route::group(['prefix' => 'soal-kelas'], function () {
    Route::get('/{test_type}/{program}/{question_category}', [ClassQuestionController::class, 'showSubCategoryModules']);
    Route::get('/{test_type}/{program}/{question_category}/{module_code}', [ClassQuestionController::class, 'showQuestions']);
    Route::get('/{test_type}/{program}/{question_category}/{module_code}/{question_id}/pembahasan', [ClassQuestionController::class, 'showExplanation']);
  });

  Route::group(["prefix" => "performa-siswa-edutech"], function () {
    Route::get("/", [StudentResultSummaryController::class, 'index'])->name('performa-siswa-edutech');
    Route::get("/pdf", [StudentResultSummaryController::class, 'pdf']);
    Route::get("/grafik/{student_id}/{exam_type?}", [StudentResultSummaryController::class, 'chart']);
    Route::get("/siswa/{student_id}/hasil-uka", [StudentResultSummaryController::class, 'studentResult'])->name('performa-siswa-edutech');
  });

  Route::group(["prefix" => "laporan-belajar"], function () {
    Route::get("/", [StudentResultSummaryController::class, 'indexV2']);
  });

  Route::get("/pemetaan-jurusan", [MajorMappingController::class, 'redirectToSubApp']);

  Route::group(['prefix' => 'peminatan'], function () {
    Route::get('/sekolah', [InterestAndTalentSchoolController::class, 'index'])->name('peminatan-sekolah');
    Route::get('/sekolah/{school_id}/detail', [InterestAndTalentSchoolController::class, 'detail'])->name('peminatan-sekolah');
    Route::get("/peserta", [ParticipantController::class, 'index'])->name('peminatan-peserta');
    Route::get("/riwayat-request-kode", [AccessCodeController::class, 'requestHistory'])->name('peminatan-riwayat-request-kode');
    Route::get('/result/{id}/download', [ParticipantController::class, 'downloadReport'])->name('peminatan-download-report');
  });

  Route::group(['prefix' => 'kode-ujian-minat-bakat'], function () {
    Route::get('/', [CodeExamInterestAndTalentController::class, 'index'])->name('kode-ujian-minat-bakat-khusus-cabang');
  });

  Route::group(['prefix' => 'top-up-coin'], function () {
    Route::get('/', [CashTopUpCoinsController::class, 'index'])->name('top-up-coin');
    Route::post('/store', [CashTopUpCoinsController::class, 'storeCoins'])->name('top-up-coin.store');
  });
  Route::group(['prefix' => 'dynamic-form'], function () {
    Route::get('/', [DynamicFormController::class, 'index'])->name('dynamic-menu');
    Route::get('/tambah', [DynamicFormController::class, 'showDinamicMenuCreate'])->name('dynamic-menu');
    Route::get('/edit/{id}', [DynamicFormController::class, 'showDinamicMenuEdit'])->name('dynamic-menu.edit');
    Route::post('/store', [DynamicFormController::class, 'storeDynamicForm'])->name('dynamic-menu.store');
    Route::get('/detail/{id}', [DynamicFormController::class, 'showDetailForms'])->name('dynamic-menu');
    Route::post('/{id}', [DynamicFormController::class, 'updateDynamicForm'])->name('dynamic-menu.update');
    Route::get('/{id}/download', [DynamicFormController::class, 'downloadDetailsForm'])->name('dynamic-menu');
  });

  Route::group(['prefix' => 'rapor-performa-belajar'], function () {
    Route::get('/', [ClassroomReportController::class, 'index'])->name('rapor-performa-belajar');
    Route::get(
      '/kelas/{classroom_id}/siswa/{student_id}/rapor',
      [StudentReportController::class, 'index']
    )->name('rapor-performa-belajar');
  });
});

Route::get('lang/{locale}', [LanguageController::class, 'swap']);
Route::get('/mail', function () {
  return view('mail');
});

Route::group(['prefix' => 'test'], function () {
  // Route::get('/module-summary/tryout-code/intensive-classes', [TestController::class, 'generateIntensiveClassesTryoutCodeModuleSummary']);
  // Route::get('/student-report/{program}/{exam_type?}', [TestController::class, 'getStudentReportSummary']);
  // Route::get('/tryout-code-group/{tryout_code_group}/tryout-code-category/{tryout_code_category_id}/rankings', [TestController::class, 'sendGroupRanking']);
  // Route::get('/branches/bills/past-due-date', [TestController::class, 'getAllBranchesUnpaidPastDueDateBills']);
  // Route::get('/classrooms/{classroomId}/import-participants', [TestController::class, 'importClassParticipants']);
  // Route::get('/classrooms/{classroomId}/import-schedules', [TestController::class, 'importSchedules']);
  // Route::get('/schedules/{scheduleId}/import-participants', [TestController::class, 'importScheduleParticipants']);
  // Route::get('/classrooms/{classroomId}/members/update-smartbtw-id', [TestController::class, 'updateClassMembersSmartbtwID']);
  // Route::get('/meetings/{meetingId}/presences', [TestController::class, 'createStudentPresenceFromParticipants']);
  // Route::get('/classrooms/{classroomId}/dummy-class-members', [TestController::class, 'sendDummyClassMemberPayload']);
  Route::get("/auth/presigned-url", [TestController::class, 'generateAuthPresignedURL']);
});

Route::group(['prefix' => 'utility'], function () {
  Route::get('/rabbitmq/publish-message', [RabbitMqController::class, 'showPublishMessageForm'])->name('utility.rabbitmq.publish-message-form');
  Route::post('/rabbitmq/publish-message', [RabbitMqController::class, 'publishMessage'])->name('utility.rabbitmq.publish-message');
});

// Download Pdf Receipt
Route::get('/file/kwitansi/{transactionId}/pdf', [BillController::class, 'showReceiptPdf']);

Route::group(['prefix' => 'admin-sso'], function () {
  Route::group(['prefix' => 'applications'], function () {
    Route::get('/', [SSOController::class, 'indexApplications'])->name('app-sso');
    Route::get('/tambah', [SSOController::class, 'createApplicationsForms'])->name('app-sso');
    Route::get('/edit/{id}', [SSOController::class, 'editApplicationsForm'])->name('app-sso');
    Route::post('/store', [SSOController::class, 'storeApplicationsLogic'])->name('app-sso.store');
    Route::post('/{id}', [SSOController::class, 'updateApplicationLogic'])->name('app-sso.update');
  });
  Route::group(['prefix' => 'user-role'], function () {
    Route::get('/', [SSOController::class, 'indexUserRole'])->name('role-sso');
    Route::get('/tambah', [SSOController::class, 'createUserRoleForms'])->name('role-sso');
    Route::get('/edit/{id}', [SSOController::class, 'editUserRoleForms'])->name('role-sso');
    Route::post('/store', [SSOController::class, 'createUserRoleLogic'])->name('role-sso.store');
    Route::post('/{id}', [SSOController::class, 'updateUserRoleLogic'])->name('role-sso.update');
  });
  Route::group(['prefix' => 'application-control-list'], function () {
    Route::get('/', [SSOController::class, 'indexACL'])->name('acl-sso');
    Route::get('/tambah', [SSOController::class, 'createACLForms'])->name('acl-sso');
    Route::get('/edit/{id}', [SSOController::class, 'editACLForms'])->name('acl-sso');
    Route::post('/store', [SSOController::class, 'storeACLLogic'])->name('acl-sso.store');
    Route::post('/{id}', [SSOController::class, 'updateACLLogic'])->name('acl-sso.update.update');
  });
  Route::group(['prefix' => 'additional-controls'], function () {
    Route::get('/', [SSOController::class, 'indexAdditionalControl'])->name('additional-control-sso');
    Route::get('/tambah', [SSOController::class, 'createAdditionalControlForms'])->name('additional-control-sso');
    Route::get('/edit/{id}', [SSOController::class, 'editAdditionalControlForms'])->name('additional-control-sso');
    Route::post('/store', [SSOController::class, 'storeAdditionalControl'])->name('additional-control-sso.store');
    Route::post('/{id}', [SSOController::class, 'updateAdditionalControl'])->name('additional-control-sso.update');
  });
  Route::group(['prefix' => 'users'], function () {
    Route::get('/', [SSOController::class, 'indexUsers'])->name('user-sso');
    Route::get('/tambah', [SSOController::class, 'createUsers'])->name('user-sso');
    Route::post('/store', [SSOController::class, 'storeUsers'])->name('user-sso.store');
    Route::post('/{id}', [SSOController::class, 'updateUsersLogic'])->name('user-sso.edit');
    Route::get('/edit/{id}', [SSOController::class, 'editUsersForm'])->name('user-sso');
  });
});

Route::get("/validate", [SSOController::class, 'validateCredentialToken']);

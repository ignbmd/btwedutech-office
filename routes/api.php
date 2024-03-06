<?php

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SSOController;
use App\Http\Controllers\Api\COAController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TryoutController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\InternalController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\PresenceController;
use App\Http\Controllers\Api\PayAndBillController;
use App\Http\Controllers\Api\ClassMemberController;
use App\Http\Controllers\Api\BranchEarningController;
use App\Http\Controllers\Api\Exam\InstructionController;
use App\Http\Controllers\Api\Exam\ModuleController;
use App\Http\Controllers\Api\Exam\QuestionCategoryController;
use App\Http\Controllers\Api\Exam\QuestionController;
use App\Http\Controllers\Api\Exam\SubQuestionCategoryController;
use App\Http\Controllers\Api\Exam\TryoutCodeController;
use App\Http\Controllers\Api\Exam\TryoutCodeCategoryController;
use App\Http\Controllers\Api\Exam\PackageController;
use App\Http\Controllers\Api\StudentResultController;
use App\Http\Controllers\Api\FinanceContactController;
use App\Http\Controllers\Api\MedicalCheckupController;
use App\Http\Controllers\Api\AlumniController;
use App\Http\Controllers\Api\BranchPaymentMethodController;
use App\Http\Controllers\Api\CompetitionMap\CompetitionController;
use App\Http\Controllers\Api\CompetitionMap\LastEducationController;
use App\Http\Controllers\Api\CompetitionMap\LocationController as CompetitionMapLocationController;
use App\Http\Controllers\Api\CompetitionMap\SchoolController;
use App\Http\Controllers\Api\CompetitionMap\SchoolQuotaController;
use App\Http\Controllers\Api\CompetitionMap\StudyProgramController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CompetitionMapController;
use App\Http\Controllers\Api\CentralOperationalItemController;
use App\Http\Controllers\Api\CompetitionMap\SkdRankController;
use App\Http\Controllers\Api\Exam\AssessmentPackageController;
use App\Http\Controllers\Api\Exam\PostTestPackageController;
use App\Http\Controllers\Api\Exam\PreTestPackageController;
use App\Http\Controllers\Api\Exam\StudyMaterialController;
use App\Http\Controllers\Api\Exam\TrialModuleController;
use App\Http\Controllers\Api\Exam\TryoutFreeController;
use App\Http\Controllers\Api\Exam\TryoutPremiumController;
use App\Http\Controllers\Api\ExamCodeInterestAndTalentController;
use App\Http\Controllers\Api\ExamCPNS\QuestionCategoryController as CPNSQuestionCategoryController;
use App\Http\Controllers\Api\ExamCPNS\SubQuestionCategoryController as CPNSSubQuestionCategoryController;
use App\Http\Controllers\Api\ExamCPNS\InstructionController as CPNSInstructionController;
use App\Http\Controllers\Api\ExamCPNS\PackageController as CPNSPackageController;
use App\Http\Controllers\Api\ExamCPNS\PreTestPackageController as CPNSPreTestPackageController;
use App\Http\Controllers\Api\ExamCPNS\PostTestPackageController as CPNSPostTestPackageController;
use App\Http\Controllers\Api\ExamCPNS\StudyMaterialController as CPNSStudyMaterialController;
use App\Http\Controllers\Api\ExamCPNS\ModuleController as CPNSModuleController;
use App\Http\Controllers\Api\ExamCPNS\TrialModuleController as CPNSTrialModuleController;
use App\Http\Controllers\Api\ExamCPNS\TryoutCodeCategoryController as CPNSTryoutCodeCategoryController;
use App\Http\Controllers\Api\ExamCPNS\TryoutCodeController as CPNSTryoutCodeController;
use App\Http\Controllers\Api\ExamCPNS\TryoutPremiumController as CPNSTryoutPremiumController;
use App\Http\Controllers\Api\FinanceFundController;
use App\Http\Controllers\Api\GenerateResultController;
use App\Http\Controllers\Api\InterestAndTalent\SchoolController as InterestAndTalentSchoolController;
use App\Http\Controllers\Api\HighSchool\HighSchoolController;
use App\Http\Controllers\Api\JournalRecordController;
use App\Http\Controllers\Api\NewAffiliate\AffiliateController;
use App\Http\Controllers\Api\NewAffiliate\AffiliateDiscountSettingController;
use App\Http\Controllers\Api\NewAffiliate\AffiliatePortionController;
use App\Http\Controllers\Api\NewAffiliate\GlobalDiscountSettingController;
use App\Http\Controllers\Api\NewAffiliate\DiscountCodeController;
use App\Http\Controllers\Api\NewAffiliate\PortionSettingController;
use App\Http\Controllers\Api\NewAffiliate\TaxPaymentController;
use App\Http\Controllers\Api\NewAffiliate\WithdrawController;
use App\Http\Controllers\Api\NewRankingStudent\NewRankingController;
use App\Http\Controllers\Api\Zoom\V2\ZoomController;
use App\Http\Controllers\Api\ZoomWebhookController;
use App\Http\Controllers\Api\StagesController;
use App\Http\Controllers\Api\OnlineClass\ScheduleController as OnlineScheduleController;
use App\Http\Controllers\Api\OnlineClass\AttendanceController;
use App\Http\Controllers\Api\Psikotest\HistoryRequestCodeController;
use App\Http\Controllers\Api\Psikotest\ParticipantListController;
use App\Http\Controllers\Api\PusherController;
use App\Http\Controllers\Api\SamaptaController;
use App\Http\Controllers\Api\StudentProgress\ClassroomReportController;
use App\Http\Controllers\Api\StudentProgress\StudentPrePostTestReportController;
use App\Http\Controllers\Api\StudentProgress\StudentPresenceController;
use App\Http\Controllers\Api\StudentProgress\StudentReportController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Cache;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/check-response-tryout-performa/{cache_name}', function ($cache_name) {
  $client = new \Predis\Client([
    'scheme' => 'tcp',
    'host' => env('REDIS_HOST'),
    'port' => env('REDIS_PORT'),
    'password' => env('REDIS_PASSWORD'),
  ]);
  $cache_value = $client->get($cache_name);
  $decoded_cache_value = json_decode($cache_value);
  $results = collect($decoded_cache_value)->toArray();
  return response()->json($results);
});

Route::middleware('auth:api')->get('/user', function (Request $request) {
  return $request->user();
});

Route::get('/timezone', function (Request $request) {
  return response()->json(['timezone' => Carbon::now()->timezoneName]);
});

Route::group(['prefix' => 'dashboard'], function () {
  Route::get('/user-retention-chart', [DashboardController::class, 'getUserRetentionChart']);
});

Route::group(['prefix' => 'learning'], function () {

  // classrooms
  Route::group(['prefix' => 'classroom'], function () {
    Route::get('/', [ClassController::class, 'getAll']);
    Route::get('/summary', [ClassController::class, 'getSummary']);
    Route::post('/', [ClassController::class, 'create']);
    Route::post('/{id}', [ClassController::class, 'update']);
    Route::delete('/{id}', [ClassController::class, 'delete']);
    Route::get('/{id}', [ClassController::class, 'getSingle']);
    Route::get('/class-member/{id}', [ClassController::class, 'getClassMember']);
    Route::get('/shared/by-sso-id/{sso_id}', [ClassController::class, 'getSharedClassroomBySSOID']);
    Route::get('/branch/{branch_code}', [ClassController::class, 'getByBranch']);
    Route::get('/by-branch-codes/{branch_codes}', [ClassController::class, 'getByMultipleBranchCodes']);
    Route::get('/{id}/members/scores', [ClassMemberController::class, 'scores']);
    Route::get('/{id}/available-online-schedules', [ClassController::class, 'getAvailableOnlineSchedules']);
  });

  // schedules
  Route::group(['prefix' => 'schedule'], function () {
    Route::get('', [ScheduleController::class, 'getAll']);
    Route::get('/calendar', [ScheduleController::class, 'getCalendar']);
    Route::get('/with-student/{scheduleId}', [ScheduleController::class, 'getWithStudent']);
    Route::post('/many', [ScheduleController::class, 'createMany']);
    Route::post('/', [ScheduleController::class, 'create']);
    Route::post('/update/{scheduleId}', [ScheduleController::class, 'update']);
    Route::delete('/{scheduleId}', [ScheduleController::class, 'delete']);
  });

  // class presence
  Route::group(['prefix' => 'presence'], function () {
    Route::post('', [PresenceController::class, 'create']);
    Route::post('/{presenceId}', [PresenceController::class, 'update']);
  });

  // teachers
  Route::group(['prefix' => 'teacher'], function () {
    Route::get('', [TeacherController::class, 'getAll']);
  });

  // report
  Route::group(['prefix' => 'report'], function () {
    Route::get('/{id}', [ReportController::class, 'getSingle']);
    Route::post('', [ReportController::class, 'create']);
    Route::post('/{id}', [ReportController::class, 'update']);
  });

  // material
  Route::group(['prefix' => 'material'], function () {
    Route::get('/', [MaterialController::class, 'getAllLearningMaterial']);
    Route::get('/{materialId}', [MaterialController::class, 'getSingleLearningMaterial']);
    Route::delete('/{materialId}', [MaterialController::class, 'deleteLearningMaterial']);
    Route::post('/', [MaterialController::class, 'createLearningMaterial']);
    Route::post('/{materialId}', [MaterialController::class, 'updateLearningMaterial']);
  });
});

// ** Internal
Route::group(['prefix' => 'internal'], function () {
  Route::get('programs', [InternalController::class, 'getPrograms']);
  Route::get('/code-tryout/schedule', [InternalController::class, 'getCodeTryoutSchedules']);
  Route::get('/code-tryout/schedule/break-time/{tryoutCode}', [InternalController::class, 'getCodeTryoutBreakTime']);
  Route::get('/online-legacy-product/{id}', [InternalController::class, 'getOnlineLegacyProductById']);
  Route::put('/online-legacy-product/{id}', [InternalController::class, 'updateOnlineLegacyProduct']);
  Route::get('/offline-legacy-product/{id}', [InternalController::class, 'getOfflineLegacyProductById']);
  Route::put('/offline-legacy-product/{id}', [InternalController::class, 'updateOfflineLegacyProduct']);
});

// ** Study Material
Route::group(['prefix' => 'study-material'], function () {
  Route::get('material', [MaterialController::class, 'getAll']);
});

// ** Product
Route::group(['prefix' => 'product'], function () {
  Route::get('/all', [ProductController::class, 'getAllProduct']);
  Route::get('/included-products', [ProductController::class, 'getIncludedProduct']);
  Route::get('/included-products/satuan', [ProductController::class, 'getSatuanProduct']);
  Route::get('/get-legacy-ids', [ProductController::class, 'getLegacyIds']);
  Route::get('/online-package/{program_slug}/options', [ProductController::class, 'getOnlinePackageOptionsByProgram']);
  Route::get('/online-package/{program_slug}/options/v2', [ProductController::class, 'getOnlinePackageOptionsByProgramV2']);
  Route::get('/tryout-premium/{program_slug}/options', [ProductController::class, 'getTryoutPremiumOptionsByProgram']);
  Route::get('/tryout-premium/{program_slug}/options/v2', [ProductController::class, 'getTryoutPremiumOptionsByProgramV2']);
  Route::get('/coin-product/{program_slug}/options', [ProductController::class, 'getCoinProductOptionsByProgram']);
  Route::get('/by-query', [ProductController::class, 'getProductByQuery']);
  Route::get('/assessment-only', [ProductController::class, 'getAssessmentProductOnly']);
  Route::get('/siplah', [ProductController::class, 'getSiplahProducts']);
  Route::get('/assessment-products/filter', [ProductController::class, 'getFilteredAssessmentProducts']);
});

// ** Branch
Route::group(['prefix' => 'branch'], function () {
  Route::get('/all', [BranchController::class, 'getAllBranch']);
  Route::get('/{code}', [BranchController::class, 'getBranch']);
  Route::get('/multiple', [BranchController::class, 'getMultipleBranches']);
  Route::post('/create', [BranchController::class, 'create']);
  Route::put('/update/{code}', [BranchController::class, 'update']);
});

Route::group(['prefix' => 'branch-payment-method'], function () {
  Route::get('/all', [BranchPaymentMethodController::class, 'getAll']);
  Route::get('/{branch_code}', [BranchPaymentMethodController::class, 'getByBranchCode']);
  Route::post('/{branch_code}', [BranchPaymentMethodController::class, 'create']);
  Route::delete('/{id}', [BranchPaymentMethodController::class, 'delete']);
});

// ** Sale
Route::group(['prefix' => 'sale'], function () {
  Route::get('/products', [SaleController::class, 'getAllProduct']);
  Route::get('/find-student', [SaleController::class, 'searchStudent']);
  Route::get('/classroom', [SaleController::class, 'getClassRoom']);
  Route::post('/create-student', [SaleController::class, 'createStudent']);
  Route::post('/update-student', [SaleController::class, 'updateStudent']);
  Route::post('/process', [SaleController::class, 'processTransaction']);
  Route::post('/check-promo', [SaleController::class, 'checkPromoCode']);
  Route::get('/check-central-fee', [SaleController::class, 'checkCentralFee']);
  Route::get('/student-detail-data/{student_id}', [SaleController::class, 'getStudentData']);
  Route::get('/siswa-unggulan-products/{product_code}/branches/{branch_code}/available-discount-code', [SaleController::class, 'getAvailableSiswaUnggulanProductDiscountCode']);
  Route::post('/student-screening-result', [SaleController::class, 'checkSiswaUnggulanScreeningResult']);
  Route::post("/process-siplah-transaction", [SaleController::class, 'processSiplahTransaction']);
  Route::post("/process-assessment-transaction", [SaleController::class, 'processAssessmentProductTransaction']);
});

// ** Medical Checkup
Route::group(['prefix' => 'medical-checkup'], function () {
  Route::group(['prefix' => 'point'], function () {
    Route::get('/', [MedicalCheckupController::class, 'getAllPoint']);
    Route::get('/checkup', [MedicalCheckupController::class, 'getPointCheckup']);
    Route::get('/detail/{id}', [MedicalCheckupController::class, 'getDetail']);
    Route::post('/create', [MedicalCheckupController::class, 'createPoint']);
    Route::put('/update/{pointId}', [MedicalCheckupController::class, 'updatePoint']);
  });
  Route::group(['prefix' => 'record'], function () {
    Route::get('/history/all', [MedicalCheckupController::class, 'getAllRecordHistory']);
    Route::get('/history/{studentId}', [MedicalCheckupController::class, 'getRecordHistory']);
    Route::get('/summary/{historyId}', [MedicalCheckupController::class, 'getRecordSummary']);
    Route::post('/create', [MedicalCheckupController::class, 'createRecord']);
    Route::put('/edit/{historyId}', [MedicalCheckupController::class, 'updateRecord']);
  });
});

// ** SSO
Route::group(['prefix' => 'sso'], function () {
  Route::get('/users', [SSOController::class, 'getAllUsers']);
  Route::get('/branch-users/{code}', [SSOController::class, 'getBranchUsers']);
  Route::get('/user/{ssoId}', [SSOController::class, 'getSingleUser']);
  Route::post('/create-users', [SSOController::class, 'createUsers']);
  Route::post('/create-user', [SSOController::class, 'createUser']);
  Route::post('/update-user/{ssoId}', [SSOController::class, 'updateUser']);
  Route::delete('/user/{ssoId}', [SSOController::class, 'deleteUser']);
  Route::delete('/user-roles/{ssoId}', [SSOController::class, 'deleteUserRoles']);
  Route::delete('/application/{ssoId}', [SSOController::class, 'deleteApplications']);
  Route::delete('/acl/{ssoId}', [SSOController::class, 'deleteACL']);
  Route::delete('/addtitonal-control/{ssoId}', [SSOController::class, 'deleteAdditionalControl']);
});

// Alumni
Route::group(['prefix' => "alumni"], function () {
  Route::get('/{program}/{selection}', [AlumniController::class, 'getAll']);
  Route::get('/{program}/{selection}/{id}', [AlumniController::class, 'getByID']);
  Route::post('/{program}/{selection}', [AlumniController::class, 'create']);
  Route::post('/{program}/{selection}/{id}', [AlumniController::class, 'update']);
  Route::delete('/{program}/{selection}/{id}', [AlumniController::class, 'delete']);
});

// ** Finance
Route::group(['prefix' => 'finance'], function () {

  // ** Bill
  Route::group(['prefix' => 'bill'], function () {
    Route::get('/', [BillController::class, 'getAll']);
    Route::get('/by-branch/{branchCode}/{type}', [BillController::class, 'getByBranch']);
    Route::get('/by-product-type/{type}', [BillController::class, 'getByProductType']);
    Route::get('/branch-code/{branch_code}/unpaid/past-due-date', [BillController::class, 'getBranchPastDueDateUnpaidBill']);
    Route::get('/assessment-event-products', [BillController::class, 'getAssessmentEventProductBill']);
    Route::post('/transaction/send-payment-info', [BillController::class, 'sendPaymentLinkToWhatsapp']);
    Route::get('/{billId}', [BillController::class, 'getById']);
    Route::get('/{billId}/transactions', [BillController::class, 'getTransactions']);
    Route::get('/{billId}/transactions/{transactionId}', [BillController::class, 'getDetailTransaction']);
    Route::get('/{billId}/product', [BillController::class, 'getBillProduct']);
    Route::post('/{billId}/transaction', [BillController::class, 'updateBilling']);
    Route::post('/{billId}/transaction-v2', [BillController::class, 'createNewBillingTransaction']);
    Route::post('/{billId}/transaction/{transactionId}', [BillController::class, 'updateBillingTransaction']);
    Route::post('/transaction-midtrans/{transactionId}', [BillController::class, 'updateBillingTransactionV2']);
    Route::post('/{billId}/send-invoice', [BillController::class, 'sendInvoice']);
    Route::post('/{billId}/transaction/{transactionId}/send', [BillController::class, 'sendReceipt']);
    Route::post('/{billId}/offline-transaction/{transactionId}', [BillController::class, 'updateOfflineTransaction']);
    Route::post('/{billId}/online-transaction/{transactionId}', [BillController::class, 'updateOnlineTransaction']);
    Route::post('/{billId}/online-transaction/{transactionId}/approve', [BillController::class, 'approveOnlineTransaction']);
    Route::post('/{billId}/online-transaction/{transactionId}/reject', [BillController::class, 'rejectOnlineTransaction']);
    Route::post('/{billId}/return-payment', [BillController::class, 'createReturnPayment']);
    Route::put('/{billId}/update-bill-discount', [BillController::class, 'updateBillDiscount']);
    Route::put('/{billId}/update-bill-discount-v2', [BillController::class, 'updateBillDiscountV2']);
    Route::delete('/{billId}', [BillController::class, 'deleteBill']);
    Route::delete('/transaction/{transactionId}', [BillController::class, 'deleteTransaction']);
  });

  // ** Pay & Bill
  Route::group(['prefix' => 'pay-and-bill'], function () {
    Route::get('/source-account', [PayAndBillController::class, 'getSourceAccount']);
    Route::get('/amount/{accountId}', [PayAndBillController::class, 'getDebtAmount']);
    Route::get('/history/{historyId}', [PayAndBillController::class, 'getDetailHistory']);
    Route::get('/central/history/{type}/{accountId}', [PayAndBillController::class, 'getCentralPayDebtHistory'])
      ->where('type', '[PAY|BILL]+');
    Route::get('/central/{type}', [PayAndBillController::class, 'getCentralDebtOrReceivables'])
      ->where('type', '[hutang|piutang]+');
    Route::get('/central-collect-receivable-history', [PayAndBillController::class, 'getCentralCollectReceivableHistory']);
    Route::get('/branch-debt', [PayAndBillController::class, 'getBranchDebt']);
    Route::get('/branch-receivable', [PayAndBillController::class, 'getBranchReceivable']);
    Route::post('/central/create/{type}', [PayAndBillController::class, 'postCentralPayOrBill'])
      ->where('type', '[pay|bill]+');
    Route::put('/history-central', [PayAndBillController::class, 'updateHistoryCentral']);
    Route::post('/history-branch', [PayAndBillController::class, 'updateHistoryBranch']);
  });

  // ** COA
  Route::group(['prefix' => 'coa'], function () {
    Route::get('/', [COAController::class, 'getAccounts']);
    Route::get('/account-categories', [COAController::class, 'getAccountCategories']);
    Route::get('/branch-and-category-ids', [COAController::class, 'getByBranchAndCategoryIds']);
    Route::post('/', [COAController::class, 'createAccount']);
    Route::get('/{id}', [COAController::class, 'getSingleAccount']);
    Route::put('/{id}', [COAController::class, 'updateAccount']);
  });

  // Contacts
  Route::group(['prefix' => 'contact'], function () {
    Route::post('/', [FinanceContactController::class, 'create']);
    Route::put('/{id}', [FinanceContactController::class, 'update']);
    Route::get('/', [FinanceContactController::class, 'getAll']);
    Route::get('/{branchCode}', [FinanceContactController::class, 'getAllByBranchCode']);
  });

  Route::group(['prefix' => 'branch-contact'], function () {
    Route::post('/', [FinanceContactController::class, 'createBranchContact']);
  });

  Route::group(['prefix' => 'transfer-fund'], function () {
    Route::get('/', [FinanceFundController::class, 'getAll']);
    Route::get('/{id}', [FinanceFundController::class, 'getById']);
    Route::post('/branch', [FinanceFundController::class, 'storeBranch']);
    Route::post('/central', [FinanceFundController::class, 'storeCentral']);
    Route::post('/confirm/{id}', [FinanceFundController::class, 'confirm']);
    Route::put('/{id}', [FinanceFundController::class, 'update']);
    Route::post('/proof/{id}', [FinanceFundController::class, 'updateProof']);
  });

  Route::group(['prefix' => 'journal-records'], function () {
    Route::get('/calculate-amount', [JournalRecordController::class, 'getAccountTotalAmount']);
    Route::get('/{account_id}/calculate-amount', [JournalRecordController::class, 'getAccountTotalAmountByAccountID']);
  });

  // Expense
  Route::group(['prefix' => 'expense'], function () {
    Route::post('/', [ExpenseController::class, 'create']);
    Route::post('/update', [ExpenseController::class, 'update']);
    Route::get('/detail/{id}', [ExpenseController::class, 'getById']);
    Route::get('/calculation/{branchCode}', [ExpenseController::class, 'getCalculationByBranchCode']);
    Route::get('/{branchCode}', [ExpenseController::class, 'getByBranchCode']);
  });

  // ** Branch Earning
  Route::group(['prefix' => 'branch-earning'], function () {
    Route::get('detail/{id}', [BranchEarningController::class, 'getById']);
    Route::get('default-by-branch/{branch_code}', [BranchEarningController::class, 'getDefaultByBranchCode']);
    Route::get('/{branch_code}', [BranchEarningController::class, 'getByBranchCode']);
    Route::post('/', [BranchEarningController::class, 'create']);
    Route::post('/{id}', [BranchEarningController::class, 'update']);
    Route::delete('/{id}', [BranchEarningController::class, 'delete']);
  });
});

Route::post('login', [AuthController::class, 'login']);
/**
 * Route need JWT Token
 */
Route::group(['middleware' => 'jwt'], function () {
  Route::post('me', [AuthController::class, 'me']);
});;

Route::group(['prefix' => 'students'], function () {
  Route::get('/', [StudentController::class, 'getAll']);
  Route::get('/search', [StudentController::class, 'search']);
  Route::get('/detail/{studentId}', [StudentController::class, 'getStudentById']);
  Route::get('/{studentId}/result', [StudentController::class, 'result']);
  Route::get('/{studentId}/presence-log', [StudentController::class, 'presenceLog']);
  Route::get('/{studentId}/transaction', [StudentController::class, 'transaction']);
  Route::post('/sync', [StudentController::class, 'syncStudent']);
  Route::post('/classrooms', [StudentController::class, 'getStudentClassroomsByStudentIds']);
  Route::delete('/{studentId}/delete', [StudentController::class, 'delete']);
  Route::post('/skd-rank', [StudentController::class, 'getSkdRankStudent']);
  Route::post('/exam-result', [StudentController::class, 'getExamResult']);
  Route::get('/{studentEmail}/targets/{type}', [StudentController::class, 'getStudentTargetFromElasticByEmail']);
  Route::get('/detail/{studentId}/sale-data', [StudentController::class, 'getStudentIDForSaleData']);
  Route::get('/{studentEmail}/uka-code-scores', [StudentController::class, 'getUKACodeScoresByEmail']);
  Route::get('/{studentId}/all-targets/{type}', [StudentController::class, 'getAllSingleStudentTarget']);
  // Route::get('/{studentId}/result/pdf', [StudentController::class, 'resultPDF']);
});

Route::group(['prefix' => 'mentor'], function () {
  Route::get('/', [MentorController::class, 'index']);
  Route::get('/legacy', [MentorController::class, 'legacy']);
  Route::get('/excluded-legacy', [MentorController::class, 'excludedLegacy']);
});

Route::group(['prefix' => 'location'], function () {
  Route::get('/', [LocationController::class, 'get']);
  Route::get('/get-province', [LocationController::class, 'getProvince']);
  Route::get('/get-region/{province_id}', [LocationController::class, 'getRegion']);
});

Route::group(['prefix' => 'tryout'], function () {
  Route::get('/free/sections', [TryoutController::class, 'getFreeTryoutSection']);
  Route::get('/premium/sections', [TryoutController::class, 'getPremiumTryoutSection']);
  Route::get('/package/sections', [TryoutController::class, 'getPackageTryoutSection']);
  Route::get('/specific/sections', [TryoutController::class, 'getSpecificTryoutSection']);
  Route::post('/skd-rank', [TryoutCodeController::class, 'getSkdRankTryout']);
});

Route::group(['prefix' => 'central-operational-item'], function () {
  Route::get('/', [CentralOperationalItemController::class, 'getAll']);
  Route::get('/{id}', [CentralOperationalItemController::class, 'getById']);
  Route::get('/by-product-code/{productCode}', [CentralOperationalItemController::class, 'getByProductCode']);
  Route::post('/', [CentralOperationalItemController::class, 'create']);
  Route::put('/{id}', [CentralOperationalItemController::class, 'update']);
});

Route::get('/competition-map', [CompetitionMapController::class, 'get']);

Route::group(['prefix' => 'competition-map'], function () {

  Route::group(['prefix' => 'school'], function () {
    Route::get('/', [SchoolController::class, 'index']);
    Route::get('/{id}', [SchoolController::class, 'show']);
    Route::post('/', [SchoolController::class, 'store']);
    Route::put('/{id}', [SchoolController::class, 'update']);
    Route::delete('/{id}', [SchoolController::class, 'delete']);
    Route::get('/origin/{school_type}/educations', [SchoolController::class, 'getSchoolOriginEducations']);
  });

  Route::group(['prefix' => 'location'], function () {
    Route::get('/', [CompetitionMapLocationController::class, 'index']);
    Route::get('/provinces', [CompetitionMapLocationController::class, 'provinces']);
    Route::get('/region', [CompetitionMapLocationController::class, 'region']);
    Route::get('/location-parent/{id}', [CompetitionMapLocationController::class, 'getRegionByParentId']);
    Route::get('/{id}', [CompetitionMapLocationController::class, 'show']);
    Route::post('/', [CompetitionMapLocationController::class, 'store']);
    Route::put('/{id}', [CompetitionMapLocationController::class, 'update']);
    Route::delete('/{id}', [CompetitionMapLocationController::class, 'delete']);
  });

  Route::group(['prefix' => 'last-education'], function () {
    Route::get('/', [LastEducationController::class, 'index']);
    Route::get('/{id}', [LastEducationController::class, 'show']);
    Route::post('/', [LastEducationController::class, 'store']);
    Route::put('/{id}', [LastEducationController::class, 'update']);
    Route::delete('/{id}', [LastEducationController::class, 'delete']);
  });

  Route::group(['prefix' => 'study-program'], function () {
    Route::get('/', [StudyProgramController::class, 'index']);
    Route::get('/{id}', [StudyProgramController::class, 'show']);
    Route::get('/school/{id}', [StudyProgramController::class, 'getBySchoolId']);
    Route::post('/', [StudyProgramController::class, 'store']);
    Route::put('/{id}', [StudyProgramController::class, 'update']);
    Route::delete('/{id}', [StudyProgramController::class, 'delete']);
  });

  Route::group(['prefix' => 'school-quota'], function () {
    Route::get('/', [SchoolQuotaController::class, 'index']);
    Route::get('/{id}', [SchoolQuotaController::class, 'show']);
    Route::post('/', [SchoolQuotaController::class, 'store']);
    Route::put('/{id}', [SchoolQuotaController::class, 'update']);
    Route::delete('/{id}', [SchoolQuotaController::class, 'delete']);
  });

  Route::group(['prefix' => 'competition'], function () {
    Route::get('/', [CompetitionController::class, 'index']);
    Route::get('/{id}', [CompetitionController::class, 'show']);
    Route::post('/', [CompetitionController::class, 'store']);
    Route::put('/{id}', [CompetitionController::class, 'update']);
    Route::delete('/{id}', [CompetitionController::class, 'delete']);
  });

  Route::group(['prefix' => 'skd-rank'], function () {
    Route::get('/', [SkdRankController::class, 'get']);
    Route::post('/import', [SkdRankController::class, 'import']);
    // Route::post('/', [SkdRankController::class, 'create']);
    Route::post('/cud', [SkdRankController::class, 'createUpdateDelete']);
  });;
});

Route::group(['prefix' => 'exam'], function () {
  Route::group(['prefix' => 'question'], function () {
    Route::get('/', [QuestionController::class, 'get']);
    Route::get('/detail/{id}', [QuestionController::class, 'getById']);
    Route::get('/type/{type}', [QuestionController::class, 'getByType']);
    Route::post('/create', [QuestionController::class, 'create']);
    Route::post('/connect', [QuestionController::class, 'connectQuestion']);
    Route::put('/{id}', [QuestionController::class, 'update']);
    Route::delete('/{id}', [QuestionController::class, 'delete']);
  });
  Route::group(['prefix' => 'tryout-code'], function () {
    Route::get('/all', [TryoutCodeController::class, 'getAll']);
    Route::get('/tag/{tag}', [TryoutCodeController::class, 'getByTag']);
    Route::get('/detail/{id}', [TryoutCodeController::class, 'getDetail']);
    Route::post('/create', [TryoutCodeController::class, 'create']);
    Route::put('/update', [TryoutCodeController::class, 'update']);
    Route::delete('/{id}', [TryoutCodeController::class, 'delete']);
    Route::get('/code-category', [TryoutCodeController::class, 'getCodeCategory']);
  });
  Route::group(['prefix' => 'tryout-code-category'], function () {
    Route::get('/all', [TryoutCodeCategoryController::class, 'getAll']);
    Route::get('/detail/{id}', [TryoutCodeCategoryController::class, 'getDetail']);
    Route::get('/{id}/groups', [TryoutCodeCategoryController::class, 'getGroups']);
    Route::post('/create', [TryoutCodeCategoryController::class, 'create']);
    Route::put('/update', [TryoutCodeCategoryController::class, 'update']);
    Route::delete('/{id}', [TryoutCodeCategoryController::class, 'delete']);
  });
  Route::group(['prefix' => 'tryout-free'], function () {
    Route::get('/all', [TryoutFreeController::class, 'getAll']);
    Route::get('/detail/{id}', [TryoutFreeController::class, 'getDetail']);
    Route::get('/clusters/{id}', [TryoutFreeController::class, 'getDetailCluster']);
    Route::post('/create', [TryoutFreeController::class, 'create']);
    Route::post('/add-session', [TryoutFreeController::class, 'addSession']);
    Route::put('/update', [TryoutFreeController::class, 'update']);
    Route::put('/update-clusters', [TryoutFreeController::class, 'updateCluster']);
    Route::delete('/{id}', [TryoutFreeController::class, 'delete']);
    Route::delete('/clusters/{id}', [TryoutFreeController::class, 'deleteCluster']);
  });
  Route::group(['prefix' => 'instruction'], function () {
    Route::get('/{program?}', [InstructionController::class, 'get']);
    Route::get('/detail/{id}', [InstructionController::class, 'getById']);
    Route::post('/create', [InstructionController::class, 'create']);
    Route::put('/{id}', [InstructionController::class, 'update']);
    Route::delete('/{id}', [InstructionController::class, 'delete']);
  });
  Route::group(['prefix' => 'question-category'], function () {
    Route::get('/{program?}', [QuestionCategoryController::class, 'get']);
    Route::get('/detail/{id}', [QuestionCategoryController::class, 'getById']);
    Route::post('/create', [QuestionCategoryController::class, 'create']);
    Route::put('/{id}', [QuestionCategoryController::class, 'update']);
    Route::delete('/{id}', [QuestionCategoryController::class, 'delete']);
  });
  Route::group(['prefix' => 'sub-question-category'], function () {
    Route::get('/', [SubQuestionCategoryController::class, 'get']);
    Route::get('/detail/{id}', [SubQuestionCategoryController::class, 'getById']);
    Route::get('/category/{categoryId}', [SubQuestionCategoryController::class, 'getByCategoryId']);
    Route::post('/create', [SubQuestionCategoryController::class, 'create']);
    Route::put('/{id}', [SubQuestionCategoryController::class, 'update']);
    Route::delete('/{id}', [SubQuestionCategoryController::class, 'delete']);
  });
  Route::group(['prefix' => 'module'], function () {
    Route::get('/', [ModuleController::class, 'get']);
    Route::get('/detail/{module_code}', [ModuleController::class, 'getByModuleCode']);
    Route::get('/program/{program}', [ModuleController::class, 'getByProgram']);
    Route::get('/program/{program}/tag/{tag}', [ModuleController::class, 'getByProgramAndTag']);
    Route::post('/create', [ModuleController::class, 'create']);
    Route::put('/{id}', [ModuleController::class, 'update']);
    Route::delete('/{id}', [ModuleController::class, 'delete']);
  });
  Route::group(['prefix' => 'package'], function () {
    Route::get('/', [PackageController::class, 'getAll']);
    Route::get('/{id}', [PackageController::class, 'getById']);
    Route::post('/bulk', [PackageController::class, 'createBulk']);
    Route::post('/{id}', [PackageController::class, 'update']);
    Route::delete('/{id}', [PackageController::class, 'delete']);
  });
  Route::group(['prefix' => 'assessment-package'], function () {
    Route::get('/', [AssessmentPackageController::class, 'getAll']);
    Route::get('/{id}', [AssessmentPackageController::class, 'getById']);
    Route::post('/bulk', [AssessmentPackageController::class, 'createBulk']);
    Route::post('/{id}', [AssessmentPackageController::class, 'update']);
  });
  Route::group(['prefix' => 'pre-test-package'], function () {
    Route::get('/', [PreTestPackageController::class, 'getAll']);
    Route::get('/{id}', [PreTestPackageController::class, 'getById']);
    Route::get('/programs/{program_slug}', [PreTestPackageController::class, 'getByProgram']);
    Route::post('/bulk', [PreTestPackageController::class, 'createBulk']);
    Route::post('/{id}', [PreTestPackageController::class, 'update']);
  });
  Route::group(['prefix' => 'post-test-package'], function () {
    Route::get('/', [PostTestPackageController::class, 'getAll']);
    Route::get('/{id}', [PostTestPackageController::class, 'getById']);
    Route::get('/programs/{program_slug}', [PostTestPackageController::class, 'getByProgram']);
    Route::post('/bulk', [PostTestPackageController::class, 'createBulk']);
    Route::post('/{id}', [PostTestPackageController::class, 'update']);
  });
  Route::group(['prefix' => 'study-material'], function () {
    Route::get("/", [StudyMaterialController::class, "index"]);
    Route::get("/{id}", [StudyMaterialController::class, "show"]);
    Route::post("/", [StudyMaterialController::class, 'store']);
    Route::put("/{id}", [StudyMaterialController::class, 'update']);

    Route::get("/{studyMaterialId}/documents", [StudyMaterialController::class, 'indexDocument']);
    Route::get("/{studyMaterialId}/documents/{documentId}", [StudyMaterialController::class, 'showDocument']);
    Route::post("/{studyMaterialId}/documents", [StudyMaterialController::class, 'storeDocument']);
    Route::put("/{studyMaterialId}/documents/{documentId}", [StudyMaterialController::class, 'updateDocument']);
  });
  Route::group(['prefix' => 'tryout-premium'], function () {
    Route::get('/', [TryoutPremiumController::class, 'index']);
    Route::get('/{id}', [TryoutPremiumController::class, 'show']);
    Route::post('/', [TryoutPremiumController::class, 'create']);
    Route::put('/{id}', [TryoutPremiumController::class, 'update']);
  });
  Route::group(['prefix' => 'trial-module'], function () {
    Route::get('/', [TrialModuleController::class, 'index']);
    Route::get('/{id}', [TrialModuleController::class, 'show']);
    Route::post('/', [TrialModuleController::class, 'store']);
    Route::put('/{id}', [TrialModuleController::class, 'update']);
  });
});
Route::group(['prefix' => 'exam-cpns'], function () {
  Route::group(['prefix' => 'question-category'], function () {
    Route::get('/{program?}', [CPNSQuestionCategoryController::class, 'get']);
    Route::get('/detail/{id}', [CPNSQuestionCategoryController::class, 'getById']);
    Route::post('/create', [CPNSQuestionCategoryController::class, 'create']);
    Route::put('/{id}', [CPNSQuestionCategoryController::class, 'update']);
    Route::delete('/{id}', [CPNSQuestionCategoryController::class, 'delete']);
  });
  Route::group(['prefix' => 'sub-question-category'], function () {
    Route::get('/', [CPNSSubQuestionCategoryController::class, 'get']);
    Route::get('/detail/{id}', [CPNSSubQuestionCategoryController::class, 'getById']);
    Route::get('/category/{categoryId}', [CPNSSubQuestionCategoryController::class, 'getByCategoryId']);
    Route::post('/create', [CPNSSubQuestionCategoryController::class, 'create']);
    Route::put('/{id}', [CPNSSubQuestionCategoryController::class, 'update']);
    Route::delete('/{id}', [CPNSSubQuestionCategoryController::class, 'delete']);
  });
  Route::group(['prefix' => 'instruction'], function () {
    Route::get('/{program?}', [CPNSInstructionController::class, 'get']);
    Route::get('/detail/{id}', [CPNSInstructionController::class, 'getById']);
    Route::post('/create', [CPNSInstructionController::class, 'create']);
    Route::put('/{id}', [CPNSInstructionController::class, 'update']);
    Route::delete('/{id}', [CPNSInstructionController::class, 'delete']);
  });
  Route::group(['prefix' => 'tryout-code-category'], function () {
    Route::get('/all', [CPNSTryoutCodeCategoryController::class, 'getAll']);
    Route::get('/detail/{id}', [CPNSTryoutCodeCategoryController::class, 'getDetail']);
    Route::get('/{id}/groups', [CPNSTryoutCodeCategoryController::class, 'getGroups']);
    Route::post('/create', [CPNSTryoutCodeCategoryController::class, 'create']);
    Route::put('/update', [CPNSTryoutCodeCategoryController::class, 'update']);
    Route::delete('/{id}', [CPNSTryoutCodeCategoryController::class, 'delete']);
  });
  Route::group(['prefix' => 'package'], function () {
    Route::get('/', [CPNSPackageController::class, 'getAll']);
    Route::get('/{id}', [CPNSPackageController::class, 'getById']);
    Route::post('/bulk', [CPNSPackageController::class, 'createBulk']);
    Route::post('/{id}', [CPNSPackageController::class, 'update']);
    Route::delete('/{id}', [CPNSPackageController::class, 'delete']);
  });
  Route::group(['prefix' => 'pre-test-package'], function () {
    Route::get('/', [CPNSPreTestPackageController::class, 'getAll']);
    Route::get('/{id}', [CPNSPreTestPackageController::class, 'getById']);
    Route::get('/programs/{program_slug}', [CPNSPreTestPackageController::class, 'getByProgram']);
    Route::post('/bulk', [CPNSPreTestPackageController::class, 'createBulk']);
    Route::post('/{id}', [CPNSPreTestPackageController::class, 'update']);
  });
  Route::group(['prefix' => 'post-test-package'], function () {
    Route::get('/', [CPNSPostTestPackageController::class, 'getAll']);
    Route::get('/{id}', [CPNSPostTestPackageController::class, 'getById']);
    Route::get('/programs/{program_slug}', [CPNSPostTestPackageController::class, 'getByProgram']);
    Route::post('/bulk', [CPNSPostTestPackageController::class, 'createBulk']);
    Route::post('/{id}', [CPNSPostTestPackageController::class, 'update']);
  });
  Route::group(['prefix' => 'study-material'], function () {
    Route::get("/", [CPNSStudyMaterialController::class, "index"]);
    Route::get("/{id}", [CPNSStudyMaterialController::class, "show"]);
    Route::post("/", [CPNSStudyMaterialController::class, 'store']);
    Route::put("/{id}", [CPNSStudyMaterialController::class, 'update']);

    Route::get("/{studyMaterialId}/documents", [CPNSStudyMaterialController::class, 'indexDocument']);
    Route::get("/{studyMaterialId}/documents/{documentId}", [CPNSStudyMaterialController::class, 'showDocument']);
    Route::post("/{studyMaterialId}/documents", [CPNSStudyMaterialController::class, 'storeDocument']);
    Route::put("/{studyMaterialId}/documents/{documentId}", [CPNSStudyMaterialController::class, 'updateDocument']);
  });
  Route::group(['prefix' => 'module'], function () {
    Route::get('/', [CPNSModuleController::class, 'get']);
    Route::get('/detail/{module_code}', [CPNSModuleController::class, 'getByModuleCode']);
    Route::get('/program/{program}', [CPNSModuleController::class, 'getByProgram']);
    Route::get('/program/{program}/tag/{tag}', [CPNSModuleController::class, 'getByProgramAndTag']);
    Route::post('/create', [CPNSModuleController::class, 'create']);
    Route::put('/{id}', [CPNSModuleController::class, 'update']);
    Route::delete('/{id}', [CPNSModuleController::class, 'delete']);
  });
  Route::group(['prefix' => 'tryout-code'], function () {
    Route::get('/all', [CPNSTryoutCodeController::class, 'getAll']);
    Route::get('/tag/{tag}', [CPNSTryoutCodeController::class, 'getByTag']);
    Route::get('/detail/{id}', [CPNSTryoutCodeController::class, 'getDetail']);
    Route::post('/create', [CPNSTryoutCodeController::class, 'create']);
    Route::put('/update', [CPNSTryoutCodeController::class, 'update']);
    Route::delete('/{id}', [CPNSTryoutCodeController::class, 'delete']);
    Route::get('/code-category', [CPNSTryoutCodeController::class, 'getCodeCategory']);
  });
  Route::group(['prefix' => 'tryout-premium'], function () {
    Route::get('/', [CPNSTryoutPremiumController::class, 'index']);
    Route::get('/{id}', [CPNSTryoutPremiumController::class, 'show']);
    Route::post('/', [CPNSTryoutPremiumController::class, 'create']);
    Route::put('/{id}', [CPNSTryoutPremiumController::class, 'update']);
  });
  Route::group(['prefix' => 'trial-module'], function () {
    Route::get('/', [CPNSTrialModuleController::class, 'index']);
    Route::get('/{id}', [CPNSTrialModuleController::class, 'show']);
    Route::post('/', [CPNSTrialModuleController::class, 'store']);
    Route::put('/{id}', [CPNSTrialModuleController::class, 'update']);
  });
});

Route::group(['prefix' => 'zoom'], function () {
  Route::group(['middleware' => 'zoom.checktoken'], function () {
    Route::get('/users', [ZoomController::class, 'getUsers']);
    Route::get('/users/{id}', [ZoomController::class, 'getUserById']);
    Route::get('/users/{id}/settings', [ZoomController::class, 'getUserSettings']);
    Route::get('/meetings/{id}', [ZoomController::class, 'getMeeting']);
    Route::get('/meetings/{id}/registrants', [ZoomController::class, 'getMeetingRegistrants']);
    Route::post('/student-presence', [ZoomController::class, 'createStudentPresence']);
  });
});

Route::group(['prefix' => 'stages'], function () {
  Route::get('/type/:type', [StagesController::class, 'getStagesByType']);
  Route::get('/level/:level/type/:type', [StagesController::class, 'getStageByTypeAndLevel']);
  Route::post('/', [StagesController::class, 'create']);
  Route::post('/:id', [StagesController::class, 'update']);
});

Route::group(['prefix' => 'online-class'], function () {
  Route::get("/classrooms/{classroom_id}/schedules", [OnlineScheduleController::class, 'index']);

  Route::get("/schedules/{schedule_id}", [OnlineScheduleController::class, 'getById']);
  Route::get("/schedules/{schedule_id}/attendances", [AttendanceController::class, 'index']);
  Route::put("/schedules/{schedule_id}/attendances", [AttendanceController::class, 'upsert']);
});

Route::group(['prefix' => 'discount-code'], function () {
  Route::get('/', [DiscountCodeController::class, 'getAll']);
  Route::get('/{id}', [DiscountCodeController::class, 'getById']);
  Route::get('/{id}/usages', [DiscountCodeController::class, 'getUsages']);
  Route::get('/identifier/{identifier}', [DiscountCodeController::class, 'getByIdentifier']);
  Route::post('/eligibility-check', [DiscountCodeController::class, 'checkEligibility']);
  Route::post('/check-affiliate-code', [DiscountCodeController::class, 'checkAffiliateDiscountCode']);
  Route::post('/eligibility-check/v2', [DiscountCodeController::class, 'checkEligibilityV2']);
  Route::post('/central', [DiscountCodeController::class, 'createForCentral']);
  Route::post('/branch', [DiscountCodeController::class, 'createForBranch']);
  Route::put('/{id}', [DiscountCodeController::class, 'update']);
  Route::delete('/{id}', [DiscountCodeController::class, 'delete']);
});

Route::group(['prefix' => 'portion-setting'], function () {
  Route::get('/', [PortionSettingController::class, 'getAll']);
  Route::get('/{id}', [PortionSettingController::class, 'getById']);
  Route::post('/create', [PortionSettingController::class, 'create']);
  Route::put('/{id}/update', [PortionSettingController::class, 'update']);
});

Route::group(['prefix' => 'global-discount-setting'], function () {
  Route::get('/', [GlobalDiscountSettingController::class, 'getAll']);
  Route::get('/{id}', [GlobalDiscountSettingController::class, 'getById']);
  Route::post('/create', [GlobalDiscountSettingController::class, 'create']);
  Route::put('/{id}/update', [GlobalDiscountSettingController::class, 'update']);
});

Route::group(['prefix' => 'affiliate-discount-setting'], function () {
  Route::get("affiliate-code/{affiliate_code}", [AffiliateDiscountSettingController::class, 'getByAffiliateCode']);
});

Route::group(['prefix' => 'affiliate-portion'], function () {
  Route::get("affiliate-id/{affiliateId}", [AffiliatePortionController::class, 'getPortionByAffiliateId']);
});

Route::group(['prefix' => 'withdraw'], function () {
  Route::get('/', [WithdrawController::class, 'getAll']);
  Route::get('/{id}', [WithdrawController::class, 'getById']);
  Route::post('/process/{id}', [WithdrawController::class, 'processWithdraw']);
});

Route::group(['prefix' => 'new-ranking'], function () {
  Route::get('/get-all-uka/{program}/category/{category}', [NewRankingController::class, 'getAllUKAList']);
  Route::get('/get-uka-by/{program}/task-id/{taskId}', [NewRankingController::class, 'getUKAListByTaskId']);
  Route::get('/{program}/task-id/{taskId}', [NewRankingController::class, 'getStudentRanking']);
  Route::post('/download/program/{program}/task-id/{taskId}', [NewRankingController::class, 'generatePDF']);
  Route::get('/get-irt/{tryout_code}', [NewRankingController::class, 'recalculateIRTScore']);
  Route::get('/get-irt-uka-stage/{package_id}/session/{session}', [NewRankingController::class, 'recalculateIRTUKAStage']);
});

Route::group(['prefix' => 'tax-payment'], function () {
  Route::get('/', [TaxPaymentController::class, 'get']);
  Route::get('/{id}', [TaxPaymentController::class, 'getById']);
  Route::post('/process/{id}', [TaxPaymentController::class, 'processTaxPayment']);
});

Route::group(['prefix' => 'affiliates'], function () {
  Route::get('/', [AffiliateController::class, 'getAll']);
  Route::get('/schools/{school_id}', [AffiliateController::class, 'getSingleBySchoolID']);
  Route::get('/bank-account-update-requests', [AffiliateController::class, 'getBankAccountUpdateRequests']);
  Route::get('/bank-account-update-requests/{id}', [AffiliateController::class, 'getBankAccountUpdateRequestByID']);
  Route::get('/{id}/wallets', [AffiliateController::class, 'getAffiliateWallets']);
  Route::get('/{id}/transaction-histories', [AffiliateController::class, 'getAffiliateTransactionHistories']);
  Route::get('/total', [AffiliateController::class, 'getAffiliateTotals']);
  Route::get('/{sso_id}', [AffiliateController::class, 'getSingleBySSOID']);
  Route::post('/', [AffiliateController::class, 'create']);
  Route::post('/bank-account-update-requests', [AffiliateController::class, 'processBankAccountUpdateRequest']);
  Route::post('/update-to-upliner/{id}', [AffiliateController::class, 'updateToUpliner']);
  Route::put('/verification', [AffiliateController::class, 'verificationAffiliateStatus']);
  Route::put('/{sso_id}', [AffiliateController::class, 'update']);
});

Route::group(['prefix' => 'highschools'], function () {
  // Used for datatable server side rendering
  Route::get('/', [HighSchoolController::class, 'index']);
  Route::get('/paginated', [HighSchoolController::class, 'indexPaginated']);
  Route::get('/{id}', [HighSchoolController::class, 'getById']);
  Route::get('/locations/{location_id}', [HighSchoolController::class, 'getByLocationID']);
  Route::get('/types/{type}', [HighSchoolController::class, 'getByType']);
  Route::get('/types/{type}/locations/{location_id}', [HighSchoolController::class, 'getByTypeAndLocationID']);
  Route::delete('/{id}', [HighSchoolController::class, 'delete']);
});

Route::group(["prefix" => "interest-and-talent"], function () {
  Route::group(["prefix" => "schools"], function () {
    Route::get("/", [InterestAndTalentSchoolController::class, 'get']);
    Route::get("/{school_id}", [InterestAndTalentSchoolController::class, 'getById']);
    Route::post("/", [InterestAndTalentSchoolController::class, 'create']);
    Route::post("/{school_id}", [InterestAndTalentSchoolController::class, 'update']);
    Route::post("/{school_id}/access-codes", [InterestAndTalentSchoolController::class, 'assignAccessCodes']);
    Route::get("/{school_id}/admins", [InterestAndTalentSchoolController::class, 'getSchoolAdminBySchoolId']);
    Route::post("/{school_id}/admins", [InterestAndTalentSchoolController::class, 'createSchoolAdmin']);
    Route::delete("/{school_id}/admins/{school_admin_id}", [InterestAndTalentSchoolController::class, 'deleteSchoolAdmin']);
    Route::post("/{group_test_id}/update", [InterestAndTalentSchoolController::class, 'updateAssignAccessCodes']);
  });
});

Route::get('/student-result/option/exam-type', [StudentResultController::class, 'getOptionExamType']);
Route::post('/zoom/webhook-test', [ZoomWebhookController::class, 'testingWebhookNotification']);
Route::post('/zoom/webhook', [ZoomWebhookController::class, 'processWebhookNotification']);
Route::patch("/test/students/update-branch-code", [TestController::class, 'updateSingleStudentBranchCode']);
Route::patch("/test/students/update-smartbtw-id", [TestController::class, 'updateMultipleStudentSmartBTWID']);

Route::group(['prefix' => 'psikotest'], function () {
  Route::group(['prefix' => 'history-request-code'], function () {
    Route::get('/', [HistoryRequestCodeController::class, 'getAllCodeRequest']);
  });
  Route::group(['prefix' => 'participant-list'], function () {
    Route::get('/', [ParticipantListController::class, 'getAllParticipants']);
    Route::get('/{id}/download-link', [ParticipantListController::class, 'getStudentResultPDFDownloadLink']);
    Route::post('/', [ParticipantListController::class, 'store']);
  });
  Route::group(['prefix' => 'student-result'], function () {
    Route::get('/find-by-email/{student_email}', [ParticipantListController::class, 'getStudentResultByEmail']);
  });
  Route::group(['prefix' => 'exam-code-psikotes'], function () {
    Route::get('/{id}/download-link', [ExamCodeInterestAndTalentController::class, 'downloadResult']);
  });
});

Route::group(['prefix' => 'generate-result'], function () {
  Route::get("/student/{student_id}/ptk/pdf-report-link", [GenerateResultController::class, 'getStudentPTKReportPDFLink']);
  Route::get("/student/{student_id}/ptk/pdf-resume-link", [GenerateResultController::class, 'getStudentPTKResumePDFLink']);
  Route::post("/pdf-performa-kelas", [GenerateResultController::class, 'getPerformaKelasPDFLink']);
  Route::get("/pdf-performa-kelas/{file_name}", [GenerateResultController::class, 'streamPerformaKelasPDFDocument']);
  Route::get("/pdf-student-progress-report/{file_name}", [GenerateResultController::class, 'streamStudentProgressReportPDFDocument']);
  Route::get("/pdf-student-uka-stage-report/{file_name}", [GenerateResultController::class, 'streamStudentUKAStageReportPDFDocument']);
});

Route::group(['prefix' => 'ws'], function () {
  Route::post("/login", [PusherController::class, 'login']);
  Route::post("/authorize", [PusherController::class, 'authorizeUser']);
  Route::post("/webhook", [PusherController::class, 'handleWebhook']);
});

Route::group(['prefix' => 'student-progress-report'], function () {
  Route::get('/student/{student_id}/profile', [StudentReportController::class, 'getStudentProfile']);
  Route::get(
    '/student/{student_id}/program/{program}',
    [StudentReportController::class, 'getStudentProgressReports']
  );
  Route::post(
    '/student/{student_id}/program/{program}/document-link',
    [StudentReportController::class, 'generateStudentProgressReportsDocumentLink']
  );
  Route::post(
    '/multiple-student/document-link',
    [StudentReportController::class, 'generateMultipleStudentsProgressReportsDocumentLinks']
  );
  Route::post('/send', [StudentReportController::class, 'sendStudentProgressReport']);
});

Route::group(['prefix' => 'student-uka-report'], function () {
  Route::post(
    '/document-link',
    [StudentReportController::class, 'generateStudentUkaReportsDocumentLink']
  );
  Route::post('/multiple-student/document-link', [StudentReportController::class, 'generateMultipleStudentsUkaReportsDocumentLinks']);
  Route::post('/send', [StudentReportController::class, 'sendStudentUkaReport']);
});

Route::group(['prefix' => 'classroom-report'], function () {
  Route::get('/branches', [ClassroomReportController::class, 'getBranches']);
  Route::get('/branches/{branchCode}/classrooms', [ClassroomReportController::class, 'getBranchClassrooms']);
  Route::get(
    '/branches/{branchCode}/classrooms/{classroomId}/reports',
    [ClassroomReportController::class, 'getClassroomReports']
  );
});

Route::group(['prefix' => 'student-pre-post-test-report'], function () {
  Route::get(
    "/summary/{student_id}/{program}",
    [StudentPrePostTestReportController::class, 'getSummaryByStudentIDAndProgram']
  );
});

Route::group(['prefix' => 'student-presence-report'], function () {
  Route::get("/summary/{student_id}", [StudentPresenceController::class, 'getSummaryByStudentID']);
});

Route::group(['prefix' => 'samapta'], function () {
  Route::group(['prefix' => 'students'], function () {
    Route::get('/', [SamaptaController::class, 'getAllStudents']);
    Route::get('/classroom', [SamaptaController::class, 'getAllClassroom']);
    Route::get('/classroom/{id}', [SamaptaController::class, 'getStudentByClassroomId']);
    Route::get('/classroom-by-id/{id}', [SamaptaController::class, 'getClassroomById']);
    Route::get('/session-classroom/{id}', [SamaptaController::class, 'getGroupSessionByClassroomId']);
    Route::get('/session/{id}', [SamaptaController::class, 'getSessionByClassroomId']);
    Route::get('/session/{year}/type/{type}', [SamaptaController::class, 'getStudentBySelectionTypeAndSelectionYear']);
    Route::get('/student-session/{id}/gender/{gender}/classroom/{classId}', [SamaptaController::class, 'getStudentBySessionId']);
    Route::get('/student/{id}/gender/{gender}', [SamaptaController::class, 'getStudentBySessionIdAndGender']);
    Route::get('/student-sort/{id}/gender/{gender}/sort/{sort}', [SamaptaController::class, 'getStudentBySessionIdAndGenderWithSort']);
    Route::get('/student-by-smartbtw/{id}', [SamaptaController::class, 'getStudentBySmartbtwId']);
    Route::post('/create', [SamaptaController::class, 'createSession']);
    Route::put('/update/{sessionId}', [SamaptaController::class, 'updateSession']);
    Route::post('/download-group-record/{sessionId}', [SamaptaController::class, 'generatePDFGroupReport']);
    Route::post('/download-group-record-bulk/{classId}', [SamaptaController::class, 'generatePDFGroupReportBulk']);
    Route::post('/download-ranking/{type}/year/{year}', [SamaptaController::class, 'generatePDFRankingsGlobal']);
    Route::post('/download-student-ranking/{id}', [SamaptaController::class, 'generatePDFStudentSamaptaSingle']);
    Route::post('/download-student-ranking-bulk/{id}', [SamaptaController::class, 'generatePDFStudentSamaptaBulk']);
    Route::get('/chart/{id}/type/{type}', [SamaptaController::class, 'getChartBySmartbtwId']);
  });
});

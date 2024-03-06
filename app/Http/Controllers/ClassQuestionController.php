<?php

namespace App\Http\Controllers;

use App\Helpers\UserRole;
use App\Services\ExamService\QuestionCategory;
use App\Services\ExamService\SubQuestionCategory;
use App\Services\ExamService\Exam;
use App\Services\ExamService\Module;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ClassQuestionController extends Controller
{
  private QuestionCategory $examQuestionCategoryService;
  private SubQuestionCategory $examSubQuestionCategoryService;
  private Exam $examQuestionService;
  private Module $examModuleService;

  public function __construct(
    QuestionCategory $examQuestionCategoryService,
    SubQuestionCategory $examSubQuestionCategoryService,
    Exam $examQuestionService,
    Module $examModuleService
  )
  {
    $this->examQuestionCategoryService = $examQuestionCategoryService;
    $this->examSubQuestionCategoryService = $examSubQuestionCategoryService;
    $this->examQuestionService = $examQuestionService;
    $this->examModuleService = $examModuleService;
  }

  public function showSubCategoryModules(Request $request, $test_type, $program, $question_category)
  {
    // Validate test type route param value
    $validTestTypes = ["pre-test", "post-test"];
    $lowerCasedTestType = strtolower($test_type);
    if(!in_array($lowerCasedTestType, $validTestTypes)) abort(404);

    // Validate program route param value
    $validPrograms = ["skd", "utbk"];
    $lowerCasedProgram = strtolower($program);
    if(!in_array($lowerCasedProgram, $validPrograms)) abort(404);

    // Validate question category route param value
    $validQuestionCategories = [
      "TWK", "TIU", "TKP", // SKD
      "penalaran-umum", "pengetahuan-umum", "pemahaman-bacaan", "pengetahuan-kuantitatif", "literasi-bahasa-indonesia", "literasi-bahasa-inggris", "penalaran-matematika" // UTBK-SNBT
    ];
    $upperCasedQuestionCategory = strtoupper($question_category);
    if($program === "skd") $isQuestionCategoryInvalid = !in_array($upperCasedQuestionCategory, $validQuestionCategories);
    else $isQuestionCategoryInvalid = !in_array($question_category, $validQuestionCategories);
    if($isQuestionCategoryInvalid) abort(404);

    // Get program's question categories
    $questionCategoriesResponse = $this->examQuestionCategoryService->get($lowerCasedProgram);
    $questionCategoriesBody = json_decode($questionCategoriesResponse->body())?->data ?? [];
    if(count($questionCategoriesBody) === 0) {
      Log::error("Cannot get $test_type class sub category modules", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'response' => $questionCategoriesBody,
        'message' => 'Could not found question category data from exam service'
      ]);
      abort(404);
    }

    // Make sure mentor have rights to proceed further
    $isMentor = UserRole::isMentor();
    $sluggifiedQuestionCategory = Str::slug($question_category, "_");
    if($isMentor) {
      $mentorRoles = Auth::user()->roles;
      $permittedQuestionCategories = array_map(function($role) {
        $explodedRoleString = explode("mentor_", $role);
        return isset($explodedRoleString[1]) ? $explodedRoleString[1] : null;
      }, $mentorRoles);
      $permittedQuestionCategories = array_values(array_filter($permittedQuestionCategories, function($role) {
        return $role !== null;
      }));
      $isNotAuthorized = $program === "skd"
        ? !in_array($question_category, $permittedQuestionCategories)
        : !in_array($sluggifiedQuestionCategory, $permittedQuestionCategories);
      if($isNotAuthorized) {
        // Log::error("Cannot get $test_type training questions data", [
        //   'user_id' => Auth::user()->id,
        //   "user_roles" => Auth::user()->roles,
        //   "permitted_question_categories" => $permittedQuestionCategories,
        //   "current_question_category" => $question_category,
        //   'current_office_path' => $request->getRequestUri(),
        //   'message' => "User doesn't have the priviliege to proceed further"
        // ]);
        $request->session()->flash('flash-message', [
          "title" => "Peringatan",
          "type" => "warning",
          "message" => "Anda tidak memiliki hak akses pada halaman ini"
        ]);
        return redirect("/home");
      }
    }

    // Get $question_category param value's question category data
    $sluggifiedQuestionCategory = Str::slug($question_category, "_");
    if($program === "skd") $questionCategory = collect($questionCategoriesBody)->where('category', $upperCasedQuestionCategory)->first();
    else $questionCategory = collect($questionCategoriesBody)->where('category', $sluggifiedQuestionCategory)->first();

    if(!$questionCategory) {
      $errorMessage = $program === "skd"
        ? "Question category $upperCasedQuestionCategory was not found on exam service"
        : "Question category $sluggifiedQuestionCategory was not found on exam service";

      Log::error("Cannot get $test_type class sub category modules", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'message' => $errorMessage
      ]);
      abort(404);
    }

    // $subQuestionCategoriesResponse = $this->examSubQuestionCategoryService->get();
    // $subQuestionCategoriesBody = json_decode($subQuestionCategoriesResponse->body())?->data ?? [];
    // if(count($subQuestionCategoriesBody) === 0) {
    //   Log::error("Cannot get $test_type training sub category modules", [
    //     'user_id' => Auth::user()->id,
    //     'current_office_path' => $request->getRequestUri(),
    //     'response' => $subQuestionCategoriesBody,
    //     'message' => 'Could not found sub question category data from exam service'
    //   ]);
    //   abort(404);
    // }

    $moduleCodes = $test_type === "pre-test" ? $this->getPreTestModuleCodes() : $this->getPostTestModuleCodes();
    if($program === "skd") {
      $subQuestionCategories = $test_type === "pre-test"
        ? $this->getPreTestSubCategoryModules($upperCasedQuestionCategory)
        : $this->getPostTestSubCategoryModules($upperCasedQuestionCategory);
    }
    else {
      $subQuestionCategories = $test_type === "pre-test"
        ? $this->getPreTestSubCategoryModules($sluggifiedQuestionCategory)
        : $this->getPostTestSubCategoryModules($sluggifiedQuestionCategory);
    }
    $testTypeTitle = ucwords(str_replace('-', ' ', $lowerCasedTestType));
    $testTypeTitle = str_replace(' ', '-', $testTypeTitle);

    $programBreadcrumbs = [
      "skd" => [
        [
          "name" => "Modul Soal Kelas $testTypeTitle - $upperCasedQuestionCategory",
          "link" => null
        ]
      ],
      "utbk" => [
        [
          "name" => "Modul Soal Kelas $testTypeTitle - " . ucwords(str_replace('-', ' ', $question_category)),
          "link" => null
        ]
      ],
    ];
    $breadcrumbs = $programBreadcrumbs[$program];

    return view('/pages/class-question/sub-category-modules', compact(
      'breadcrumbs', 'subQuestionCategories', 'testTypeTitle', 'upperCasedQuestionCategory',
      'test_type', 'program', 'question_category', 'sluggifiedQuestionCategory'
    ));
  }

  public function showQuestions(Request $request, $test_type, $program, $question_category, $module_code)
  {
    // Validate test type route param value
    $validTestTypes = ["pre-test", "post-test"];
    $lowerCasedTestType = strtolower($test_type);
    if(!in_array($lowerCasedTestType, $validTestTypes)) abort(404);

    // Validate program route param value
    $validPrograms = ["skd", "utbk"];
    $lowerCasedProgram = strtolower($program);
    if(!in_array($lowerCasedProgram, $validPrograms)) abort(404);

    // Validate question category route param value
    $validQuestionCategories = [
      "TWK", "TIU", "TKP", // SKD
      "penalaran-umum", "pengetahuan-umum", "pemahaman-bacaan", "pengetahuan-kuantitatif", "literasi-bahasa-indonesia", "literasi-bahasa-inggris", "penalaran-matematika" // UTBK-SNBT
    ];
    $upperCasedQuestionCategory = strtoupper($question_category);
    if($program === "skd") $isQuestionCategoryInvalid = !in_array($upperCasedQuestionCategory, $validQuestionCategories);
    else $isQuestionCategoryInvalid = !in_array($question_category, $validQuestionCategories);
    if($isQuestionCategoryInvalid) abort(404);

    // Validate module codes
    $validModuleCodes = $test_type === "pre-test" ? $this->getPreTestModuleCodes() : $this->getPostTestModuleCodes();
    if(!in_array($module_code, $validModuleCodes)) {
      Log::error("Cannot get $test_type class questions data", [
        'user_id' => Auth::user()->id,
        'valid_module_codes' => $validModuleCodes,
        'current_office_path' => $request->getRequestUri(),
        'message' => 'Module code is not valid'
      ]);
      abort(404);
    }

    // Get module data by module code
    $moduleResponse = $this->examModuleService->getByModuleCode($module_code);
    $moduleBody = json_decode($moduleResponse->body())?->data ?? null;
    if(!$moduleBody) {
      Log::error("Cannot get $test_type class questions data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'response' => $moduleBody,
        'message' => 'Could not found module data from exam service'
      ]);
      abort(404);
    }
    if($moduleBody->program !== $program) {
      Log::error("Cannot get $test_type class questions data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'message' => "Module code doesn't match with program"
      ]);
      abort(404);
    }

    // Get program's question categories
    $questionCategoriesResponse = $this->examQuestionCategoryService->get($lowerCasedProgram);
    $questionCategoriesBody = json_decode($questionCategoriesResponse->body())?->data ?? [];
    if(count($questionCategoriesBody) === 0) {
      Log::error("Cannot get $test_type class questions data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'response' => $questionCategoriesBody,
        'message' => 'Could not found question category data from exam service'
      ]);
      abort(404);
    }

    // Make sure mentor have rights to proceed further
    $isMentor = UserRole::isMentor();
    $sluggifiedQuestionCategory = Str::slug($question_category, "_");
    if($isMentor) {
      $mentorRoles = Auth::user()->roles;
      $permittedQuestionCategories = array_map(function($role) {
        $explodedRoleString = explode("mentor_", $role);
        return isset($explodedRoleString[1]) ? $explodedRoleString[1] : null;
      }, $mentorRoles);
      $permittedQuestionCategories = array_values(array_filter($permittedQuestionCategories, function($role) {
        return $role !== null;
      }));
      $isNotAuthorized = $program === "skd"
        ? !in_array($question_category, $permittedQuestionCategories)
        : !in_array($sluggifiedQuestionCategory, $permittedQuestionCategories);
      if($isNotAuthorized) {
        // Log::error("Cannot get $test_type training questions data", [
        //   'user_id' => Auth::user()->id,
        //   "user_roles" => Auth::user()->roles,
        //   "permitted_question_categories" => $permittedQuestionCategories,
        //   "current_question_category" => $question_category,
        //   'current_office_path' => $request->getRequestUri(),
        //   'message' => "User doesn't have the priviliege to proceed further"
        // ]);
        $request->session()->flash('flash-message', [
          "title" => "Peringatan",
          "type" => "warning",
          "message" => "Anda tidak memiliki hak akses pada halaman ini"
        ]);
        return redirect("/home");
      }
    }

    // Get $question_category param value's question category data
    $sluggifiedQuestionCategory = Str::slug($question_category, "_");
    if($program === "skd") $questionCategory = collect($questionCategoriesBody)->where('category', $upperCasedQuestionCategory)->first();
    else $questionCategory = collect($questionCategoriesBody)->where('category', $sluggifiedQuestionCategory)->first();

    if(!$questionCategory) {
      $errorMessage = $program === "skd"
        ? "Question category $upperCasedQuestionCategory was not found on exam service"
        : "Question category $sluggifiedQuestionCategory was not found on exam service";

      Log::error("Cannot get $test_type class sub category modules", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'message' => $errorMessage
      ]);
      abort(404);
    }

    $subQuestionCategoriesResponse = $this->examSubQuestionCategoryService->getCategoryId($questionCategory->id);
    $subQuestionCategoriesBody = json_decode($subQuestionCategoriesResponse->body())?->data ?? [];
    if(count($subQuestionCategoriesBody) === 0) {
      Log::error("Cannot get $test_type class questions data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'response' => $subQuestionCategoriesBody,
        'message' => 'Could not found sub question category data from exam service'
      ]);
      abort(404);
    }
    $subCategoryId = $request->get('subcat_id') ?? null;
    $subQuestionCategory = collect($subQuestionCategoriesBody)->where('id', $subCategoryId)->first();
    if($program === "skd" && !$subQuestionCategory) {
      Log::error("Cannot get $test_type training questions data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'message' => "Sub category data with id: $subCategoryId was not found"
      ]);
      abort(404);
    }

    $questionsResponse = $this->examQuestionService->get(null, null, '', '', $module_code, '', '', $questionCategory->id);
    $questionsBody = json_decode($questionsResponse->body())?->data ?? [];
    if($program === "skd") {
      $questions = collect($questionsBody)
        ->where('sub_category_questions_id', $subCategoryId)
        ->sortBy('id')
        ->values()
        ->toArray();
      $subCategoryModules = $test_type === "pre-test"
        ? $this->getPreTestSubCategoryModules($upperCasedQuestionCategory)
        : $this->getPostTestSubCategoryModules($upperCasedQuestionCategory);
      $subCategoryModule = collect($subCategoryModules)->where('sub_category_id', $subCategoryId)->where('module_code', $module_code)->first();
    } else {
      $questions = collect($questionsBody)
        ->sortBy('id')
        ->values()
        ->toArray();
      $subCategoryModules = $test_type === "pre-test"
        ? $this->getPreTestSubCategoryModules($sluggifiedQuestionCategory)
        : $this->getPostTestSubCategoryModules($sluggifiedQuestionCategory);
      $subCategoryModule = null;
    }

    $testTypeTitle = ucwords(str_replace('-', ' ', $lowerCasedTestType));
    $testTypeTitle = str_replace(' ', '-', $testTypeTitle);
    $programBreadcrumbs = [
      "skd" => [
        [
          "name" => "Modul Soal Kelas $testTypeTitle  - $upperCasedQuestionCategory",
          "link" => "/soal-kelas/$test_type/$program/$question_category"
        ],
        [
          "name" => "Soal " . $subCategoryModule?->title ?? "",
          "link" => null
        ],
      ],
      "utbk" => [
        [
          "name" => "Modul Soal Kelas $testTypeTitle - " . ucwords(str_replace('-', ' ', $question_category)),
          "link" => "/soal-kelas/$test_type/$program/$question_category"
        ],
        [
          "name" => "Soal " . ucwords(str_replace('-', ' ', $question_category)),
          "link" => null
        ]
      ],
    ];
    $breadcrumbs = $programBreadcrumbs[$program];
    $authUserId = Auth::user()->id;
    $authUserName = Auth::user()->name;
    return view('/pages/class-question/question', compact(
      'breadcrumbs', 'questions', 'testTypeTitle', 'upperCasedQuestionCategory',
      'subQuestionCategory', 'test_type', 'program', 'question_category', 'module_code',
      'authUserId', 'authUserName', 'subCategoryModule'
    ));
  }

  public function showExplanation(Request $request, $test_type, $program, $question_category, $module_code, $question_id)
  {
    // Validate test type route param value
    $validTestTypes = ["pre-test", "post-test"];
    $lowerCasedTestType = strtolower($test_type);
    if(!in_array($lowerCasedTestType, $validTestTypes)) abort(404);

    // Validate program route param value
    $validPrograms = ["skd", "utbk"];
    $lowerCasedProgram = strtolower($program);
    if(!in_array($lowerCasedProgram, $validPrograms)) abort(404);

    // Validate question category route param value
    $validQuestionCategories = [
      "TWK", "TIU", "TKP", // SKD
      "penalaran-umum", "pengetahuan-umum", "pemahaman-bacaan", "pengetahuan-kuantitatif", "literasi-bahasa-indonesia", "literasi-bahasa-inggris", "penalaran-matematika" // UTBK-SNBT
    ];
    $upperCasedQuestionCategory = strtoupper($question_category);
    if($program === "skd") $isQuestionCategoryInvalid = !in_array($upperCasedQuestionCategory, $validQuestionCategories);
    else $isQuestionCategoryInvalid = !in_array($question_category, $validQuestionCategories);
    if($isQuestionCategoryInvalid) abort(404);

    // Validate module codes
    $validModuleCodes = $test_type === "pre-test" ? $this->getPreTestModuleCodes() : $this->getPostTestModuleCodes();
    if(!in_array($module_code, $validModuleCodes)) {
      Log::error("Cannot get $test_type class module explanation data", [
        'user_id' => Auth::user()->id,
        'valid_module_codes' => $validModuleCodes,
        'current_office_path' => $request->getRequestUri(),
        'message' => 'Module code is not valid'
      ]);
      abort(404);
    }

    // Get module data by module code
    $moduleResponse = $this->examModuleService->getByModuleCode($module_code);
    $moduleBody = json_decode($moduleResponse->body())?->data ?? null;
    if(!$moduleBody) {
      Log::error("Cannot get $test_type class module explanation data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'response' => $moduleBody,
        'message' => 'Could not found module data from exam service'
      ]);
      abort(404);
    }
    if($moduleBody->program !== $program) {
      Log::error("Cannot get $test_type class module explanation data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'message' => "Module code doesn't match with program"
      ]);
      abort(404);
    }

    // Get program's question categories
    $questionCategoriesResponse = $this->examQuestionCategoryService->get($lowerCasedProgram);
    $questionCategoriesBody = json_decode($questionCategoriesResponse->body())?->data ?? [];
    if(count($questionCategoriesBody) === 0) {
      Log::error("Cannot get $test_type class module explanation data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'response' => $questionCategoriesBody,
        'message' => 'Could not found question category data from exam service'
      ]);
      abort(404);
    }

    // Make sure mentor have rights to proceed further
    $isMentor = UserRole::isMentor();
    $sluggifiedQuestionCategory = Str::slug($question_category, "_");
    if($isMentor) {
      $mentorRoles = Auth::user()->roles;
      $permittedQuestionCategories = array_map(function($role) {
        $explodedRoleString = explode("mentor_", $role);
        return isset($explodedRoleString[1]) ? $explodedRoleString[1] : null;
      }, $mentorRoles);
      $permittedQuestionCategories = array_values(array_filter($permittedQuestionCategories, function($role) {
        return $role !== null;
      }));
      $isNotAuthorized = $program === "skd"
        ? !in_array($question_category, $permittedQuestionCategories)
        : !in_array($sluggifiedQuestionCategory, $permittedQuestionCategories);
      if($isNotAuthorized) {
        // Log::error("Cannot get $test_type training questions data", [
        //   'user_id' => Auth::user()->id,
        //   "user_roles" => Auth::user()->roles,
        //   "permitted_question_categories" => $permittedQuestionCategories,
        //   "current_question_category" => $question_category,
        //   'current_office_path' => $request->getRequestUri(),
        //   'message' => "User doesn't have the priviliege to proceed further"
        // ]);
        $request->session()->flash('flash-message', [
          "title" => "Peringatan",
          "type" => "warning",
          "message" => "Anda tidak memiliki hak akses pada halaman ini"
        ]);
        return redirect("/home");
      }
    }

    // Get $question_category param value's question category data
    $sluggifiedQuestionCategory = Str::slug($question_category, "_");
    if($program === "skd") $questionCategory = collect($questionCategoriesBody)->where('category', $upperCasedQuestionCategory)->first();
    else $questionCategory = collect($questionCategoriesBody)->where('category', $sluggifiedQuestionCategory)->first();

    if(!$questionCategory) {
      $errorMessage = $program === "skd"
        ? "Question category $upperCasedQuestionCategory was not found on exam service"
        : "Question category $sluggifiedQuestionCategory was not found on exam service";

      Log::error("Cannot get $test_type class sub category modules", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'message' => $errorMessage
      ]);
      abort(404);
    }

    $questionCode = "CODE-" . $question_id;
    $encryptedQuestionId = $request->has('qid') ? str_replace('%3D', '=', urlencode($request->qid)) : null;
    if(!$encryptedQuestionId) {
      Log::error("Could not encrypt text $questionCode, please make sure the questionId is not null ", [
        'user_id' => Auth::user()->id,
        'success' => false,
        'message' => 'Could not get encrypted question ID',
        'current_office_path' => $request->getRequestUri()
      ]);
    }

    $encryptedUserId = $request->has('mid') ? str_replace('%3D', '=', urlencode($request->mid)) : null;
    if(!$encryptedUserId) {
      Log::error("Could not get encrypted text of auth user id, please make sure the auth user id is not null ", [
        'user_id' => Auth::user()->id,
        'success' => false,
        'message' => 'Could not get encrypted auth user id',
        'current_office_path' => $request->getRequestUri()
      ]);

      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $encryptedUserName = $request->has('mnm') ? str_replace('%3D', '=', urlencode($request->mnm)) : null;
    if(!$encryptedUserName) {
      Log::error("Could not get encrypted text of auth user id, please make sure the auth user id is not null ", [
        'user_id' => Auth::user()->id,
        'success' => false,
        'message' => 'Could not get encrypted auth user id',
        'current_office_path' => $request->getRequestUri()
      ]);

      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $edutechProgram = $program === "skd" ? "ptk" : ($program === "utbk" ? "ptn" : null);
    if(!$edutechProgram) {
      Log::error("Cannot get $test_type class module explanation data", [
        'user_id' => Auth::user()->id,
        'success' => false,
        'message' => 'Any other program except ptk is not supported at the moment',
        'current_office_path' => $request->getRequestUri()
      ]);

      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }
    $explanationHost = env('APP_ENV') == 'dev' ? 'https://app-edutech.btwazure.com' : 'https://app.btwedutech.com';
    $iframeLink = "$explanationHost/pembahasan/" . strtolower($edutechProgram) . "/" . $encryptedQuestionId . "?mid=$encryptedUserId&mnm=$encryptedUserName";
    return view('/pages/class-question/explanation', compact(
      'iframeLink', 'question_id'
    ));
  }

  private function getPreTestSubCategoryModules($question_category)
  {
    $modules = (object)[
      "TWK" => [
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1041,
          "title" => "Nasionalisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1041",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1043,
          "title" => "Nasionalisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1043",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1044,
          "title" => "Nasionalisme - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1044",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1045,
          "title" => "Nasionalisme - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1045",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1046,
          "title" => "Integritas - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1046",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1047,
          "title" => "Integritas - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1047",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1048,
          "title" => "Integritas - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1048",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1049,
          "title" => "Integritas - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1049",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1050,
          "title" => "Bela Negara - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1050",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1051,
          "title" => "Bela Negara - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1051",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1052,
          "title" => "Bela Negara - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1052",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1053,
          "title" => "Bela Negara - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1053",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1034,
          "title" => "Pilar Negara - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1034",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1035,
          "title" => "Pilar Negara - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1035",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1036,
          "title" => "Pilar Negara - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1036",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1037,
          "title" => "Pilar Negara - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1037",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 151 : 1038,
          "title" => "Pilar Negara - Pertemuan 5",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-151" : "MD-SKD-1038",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 1 : 1,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1039,
          "title" => "Bahasa Indonesia - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1039",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 1 : 1,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1040,
          "title" => "Bahasa Indonesia - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1040",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 1 : 1,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1042,
          "title" => "Bahasa Indonesia - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1042",
        ],
      ],
      "TIU" => [
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 3 : 13,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1324,
          "title" => "Verbal Analogi - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1324",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 3 : 13,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1325,
          "title" => "Verbal Analogi - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1325",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 16 : 6,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1327,
          "title" => "Verbal Silogisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1327",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 16 : 6,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1328,
          "title" => "Verbal Silogisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1328",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 26 : 15,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1320,
          "title" => "Verbal Analitis - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1320",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 26 : 15,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1321,
          "title" => "Verbal Analitis - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1321",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 26 : 15,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1322,
          "title" => "Verbal Analitis - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1322",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1303,
          "title" => "Numerik Berhitung - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1303",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1304,
          "title" => "Numerik Berhitung - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1304",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1305,
          "title" => "Numerik Berhitung - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1305",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 161 : 1306,
          "title" => "Numerik Berhitung - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-161" : "MD-SKD-1306",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 18 : 8,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1313,
          "title" => "Numerik Deret - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1313",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 18 : 8,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1314,
          "title" => "Numerik Deret - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1314",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 28 : 12,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1316,
          "title" => "Numerik Perbandingan - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1316",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 28 : 12,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1317,
          "title" => "Numerik Perbandingan - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1317",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 28 : 12,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1318,
          "title" => "Numerik Perbandingan - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1318",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1308,
          "title" => "Numerik Soal Cerita - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1308",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1309,
          "title" => "Numerik Soal Cerita - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1309",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1310,
          "title" => "Numerik Soal Cerita - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1310",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 161 : 1311,
          "title" => "Numerik Soal Cerita - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-161" : "MD-SKD-1311",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 19 : 10,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1265,
          "title" => "Figural Analogi - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1265",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 19 : 10,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1266,
          "title" => "Figural Analogi - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1266",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 30 : 9,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1300,
          "title" => "Figural Serial - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1300",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 30 : 9,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1301,
          "title" => "Figural Serial - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1301",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 17 : 7,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1268,
          "title" => "Figural Ketidaksamaan - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1268",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 17 : 7,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1298,
          "title" => "Figural Ketidaksamaan - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1298",
        ],
      ],
      "TKP" => [
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 21 : 17,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1069,
          "title" => "Pelayanan Publik - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1069",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 21 : 17,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1070,
          "title" => "Pelayanan Publik - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1070",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 21 : 17,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1072,
          "title" => "Pelayanan Publik - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1072",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 20 : 16,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1080,
          "title" => "Jejaring Kerja - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1080",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 20 : 16,
          "module_id" => env('APP_ENV') === "dev" ? 116  : 1082,
          "title" => "Jejaring Kerja - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1082",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 20 : 16,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1101,
          "title" => "Jejaring Kerja - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1101",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 23 : 19,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1075,
          "title" => "Sosial Budaya - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1075",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 23 : 19,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1076,
          "title" => "Sosial Budaya - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1076",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 23 : 19,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1078,
          "title" => "Sosial Budaya - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1078",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 22 : 18,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1073,
          "title" => "Profesionalisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1073",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 22 : 18,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1074,
          "title" => "Profesionalisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1074",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 22 : 18,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1077,
          "title" => "Profesionalisme - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1077",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 24 : 20,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1067,
          "title" => "TIK - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1067",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 24 : 20,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1068,
          "title" => "TIK - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1068",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 24 : 20,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1071,
          "title" => "TIK - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1071",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 25 : 21,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1079,
          "title" => "Antiradikalisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1079",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 25 : 21,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1081,
          "title" => "Antiradikalisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1081",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 25 : 21,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1100,
          "title" => "Antiradikalisme - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1100",
        ],
      ],
      "penalaran_umum" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 208 : 1352,
          "title" => "Penalaran Umum - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-208" : "MD-UTBK-1352",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 209 : 1353,
          "title" => "Penalaran Umum - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-209" : "MD-UTBK-1353",
        ]
      ],
      "pengetahuan_umum" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 210 : 1360,
          "title" => "Pengetahuan dan Pemahaman Umum - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-210" : "MD-UTBK-1360",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 211 : 1361,
          "title" => "Pengetahuan dan Pemahaman Umum - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-211" : "MD-UTBK-1361",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 212 : 1362,
          "title" => "Pengetahuan dan Pemahaman Umum - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-212" : "MD-UTBK-1362",
        ]
      ],
      "pemahaman_bacaan" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 213 : 1343,
          "title" => "Pemahaman Bacaan dan Menulis - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-213" : "MD-UTBK-1343",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 214 : 1344,
          "title" => "Pemahaman Bacaan dan Menulis - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-214" : "MD-UTBK-1344",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 215 : 1345,
          "title" => "Pemahaman Bacaan dan Menulis - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-215" : "MD-UTBK-1345",
        ]
      ],
      "pengetahuan_kuantitatif" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 216 : 1354,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-216" : "MD-UTBK-1354",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 217 : 1355,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-217" : "MD-UTBK-1355",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 218 : 1356,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-218" : "MD-UTBK-1356",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 219 : 1357,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-219" : "MD-UTBK-1357",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 220 : 1358,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-220" : "MD-UTBK-1358",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 221 : 1359,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-221" : "MD-UTBK-1359",
        ]
      ],
      "literasi_bahasa_indonesia" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 222 : 1331,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-222" : "MD-UTBK-1331",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 223 : 1332,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-223" : "MD-UTBK-1332",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 224 : 1333,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-224" : "MD-UTBK-1333",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 225 : 1334,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-225" : "MD-UTBK-1334",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 226 : 1335,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-226" : "MD-UTBK-1335",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 227 : 1336,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-227" : "MD-UTBK-1336",
        ]
      ],
      "literasi_bahasa_inggris" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 228 : 1337,
          "title" => "Literasi Bahasa Inggris - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-228" : "MD-UTBK-1337",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 229 : 1338,
          "title" => "Literasi Bahasa Inggris - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-229" : "MD-UTBK-1338",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 230 : 1339,
          "title" => "Literasi Bahasa Inggris - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-230" : "MD-UTBK-1339",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 231 : 1340,
          "title" => "Literasi Bahasa Inggris - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-231" : "MD-UTBK-1340",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 232 : 1341,
          "title" => "Literasi Bahasa Inggris - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-232" : "MD-UTBK-1341",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 233 : 1342,
          "title" => "Literasi Bahasa Inggris - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-233" : "MD-UTBK-1342",
        ]
      ],
      "penalaran_matematika" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 234 : 1346,
          "title" => "Penalaran Matematika - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-234" : "MD-UTBK-1346",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 235 : 1347,
          "title" => "Penalaran Matematika - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-235" : "MD-UTBK-1347",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 236 : 1348,
          "title" => "Penalaran Matematika - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-236" : "MD-UTBK-1348",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 237 : 1349,
          "title" => "Penalaran Matematika - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-237" : "MD-UTBK-1349",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 238 : 1350,
          "title" => "Penalaran Matematika - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-238" : "MD-UTBK-1350",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 239 : 1351,
          "title" => "Penalaran Matematika - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-239" : "MD-UTBK-1351",
        ]
      ]
    ];
    return $modules->{$question_category};
  }

  private function getPostTestSubCategoryModules($question_category)
  {
    $modules = (object)[
      "TWK" => [
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1041,
          "title" => "Nasionalisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1041",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1043,
          "title" => "Nasionalisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1043",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1044,
          "title" => "Nasionalisme - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1044",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 14 : 2,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1045,
          "title" => "Nasionalisme - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1045",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1046,
          "title" => "Integritas - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1046",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1047,
          "title" => "Integritas - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1047",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1048,
          "title" => "Integritas - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1048",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 4,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1049,
          "title" => "Integritas - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1049",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1050,
          "title" => "Bela Negara - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1050",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1051,
          "title" => "Bela Negara - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1051",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1052,
          "title" => "Bela Negara - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1052",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 15 : 5,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1053,
          "title" => "Bela Negara - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1053",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1034,
          "title" => "Pilar Negara - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1034",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1035,
          "title" => "Pilar Negara - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1035",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1036,
          "title" => "Pilar Negara - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1036",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 161 : 1037,
          "title" => "Pilar Negara - Pertemuan 4",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-161" : "MD-SKD-1037",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 13 : 3,
          "module_id" => env('APP_ENV') === 'dev' ? 151 : 1038,
          "title" => "Pilar Negara - Pertemuan 5",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-151" : "MD-SKD-1038",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 1 : 1,
          "module_id" => env('APP_ENV') === 'dev' ? 156 : 1039,
          "title" => "Bahasa Indonesia - Pertemuan 1",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-156" : "MD-SKD-1039",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 1 : 1,
          "module_id" => env('APP_ENV') === 'dev' ? 116 : 1040,
          "title" => "Bahasa Indonesia - Pertemuan 2",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-116" : "MD-SKD-1040",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === 'dev' ? 1 : 1,
          "module_id" => env('APP_ENV') === 'dev' ? 165 : 1042,
          "title" => "Bahasa Indonesia - Pertemuan 3",
          "module_code" => env('APP_ENV') === 'dev' ? "MD-SKD-165" : "MD-SKD-1042",
        ],
      ],
      "TIU" => [
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 3 : 13,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1324,
          "title" => "Verbal Analogi - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1324",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 3 : 13,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1325,
          "title" => "Verbal Analogi - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1325",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 16 : 6,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1327,
          "title" => "Verbal Silogisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1327",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 16 : 6,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1328,
          "title" => "Verbal Silogisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1328",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 26 : 15,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1320,
          "title" => "Verbal Analitis - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1320",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 26 : 15,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1321,
          "title" => "Verbal Analitis - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1321",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 26 : 15,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1322,
          "title" => "Verbal Analitis - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1322",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1303,
          "title" => "Numerik Berhitung - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1303",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1304,
          "title" => "Numerik Berhitung - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1304",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1305,
          "title" => "Numerik Berhitung - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1305",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 29 : 11,
          "module_id" => env('APP_ENV') === "dev" ? 161 : 1306,
          "title" => "Numerik Berhitung - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-161" : "MD-SKD-1306",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 18 : 8,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1313,
          "title" => "Numerik Deret - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1313",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 18 : 8,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1314,
          "title" => "Numerik Deret - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1314",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 28 : 12,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1316,
          "title" => "Numerik Perbandingan - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1316",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 28 : 12,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1317,
          "title" => "Numerik Perbandingan - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1317",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 28 : 12,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1318,
          "title" => "Numerik Perbandingan - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1318",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1308,
          "title" => "Numerik Soal Cerita - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1308",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1309,
          "title" => "Numerik Soal Cerita - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1309",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1310,
          "title" => "Numerik Soal Cerita - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1310",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 27 : 14,
          "module_id" => env('APP_ENV') === "dev" ? 161 : 1311,
          "title" => "Numerik Soal Cerita - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-161" : "MD-SKD-1311",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 19 : 10,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1265,
          "title" => "Figural Analogi - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1265",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 19 : 10,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1266,
          "title" => "Figural Analogi - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1266",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 30 : 9,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1300,
          "title" => "Figural Serial - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1300",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 30 : 9,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1301,
          "title" => "Figural Serial - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1301",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 17 : 7,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1268,
          "title" => "Figural Ketidaksamaan - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1268",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 17 : 7,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1298,
          "title" => "Figural Ketidaksamaan - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1298",
        ],
      ],
      "TKP" => [
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 21 : 17,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1069,
          "title" => "Pelayanan Publik - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1069",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 21 : 17,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1070,
          "title" => "Pelayanan Publik - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1070",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 21 : 17,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1072,
          "title" => "Pelayanan Publik - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1072",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 20 : 16,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1080,
          "title" => "Jejaring Kerja - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1080",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 20 : 16,
          "module_id" => env('APP_ENV') === "dev" ? 116  : 1082,
          "title" => "Jejaring Kerja - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1082",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 20 : 16,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1101,
          "title" => "Jejaring Kerja - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1101",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 23 : 19,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1075,
          "title" => "Sosial Budaya - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1075",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 23 : 19,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1076,
          "title" => "Sosial Budaya - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1076",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 23 : 19,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1078,
          "title" => "Sosial Budaya - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1078",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 22 : 18,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1073,
          "title" => "Profesionalisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1073",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 22 : 18,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1074,
          "title" => "Profesionalisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1074",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 22 : 18,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1077,
          "title" => "Profesionalisme - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1077",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 24 : 20,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1067,
          "title" => "TIK - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1067",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 24 : 20,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1068,
          "title" => "TIK - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1068",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 24 : 20,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1071,
          "title" => "TIK - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1071",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 25 : 21,
          "module_id" => env('APP_ENV') === "dev" ? 156 : 1079,
          "title" => "Antiradikalisme - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-156" : "MD-SKD-1079",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 25 : 21,
          "module_id" => env('APP_ENV') === "dev" ? 116 : 1081,
          "title" => "Antiradikalisme - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-116" : "MD-SKD-1081",
        ],
        (object)[
          "sub_category_id" => env('APP_ENV') === "dev" ? 25 : 21,
          "module_id" => env('APP_ENV') === "dev" ? 165 : 1100,
          "title" => "Antiradikalisme - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-SKD-165" : "MD-SKD-1100",
        ],
      ],
      "penalaran_umum" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 208 : 1352,
          "title" => "Penalaran Umum - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-208" : "MD-UTBK-1352",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 209 : 1353,
          "title" => "Penalaran Umum - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-209" : "MD-UTBK-1353",
        ]
      ],
      "pengetahuan_umum" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 210 : 1360,
          "title" => "Pengetahuan dan Pemahaman Umum - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-210" : "MD-UTBK-1360",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 211 : 1361,
          "title" => "Pengetahuan dan Pemahaman Umum - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-211" : "MD-UTBK-1361",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 212 : 1362,
          "title" => "Pengetahuan dan Pemahaman Umum - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-212" : "MD-UTBK-1362",
        ]
      ],
      "pemahaman_bacaan" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 213 : 1343,
          "title" => "Pemahaman Bacaan dan Menulis - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-213" : "MD-UTBK-1343",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 214 : 1344,
          "title" => "Pemahaman Bacaan dan Menulis - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-214" : "MD-UTBK-1344",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 215 : 1345,
          "title" => "Pemahaman Bacaan dan Menulis - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-215" : "MD-UTBK-1345",
        ]
      ],
      "pengetahuan_kuantitatif" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 216 : 1354,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-216" : "MD-UTBK-1354",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 217 : 1355,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-217" : "MD-UTBK-1355",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 218 : 1356,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-218" : "MD-UTBK-1356",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 219 : 1357,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-219" : "MD-UTBK-1357",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 220 : 1358,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-220" : "MD-UTBK-1358",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 221 : 1359,
          "title" => "Pengetahuan Kuantitatif - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-221" : "MD-UTBK-1359",
        ]
      ],
      "literasi_bahasa_indonesia" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 222 : 1331,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-222" : "MD-UTBK-1331",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 223 : 1332,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-223" : "MD-UTBK-1332",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 224 : 1333,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-224" : "MD-UTBK-1333",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 225 : 1334,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-225" : "MD-UTBK-1334",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 226 : 1335,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-226" : "MD-UTBK-1335",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 227 : 1336,
          "title" => "Literasi Bahasa Indonesia - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-227" : "MD-UTBK-1336",
        ]
      ],
      "literasi_bahasa_inggris" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 228 : 1337,
          "title" => "Literasi Bahasa Inggris - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-228" : "MD-UTBK-1337",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 229 : 1338,
          "title" => "Literasi Bahasa Inggris - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-229" : "MD-UTBK-1338",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 230 : 1339,
          "title" => "Literasi Bahasa Inggris - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-230" : "MD-UTBK-1339",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 231 : 1340,
          "title" => "Literasi Bahasa Inggris - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-231" : "MD-UTBK-1340",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 232 : 1341,
          "title" => "Literasi Bahasa Inggris - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-232" : "MD-UTBK-1341",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 233 : 1342,
          "title" => "Literasi Bahasa Inggris - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-233" : "MD-UTBK-1342",
        ]
      ],
      "penalaran_matematika" => [
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 234 : 1346,
          "title" => "Penalaran Matematika - Pertemuan 1",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-234" : "MD-UTBK-1346",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 235 : 1347,
          "title" => "Penalaran Matematika - Pertemuan 2",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-235" : "MD-UTBK-1347",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 236 : 1348,
          "title" => "Penalaran Matematika - Pertemuan 3",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-236" : "MD-UTBK-1348",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 237 : 1349,
          "title" => "Penalaran Matematika - Pertemuan 4",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-237" : "MD-UTBK-1349",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 238 : 1350,
          "title" => "Penalaran Matematika - Pertemuan 5",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-238" : "MD-UTBK-1350",
        ],
        (object)[
          "sub_category_id" => null,
          "module_id" => env('APP_ENV') === "dev" ? 239 : 1351,
          "title" => "Penalaran Matematika - Pertemuan 6",
          "module_code" => env('APP_ENV') === "dev" ? "MD-UTBK-239" : "MD-UTBK-1351",
        ]
      ]
    ];
    return $modules->{$question_category};
  }

  private function getPreTestModuleCodes()
  {
    return env('APP_ENV') === "dev"
    ? [
        // SKD
        "MD-SKD-156","MD-SKD-116","MD-SKD-165","MD-SKD-161","MD-SKD-151","MD-SKD-148",
        // UTBK
        "MD-UTBK-208","MD-UTBK-209","MD-UTBK-210","MD-UTBK-211","MD-UTBK-212","MD-UTBK-213",
        "MD-UTBK-214","MD-UTBK-215","MD-UTBK-216","MD-UTBK-217","MD-UTBK-218","MD-UTBK-219",
        "MD-UTBK-220","MD-UTBK-221","MD-UTBK-222","MD-UTBK-223","MD-UTBK-224","MD-UTBK-225",
        "MD-UTBK-226","MD-UTBK-227","MD-UTBK-228","MD-UTBK-229","MD-UTBK-230","MD-UTBK-231",
        "MD-UTBK-232","MD-UTBK-233","MD-UTBK-234","MD-UTBK-235","MD-UTBK-236","MD-UTBK-237",
        "MD-UTBK-238","MD-UTBK-239"
      ]
    : [
        // SKD
        "MD-SKD-1041","MD-SKD-1043","MD-SKD-1044","MD-SKD-1045","MD-SKD-1050","MD-SKD-1051","MD-SKD-1052","MD-SKD-1053","MD-SKD-1046",
        "MD-SKD-1047","MD-SKD-1048","MD-SKD-1049","MD-SKD-1039","MD-SKD-1040","MD-SKD-1042","MD-SKD-1034","MD-SKD-1035","MD-SKD-1036",
        "MD-SKD-1037","MD-SKD-1038","MD-SKD-1075","MD-SKD-1076","MD-SKD-1078","MD-SKD-1079","MD-SKD-1081","MD-SKD-1100","MD-SKD-1080",
        "MD-SKD-1082","MD-SKD-1101","MD-SKD-1073","MD-SKD-1074","MD-SKD-1077","MD-SKD-1069","MD-SKD-1070","MD-SKD-1072","MD-SKD-1067",
        "MD-SKD-1068","MD-SKD-1071","MD-SKD-1324","MD-SKD-1325","MD-SKD-1316","MD-SKD-1317","MD-SKD-1318","MD-SKD-1308","MD-SKD-1309",
        "MD-SKD-1310","MD-SKD-1311","MD-SKD-1303","MD-SKD-1304","MD-SKD-1305","MD-SKD-1306","MD-SKD-1313","MD-SKD-1314","MD-SKD-1265",
        "MD-SKD-1266","MD-SKD-1300","MD-SKD-1301","MD-SKD-1268","MD-SKD-1298","MD-SKD-1320","MD-SKD-1321","MD-SKD-1322","MD-SKD-1327",
        "MD-SKD-1328",
        // UTBK
        "MD-UTBK-1362","MD-UTBK-1361","MD-UTBK-1360","MD-UTBK-1359","MD-UTBK-1358","MD-UTBK-1357","MD-UTBK-1356","MD-UTBK-1355","MD-UTBK-1354",
        "MD-UTBK-1353","MD-UTBK-1352","MD-UTBK-1351","MD-UTBK-1350","MD-UTBK-1349","MD-UTBK-1348","MD-UTBK-1347","MD-UTBK-1346","MD-UTBK-1345",
        "MD-UTBK-1344","MD-UTBK-1343","MD-UTBK-1342","MD-UTBK-1341","MD-UTBK-1340","MD-UTBK-1339","MD-UTBK-1338","MD-UTBK-1337","MD-UTBK-1336",
        "MD-UTBK-1335","MD-UTBK-1334","MD-UTBK-1333","MD-UTBK-1332","MD-UTBK-1331"
      ];
  }

  private function getPostTestModuleCodes()
  {
    return env('APP_ENV') === "dev"
    ? [
        // SKD
        "MD-SKD-156","MD-SKD-116","MD-SKD-165","MD-SKD-161","MD-SKD-151","MD-SKD-148",
        // UTBK
        "MD-UTBK-208","MD-UTBK-209","MD-UTBK-210","MD-UTBK-211","MD-UTBK-212","MD-UTBK-213",
        "MD-UTBK-214","MD-UTBK-215","MD-UTBK-216","MD-UTBK-217","MD-UTBK-218","MD-UTBK-219",
        "MD-UTBK-220","MD-UTBK-221","MD-UTBK-222","MD-UTBK-223","MD-UTBK-224","MD-UTBK-225",
        "MD-UTBK-226","MD-UTBK-227","MD-UTBK-228","MD-UTBK-229","MD-UTBK-230","MD-UTBK-231",
        "MD-UTBK-232","MD-UTBK-233","MD-UTBK-234","MD-UTBK-235","MD-UTBK-236","MD-UTBK-237",
        "MD-UTBK-238","MD-UTBK-239"
      ]
    : [
        // SKD
        "MD-SKD-1041","MD-SKD-1043","MD-SKD-1044","MD-SKD-1045","MD-SKD-1050","MD-SKD-1051","MD-SKD-1052","MD-SKD-1053","MD-SKD-1046",
        "MD-SKD-1047","MD-SKD-1048","MD-SKD-1049","MD-SKD-1039","MD-SKD-1040","MD-SKD-1042","MD-SKD-1034","MD-SKD-1035","MD-SKD-1036",
        "MD-SKD-1037","MD-SKD-1038","MD-SKD-1075","MD-SKD-1076","MD-SKD-1078","MD-SKD-1079","MD-SKD-1081","MD-SKD-1100","MD-SKD-1080",
        "MD-SKD-1082","MD-SKD-1101","MD-SKD-1073","MD-SKD-1074","MD-SKD-1077","MD-SKD-1069","MD-SKD-1070","MD-SKD-1072","MD-SKD-1067",
        "MD-SKD-1068","MD-SKD-1071","MD-SKD-1324","MD-SKD-1325","MD-SKD-1316","MD-SKD-1317","MD-SKD-1318","MD-SKD-1308","MD-SKD-1309",
        "MD-SKD-1310","MD-SKD-1311","MD-SKD-1303","MD-SKD-1304","MD-SKD-1305","MD-SKD-1306","MD-SKD-1313","MD-SKD-1314","MD-SKD-1265",
        "MD-SKD-1266","MD-SKD-1300","MD-SKD-1301","MD-SKD-1268","MD-SKD-1298","MD-SKD-1320","MD-SKD-1321","MD-SKD-1322","MD-SKD-1327",
        "MD-SKD-1328",
        // UTBK
        "MD-UTBK-1362","MD-UTBK-1361","MD-UTBK-1360","MD-UTBK-1359","MD-UTBK-1358","MD-UTBK-1357","MD-UTBK-1356","MD-UTBK-1355","MD-UTBK-1354",
        "MD-UTBK-1353","MD-UTBK-1352","MD-UTBK-1351","MD-UTBK-1350","MD-UTBK-1349","MD-UTBK-1348","MD-UTBK-1347","MD-UTBK-1346","MD-UTBK-1345",
        "MD-UTBK-1344","MD-UTBK-1343","MD-UTBK-1342","MD-UTBK-1341","MD-UTBK-1340","MD-UTBK-1339","MD-UTBK-1338","MD-UTBK-1337","MD-UTBK-1336",
        "MD-UTBK-1335","MD-UTBK-1334","MD-UTBK-1333","MD-UTBK-1332","MD-UTBK-1331"
      ];
  }

}

<?php

namespace App\Http\Controllers;

use App\Helpers\UserRole;
use Illuminate\Http\Request;
use App\Services\BranchService\Branch;
use App\Services\ExamService\Package;
use App\Services\ExamService\TryoutPremium;
use App\Services\ExamService\TryoutCode;
use App\Services\ExamService\Exam;
use App\Services\ExamService\QuestionCategory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TryoutCodeQuestionController extends Controller
{
  private Package $examPackageService;
  private TryoutCode $examTryoutCodeService;
  private TryoutPremium $examTryoutPremiumService;
  private QuestionCategory $examQuestionCategoryService;
  private Exam $examService;
  private Branch $branchService;

  public function __construct(
    Package $examPackageService,
    TryoutCode $examTryoutCodeService,
    TryoutPremium $examTryoutPremiumService,
    Exam $examService,
    Branch $branchService,
    QuestionCategory $examQuestionCategoryService
  )
  {
    $this->examPackageService = $examPackageService;
    $this->examTryoutCodeService = $examTryoutCodeService;
    $this->examTryoutPremiumService = $examTryoutPremiumService;
    $this->examService = $examService;
    $this->branchService = $branchService;
    $this->examQuestionCategoryService = $examQuestionCategoryService;
  }
  public function indexUKAKode()
  {
    $liveRankingHost = env('LIVE_RANKING_HOST');
    $breadcrumbs = [["name" => "Data UKA Kode", "link" => null]];
    return view('/pages/tryout-code-question/index-tryout-code', compact('breadcrumbs', 'liveRankingHost'));
  }

  public function index(Request $request, string $tryout_code_id)
  {
    $package = null;
    $questions = [];
    $questionDifficulties = [];
    $program = "skd";

    $user = Auth::user();
    $isBranchUser = $user->branch_code !== "PT0000";

    $branches = $this->branchService->getBranchs();
    if($isBranchUser) {
      $branchFilterCondition = function($branch) use($user) { return $branch->code === $user->branch_code; };
      $filteredBranches = array_filter($branches, $branchFilterCondition);
      $branches = array_values($filteredBranches);
    }

    $selectedBranchCode = $request->has('branch_code') ? $request->get('branch_code') : null;
    $selectedQuestionCategoryId = $request->has('question_category_id') ? $request->get('question_category_id') : null;

    $questionCategoriesResponse =  $this->examQuestionCategoryService->get($program);
    $questionCategories = json_decode($questionCategoriesResponse->body())?->data ?? [];

    $isMentor = UserRole::isMentor();
    if($isMentor) {
      $mentorRoles = Auth::user()->roles;
      $permittedQuestionCategories = array_map(function($role) {
        $explodedRoleString = explode("_", $role);
        return isset($explodedRoleString[1]) ? $explodedRoleString[1] : null;
      }, $mentorRoles);
      $permittedQuestionCategories = array_values(array_filter($permittedQuestionCategories, function($role) {
        return $role !== null;
      }));
      $questionCategories = array_values(array_filter($questionCategories, function($questionCategory) use($permittedQuestionCategories) {
        return in_array(strtolower($questionCategory->category), $permittedQuestionCategories);
      }));

      if($request->has('question_category_id') && !$request->get('question_category_id')) {
        Log::error("Mentor trying to get question + difficulty data with empty question ID query string value. Please make sure it doesn't", [
          'user_id' => Auth::user()->id,
          'roles' => Auth::user()->roles,
          'current_office_path' => $request->getRequestUri()
        ]);
        $request->session()->flash('flash-message', [
          "title" => "Terjadi kesalahan",
          "type" => "error",
          "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
        ]);
        return redirect("/soal-uka-kode");
      }

      if($request->has('question_category_id') && $request->get('question_category_id')) {
        $permittedQuestionCategoryIDs = array_values(array_map(function($questionCategory) {
          return $questionCategory->id;
        }, $questionCategories));

        if(!in_array($selectedQuestionCategoryId, $permittedQuestionCategoryIDs)) {
          Log::error("Cannot getting question + difficulty data. User may be trying to get the data with not permitted question category ID", [
            'user_id' => Auth::user()->id,
            'roles' => Auth::user()->roles,
            'permitted_question_category_id' => $permittedQuestionCategoryIDs,
            'inputted_question_category_id' => $selectedQuestionCategoryId,
            'current_office_path' => $request->getRequestUri()
          ]);
          $request->session()->flash('flash-message', [
            "title" => "Terjadi kesalahan",
            "type" => "error",
            "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
          ]);
          return redirect("/soal-uka-kode");
        }
      }

    }

    $tryoutCodeResponse = $this->examTryoutCodeService->getById($tryout_code_id);
    $tryoutCodeResponseStatus = $tryoutCodeResponse->status();
    $tryoutCode = json_decode($tryoutCodeResponse->body())?->data ?? null;

    // Handle stage data not found
    if(!$tryoutCode) {
      Log::error('Error when trying to get uka code data', [
        'success' => false,
        'body' => json_decode($tryoutCode->body()),
        'status' => $tryoutCodeResponse,
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $breadcrumbs = [["name" => "Data UKA Kode", "link" => "/soal-uka-kode"], ["name" => "Soal UKA Kode", "link" => null]];
    if($selectedBranchCode) {
      if($isBranchUser && ($selectedBranchCode !== $user->branch_code)) {
        Log::error("Branch user cannot access stage questions that are not on their own branch code", [
          'user_id' => $user->id,
          'roles' => $user->roles,
          'branch_code' => $user->branch_code,
          'selected_branch_code' => $selectedBranchCode,
          'current_office_path' => $request->getRequestUri()
        ]);
        $request->session()->flash('flash-message', [
          "title" => "Terjadi kesalahan",
          "type" => "error",
          "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
        ]);
        return redirect("/soal-uka-kode");
      }

      $packageResponse = $this->examPackageService->getByIdV2($tryoutCode->packages_id);
      $package = json_decode($packageResponse->body())?->data ?? null;

      $questionsResponse = $this->examService->get(null, null, '', '', $package->modules->module_code, '', '', $selectedQuestionCategoryId ? $selectedQuestionCategoryId : '');
      $questions = json_decode($questionsResponse->body())?->data ?? [];

      $questionDifficultiesResponse = $this->examService->getQuestionDifficultyData($package->modules->program, $package->modules->module_code, $selectedBranchCode);
      $questionDifficulties = json_decode($questionDifficultiesResponse->body()) ?? null;
    }
    $explanationHost = env('APP_ENV') == 'dev' ? 'https://app-edutech.btwazure.com' : 'https://app.btwedutech.com';
    return view('pages/tryout-code-question/index-question', compact('breadcrumbs', 'tryoutCode', 'questions', 'questionDifficulties', 'branches', 'questionCategories', 'selectedBranchCode', 'isMentor', 'explanationHost'));
  }

  public function questionExplanation(Request $request, int $tryout_code_id, string $questionId)
  {
    $questionCode = "CODE-" . $questionId;
    $encryptedQuestionId = $request->has('qid') ? str_replace('%3D', '=', urlencode($request->qid)) : null;
    if(!$encryptedQuestionId) {
      Log::error("Could not encrypt text $questionCode, please make sure the questionId is not null ", [
        'success' => false,
        'message' => 'Could not get encrypted question ID',
        'current_office_path' => $request->getRequestUri()
      ]);

      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $tryoutCodeResponse = $this->examTryoutCodeService->getById($tryout_code_id);
    $tryoutCodeResponseStatus = $tryoutCodeResponse->status();
    $tryoutCode = json_decode($tryoutCodeResponse->body())?->data ?? null;

    if(!$tryoutCode) {
      Log::error('Error when trying to get stage data', [
        'success' => false,
        'body' => json_decode($tryoutCodeResponse->body()),
        'status' => $tryoutCodeResponseStatus,
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $packageResponse = $this->examPackageService->getByIdV2($tryoutCode->packages_id);
    $packageStatus = $packageResponse->status();
    $package = json_decode($packageResponse->body())?->data ?? null;

    if(!$package) {
      Log::error('Error when trying to get package data', [
        'success' => false,
        'body' => json_decode($packageResponse->body()),
        'status' => $packageStatus,
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }
    $breadcrumbs = [
      ["name" => "Data UKA Kode", "link" => "/soal-uka-kode"],
      ["name" => "Soal UKA Kode ". $tryoutCode->packages->title, "link" => url()->previous()],
      ["name" => "Pembahasan Soal #$questionId", "link" => null]
    ];
    $explanationHost = env('APP_ENV') == 'dev' ? 'https://app-edutech.btwazure.com' : 'https://app.btwedutech.com';
    $iframeLink = "$explanationHost/pembahasan/ptk/$encryptedQuestionId";
    return view("/pages/tryout-code-question/question-explanation", compact(
      'tryoutCode',
      'breadcrumbs',
      'iframeLink',
      'questionId'
    ));
  }
}

<?php

namespace App\Http\Controllers;

use App\Helpers\UserRole;
use Illuminate\Http\Request;
use App\Services\StagesService\Stages;
use App\Services\BranchService\Branch;
use App\Services\ExamService\Package;
use App\Services\ExamService\TryoutPremium;
use App\Services\ExamService\Exam;
use App\Services\ExamService\QuestionCategory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MultiStageQuestionController extends Controller
{
  private Stages $stagesService;
  private Package $examPackageService;
  private QuestionCategory $examQuestionCategoryService;
  private Exam $examService;
  private Branch $branchService;

  public function __construct(
    Stages $stagesService,
    Package $examPackageService,
    Exam $examService,
    Branch $branchService,
    QuestionCategory $examQuestionCategoryService
  ) {
    $this->stagesService = $stagesService;
    $this->examPackageService = $examPackageService;
    $this->examService = $examService;
    $this->branchService = $branchService;
    $this->examQuestionCategoryService = $examQuestionCategoryService;
  }

  public function stages(Request $request)
  {
    $valid_programs = [];
    // Validasi initial data
    $user = Auth::user();
    if (!$user) {
      return redirect("/soal-multistages");
    }

    $is_mentor = collect($user->roles)
      ->every(fn ($item) => str_contains($item, "mentor"));

    if ($is_mentor) {
      if ($this->canShowProgramOption("PTK")) {
        array_push($valid_programs, "PTK");
      }
      if ($this->canShowProgramOption("PTN")) {
        array_push($valid_programs, "PTN");
      }
    } else {
      $valid_programs = ["PTK", "PTN"];
    }

    $valid_stage_types = ["REGULER", "BINSUS", "INTENSIF"];
    $program = $request->has("program") ? $request->get("program") : "";
    $stage_type = $request->has("stage_type") ? $request->get("stage_type") : "";
    $cannot_proceed = $program && !$stage_type;
    if ($cannot_proceed) {
      return redirect("/home")
        ->with("flash-message", [
          "type" => "warning",
          "title" => "Peringatan",
          "message" => "Program dan Tipe Stage harus diisi"
        ]);
    }

    // Set value ke initial default value ketika value program atau stage_type tidak sesuai ketentuan
    $fetch_multi_stage_data = ($program && $stage_type);

    // Buat payload yang diperlukan file blade view
    $page_title = "Soal Multi Stage";
    $stages = new \stdClass();
    $stages->data = null;
    if ($fetch_multi_stage_data) {
      $is_valid_program = $is_mentor
        ? in_array($program, $valid_programs) && $this->canShowProgramOption($program)
        : in_array($program, $valid_programs);
      $is_valid_stage_type = in_array($stage_type, $valid_stage_types);
      if (!$is_valid_program || !$is_valid_stage_type) {
        return redirect("/soal-multistages");
      }

      $page_title = $page_title . " " . strtoupper($program) . " " . $stage_type;
      $response = $this->stagesService->getClassStagesByType($program);
      $stages = json_decode($response->body());
      $stages->data = collect($stages?->data ?? [])
        ->filter(fn ($stage) => $stage->stage_type == $stage_type)
        ->values()
        ->toArray();
    }

    $breadcrumbs = [["name" => $page_title, "link" => null]];
    $view = 'pages/stages/question/multi-stage';
    $viewData = compact(
      'stages',
      'breadcrumbs',
      'fetch_multi_stage_data',
      'page_title',
      'program',
      'stage_type',
      'valid_programs'
    );
    return view($view, $viewData);
  }

  public function questions(Request $request, string $type, string $id)
  {
    $package = null;
    $questions = [];
    $questionDifficulties = [];

    $user = Auth::user();
    $authUserId = Auth::user()->id;
    $authUserName = Auth::user()->name;
    $isBranchUser = $user->branch_code !== "PT0000";

    $branches = $this->branchService->getBranchs();
    if ($isBranchUser) {
      $branchFilterCondition = function ($branch) use ($user) {
        return $branch->code === $user->branch_code;
      };
      $filteredBranches = array_filter($branches, $branchFilterCondition);
      $branches = array_values($filteredBranches);
    }
    if ($type === "PTK") $program = "skd";
    else if ($type === "PTN") $program = "utbk";
    else $program = null;

    $selectedBranchCode = $request->has('branch_code') ? $request->get('branch_code') : null;
    $selectedQuestionCategoryId = $request->has('question_category_id') ? $request->get('question_category_id') : null;

    $questionCategoriesResponse =  $this->examQuestionCategoryService->get($program);
    $questionCategories = collect(json_decode($questionCategoriesResponse->body())?->data ?? [])
      ->map(function ($item) {
        $item->category_label = ucwords(str_replace("_", " ", $item->category));
        return $item;
      })
      ->values()
      ->toArray();

    $isMentor = UserRole::isMentor();
    if ($isMentor) {
      $mentorRoles = collect(Auth::user()->roles)
        ->filter(fn ($item) => str_contains($item, "mentor_"))
        ->map(fn ($item) => str_replace("mentor_", "", $item))
        ->values()
        ->toArray();
      $questionCategories = array_values(array_filter($questionCategories, function ($questionCategory) use ($mentorRoles) {
        return in_array(strtolower($questionCategory->category), $mentorRoles);
      }));
      if ($request->has('question_category_id') && !$request->get('question_category_id')) {
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
        return redirect()->back();
      }

      if ($request->has('question_category_id') && $request->get('question_category_id')) {
        $permittedQuestionCategoryIDs = array_values(array_map(function ($questionCategory) {
          return $questionCategory->id;
        }, $questionCategories));

        if (!in_array($selectedQuestionCategoryId, $permittedQuestionCategoryIDs)) {
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
          return redirect()->back();
        }
      }
    }

    $stageResponse = $this->stagesService->getClassStageById($id);
    $stageStatus = $stageResponse->status();
    $stage = json_decode($stageResponse->body())?->data ?? null;
    // Handle stage data not found
    if (!$stage) {
      Log::error('Error when trying to get stage data', [
        'success' => false,
        'body' => json_decode($stageResponse->body()),
        'status' => $stageStatus,
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    // Handle stage type not match
    if ($stage->type != $type) {
      Log::error('Error when trying to get stage data', [
        'success' => false,
        'body' => json_decode($stageResponse->body()),
        'status' => $stageStatus,
        'message' => "Stage id is present, but the type doesn't match",
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
      ["name" => "Soal Multi Stage $type $stage->stage_type", "link" => "/soal-multistages?program=" . "$type&stage_type=" . $stage->stage_type],
      ["name" => "Soal Stage $stage->stage Level $stage->level", "link" => null]
    ];
    if ($selectedBranchCode) {
      if ($isBranchUser && ($selectedBranchCode !== $user->branch_code)) {
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
        return redirect()->back();
      }
      $packageResponse = $this->examPackageService->getByIdV2($stage->package_id);
      $package = json_decode($packageResponse->body())?->data ?? null;

      $questionsResponse = $this->examService->get(null, null, '', '', $package->modules->module_code, '', '', $selectedQuestionCategoryId ? $selectedQuestionCategoryId : '');
      $questions = json_decode($questionsResponse->body())?->data ?? [];

      $questionDifficultiesResponse = $this->examService->getQuestionDifficultyData($package->modules->program, $package->modules->module_code, $selectedBranchCode);
      $questionDifficulties = json_decode($questionDifficultiesResponse->body()) ?? null;
    }
    $explanationHost = env('APP_ENV') == 'dev' ? 'https://app-edutech.btwazure.com' : 'https://app.btwedutech.com';

    return view('pages/stages/question/multi-stage-question', compact('breadcrumbs', 'stage', 'type', 'questions', 'questionDifficulties', 'branches', 'questionCategories', 'selectedBranchCode', 'isMentor', 'explanationHost', 'authUserId', 'authUserName'));
  }

  public function questionExplanation(Request $request, string $type, string $id, string $questionId)
  {
    $questionCode = "CODE-" . $questionId;
    $encryptedQuestionId = $request->has('qid') ? str_replace('%3D', '=', urlencode($request->qid)) : null;
    if (!$encryptedQuestionId) {
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

    $stageResponse = $this->stagesService->getClassStageById($id);
    $stageStatus = $stageResponse->status();
    $stage = json_decode($stageResponse->body())?->data ?? null;

    if (!$stage) {
      Log::error('Error when trying to get stage data', [
        'success' => false,
        'body' => json_decode($stageResponse->body()),
        'status' => $stageStatus,
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    if ($stage->type != $type) {
      Log::error('Error when trying to get stage data', [
        'success' => false,
        'body' => json_decode($stageResponse->body()),
        'status' => $stageStatus,
        'message' => "Stage id is present, but the type doesn't match",
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $packageResponse = $this->examPackageService->getByIdV2($stage->package_id);
    $packageStatus = $packageResponse->status();
    $package = json_decode($packageResponse->body())?->data ?? null;

    if (!$package) {
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

    $encryptedUserId = $request->has('mid') ? str_replace('%3D', '=', urlencode($request->mid)) : null;
    if (!$encryptedUserId) {
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
    if (!$encryptedUserName) {
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
    $breadcrumbs = [
      ["name" => "Soal MultiStage $type", "link" => "/soal-multistages"],
      ["name" => "Soal Stage $stage->stage Level $stage->level", "link" => url()->previous()],
      ["name" => "Pembahasan Soal #$questionId", "link" => null]
    ];
    $explanationHost = env('APP_ENV') == 'dev' ? 'https://app-edutech.btwazure.com' : 'https://app.btwedutech.com';
    $iframeLink = "$explanationHost/pembahasan/" . strtolower($type) . '/' . $encryptedQuestionId . "?mid=$encryptedUserId&mnm=$encryptedUserName&track=comment";
    return view("/pages/stages/question/question-explanation", compact(
      'stage',
      'breadcrumbs',
      'type',
      'iframeLink',
      'questionId'
    ));
  }

  public function showComments(Request $request, string $type, string $id, string $questionId)
  {
    $questionCode = "CODE-" . $questionId;
    // Validasi type test dari route param
    $validTestTypes = ["PTK", "PTN"];
    $lowerCasedTestType = strtoupper($type);
    if (!in_array($lowerCasedTestType, $validTestTypes)) {
      abort(404);
    }

    //valid program
    if ($type === "PTK") $program = "skd";
    else if ($type === "PTN") $program = "utbk";
    else $program = null;

    $questionCategoriesResponse =  $this->examQuestionCategoryService->get($program);
    $questionCategories = json_decode($questionCategoriesResponse->body())?->data ?? [];

    $selectedBranchCode = $request->has('branch_code') ? $request->get('branch_code') : null;
    $selectedQuestionCategoryId = $request->has('question_category_id') ? $request->get('question_category_id') : null;

    $stageResponse = $this->stagesService->getClassStageById($id);
    $stageStatus = $stageResponse->status();
    $stage = json_decode($stageResponse->body())?->data ?? null;
    // Handle stage data not found
    if (!$stage) {
      Log::error('Error when trying to get stage data', [
        'success' => false,
        'body' => json_decode($stageResponse->body()),
        'status' => $stageStatus,
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    // Handle stage type not match
    if ($stage->type != $type) {
      Log::error('Error when trying to get stage data', [
        'success' => false,
        'body' => json_decode($stageResponse->body()),
        'status' => $stageStatus,
        'message' => "Stage id is present, but the type doesn't match",
        'current_office_path' => $request->getRequestUri()
      ]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Sistem sedang mengalami gangguan, silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $isMentor = UserRole::isMentor();
    if ($isMentor) {
      $mentorRoles = collect(Auth::user()->roles)
        ->filter(fn ($item) => str_contains($item, "mentor_"))
        ->map(fn ($item) => str_replace("mentor_", "", $item))
        ->values()
        ->toArray();
      $questionCategories = array_values(array_filter($questionCategories, function ($questionCategory) use ($mentorRoles) {
        return in_array(strtolower($questionCategory->category), $mentorRoles);
      }));
      if ($request->has('question_category_id') && !$request->get('question_category_id')) {
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
        return redirect()->back();
      }

      if ($request->has('question_category_id') && $request->get('question_category_id')) {
        $permittedQuestionCategoryIDs = array_values(array_map(function ($questionCategory) {
          return $questionCategory->id;
        }, $questionCategories));

        if (!in_array($selectedQuestionCategoryId, $permittedQuestionCategoryIDs)) {
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
          return redirect()->back();
        }
      }
    }

    $questionResponse = $this->examService->getById($questionId);
    $questionBody = json_decode($questionResponse->body());
    if (!$questionBody) {
      Log::error("Cannot get $type training modules question comments data", [
        'user_id' => Auth::user()->id,
        'current_office_path' => $request->getRequestUri(),
        'response' => $questionBody,
        'message' => "Question data was not found on exam service"
      ]);
      abort(404);
    }

    $questionCommentsResponse = $this->examService->getQuestionComments($questionId);
    $questionComments = json_decode($questionCommentsResponse->body())?->data ?? [];
    if (count($questionComments) > 0) {
      $questionComments = collect($questionComments)->map(function ($item) {
        $item->comment = nl2br($item->comment);
        return $item;
      })->toArray();
    }
    $breadcrumbs = [
      ["name" => "Soal Multi Stage $type $stage->stage_type", "link" => "/soal-multistages?program=" . "$type&stage_type=" . $stage->stage_type],
      ["name" => "Soal Stage $stage->stage Level $stage->level", "link" => url()->previous()],
      ["name" => "Komentar Soal #$questionId", "link" => null]
    ];
    return view('pages.stages.question.multi-stage-comment-question', compact(
      'breadcrumbs',
      'type',
      'questionComments',
      'questionId',
    ));
  }

  private function canShowProgramOption($program)
  {
    $validPrograms = ["PTK", "PTN"];
    $isValidProgram = in_array($program, $validPrograms);
    if (!$isValidProgram) {
      return false;
    }

    $allowedAccess = UserRole::getAllowed('roles.multistages_question');
    $acl = [
      "PTK" => "show_select_ptk_option",
      "PTN" => "show_select_ptn_option"
    ];
    return in_array($acl[strtoupper($program)], $allowedAccess);
  }
}

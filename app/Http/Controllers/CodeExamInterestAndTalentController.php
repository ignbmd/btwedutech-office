<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\InterestAndTalentService\InterestAndTalent;
use App\Services\BranchService\Branch;

class CodeExamInterestAndTalentController extends Controller 

{
  private InterestAndTalent $interestAndTalentService;
  private Branch $branchService;

  public function __construct(InterestAndTalent $interestAndTalentService, Branch $branchService)
  {
      $this->interestAndTalentService = $interestAndTalentService;
      $this->branchService = $branchService;
      Breadcrumb::setFirstBreadcrumb('Kode Ujian Minat Bakat Cabang', null);
  }
  public function index()
  {
    $branchCode = Auth::user()->branch_code;
    $branchName = $this->branchService->getBranchByCode($branchCode)->name;
    $getExamCode = $this->interestAndTalentService->getExamCodeByInstanceId($branchCode);
    return view('pages.code-exam-interest-and-talent.index', compact('branchCode','getExamCode', 'branchName'));
  }
}
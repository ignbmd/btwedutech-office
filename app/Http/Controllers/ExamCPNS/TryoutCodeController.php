<?php

namespace App\Http\Controllers\ExamCPNS;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\ExamCPNSService\TryoutCode;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class TryoutCodeController extends Controller
{
    protected TryoutCode $tryoutCode;

    public function __construct(TryoutCode $tryoutCode) {
      $this->tryoutCode = $tryoutCode;
      Breadcrumb::setFirstBreadcrumb('Tryout Kode CPNS', 'ujian-cpns/tryout-kode');
    }

    public function index() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      $isMarketingUser = UserRole::isMarketing();
      $isBranchUser = UserRole::isBranchUser();
      $userBranchCode = Auth::user()->branch_code;
      $liveRankingHost = env('LIVE_RANKING_HOST');
      return view('/pages/exam-cpns/tryout-code/index', compact('breadcrumbs', 'isMarketingUser', 'isBranchUser', 'userBranchCode', 'liveRankingHost'));
    }

    public function showCreateForm() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Buat Tryout Kode CPNS']];
      $isMarketingUser = UserRole::isMarketing();
      $isBranchUser = UserRole::isBranchUser();
      $userBranchCode = Auth::user()->branch_code;
      return view('/pages/exam-cpns/tryout-code/create', compact('breadcrumbs', 'isMarketingUser', 'isBranchUser', 'userBranchCode'));
    }

    public function edit($id) {
      $isMarketingUser = UserRole::isMarketing();
      $isBranchUser = UserRole::isBranchUser();
      $userBranchCode = Auth::user()->branch_code;

      $tryoutResponse = $this->tryoutCode->getById($id);
      $tryout = json_decode($tryoutResponse->body())->data;

      $isTryoutBelongsToCurrentUserBranch = $tryout->packages->branch_code === $userBranchCode;
      if($isBranchUser && !$isTryoutBelongsToCurrentUserBranch) {
        return redirect("/ujian/tryout-kode")->with('flash-message', [
          'title' => 'Peringatan',
          'type' => 'error',
          'message' => 'Anda tidak bisa mengubah data tryout ini!']);
      }

      if($isMarketingUser && !in_array("marketing", $tryout->packages->tags)) {
        return redirect("/ujian/tryout-kode")->with('flash-message', [
        'title' => 'Peringatan',
        'type' => 'error',
        'message' => 'Anda tidak bisa mengubah data tryout ini!']);
      }

      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Tryout Kode CPNS']];
      return view('/pages/exam-cpns/tryout-code/edit', compact('breadcrumbs', 'isMarketingUser', 'isBranchUser', 'userBranchCode'));
    }
}

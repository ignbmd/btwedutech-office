<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SSOService\SSO;
use Illuminate\Http\Request;
use App\Services\LearningService\User;

class MentorController extends Controller
{
  private SSO $sso;
  private User $learningUser;

  public function __construct(SSO $sso, User $learningUser) {
    $this->sso = $sso;
    $this->learningUser = $learningUser;
  }

  public function index()
  {
    // $branch_code = auth()->user()->branch_code ?? null;
    // $mentors  = $branch_code
    //           ? $this->sso->getMentorByBranchCode($branch_code)
    //           : $this->sso->getAllMentor();
    $mentors = $this->sso->getAllMentor();
    return $mentors;
  }

  public function legacy()
  {
    $mentors = $this->learningUser->getUser(['roles' => 'mentor']);
    $mentorIds = array_column($mentors, 'sso_id');
    $mentors = $this->sso->getLegacyMentor(['id' => $mentorIds]);
    return $mentors;
  }

  public function excludedLegacy(Request $request)
  {
    $query = ['roles' => 'mentor'];
    if($request->has('branch_code')) $query['branch_code'] = $request->get('branch_code');
    $mentors = $this->learningUser->getUser($query);
    $mentorIds = array_column($mentors, 'sso_id');
    $mentors = $this->sso->getExcludedLegacyMentor(['id' => $mentorIds]);
    return $mentors;
  }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LearningService\Teacher;
use App\Helpers\UserRole;
use App\Helpers\UserBranch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class TeacherController extends Controller
{

  private Teacher $teacherService;

  public function __construct(Teacher $teacherService)
  {
    $this->teacherService = $teacherService;
  }

  public function getAll(Request $request)
  {
    $query = [
      'classroom_id' => $request->get('classroom_id'),
      'roles' => ['mentor'],
    ];
    if(!UserRole::isAdmin()) $query['branch_code'] = [Auth()->user()->branch_code, 'PT0000'];
    if(UserBranch::isCentralBranchUser()) unset($query['branch_code']);

    $data = $this->teacherService->getAll($query);
    return response()->json(['data' => $data]);
  }
}

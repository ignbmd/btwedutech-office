<?php

namespace App\Http\Controllers\Api\StudentProgress;

use App\Http\Controllers\Controller;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Schedule;
use App\Services\ProfileService\Profile;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassroomReportController extends Controller
{
  private Branch $branchService;
  private ClassRoom $learningClassroomService;
  private ClassMember $learningClassMemberService;
  private Schedule $learningScheduleService;
  private Profile $profileService;

  public function __construct()
  {
    $this->branchService = new Branch;
    $this->learningClassroomService = new ClassRoom;
    $this->learningClassMemberService = new ClassMember;
    $this->learningScheduleService = new Schedule;
    $this->profileService = new Profile;
  }

  public function getBranches()
  {
    $authUserBranchCode = Auth::user()->branch_code;
    $isCentralUser = !$authUserBranchCode || $authUserBranchCode == "PT0000";

    $branches = $isCentralUser
      ? $this->generateBranchesForCentralUsers()
      : $this->generateBranchesForBranchUsers();
    return response()->json(['success' => true, 'data' => $branches], 200);
  }

  private function generateBranchesForCentralUsers()
  {
    $authUserRoles = Auth::user()->roles;
    $isMentor =
      in_array("mentor", $authUserRoles) && count($authUserRoles) == 1;
    $branches = [];
    if (!$isMentor) {
      $branches = $this->branchService->getBranchs();
    } else {
      $branches = [];
      $mentorSchedules = collect($this->learningScheduleService->getByRoles());
      $branch_codes = ($mentorSchedules->unique('branch_code')->pluck('branch_code')->sort()->toArray());
      foreach ($branch_codes as $code) {
        $branches[] = $this->branchService->getBranchByCode($code);
      }
    }
    return $branches;
  }

  private function generateBranchesForBranchUsers()
  {
    $authUserBranchCode = Auth::user()->branch_code;
    $authUserRoles = Auth::user()->roles;
    $isBranchHead =
      in_array("kepala_cabang", $authUserRoles) && count($authUserRoles) == 1;
    $isBranchAdmin =
      in_array("admin_cabang", $authUserRoles) && count($authUserRoles) == 1;
    if ($isBranchHead || $isBranchAdmin) {
      return $this->branchService->getMultipleBranches($authUserBranchCode);
    }
    return [$this->branchService->getBranchByCode($authUserBranchCode)];
  }

  public function getBranchClassrooms(string $branchCode)
  {
    $centralBranchCode = "PT0000";

    $query = [
      "branch_code" => $branchCode,
      "status" => "ONGOING",
    ];

    if ($branchCode === $centralBranchCode) {
      unset($query["branch_code"]);
    }

    $classrooms = $this->learningClassroomService->getAll($query);
    return response()->json(['success' => true, 'data' => $classrooms], 200);
  }

  public function getClassroomReports(Request $request, string $branchCode, string $classroomId)
  {
    $stageType = $request->has('stage_type') ? $request->get('stage_type') : "UMUM";
    $moduleType = $request->has('module_type') ? $request->get('module_type') : "ALL_MODULE";

    $classroom = $this->learningClassroomService->getSingle($classroomId);
    if (!$classroom) {
      return response()->json(['success' => false, 'data' => null, 'message' => "Classroom was not found"]);
    }

    $classroomProgram = "ptk";
    $classroomTags = collect($classroom->tags)
      ->map(fn ($tag) => strtoupper($tag))
      ->toArray() ?? [];

    $isPTNClassroomProgram = in_array("PTN", $classroomTags)
      || in_array("UTBK", $classroomTags)
      || in_array("SNBT", $classroomTags);
    $isCPNSClassroomProgram = in_array("CPNS", $classroomTags);
    if ($isPTNClassroomProgram) {
      $classroomProgram = "ptn";
    }
    if ($isCPNSClassroomProgram) {
      $classroomProgram = "cpns";
    }

    $classMembers = $this->learningClassMemberService->getByClassroomId($classroomId);
    if (count($classMembers) == 0) {
      return response()->json(['success' => false, 'data' => null, 'message' => "This classroom has no member"]);
    }

    $classMembersIDs = collect($classMembers)
      ->pluck('smartbtw_id')
      ->all();

    $payload = [
      "program" => $classroomProgram,
      "smartbtw_id" => $classMembersIDs,
      "type_stages" => $stageType,
      "type_module" => $moduleType
    ];
    $response = $this->profileService->getStudentResultSummary($payload);
    $body = json_decode($response->body());
    $status = $response->status();

    return response()->json($body, $status);
  }
}

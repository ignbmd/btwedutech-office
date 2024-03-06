<?php

namespace app\Helpers;

use App\Services\LearningService\Schedule;
use Illuminate\Support\Facades\Auth;

class Mentor {

  public static function getWithScheduledClassBranchCode()
  {
    $scheduleLearningService = new Schedule();
    $branchCode = Auth::user()->branch_code;

    $trimmedBranchCode = strtoupper(preg_replace('/\s+/', '', $branchCode));
    $explodedBranchCode = explode(',', $trimmedBranchCode);

    $mentorSchedules = collect($scheduleLearningService->getByRoles(['branch_code' => $branchCode]));
    $scheduleBranchCodes = $mentorSchedules->unique('branch_code')->pluck('branch_code')->sort()->toArray();

    $branchCodes = array_unique(array_merge($scheduleBranchCodes, $explodedBranchCode));
    $allBranchCodes = implode(',', $branchCodes);
    return [
      "original" => $explodedBranchCode,
      "originalString" => $branchCode,
      "schedule" => $scheduleBranchCodes,
      "merged" => $branchCodes,
      "mergedString" => $allBranchCodes
    ];
  }

  public static function getBranchCode()
  {
    $formattedBranchCodeString = strtoupper(preg_replace('/\s+/', '', auth()->user()->branch_code));
    $branchCodes = explode(',', $formattedBranchCodeString);
    return count($branchCodes) == 1 ? $branchCodes[0] : $branchCodes;
  }

}

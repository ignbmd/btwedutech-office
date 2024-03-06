<?php

namespace App\Http\Controllers\Api\StudentProgress;

use App\Http\Controllers\Controller;
use App\Services\ProfileService\Profile;

class StudentPrePostTestReportController extends Controller
{
  private Profile $profileService;

  public function __construct()
  {
    $this->profileService = new Profile;
  }

  public function getSummaryByStudentIDAndProgram(int $smartbtw_id, string $program)
  {
    $response = $this->profileService->getSingleStudentPrePostTestReport($smartbtw_id, $program);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

<?php

namespace App\Http\Controllers\Api\StudentProgress;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\LearningService\Presence;
use App\Services\SSOService\SSO;

class StudentPresenceController extends Controller
{
  private Presence $learningPresenceService;
  private SSO $ssoService;

  public function __construct(Presence $learningPresenceService, SSO $ssoService)
  {
    $this->learningPresenceService = $learningPresenceService;
    $this->ssoService = $ssoService;
  }

  public function getSummaryByStudentID(int $student_id)
  {
    $response = $this->learningPresenceService->getSummaryByStudentID($student_id);
    $body = json_decode($response->body());
    $status = $response->status();

    $attend_presences = $body?->data?->attend_presences ?? [];
    $absent_presences = $body?->data?->absent_presences ?? [];
    $all_presences = collect(array_merge($attend_presences, $absent_presences))
      ->map(function ($item) {
        $item->created_by_name = "-";
        return $item;
      })
      ->toArray();
    if (count($all_presences)) {
      $presence_user_ids = collect($all_presences)
        ->map(fn ($item) => $item->created_by)
        ->unique()
        ->values()
        ->toArray();
      $presence_users = collect($this->ssoService->getUserByIds($presence_user_ids))
        ->mapWithKeys(function ($item) {
          return [$item->id => $item];
        });
      $attend_presences = collect($attend_presences)
        ->map(function ($item) use ($presence_users) {
          $item->created_by_name = isset($presence_users[$item?->created_by])
            ? $presence_users[$item?->created_by]->name
            : "-";
          return $item;
        });
      $absent_presences = collect($absent_presences)
        ->map(function ($item) use ($presence_users) {
          $item->created_by_name = isset($presence_users[$item?->created_by])
            ? $presence_users[$item?->created_by]->name
            : "-";
          return $item;
        });
    }
    $attend_presences = collect($all_presences)
      ->reject(fn ($item) => $item->presence === "NOT_ATTEND")
      ->values()
      ->toArray();
    $absent_presences = collect($all_presences)
      ->reject(fn ($item) => $item->presence === "ATTEND")
      ->values()
      ->toArray();
    $body->data->attend_presences = $attend_presences;
    $body->data->absent_presences = $absent_presences;
    return response()->json($body, $status);
  }
}

<?php

namespace App\Http\Controllers\Api\Zoom\V2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ZoomAPIService\User;
use App\Services\ZoomAPIService\Meeting;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Presence;
use App\Services\LearningService\OnlineClassMeeting;
use Illuminate\Support\Facades\Http;

class ZoomController extends Controller
{
  private $zoomURL;
  private ClassMember $classMemberService;
  private OnlineClassMeeting $ocmService;
  private Presence $studentPresenceService;

  public function __construct(
    ClassMember $classMemberService,
    OnlineClassMeeting $ocmService,
    Presence $studentPresenceService
  ) {
    $this->zoomURL = "https://api.zoom.us/v2";
    $this->classMemberService = $classMemberService;
    $this->ocmService = $ocmService;
    $this->studentPresenceService = $studentPresenceService;
  }

  public function getUsers(Request $request)
  {
    $response = Http::withHeaders(["Authorization" => $request->header("Authorization")])
      ->retry(3, 100)
      ->get($this->zoomURL . "/users", $request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getUserById(Request $request, $zoom_user_id)
  {
    $response = Http::withHeaders(["Authorization" => $request->header("Authorization")])
      ->retry(3, 100)
      ->get($this->zoomURL . "/users/$zoom_user_id", $request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getUserSettings(Request $request, $zoom_user_id)
  {
    $response = Http::withHeaders(["Authorization" => $request->header("Authorization")])
      ->retry(3, 100)
      ->get($this->zoomURL . "/users/$zoom_user_id/settings", $request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getMeeting(Request $request, $zoom_meeting_id)
  {
    $response = Http::withHeaders(["Authorization" => $request->header("Authorization")])
      ->retry(3, 100)
      ->get($this->zoomURL . "/meetings/$zoom_meeting_id", $request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getMeetingRegistrants(Request $request, $zoom_meeting_id)
  {
    $response = Http::withHeaders(["Authorization" => $request->header("Authorization")])
      ->retry(3, 100)
      ->get($this->zoomURL . "/meetings/$zoom_meeting_id/registrants", $request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function createStudentPresence(Request $request)
  {
    $meetingResponse = Http::withHeaders(["Authorization" => $request->header("Authorization")])
      ->retry(3, 100)
      ->get($this->zoomURL . "/meetings/$request->zoom_meeting_id", $request->all());
    $meetingBody = json_decode($meetingResponse->body());
    $meetingStatus = $meetingResponse->status();

    if (!$meetingResponse->successful()) return response()->json($meetingBody, $meetingStatus);

    $ocmResponse = $this->ocmService->getByZoomMeetingID($request->zoom_meeting_id);
    $ocmBody = json_decode($ocmResponse->body())?->data ?? null;
    if (!$ocmBody) {
      return response()->json(
        [
          'success' => false,
          'message' => "Online class meeting data with zoom meeting id: $request->zoom_meeting_id is not found"
        ],
        404
      );
    }
    $ocmBody = $ocmBody[0];
    $classMembers = $this->classMemberService->getByClassroomId($ocmBody->classroom_id);
    if (count($classMembers) === 0) return response()->json(['success' => false, 'message' => 'Classroom has no class member. Please make sure the classroom has at least 1 member'], 200);

    $meetingAttendees = collect($request->get('attendees') ?? []);
    $meetingAttendees =  $meetingAttendees
      ->map(fn ($item, $key) => (object)["name" => $item["name"], "user_email" => $item["email"], "duration" => $item["duration"]])
      ->values()
      ->toArray();

    $meetingAttendees = array_reduce($meetingAttendees, function ($carry, $item) {
      if (!isset($carry[$item->user_email])) {
        $carry[$item->user_email] = ['name' => $item->name, 'user_email' => $item->user_email, 'duration' => $item->duration];
      } else {
        $carry[$item->user_email]['duration'] += $item->duration;
      }
      return $carry;
    });

    $learningPresence = $this->studentPresenceService->get(["class_schedule_id" => $ocmBody->class_schedule_id]) ?? [];
    if (count($learningPresence) === 0) {
      return response()->json(['success' => false, 'message' => 'No learning presence data found'], 200);
    }

    $maxMeetingDuration = collect($meetingAttendees)->max('duration');
    $maxMeetingDurationInMinutes = 90;

    $meetingAttendees = collect($meetingAttendees)->map(function ($item, $key) use ($maxMeetingDurationInMinutes) {
      $item["duration_in_minutes"] = intval(ceil($item["duration"] / 60));
      $item["duration_percentages"] = intval(ceil(($item["duration_in_minutes"] / $maxMeetingDurationInMinutes) * 100));
      return $item;
    })->sortByDesc('duration_percentages')->values()->toArray();

    $presencePayload = ["classroom_id" => $ocmBody->classroom_id, "class_schedule_id" => $ocmBody->class_schedule_id, "created_by" => "SYSTEM", "comment" => "Generated By SYSTEM"];
    $presenceLog = collect($classMembers)
      ->map(function ($item, $key) use ($meetingAttendees, $ocmBody, $learningPresence) {
        $participantEmail = array_column($meetingAttendees, "user_email");
        $meetingParticipantArrayIndex = array_search($item->email, $participantEmail);
        $participant = $meetingParticipantArrayIndex === false ? null : $meetingAttendees[$meetingParticipantArrayIndex];

        $logs = [];
        $logs["class_schedule_id"] = $ocmBody->class_schedule_id;
        $logs["smartbtw_id"] = $item->smartbtw_id;
        $logs["meeting_id"] = $ocmBody->zoom_meeting_id;
        $logs["name"] = $item->name;
        $logs["comment"] = "GENERATED BY SYSTEM";
        $logs["user_email"] = $item->email;
        $logs["duration"] = $participant ? $participant["duration"] : 0;
        $logs["duration_in_minutes"] = $participant ? $participant["duration_in_minutes"] : 0;
        if ($participant) {
          $logs["duration_percentages"] = $participant["duration_percentages"] > 100 ? 100 : $participant["duration_percentages"];
        } else {
          $logs["duration_percentages"] = 0;
        }
        $logs["updated_by"] = "SYSTEM";
        $logs["created_at"] = $learningPresence[0]->created_at;
        $logs["updated_at"] = $learningPresence[0]->updated_at;

        if (!$participant) $logs["presence"] = "NOT_ATTEND";
        else $logs["presence"] = $logs["duration_percentages"] >= 60 ? "ATTEND" : "NOT_ATTEND";

        return $logs;
      })->values()->toArray();
    $brokerPayload = [
      "version" => 1,
      "data" => $presenceLog
    ];
    return response()->json($brokerPayload, 200);

    $presencePayload["logs"] = $presenceLog;
    // $this->studentPresenceService->createForZoomWebhook($presencePayload);
    // $this->ocmService->updatePartialByClassScheduleID($ocmBody->class_schedule_id, ["zoom_meeting_status" => "ENDED"]);

    return response()->json(['success' => true, 'message' => 'Student presence has been created'], 201);
  }
}

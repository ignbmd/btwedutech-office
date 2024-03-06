<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Services\ZoomAPIService\Meeting;
use App\Services\LearningService\OnlineClassMeeting;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Presence;
use App\Services\OnlineClassService\OnlineSchedule;
use App\Services\OnlineClassService\ClassParticipant;
use App\Services\OnlineClassService\OnlineAttendance;
use App\Helpers\RabbitMq;
use App\Jobs\ProcessStudentPresence;
use Carbon\Carbon;

class ZoomWebhookController extends Controller
{

  private Meeting $zoomMeetingService;
  private OnlineClassMeeting $onlineClassMeetingService;
  private ClassMember $classMemberService;
  private Presence $studentPresenceService;
  private OnlineSchedule $onlineScheduleService;
  private ClassParticipant $classParticipantService;
  private OnlineAttendance $onlineAttendanceService;

  public function __construct(
    Meeting $zoomMeetingService,
    OnlineClassMeeting $onlineClassMeetingService,
    ClassMember $classMemberService,
    Presence $studentPresenceService,
    OnlineSchedule $onlineScheduleService,
    ClassParticipant $classParticipantService,
    OnlineAttendance $onlineAttendanceService
  ) {
    $this->zoomMeetingService = $zoomMeetingService;
    $this->onlineClassMeetingService = $onlineClassMeetingService;
    $this->classMemberService = $classMemberService;
    $this->studentPresenceService = $studentPresenceService;
    $this->onlineScheduleService = $onlineScheduleService;
    $this->classParticipantService = $classParticipantService;
    $this->onlineAttendanceService = $onlineAttendanceService;
  }

  public function testingWebhookNotification(Request $request)
  {
    $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByZoomMeetingID("88591156319");
    $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? [];
    if (count($onlineClassMeeting) === 0) {
      return response()->json(
        [
          "success" => false,
          "message" => "[ZoomWebhook][meeting.ended] could not update online class meeting status to ENDED - Online Class Meeting data with Zoom Meeting ID: " . "84688517583" . " is not found on learning service"
        ],
        404
      );
    }
    dump("Getting online class meetings");
    dump($onlineClassMeeting);
    foreach ($onlineClassMeeting as $onlineClass) {
      $this->onlineClassMeetingService->updatePartialByClassScheduleID($onlineClass?->class_schedule_id, ["zoom_meeting_status" => "ENDED"]);
      dump("$onlineClass->topic (service learning) status has been updated to ENDED");
    }

    $onlineSchedulesResponse = $this->onlineScheduleService->getByZoomMeetingID("88591156319");
    $onlineSchedules = json_decode($onlineSchedulesResponse->body())?->data ?? [];
    $onlineSchedulesCount = count($onlineSchedules);

    if ($onlineSchedulesCount === 0) {
      return response()->json(
        [
          "success" => false,
          "message" => "[ZoomWebhook][meeting.ended] Could not update online schedule status to ENDED - Online Schedule data with Zoom Meeting ID: " . "84688517583" . " is not found on online class service"
        ],
        404
      );
    }

    dump("Getting online schedules");
    dump($onlineSchedules);

    // Change meeting status to ended (online schedule)
    foreach ($onlineSchedules as $index => $onlineSchedule) {
      $this->onlineScheduleService->updateScheduleStatus($onlineSchedule?->class_schedule_id, "ENDED");
      dump("$onlineSchedule->title (online class service) status has been updated to ENDED");
    }

    foreach ($onlineSchedules as $index => $onlineSchedule) {
      $currentOnlineScheduleCount = $index + 1;
      dump($currentOnlineScheduleCount);
      $classParticipantsResponse = $this->classParticipantService->getByClassroomID($onlineSchedule?->classroom_id);
      $classParticipants = json_decode($classParticipantsResponse->body())?->data ?? [];

      dump("Getting $onlineSchedule->title participants");
      dump($classParticipants);

      if (count($classParticipants) === 0) {
        if ($currentOnlineScheduleCount !== $onlineSchedulesCount) continue;
        return response()->json(['success' => true, 'message' => 'Meeting has been ended'], 200);
      }

      $participants = collect([]);
      $zoom_meeting_id = $onlineSchedule->zoom_meeting_id;

      dump("Getting meeting participant data from zoom API");
      $meetingParticipantsResponse = $this->zoomMeetingService->getPastMeetingParticipants($zoom_meeting_id, ['page_size' => 500]);
      $meetingParticipantsBody = json_decode($meetingParticipantsResponse->body());
      $meetingParticipantsStatus = $meetingParticipantsResponse->status();
      if ($meetingParticipantsStatus !== 200) {
        Log::error("[ZoomWebhook][meeting.ended] could not get meeting participants data from zoom API - Response returned with non 2xx status code", ["response" => $meetingParticipantsBody, "status" => $meetingParticipantsStatus]);
        return response()->json($meetingParticipantsBody, $meetingParticipantsStatus);
      }
      $participants->push($meetingParticipantsBody->participants);

      while ($meetingParticipantsBody->next_page_token) {
        $meetingParticipantsResponse = $this->zoomMeetingService->getPastMeetingParticipants($zoom_meeting_id, ['page_size' => 300, 'next_page_token' => $meetingParticipantsBody->next_page_token]);
        $meetingParticipantsBody = json_decode($meetingParticipantsResponse->body());
        $meetingParticipantsStatus = $meetingParticipantsResponse->status();
        if ($meetingParticipantsStatus !== 200) {
          Log::error("[ZoomWebhook][meeting.ended] could not get meeting participants data from zoom API - Response returned with non 2xx status code", ["response" => $meetingParticipantsBody, "status" => $meetingParticipantsStatus]);
          return response()->json($meetingParticipantsBody, $meetingParticipantsStatus);
        }
        if (!$meetingParticipantsBody->participants) continue;
        $participants->push($meetingParticipantsBody->participants);
      }

      $participants = $participants->collapse()->toArray();
      $participants = array_reduce($meetingParticipantsBody->participants, function ($carry, $item) {
        if (!isset($carry[$item->user_email])) {
          $carry[$item->user_email] = ['name' => $item->name, 'user_email' => $item->user_email, 'duration' => $item->duration];
        } else {
          $carry[$item->user_email]['duration'] += $item->duration;
        }
        return $carry;
      });
      dump($participants);

      $maxMeetingDuration = collect($participants)->max('duration');
      $maxMeetingDurationInMinutes = intval(ceil($maxMeetingDuration / 60)) < $onlineSchedule->duration
        ? intval(ceil($maxMeetingDuration / 60))
        : $onlineSchedule->duration;

      dump("Getting $onlineSchedule->title meeting participant report");
      $participants = collect($participants)->map(function ($item, $key) use ($maxMeetingDurationInMinutes) {
        $item["duration_in_minutes"] = intval(ceil($item["duration"] / 60));
        $item["duration_percentages"] = intval(ceil(($item["duration_in_minutes"] / $maxMeetingDurationInMinutes) * 100));
        return $item;
      })->values()->toArray();
      // Log::info("[ZoomWebhook][meeting.ended] Get meeting participants meeting duration", ["data" => $participants]);

      $presenceLog = collect($classParticipants)
        ->map(function ($item, $key) use ($participants, $zoom_meeting_id) {
          $participantEmail = array_column($participants, "user_email");
          $meetingParticipantArrayIndex = array_search($item->email, $participantEmail);
          $participant = $meetingParticipantArrayIndex === false ? null : $participants[$meetingParticipantArrayIndex];
          $logs = [];
          $logs["smartbtw_id"] = $item->smartbtw_id;
          $logs["meeting_id"] = $zoom_meeting_id;
          $logs["name"] = $item->name;
          $logs["comment"] = "-";
          $logs["user_email"] = $item->email;
          $logs["duration"] = $participant ? $participant["duration"] : 0;
          $logs["duration_in_minutes"] = $participant ? $participant["duration_in_minutes"] : 0;
          $logs["duration_percentages"] = $participant ? $participant["duration_percentages"] : 0;
          $logs["updated_by"] = "SYSTEM";

          if (!$participant) $logs["presence"] = "NOT_ATTEND";
          else $logs["presence"] = $participant["duration_percentages"] >= 60 ? "ATTEND" : "NOT_ATTEND";

          return $logs;
        })->values()->toArray();
      // Log::info("[ZoomWebhook][meeting.ended] Student presence log payload has been created", ["data" => $presenceLog]);
      RabbitMq::send("onlineclass-attendance.created", json_encode([
        "version" => 1,
        "data" => $presenceLog
      ]));
    }
    dd("Stop");

    foreach ($onlineSchedules as $index => $onlineSchedule) {

      // $meetingResponse = $this->zoomMeetingService->getMeetingById(84290063138);
      // $meetingBody = json_decode($meetingResponse->body());
      // $meetingStatus = $meetingResponse->status();
      // if($meetingStatus !== 200) {
      //   Log::error(
      //     "[ZoomWebhook][meeting.ended] could not get meeting data from zoom API - Response returned with non 2xx status code",
      //     ["response" => $meetingBody, "status" => $meetingStatus]
      //   );
      //   if($currentOnlineScheduleCount !== $onlineSchedulesCount) continue;
      //   return response()->json($meetingBody, $meetingStatus);
      // }
      RabbitMq::send("onlineclass-attendance.created", json_encode([
        "version" => 1,
        "data" => $presenceLog
      ]));
      // ProcessStudentPresence::dispatch(["online_schedule" => $onlineSchedule, "class_participants" => $classParticipants])->delay(Carbon::now()->addMinutes(3));
    }

    // $meetingParticipantsResponse = $this->zoomMeetingService->getPastMeetingParticipants($meetingBody->id, ['page_size' => 500]);
    // $meetingParticipantsBody = json_decode($meetingParticipantsResponse->body());
    // $meetingParticipantsStatus = $meetingParticipantsResponse->status();
    // if($meetingParticipantsStatus !== 200) {
    //   Log::error(
    //     "[ZoomWebhook][meeting.ended] could not get meeting participants data from zoom API - Response returned with non 2xx status code",
    //     ["response" => $meetingParticipantsBody, "status" => $meetingParticipantsStatus]
    //   );
    //   return response()->json($meetingParticipantsBody, $meetingParticipantsStatus);
    // }

    // $participants = array_reduce($meetingParticipantsBody->participants, function($carry, $item) {
    //   if(!isset($carry[$item->user_email])) {
    //     $carry[$item->user_email] = ['name' => $item->name, 'user_email' => $item->user_email, 'duration' => $item->duration];
    //   } else {
    //     $carry[$item->user_email]['duration'] += $item->duration;
    //   }
    //   return $carry;
    // });

    // $maxMeetingDuration = collect($participants)->max('duration');
    // $maxMeetingDurationInMinutes = intval(ceil($maxMeetingDuration / 60));

    // $participants = collect($participants)->map(function($item, $key) use ($maxMeetingDurationInMinutes) {
    //   $item["duration_in_minutes"] = intval(ceil($item["duration"] / 60));
    //   $item['duration_percentages'] = intval(ceil(($item["duration_in_minutes"] / $maxMeetingDurationInMinutes) * 100));
    //   return $item;
    // })->values()->toArray();
    // Log::info("[ZoomWebhook][meeting.ended] Get meeting participants meeting duration", ["data" => $participants]);

    // $presencePayload = ["classroom_id" => $onlineClassMeeting->classroom_id, "class_schedule_id" => $onlineClassMeeting->class_schedule_id, "created_by" => "SYSTEM", "comment" => "Generated By SYSTEM"];
    // $presenceLog = collect($classMembers)
    // ->map(function($item, $key) use($participants) {
    //   $participantEmail = array_column($participants, "user_email");
    //   $meetingParticipantArrayIndex = array_search($item->email, $participantEmail);
    //   $participant = $meetingParticipantArrayIndex === false ? null : $participants[$meetingParticipantArrayIndex];

    //   $logs = [];
    //   $logs["name"] = $item->name;
    //   $logs["smartbtw_id"] = $item->smartbtw_id;
    //   if(!$participant) $logs["presence"] = "NOT_ATTEND";
    //   else $logs["presence"] = $participant["duration_percentages"] >= 75 ? "ATTEND" : "NOT_ATTEND";

    //   return $logs;
    // })->values()->toArray();
    // $presencePayload["logs"] = $presenceLog;
    // Log::info("[ZoomWebhook][meeting.ended] Student presence log payload has been created", ["data" => $presencePayload]);

    // $this->studentPresenceService->createForZoomWebhook($presencePayload);
    return response()->json(['success' => true, 'message' => 'Meeting has been ended'], 200);
  }

  public function processWebhookNotification(Request $request)
  {
    $body = $request->getContent();
    $decodedBody = json_decode($body);

    $timestampHeader = $request->header('x-zm-request-timestamp');

    // Construct the message string
    $message = "v0:$timestampHeader:$body";
    $hashForVerify = hash_hmac("sha256", $message, env("ZOOM_WEBHOOK_SECRET_TOKEN"));

    // Hash the message string with Zoom Webhook Secret Token and prepend the version semantic
    $signature = "v0=$hashForVerify";

    // Validating the request came from Zoom https://marketplace.zoom.us/docs/api-reference/webhook-reference#notification-structure
    if ($request->header('x-zm-signature') === $signature) {
      // Webhook request came from Zoom
      // Zoom validating you control the webhook endpoint https://marketplace.zoom.us/docs/api-reference/webhook-reference#validate-webhook-endpoint
      if ($decodedBody->event === "endpoint.url_validation") {
        $hashForValidate = hash_hmac("sha256", $decodedBody->payload->plainToken, env("ZOOM_WEBHOOK_SECRET_TOKEN"));
        $response = [
          "message" => ["plainToken" => $decodedBody->payload->plainToken, "encryptedToken" => $hashForValidate],
          "status" => 200,
        ];
        return response()->json($response["message"], $response["status"]);
      }

      // Make your business logic here
      if ($decodedBody->event === "meeting.started") {
        $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByZoomMeetingID($decodedBody->payload->object->id);
        $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? [];
        if (count($onlineClassMeeting) === 0) {
          return response()->json(
            [
              "success" => false,
              "message" => "[ZoomWebhook][meeting.started] Could not update online class meeting status to STARTED - Online Class Meeting data with Zoom Meeting ID: " . $decodedBody->payload->object->id . " is not found on learning service"
            ],
            404
          );
        }

        // Change meeting status to started (online class meeting)
        foreach ($onlineClassMeeting as $onlineClass) {
          $this->onlineClassMeetingService->updatePartialByClassScheduleID($onlineClass?->class_schedule_id, ["zoom_meeting_status" => "STARTED"]);
        }

        $onlineSchedulesResponse = $this->onlineScheduleService->getByZoomMeetingID($decodedBody->payload->object->id);
        $onlineSchedules = json_decode($onlineSchedulesResponse->body())?->data ?? [];
        if (count($onlineSchedules) === 0) {
          return response()->json(
            [
              "success" => false,
              "message" => "[ZoomWebhook][meeting.started] Could not update online schedule status to STARTED - Online Schedule data with Zoom Meeting ID: " . $decodedBody->payload->object->id . " is not found on online class service"
            ],
            404
          );
        }

        // Change meeting status to started (online schedule)
        foreach ($onlineSchedules as $onlineSchedule) {
          $this->onlineScheduleService->updateScheduleStatus($onlineSchedule?->class_schedule_id, "STARTED");
        }
        return response()->json(['success' => true, 'message' => "Meeting ID: " . $decodedBody->payload->object->id . " has been started"], 200);
      }

      if ($decodedBody->event === "meeting.ended") {
        $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByZoomMeetingID($decodedBody->payload->object->id);
        $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? [];
        if (count($onlineClassMeeting) === 0) {
          return response()->json(
            [
              "success" => false,
              "message" => "[ZoomWebhook][meeting.ended] could not update online class meeting status to ENDED - Online Class Meeting data with Zoom Meeting ID: " . $decodedBody->payload->object->id . " is not found on learning service"
            ],
            404
          );
        }
        foreach ($onlineClassMeeting as $onlineClass) {
          $this->onlineClassMeetingService->updatePartialByClassScheduleID($onlineClass?->class_schedule_id, ["zoom_meeting_status" => "ENDED"]);
        }

        $onlineSchedulesResponse = $this->onlineScheduleService->getByZoomMeetingID($decodedBody->payload->object->id);
        $onlineSchedules = json_decode($onlineSchedulesResponse->body())?->data ?? [];
        $onlineSchedulesCount = count($onlineSchedules);

        if ($onlineSchedulesCount === 0) {
          return response()->json(
            [
              "success" => false,
              "message" => "[ZoomWebhook][meeting.ended] Could not update online schedule status to ENDED - Online Schedule data with Zoom Meeting ID: " . $decodedBody->payload->object->id . " is not found on online class service"
            ],
            404
          );
        }

        // Change meeting status to started (online schedule)
        foreach ($onlineSchedules as $index => $onlineSchedule) {
          $currentOnlineScheduleCount = $index + 1;
          $this->onlineScheduleService->updateScheduleStatus($onlineSchedule?->class_schedule_id, "ENDED");
          $classParticipantsResponse = $this->classParticipantService->getByClassroomID($onlineSchedule?->classroom_id);
          $classParticipants = json_decode($classParticipantsResponse->body())?->data ?? [];
          if (count($classParticipants) === 0) {
            if ($currentOnlineScheduleCount !== $onlineSchedulesCount) continue;
            return response()->json(['success' => true, 'message' => 'Meeting has been ended'], 200);
          }

          $onlineAttendanceResponse = $this->onlineAttendanceService->getScheduleAttendance($onlineSchedule?->class_schedule_id);
          $onlineAttendees = json_decode($onlineAttendanceResponse->body())?->data ?? [];
          $isSomeAttendeesHaveBeenRecorded = collect($onlineAttendees)->some(fn ($value, $key) => $value->is_attend_available !== false);
          if ($isSomeAttendeesHaveBeenRecorded) {
            if ($currentOnlineScheduleCount !== $onlineSchedulesCount) continue;
            return response()->json(['success' => true, 'message' => 'Meeting has been ended'], 200);
          }

          $meetingResponse = $this->zoomMeetingService->getMeetingById($decodedBody->payload->object->id);
          $meetingBody = json_decode($meetingResponse->body());
          $meetingStatus = $meetingResponse->status();
          if ($meetingStatus !== 200) {
            Log::error(
              "[ZoomWebhook][meeting.ended] could not get meeting data from zoom API - Response returned with non 2xx status code",
              ["response" => $meetingBody, "status" => $meetingStatus]
            );
            if ($currentOnlineScheduleCount !== $onlineSchedulesCount) continue;
            return response()->json($meetingBody, $meetingStatus);
          }
          ProcessStudentPresence::dispatch(["online_schedule" => $onlineSchedule, "class_participants" => $classParticipants])->delay(Carbon::now()->addMinutes(3));
          sleep(3);
        }
        return response()->json(['success' => true, 'message' => 'Meeting has been ended'], 200);
      }
    } else {
      // Webhook request did not come from Zoom
      $response = [
        'message' => 'Unauthorized request, signature mismatch',
        'status' => 401
      ];
      $slackResponse = array_merge($response, ['header_signature' => $request->header('x-zm-signature'), 'hashed_signature' => $signature]);
      Log::error($response["message"], ['response' => json_encode($slackResponse), 'body' => $body]);
      return response()->json($response, $response["status"]);
    }
  }
}

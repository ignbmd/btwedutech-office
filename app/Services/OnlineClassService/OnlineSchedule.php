<?php

namespace App\Services\OnlineClassService;

use App\Services\Service;
use App\Services\ServiceContract;

class OnlineSchedule extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.onlineclass', '');
  }

  public function getByClassroomID(string $classroom_id)
  {
    return $this->http->get(url: "/online-schedule/$classroom_id");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/online-schedule", data: $payload);
  }

  public function update(string $id, array $payload)
  {
    return $this->http->put(url: "/online-schedule/$id", data: $payload);
  }

  public function updateScheduleStatus(string $schedule_id, string $zoom_meeting_status)
  {
    return $this->http->put(url: "/online-schedule/meeting-status/$schedule_id", data: ["zoom_meeting_status" => $zoom_meeting_status]);
  }

  // Get online schedules by classroom id with attendences count
  public function getByClassroomIDV2(string $schedule_id)
  {
    return $this->http->get("/online-schedule/by-classroom-id/new/$schedule_id");
  }

  public function getByZoomMeetingID(string $zoom_meeting_id)
  {
    return $this->http->get("/online-schedule/by-meeting-id/$zoom_meeting_id");
  }

  public function getByScheduleID(string $schedule_id)
  {
    return $this->http->get("/online-schedule/by-schedule-id/$schedule_id");
  }

  public function updateRegistrantStatus(array $payload)
  {
    return $this->http->post("/online-schedule/meeting-status/non-registrant", $payload);
  }
}

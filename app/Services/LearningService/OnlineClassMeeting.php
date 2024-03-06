<?php

namespace App\Services\LearningService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class OnlineClassMeeting extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getByClassScheduleID(string $class_schedule_id)
  {
    return $this->http->get("/online-class-meeting/" . $class_schedule_id);
  }

  public function getByZoomMeetingID(string $zoom_meeting_id)
  {
    return $this->http->get("/online-class-meeting/zoom/" . $zoom_meeting_id);
  }

  public function create(array $payload)
  {
    return $this->http->post("/online-class-meeting", $payload);
  }

  public function updateByClassScheduleID(string $class_schedule_id, array $payload)
  {
    return $this->http->put("/online-class-meeting/" . $class_schedule_id, $payload);
  }

  public function updatePartialByClassScheduleID(string $class_schedule_id, array $payload)
  {
    return $this->http->patch("/online-class-meeting/" . $class_schedule_id, $payload);
  }

  public function deleteByClassScheduleID(string $class_schedule_id)
  {
    return $this->http->delete("/online-class-meeting/" . $class_schedule_id);
  }

}

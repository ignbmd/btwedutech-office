<?php

namespace App\Services\OnlineClassService;

use App\Services\Service;
use App\Services\ServiceContract;

class OnlineAttendance extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.onlineclass', '');
  }

  public function getScheduleAttendance(string $schedule_id)
  {
    return $this->http->get("/online-schedule/attendances/schedule-id/$schedule_id");
  }

  public function updateScheduleAttendance(string $schedule_id, array $payload)
  {
    return $this->http->put("/online-attendance/by-class-schedule/$schedule_id", $payload);
  }
}

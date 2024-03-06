<?php

namespace App\Services\OnlineClassService;

use App\Services\Service;
use App\Services\ServiceContract;

class ClassParticipant extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.onlineclass', '');
  }

  public function getByClassroomID(string $classroom_id)
  {
    return $this->http->get(url: "/class-participant/$classroom_id");
  }
}

<?php

namespace App\Services\SamaptaService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Student extends Service implements ServiceContract
{
  use HasBranch;
  protected function serviceAddress(): string
  {
    return config('services.btw.samapta', '');
  }

  public function getAllStudents(array $query)
  {
    return $this->http->get(url: '/students', query: $query);
  }

  public function getStudentByClassroomId(string $classroomID)
  {
    return $this->http->get(url: "/classroom/{$classroomID}/student");
  }

  public function getStudentBySessionId(string $sessionId)
  {
    return $this->http->get(url: "/session/{$sessionId}/student");
  }
}

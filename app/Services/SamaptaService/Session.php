<?php

namespace App\Services\SamaptaService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Session extends Service implements ServiceContract
{
  use HasBranch;
  protected function serviceAddress(): string
  {
    return config('services.btw.samapta', '');
  }

  public function getGroupSessionByClassroomId($id)
  {
    $response = $this->http->get(url: "/classroom-group/group-by-classroom/{$id}");
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getGroupSessionWithRecordByClasroomId($id)
  {
    $query = ["with_record" => 1];
    $response = $this->http->get(url: "/classroom-group/group-by-classroom/{$id}", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function createSession(array $payload)
  {
    return $this->http->post(url: "/classroom-group/create", data: $payload);
  }

  public function getStudentBySessionId($id, $query)
  {
    $response = $this->http->get(url: "/record-classroom/get-by-group/{$id}", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function updateScoreSessionByClassroomId($id, $payload)
  {
    return $this->http->put(url: "/classroom-group/update/{$id}", data: $payload);
  }

  public function getStudentBySmartbtwId($smartbtwId)
  {
    $response = $this->http->get(url: "/record-classroom/get-by-smartbtw/{$smartbtwId}");
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSessionBySessionId($sessionId)
  {
    $response = $this->http->get(url: "/classroom-group/get-by-id/{$sessionId}");
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getChartBySmartbtwId($smartbtwId, $query)
  {
    $response = $this->http->get(url: "/record-classroom/chart-sekdin/{$smartbtwId}", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getAllStudentData()
  {
    $response = $this->http->get(url: "/record-classroom/all");
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getAverageScoreStudentWithFilter($payload)
  {
    return $this->http->post(url: "/record-classroom/all-with-filter", data: $payload);
  }

  public function getStudentScoreByClassroomId($classroom_id)
  {
    return $this->http->get(url: "/record-classroom/all-classroom/{$classroom_id}");
  }
}

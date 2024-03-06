<?php

namespace App\Services\LearningService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Student extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getBySmartbtwIds(array $smartbtw_ids)
  {
    $query = ['smartbtw_ids' => $smartbtw_ids];
    $response = $this->http->get(url: '/student/by-smartbtw-ids', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function findStudent(array $query) {
    $response = $this->http->get(url: '/student', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function createUpdateStudent(array $payload) {
    $response = $this->http->post(url: '/student/upsert', data: $payload);
    return $response;
  }
}

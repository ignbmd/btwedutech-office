<?php

namespace App\Services\LearningService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class User extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getUser($query)
  {
    $response = $this->http->get(url: '/user', query: $query);
    $data = json_decode($response?->body());
    return $data?->data;
  }

  public function getBio($query)
  {
    $response = $this->http->get(url: '/user', query: $query);
    $data = json_decode($response?->body());
    return $data?->data[0]?->bio ?? '';
  }

  public function updateBySSOId($ssoId, $payload)
  {
    $response = $this->http->post(url: "/user/" . $ssoId, data: $payload);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function createMany($payload)
  {
    $response = $this->http->post(url: "/user/many", data: $payload);
    $data = json_decode($response?->body());
    return $data ?? [];
  }
}

<?php

namespace App\Services\SamaptaService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Classroom extends Service implements ServiceContract
{
  use HasBranch;
  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getAll($query = [])
  {
    $response = $this->http->get(url: '/classroom', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  // get ClassMember
  public function getByClassroomIds(array $classroom_ids)
  {
    $query = ['classroom_id' => $classroom_ids];
    $response = $this->http->get(url: '/class-member/by-classroom-ids', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSingle(string $id)
  {
    $query = ['_id' => $id];
    $response = $this->http->get(url: "/classroom", query: $query);
    $data = json_decode($response?->body());
    $data = collect($data?->data ?? []);
    return $data->count() > 0 ? $data->first() : null;
  }

  public function getByClassroomId(string $classroom_id)
  {
    $query = ['classroom_id' => $classroom_id];
    $response = $this->http->get(url: '/class-member/' . $classroom_id, query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }
}

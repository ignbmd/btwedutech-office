<?php

namespace App\Services\LearningService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class ClassMember extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function addStudentToClass(int $smartbtw_id, string $classroom_id)
  {
    $payload = ["smartbtw_id" => $smartbtw_id, "classroom_id" => $classroom_id];
    $response = $this->http->post(url: "/class-member", data: $payload);
    $data = json_decode($response->body());
    return $data;
  }

  public function getByClassroomId(string $classroom_id)
  {
    $query = ['classroom_id' => $classroom_id];
    $response = $this->http->get(url: '/class-member/' . $classroom_id, query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getByClassroomIds(array $classroom_ids)
  {
    $query = ['classroom_id' => $classroom_ids];
    $response = $this->http->get(url: '/class-member/by-classroom-ids', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getByBranchCodes(array $branch_codes)
  {
    $query = ['branch_code' => $branch_codes];
    $response = $this->http->get(url: '/class-member/by-branch-codes', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function updateStudentClass(string $classroom_id, string $member_id)
  {
    $payload = ['classroom_id' => $classroom_id];
    return $this->http->put(url: "/class-member/" . $member_id, data: $payload);
  }

  public function upsertMany($payload)
  {
    return $this->http->post('/class-member/upsert-many', data: $payload);
  }

  public function remove(string $classroom_id, int $smartbtw_id)
  {
    $query = ["classroom_id" => $classroom_id, "smartbtw_id" => $smartbtw_id];
    $response = $this->http->delete(url: "/class-member", data: $query);
    $data = json_decode($response?->body());
    return $data;
  }
}

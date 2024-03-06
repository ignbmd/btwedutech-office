<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Package extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam', '');
  }

  public function getAll()
  {
    $response = $this->http->get(url: '/packages/premium');
    $data = json_decode($response->body());
    return $data?->data ?? [];
  }

  public function getById(int $id)
  {
    $response = $this->http->get(url: '/packages/premium', query: ['id' => $id]);
    $data = json_decode($response->body());
    return $data?->data ?? [];
  }

  public function getByIdV2(int $id)
  {
    return $this->http->get(url: "/client/packages/id/$id");
  }

  public function createBulk(array $payload)
  {
    $response = $this->http->post(
      url: "/packages/premium/bulk",
      data: $payload
    );
    return $response;
  }

  public function update(string $id, array $payload)
  {
    return $this->http->put(url: "/packages/premium/$id", data: $payload);
  }

  public function delete(string $id)
  {
    return $this->http->delete("/packages/premium/{$id}");
  }

  public function getAllUKAList(string $programs, string $category)
  {
    $query = ["program" => $programs, "category" => $category];
    return $this->http->get("/packages/uka-list", query: $query);
  }

  public function getUkaByTaskId(int $taskId)
  {
    return $this->http->get("/packages/office/$taskId");
  }
}

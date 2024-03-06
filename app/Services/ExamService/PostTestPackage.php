<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class PostTestPackage extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam', '');
  }

  public function getAll()
  {
    $response = $this->http->get(url: '/packages/post-test');
    $data = json_decode($response->body());
    return $data?->data ?? [];
  }

  public function getById(int $id)
  {
    $response = $this->http->get(url: '/packages/post-test', query: ['id' => $id]);
    $data = json_decode($response->body());
    return $data?->data ?? [];
  }

  public function getByProgram(string $program)
  {
    $response = $this->http->get(url: "/packages/post-test/$program");
    $data = json_decode($response->body());
    return $data?->data ?? [];
  }

  public function createBulk(array $payload) {
    $response = $this->http->post(
      url: "/packages/post-test/bulk",
      data: $payload
    );
    return $response;
  }

  public function update(string $id, array $payload)
  {
    return $this->http->put(url: "/packages/post-test/$id", data: $payload);
  }
}

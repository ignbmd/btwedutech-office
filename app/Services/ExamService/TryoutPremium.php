<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TryoutPremium extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam', '');
  }

  public function getAll()
  {
    return $this->http->get(url: '/packages/tryout-premium');
  }

  public function getById(int $id)
  {
    return $this->http->get(url: "/packages/tryout-premium/$id");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/packages/tryout-premium", data: $payload);
  }

  public function createBulk(array $payload) {
    return $this->http->post(
      url: "/packages/tryout-premium/bulk",
      data: $payload
    );
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put(url: "/packages/tryout-premium/$id", data: $payload);
  }

  public function syncTryoutGeneratedStatus(array $payload)
  {
    return $this->http->post("/utility/redis/sync", $payload);
  }
}

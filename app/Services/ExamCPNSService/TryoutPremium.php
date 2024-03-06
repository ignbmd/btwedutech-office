<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TryoutPremium extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam_cpns', '');
  }

  public function getAll()
  {
    return $this->http->get(url: '/tryout/tryout-premium');
  }

  public function getById(int $id)
  {
    return $this->http->get(url: "/tryout/tryout-premium/$id");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/tryout/tryout-premium", data: $payload);
  }

  public function createBulk(array $payload) {
    return $this->http->post(
      url: "/tryout/tryout-premium/bulk",
      data: $payload
    );
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put(url: "/tryout/tryout-premium/$id", data: $payload);
  }
}

<?php

namespace App\Services\StagesService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Reward extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.stages', '');
  }

  public function getAll(array $query = [])
  {
    return $this->http->get(url: "/reward", query: $query);
  }

  public function getByID(string $id, array $query = [])
  {
    return $this->http->get(url: "/reward/$id", query: $query);
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/reward", data: $payload);
  }

  public function update(string $id, array $payload)
  {
    return $this->http->put(url: "/reward/$id", data: $payload);
  }
}

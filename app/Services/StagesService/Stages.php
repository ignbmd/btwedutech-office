<?php

namespace App\Services\StagesService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Stages extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.stages', '');
  }

  public function getStageById(string $id)
  {
    return $this->http->get(url: "/stages/$id");
  }

  public function getStageByType(string $type, array $query = [])
  {
    return $this->http->get(url: "/stages-by-type/$type", query: $query);
  }

  public function getStageByTypeAndLevel(int $level, string $type)
  {
    return $this->http->get(url: "/stages-by-type-and-level/$level/$type");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/stages", data: $payload);
  }

  public function update(string $id, array $payload)
  {
    return $this->http->put(url: "/stages/$id", data: $payload);
  }

  public function updateLockStatus(array $payload)
  {
    return $this->http->put(url :"/stages-update-locked", data: $payload);
  }

  public function getClassStagesByType(string $type)
  {
    return $this->http->get(url: "/stages-regular-class-by-type/$type");
  }

  public function getClassStageById(string $id)
  {
    return $this->http->get(url: "/stages-regular-class/$id");
  }

  public function createClassStage(array $payload)
  {
    return $this->http->post(url: "/stages-regular-class", data: $payload);
  }

  public function updateClassStage(string $id, array $payload)
  {
    return $this->http->put(url: "/stages-regular-class/$id", data: $payload);
  }

  public function updateClassStageLockStatus(array $payload)
  {
    return $this->http->put(url: "/stages-regular-class-update-locked", data: $payload);
  }
}

<?php

namespace App\Services\CompetitionMapService;

use App\Services\Service;
use App\Services\ServiceContract;

class Competition extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.comp-map-v2', '');
  }

  public function get()
  {
    return $this->http->get(url: "/competition");
  }

  public function getById($id)
  {
    return $this->http->get(url: "/competition/$id");
  }

  public function store(array $payload)
  {
    return $this->http->post(url: "/competition", data: $payload);
  }

  public function update(array $payload)
  {
    return $this->http->put(url: "/competition", data: $payload);
  }

  public function delete($id)
  {
    return $this->http->delete(url: "/competition/$id");
  }

  public function getCacheData()
  {
    return $this->http->get("/competition/caches/all");
  }
}

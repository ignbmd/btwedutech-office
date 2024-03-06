<?php

namespace App\Services\CompetitionMapService;

use App\Services\Service;
use App\Services\ServiceContract;

class LastEducation extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.comp-map-v2', '');
  }

  public function get()
  {
    return $this->http->get(url: "/lasted");
  }

  public function getById($id)
  {
    return $this->http->get(url: "/lasted/$id");
  }

  public function store(array $payload)
  {
    return $this->http->post(url: "/lasted", data: $payload);
  }

  public function update(array $payload)
  {
    return $this->http->put(url: "/lasted", data: $payload);
  }

  public function delete($id)
  {
    return $this->http->delete(url: "/lasted/$id");
  }
}

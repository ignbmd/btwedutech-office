<?php

namespace App\Services\CompetitionMapService;

use App\Services\Service;
use App\Services\ServiceContract;

class School extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.comp-map-v2', '');
  }

  public function get()
  {
    return $this->http->get(url: "/school");
  }

  public function getById($id)
  {
    return $this->http->get(url: "/school/$id");
  }

  public function store(array $payload)
  {
    return $this->http->post(url: "/school", data: $payload);
  }

  public function update(array $payload)
  {
    return $this->http->put(url: "/school", data: $payload);
  }

  public function delete($id)
  {
    return $this->http->delete(url: "/school/$id");
  }

  public function getSchoolOriginEducations(string $school_type)
  {
    return $this->http->get(url: "/lasted?school_origin=" . $school_type);
  }
}

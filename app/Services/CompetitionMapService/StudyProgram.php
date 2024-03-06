<?php

namespace App\Services\CompetitionMapService;

use App\Services\Service;
use App\Services\ServiceContract;

class StudyProgram extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.comp-map-v2', '');
  }

  public function get()
  {
    return $this->http->get(url: "/study-program");
  }

  public function getById($id)
  {
    return $this->http->get(url: "/study-program/$id");
  }

  public function getBySchoolId($id)
  {
    return $this->http->get(url: "/study-program-school/$id");
  }

  public function store(array $payload)
  {
    return $this->http->post(url: "/study-program", data: $payload);
  }

  public function update(array $payload)
  {
    return $this->http->put(url: "/study-program", data: $payload);
  }

  public function delete($id)
  {
    return $this->http->delete(url: "/study-program/$id");
  }
}

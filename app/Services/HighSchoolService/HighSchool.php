<?php

namespace App\Services\HighSchoolService;

use App\Services\Service;
use App\Services\ServiceContract;

class HighSchool extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.highschool', '');
  }

  public function get(array $query)
  {
    return $this->http->get(url: "/school", query: $query);
  }

  public function getWithPagination(array $query)
  {
    return $this->http->get(url: "/school-pagination", query: $query);
  }

  public function getById(string $id)
  {
    return $this->http->get(url: "/school/$id");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/school", data: $payload);
  }

  public function update(string $id, array $payload)
  {
    return $this->http->put(url: "/school/$id", data: $payload);
  }

  public function delete(string $id)
  {
    return $this->http->delete(url: "/school/$id");
  }

}

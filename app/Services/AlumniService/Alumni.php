<?php

namespace App\Services\AlumniService;

use App\Services\Service;
use App\Services\ServiceContract;

class Alumni extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.alumni', '');
  }

  public function getAll(string $program, string $selection)
  {
    return $this->http->get(url: "/alumni/$program/$selection");
  }

  public function getAllWithPagination(string $program, string $selection)
  {
    return $this->http->get(url: "/alumni/$program/$selection");
  }

  public function getByID(string $program, string $selection, string $id)
  {
    return $this->http->get(url: "/alumni/$program/$selection/$id");
  }

  public function create(string $program, string $selection, array $payload)
  {
    return $this->http->post(url: "/alumni/$program/$selection", data: $payload);
  }

  public function createBulk(string $program, string $selection, array $payload)
  {
    return $this->http->post(url: "/alumni/$program/$selection/bulk", data: $payload);
  }

  public function update(string $program, string $selection, string $id, array $payload)
  {
    return $this->http->put(url: "/alumni/$program/$selection/$id", data: $payload);
  }

  public function delete(string $program, string $selection, string $id)
  {
    return $this->http->delete(url: "/alumni/$program/$selection/$id");
  }
}

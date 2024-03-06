<?php

namespace App\Services\LocationService;

use App\Services\Service;
use App\Services\ServiceContract;

class Location extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.location', '');
  }

  public function get(array $query = [])
  {
    return $this->http->get(url: "/location", query: $query);
  }

  public function getByIds(array $ids)
  {
    $queryString = implode('&', array_map(function ($id) {
      return "ids={$id}";
    }, $ids));
    return $this->http->get(url: "/location/by-ids", query: $queryString);
  }

  public function update(string $id, array $payload)
  {
    return $this->http->put(url: "/location/$id", data: $payload);
  }
}

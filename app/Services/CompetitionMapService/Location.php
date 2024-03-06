<?php

namespace App\Services\CompetitionMapService;

use App\Services\Service;
use App\Services\ServiceContract;

class Location extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.comp-map-v2', '');
  }

  public function get()
  {
    return $this->http->get(url: "/location");
  }

  public function getById($id)
  {
    return $this->http->get(url: "/location/$id");
  }

  public function getProvinces()
  {
    return $this->http->get(url: "/location-type/PROVINCE");
  }

  public function getRegion()
  {
    return $this->http->get(url: "/location-type/REGION");
  }

  public function getRegionByParentId($parent_id)
  {
    return $this->http->get(url: "location-parent/$parent_id");
  }

  public function store(array $payload)
  {
    return $this->http->post(url: "/location", data: $payload);
  }

  public function update(array $payload)
  {
    return $this->http->put(url: "/location", data: $payload);
  }

  public function delete($id)
  {
    return $this->http->delete(url: "/location/$id");
  }
}

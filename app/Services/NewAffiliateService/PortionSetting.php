<?php

namespace App\Services\NewAffiliateService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class PortionSetting extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.new_affiliate", "");
  }

  public function getAll()
  {
    return $this->http->get("/portion-setting");
  }

  public function getById(int $id)
  {
    return $this->http->get("/portion-setting/{$id}");
  }

  public function createPortion(array $payload)
  {
    return $this->http->post("/portion-setting", $payload);
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put("/portion-setting/{$id}", $payload);
  }
}

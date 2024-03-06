<?php

namespace App\Services\NewAffiliateService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TaxSetting extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.new_affiliate", "");
  }

  public function getAll()
  {
    return $this->http->get("/tax-setting");
  }

  public function getById(int $id)
  {
    return $this->http->get("/tax-setting/{$id}");
  }

  public function create(array $payload)
  {
    return $this->http->post("/tax-setting", $payload);
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put("/tax-setting/{$id}", $payload);
  }
}

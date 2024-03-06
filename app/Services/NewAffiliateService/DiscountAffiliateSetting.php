<?php

namespace App\Services\NewAffiliateService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class DiscountAffiliateSetting extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.new_affiliate", "");
  }

  public function getAll()
  {
    return $this->http->get("/discount-affiliate-setting-all");
  }

  public function getById(int $id)
  {
    return $this->http->get("/discount-affiliate-setting/{$id}");
  }

  public function createDiscount(array $payload)
  {
    return $this->http->post("/discount-affiliate-setting", $payload);
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put("/discount-affiliate-setting/{$id}", $payload);
  }
}

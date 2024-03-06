<?php

namespace App\Services\NewAffiliateService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class DiscountSpecificProduct extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.new_affiliate", "");
  }

  public function getByAffiliateCode(string $affiliate_code)
  {
    return $this->http->get("/discount-affiliate/$affiliate_code");
  }

  public function getById(int $id)
  {
    return $this->http->get("/discount-specific-product-by-id/{$id}");
  }

  public function store(array $payload)
  {
    return $this->http->post("/discount-specific-product", $payload);
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put("/discount-specific-product/{$id}", $payload);
  }

  public function storeBulk(array $payload)
  {
    return $this->http->post("/discount-affiliate-setting-bulk", $payload);
  }
}

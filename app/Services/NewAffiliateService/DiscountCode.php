<?php

namespace App\Services\NewAffiliateService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class DiscountCode extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.new_affiliate", "");
  }

  public function getAll()
  {
    return $this->http->get("/discount-code-all");
  }

  public function getById(int $id)
  {
    return $this->http->get("/discount-code/{$id}");
  }

  public function getByIdentifier(string $identifier)
  {
    return $this->http->get("/discount-code-get/{$identifier}");
  }

  public function checkEligibility(array $payload, string|null $system_only = null)
  {
    $url = is_null($system_only) ? "/discount-code-check" : "/discount-code-check?system_only=$system_only";
    return $this->http->post($url, $payload);
  }

  public function createForCentral(array $payload)
  {
    return $this->http->post("/discount-code-central", $payload);
  }

  public function createForBranch(array $payload)
  {
    return $this->http->post("/discount-code-branch", $payload);
  }

  public function update(array $payload)
  {
    return $this->http->put("/discount-code", $payload);
  }

  public function delete(int $id, array $payload)
  {
    return $this->http->delete("/discount-code/$id", $payload);
  }

  public function checkAffiliateDiscountCode(string $affiliate_code)
  {
    return $this->http->get("/discount-code-check-only/$affiliate_code");
  }

  public function checkDiscountCodeForMultipleProducts(array $payload)
  {
    return $this->http->post("/discount-code-check-bulk", $payload);
  }
}

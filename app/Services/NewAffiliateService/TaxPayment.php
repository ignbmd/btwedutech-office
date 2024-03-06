<?php

namespace App\Services\NewAffiliateService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TaxPayment extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.new_affiliate", "");
  }

  public function getTaxPayment(string|null $status)
  {
    $url = "/tax-payment-status";
    if ($status) {
      $url = $url . "?status=$status";
    }
    return $this->http->get($url);
  }

  public function getTaxPaymentPending()
  {
    return $this->http->get("/tax-payment-pending");
  }

  public function update(array $payload)
  {
    return $this->http->put("/tax-payment", $payload);
  }

  public function getById($id)
  {
    return $this->http->get("/tax-paymnet-by-id/{$id}");
  }
}

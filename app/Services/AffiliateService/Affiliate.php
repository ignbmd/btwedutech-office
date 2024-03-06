<?php

namespace App\Services\AffiliateService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Affiliate extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.affiliate', '');
  }

  public function getPromoByCode(array $payload) {
    $response = $this->http->post(url: "/promo-code/check", data: $payload);
    $data = json_decode($response?->body());
    return $data;
  }

  public function createTransaction(array $payload) {
    $response = $this->http->post(url: "/promo-code/transactions", data: $payload);
    $data = json_decode($response?->body());
    return $data;
  }
}

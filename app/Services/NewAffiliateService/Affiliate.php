<?php

namespace App\Services\NewAffiliateService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Affiliate extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.new_affiliate', '');
  }

  public function getAll()
  {
    return $this->http->get(url: "/affiliate");
  }

  public function getSingleBySSOID(string $sso_id)
  {
    return $this->http->get(url: "/affiliate/$sso_id");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/affiliate", data: $payload);
  }

  public function createForSiplah(array $payload)
  {
    return $this->http->post(url: "/affiliate-siplah", data: $payload);
  }

  public function update(string $sso_id, array $payload)
  {
    return $this->http->put(url: "/affiliate-office/$sso_id", data: $payload);
  }

  public function getAffiliateWallets(int $affiliate_id)
  {
    return $this->http->get(url: "/wallet/$affiliate_id");
  }

  public function getAffiliateTransactionHistories(int $affiliate_id)
  {
    return $this->http->get(url: "/transaction-history/$affiliate_id");
  }
  public function verificationAffiliate($payload)
  {
    return $this->http->put(url: "/affiliate-verify-status", data: $payload);
  }

  public function updateToUpliner(int $affiliate_id)
  {
    return $this->http->post(url: "/affiliate-upliner/$affiliate_id");
  }

  public function getBankAccountUpdateRequest()
  {
    return $this->http->get(url: "/affiliate-bank-request");
  }

  public function processBankAccountUpdateRequest(array $payload)
  {
    return $this->http->post(url: "/affiliate-bank-update", data: $payload);
  }

  public function getSingleBySchoolID(string $school_id)
  {
    return $this->http->get("/affiliate-school/$school_id");
  }

  public function getAffiliateTotal()
  {
    return $this->http->get("/affiliate-total");
  }
}

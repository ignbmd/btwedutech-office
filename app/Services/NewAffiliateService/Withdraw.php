<?php

namespace App\Services\NewAffiliateService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Withdraw extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.new_affiliate', '');
  }

  public function get(string | null $withdrawStatus)
  {
    $url = !is_null($withdrawStatus) ? "/withdraw-status?status=$withdrawStatus" : "/withdraw-status";
    return $this->http->get($url);
  }

  public function getById(int $id)
  {
    return $this->http->get("/withdraw/{$id}");
  }

  public function getWithdrawStatusPending()
  {
    return $this->http->get("/withdraw-status/pending");
  }

  public function requestWithdraw(array $payload)
  {
    return $this->http->post("/withdraw-request", $payload);
  }

  public function updateStatusWithdraw(int $id, array $payload)
  {
    return $this->http->put("/withdraw/{$id}", $payload);
  }
}

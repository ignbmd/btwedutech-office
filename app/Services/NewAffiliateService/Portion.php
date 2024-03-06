<?php

namespace App\Services\NewAffiliateService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Portion extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.new_affiliate", "");
  }

  public function getByAffiliateId(int $id)
  {
    return $this->http->get("/portion/{$id}");
  }

  public function getById(int $id)
  {
    return $this->http->get("/portion-by-id/{$id}");
  }

  public function store(array $payload)
  {
    return $this->http->post("/portion", $payload);
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put("/portion/{$id}", $payload);
  }

  public function storeBulk(array $payload)
  {
    return $this->http->post("/portion-setting-bulk", $payload);
  }
}
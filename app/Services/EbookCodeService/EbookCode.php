<?php

namespace App\Services\EbookCodeService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Illuminate\Support\Arr;

class EbookCode extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.ebook_code", "");
  }

  public function getAll(array $query = [])
  {
    return $this->http->get("/codes",$query);
  }

  public function getRedeemHistory()
  {
    return $this->http->get("/history-redeem");
  }

  public function getByCode(string $code)
  {
    return $this->http->get("/codes/{$code}");
  }

  public function create(array $payload)
  {
    return $this->http->post("/codes", $payload);
  }
}

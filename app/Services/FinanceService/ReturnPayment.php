<?php

namespace App\Services\FinanceService;

use App\Services\Service;
use App\Services\ServiceContract;

class ReturnPayment extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function create($payload)
  {
    return $this->http->post(url: "/return-payment", data: $payload);
  }

}

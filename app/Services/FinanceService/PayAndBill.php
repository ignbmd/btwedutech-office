<?php

namespace App\Services\FinanceService;

use App\Helpers\PayBillMessage;
use App\Services\Service;
use App\Services\ServiceContract;

class PayAndBill extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function sendContactMessage($contact)
  {
    $msg = new PayBillMessage($contact);
    $msg->sendMessage();
  }
}

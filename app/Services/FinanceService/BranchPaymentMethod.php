<?php

namespace App\Services\FinanceService;

use App\Services\Service;
use App\Services\ServiceContract;
use Illuminate\Http\Client\Response;

class BranchPaymentMethod extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function getAll()
  {
    return $this->http->get("/branch-payment-method");
  }

  public function getByBranchCode(string $branch_code)
  {
    return $this->http->get("/branch-payment-method/" . $branch_code);
  }

  public function create($payload)
  {
    return $this->http->post(url: "/branch-payment-method", data: $payload);
  }

  public function delete(int $id)
  {
    return $this->http->delete("/branch-payment-method/" . $id);
  }

}

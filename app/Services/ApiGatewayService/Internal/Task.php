<?php

namespace App\Services\ApiGatewayService\Internal;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Task extends Service implements ServiceContract
{
  use HasBranch;


  protected function serviceAddress(): string
  {
    return config('services.btw.api_gateway', '') . "/internal";
  }

  private function getHeaders()
  {
    return [
      'X-Office-Token' => config('services.btw.api_gateway_token_office'),
    ];
  }

  public function create($payload)
  {
    return $this->http->withHeaders($this->getHeaders())->post(url: '/task', data: $payload);
  }

  public function createMultiple($payload)
  {
    return $this->http->withHeaders($this->getHeaders())->post(url: '/task/multiple', data: ["tasks" => $payload]);
  }
}

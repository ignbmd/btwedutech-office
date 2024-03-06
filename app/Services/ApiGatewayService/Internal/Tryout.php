<?php

namespace App\Services\ApiGatewayService\Internal;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Tryout extends Service implements ServiceContract
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

  public function getFreeTryoutSection($query = [])
  {
    return json_decode($this->http->withHeaders($this->getHeaders())->get(url: '/tryout/free/sections', query: $query));
  }

  public function getPremiumTryoutSection($query = [])
  {
    return json_decode($this->http->withHeaders($this->getHeaders())->get(url: '/tryout/premium/sections', query: $query));
  }

  public function getPackageTryoutSection($query = [])
  {
    return json_decode($this->http->withHeaders($this->getHeaders())->get(url: '/tryout/package/sections', query: $query));
  }

  public function getSpecificTryoutSection($query = [])
  {
    return json_decode($this->http->withHeaders($this->getHeaders())->get(url: '/tryout/specific/sections', query: $query));
  }
}

<?php

namespace App\Services\ApiGatewayService\Internal;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Ranking extends Service implements ServiceContract
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

  public function getRanking($query = [])
  {
    return json_decode($this->http->withHeaders($this->getHeaders())->get(url: '/student-result/ranking-result', query: $query));
  }

  public function downloadRanking($query = [])
  {
    $response = $this->http->withHeaders($this->getHeaders())->get(url: "/student-result/download-ranking", query: $query);
    if (!$response->successful()) $response->throw();
    else {
      header('Content-Type:application/pdf');
      header('Content-Disposition:inline');
      file_put_contents('file.pdf', $response);
      readfile('file.pdf');
      unlink('file.pdf');
      exit();
    }
  }
}

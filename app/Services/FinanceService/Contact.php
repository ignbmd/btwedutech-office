<?php

namespace App\Services\FinanceService;

use App\Services\Service;
use App\Services\ServiceContract;

class Contact extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function getAllByBranchCode($branchCode)
  {
    $response = $this->http->get("/contact-branch/$branchCode");
    $body = json_decode($response->body());
    return $body;
  }

  public function getAll()
  {
    $response = $this->http->get("/contact/all");
    $body = json_decode($response->body());
    return $body;
  }

  public function create($payload)
  {
    $response = $this->http->post(
      url: "/contact",
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }

  public function createBranchContact($payload)
  {
    $response = $this->http->post(
      url: "/contact/branch",
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }

  public function updateContact($id, $payload)
  {
    $response = $this->http->put(
      url: "/contact/" . $id,
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }
}

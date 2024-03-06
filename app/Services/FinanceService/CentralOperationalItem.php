<?php

namespace App\Services\FinanceService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class CentralOperationalItem extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function __construct()
  {
    parent::__construct();
  }

  public function getAll()
  {
    $response = $this->http->get("/central-operational-items");
    return response()->json(json_decode($response->body()), $response->status());
  }

  public function getById(int $id)
  {
    $response = $this->http->get("/central-operational-items/detail/$id");
    return response()->json(json_decode($response->body()), $response->status());
  }

  public function getByProductCode(string $productCode)
  {
    $response = $this->http->get("/central-operational-items/product-detail/$productCode");
    return response()->json(json_decode($response->body()), $response->status());
  }

  public function create(array $payload)
  {
    $response = $this->http->post("/central-operational-items", $payload);
    return response()->json(json_decode($response->body()), $response->status());
  }

  public function update(array $payload)
  {
    $response = $this->http->put("/central-operational-items", $payload);
    return response()->json(json_decode($response->body()), $response->status());
  }
}

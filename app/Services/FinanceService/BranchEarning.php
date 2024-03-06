<?php

namespace App\Services\FinanceService;

use App\Services\Service;
use App\Services\ServiceContract;
use Illuminate\Http\Client\Response;

class BranchEarning extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function create($payload): Response
  {
    return $this->http->post(url: "/branch-earning", data: $payload);
  }

  public function update($payload): Response
  {
    return $this->http->put(url: "/branch-earning", data: $payload);
  }

  public function getByBranchCode($branchCode)
  {
    $response = $this->http->get(url: "/branch-earning/$branchCode");
    return json_decode($response->body());
  }

  public function getDefaultByBranchCode($branchCode)
  {
    $response = $this->http->get(url: "/branch-earning/default-branch/$branchCode");
    $result = json_decode($response->body());
    $data = $result?->data ?? null;
    return $data;
  }

  public function getById($id)
  {
    $response = $this->http->get(url: "/branch-earning/detail/$id");
    return json_decode($response->body());
  }

  public function deleteById($id): Response
  {
    return $this->http->delete(url: "/branch-earning/$id");
  }
}

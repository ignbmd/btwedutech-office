<?php

namespace App\Services\BranchService;

use App\Helpers\RabbitMq;
use App\Services\Service;
use App\Services\ServiceContract;

class Branch extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.branch', '');
  }

  public function getBranchs()
  {
    $response = $this->http->get(url: "/branch");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getBranchByCode(string $code)
  {
    $response = $this->http->get(url: "/branch/" . $code);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getMultipleBranches(string $codes)
  {
    $response = $this->http->get(url: "/branchs", query: ["codes" => $codes]);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function createBranch($payload, $earning)
  {
    $response = $this->http->post(
      url: "/branch",
      data: $payload
    );
    $data = json_decode($response->body());
    if ($data?->success) $this->createBranchEarning(
      array_merge(['branch_code' => $data?->data?->BranchCode], (array)$earning)
    );
    return $data?->data ?? null;
  }

  public function updateBranch($branchCode, $payload, $earning)
  {
    $response = $this->http->put(
      url: "/branch/" . $branchCode,
      data: $payload
    );
    $result = json_decode($response->body());
    if ($result?->success) {
      $this->createBranchEarning($earning);
    }
    return $response;
  }

  public function createBranchEarning($payload)
  {
    $payload = collect((object)$payload);
    $payload = array_filter([
      'branch_code' => $payload->get('branch_code'),
      'amount' => (int)$payload->get('amount'),
      'amount_type' => $payload->get('amount_type'),
      'earning_type' => $payload->get('earning_type', 'DEFAULT'),
      'earning_position' => $payload->get('earning_position'),
      'product_code' => $payload->get('product_code'),
    ]);
    RabbitMq::send('finance.branch-earning.created', json_encode([
      'version' => 1,
      'data' => $payload
    ]));
  }
}

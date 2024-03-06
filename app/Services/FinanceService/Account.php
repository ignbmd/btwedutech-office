<?php

namespace App\Services\FinanceService;

use App\Services\Service;
use App\Services\ServiceContract;
use GuzzleHttp\Client;

class Account extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function getAccountCategories()
  {
    $response = $this->http->get('/account-categories');
    $body = json_decode($response->body());
    return $body;
  }

  public function getAccounts()
  {
    $response = $this->http->get('/account');
    $body = json_decode($response->body());
    return $body;
  }

  public function getSingleAccount($id)
  {
    $response = $this->http->get('/account/' . $id);
    $body = json_decode($response->body());
    return $body?->data;
  }

  public function createAccount($payload)
  {
    $response = $this->http->post(url: '/account', data: $payload);
    $body = json_decode($response->body());
    return $body;
  }

  public function updateAccount($id, $payload)
  {
    $response = $this->http->put(url: '/account/' . $id, data: $payload);
    $body = json_decode($response->body());
    return $body;
  }

  public function getByBranchAndCategoryIds($branchCode, $categoryIds = [])
  {
    $response = $this->http->get(url: "/account-by-categories", query: [
      'branch_code' => $branchCode,
      'category_ids' => join(",", $categoryIds),
    ]);
    $body = json_decode($response->body());
    return $body;
  }
}

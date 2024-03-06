<?php

namespace App\Services\FinanceService;

use App\Services\Service;
use App\Helpers\SaleMessage;
use App\Services\ServiceContract;
use App\Helpers\Url;

class Finance extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function sendSaleMessage($student)
  {
    $msg = new SaleMessage($student);
    $msg->sendWhatsappMessage();
  }

  public function processSaleTransaction($payload)
  {
    $response = $this->http->post(
      url: "/billing",
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }

  public function processSaleTransactionV2($payload)
  {
    $response = $this->http->post(
      url: "/billing/new",
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }

  public function processBranchOfflineSaleTransaction($payload)
  {
    $response = $this->http->post(
      url: "/billing/offline-new-method",
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }

  // Only for central branch with online product & tatap muka online product transaction
  public function processCentralOnlineSaleTransaction($payload)
  {
    $has_classroom_id = array_key_exists("classroom_id", $payload);
    $response = $this->http->post(
      url: $has_classroom_id ? "/billing/new-online-class-public" : "/billing/new-online",
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }

  public function processFranchiseCashOfflineSaleTransaction($payload)
  {
    $response = $this->http->post(
      url: "/billing/new-cash-franchise-separated",
      data: $payload
    );
    $body = json_decode($response->body());
    return $body;
  }

  public function processSiplahTransaction($payload)
  {
    $response = $this->http->post(
      url: "/billing/siplah",
      data: $payload
    );
    return json_decode($response->body());
  }

  public function processAssessmentProductTransaction($payload)
  {
    $response = $this->http->post(
      url: "/billing/non-siplah",
      data: $payload
    );
    return json_decode($response->body());
  }

  public function getCentralDebtOrReceivables(string $type)
  {
    $response = $this->http->get(url: "/journal-records/" . $type);
    $body = json_decode($response->body());
    return $body;
  }

  public function getSource()
  {
    $response = $this->http->get(url: '/source-account');
    $body = json_decode($response->body());
    return $body;
  }

  public function getDebtTotal(string $accountId)
  {
    $response = $this->http->get(url: '/journal-records/calculate/' . $accountId);
    $body = json_decode($response->body());
    return $body;
  }

  public function getCentralDebtHistory(string $type, string $accountId)
  {
    $response = $this->http->get(url: '/log-pay-and-bill/history/' . $accountId . '/' . $type);
    $body = json_decode($response->body());
    return $body;
  }

  public function getDetailHistory(string $historyId)
  {
    $response = $this->http->get(url: '/log-pay-and-bill/get-detail/' . $historyId);
    $body = json_decode($response->body());
    return $body;
  }

  public function getBranchDebt(string $branchCode)
  {
    $response = $this->http->get(url: '/journal-records/hutang/' . $branchCode);
    return $response;
  }

  public function getBranchReceivable(string $branchCode)
  {
    $response = $this->http->get(url: '/journal-records/piutang/' . $branchCode);
    return $response;
  }

  public function getCentralFeePerBranch(
    string $productCode,
    string $branchCode,
    string $productPrice
  ) {
    $response = $this->http->get(url: '/central-operational-items/central-fee', query: [
      'product_code' => $productCode,
      'branch_code' => $branchCode,
      'product_price' => $productPrice
    ]);
    return $response;
  }

  public function getCentralBillHistory(string $branchCode, string $status = null)
  {
    $body = [
      'branch_code' => $branchCode,
      'type' => "BILL"
    ];
    if ($status) {
      $body['status'] = $status;
    }
    $response = $this->http
      ->withBody(json_encode($body), 'application/json')
      ->get(url: '/log-pay-and-bill/history-branch');
    return $response;
  }

  public function createPayBillLog(string $type, array $payload)
  {
    $response = $this->http->post(url: '/log-pay-and-bill/' . $type, data: $payload);
    return $response;
  }

  public function updateHistory(array $payload, string $updateType)
  {
    $response = $this->http->put(url: '/log-pay-and-bill/' . $updateType, data: $payload);
    return $response;
  }

  public function getAccountTotalAmountByAccountID(string $account_id)
  {
    return $this->http->get('/journal-records/calculate/' . $account_id);
  }

  public function getAccountTotalAmount(array $query)
  {
    $url = Url::combineQueryString("/journal-records/calculate/", $query);
    return $this->http->get($url);
  }
}

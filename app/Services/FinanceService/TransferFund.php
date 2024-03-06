<?php

namespace App\Services\FinanceService;

use App\Helpers\S3;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Carbon\Carbon;
use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TransferFund extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function getAll(array $query)
  {
    return $this->http->get(url: "/transfer-fund", query: $query);
  }

  public function getById(int $id)
  {
    return $this->http->get(url: "/transfer-fund/" . $id);
  }


  public function storeBranch(array $payload)
  {
    return $this->http->post(url: "/transfer-fund", data: $payload);
  }

  public function storeCentral(array $payload, UploadedFile|null $file): Response
  {
    $data = [
      "source_account_code" => $payload["source_account_code"]->accountCode,
      "target_account_code" => $payload["target_account_code"]->account_code,
      "amount" => (int)$payload["amount"],
      "request_by" => Auth::user()->name,
    ];
    if ($file) {
      $data["transfer_fund_attachment"]["name"] = $file->getClientOriginalName();
      $data["transfer_fund_attachment"]["path"] = S3::storeOriginal("/uploads/office/fund-transfer", $file);
    }
    return $this->http->post(url: "/transfer-fund/central", data: $data);
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put(url: "/transfer-fund/" . $id, data: $payload);
  }

  public function confirm(array $payload, int $id, UploadedFile|null $file): Response
  {
    $data = [
      "source_account_code" => $payload["source_account_code"]->account_code,
      "branch_code" => $payload["branch_code"],
      "status" => $payload["status"]->value,
      "approved_by" => Auth::user()->name,
    ];
    if ($file) {
      $data["transfer_fund_attachment"]["name"] = $file->getClientOriginalName();
      $data["transfer_fund_attachment"]["path"] = S3::storeOriginal("/uploads/office/fund-transfer", $file);
    } else {
      $data["transfer_fund_attachment"]["name"] = $payload["old_transfer_fund_attachment"]["name"];
      $data["transfer_fund_attachment"]["path"] = $payload["old_transfer_fund_attachment"]["path"];
    }
    return $this->http->post(url: "/transfer-fund/approve/" . $id, data: $data);
  }

  public function updateTransferFundProof(array $payload, int $id, UploadedFile|null $file): Response
  {
    $data = [];
    if ($file) {
      $data["transfer_fund_attachment"]["name"] = $file->getClientOriginalName();
      $data["transfer_fund_attachment"]["path"] = S3::storeOriginal("/uploads/office/fund-transfer", $file);
    } else {
      $data["transfer_fund_attachment"]["name"] = $payload["old_transfer_fund_attachment"]["name"];
      $data["transfer_fund_attachment"]["path"] = $payload["old_transfer_fund_attachment"]["path"];
    }
    return $this->http->put(url: "/transfer-fund/proof/" . $id, data: $data);
  }
}

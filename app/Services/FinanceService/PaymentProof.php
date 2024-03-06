<?php

namespace App\Services\FinanceService;

use App\Helpers\RabbitMq;
use App\Helpers\S3;
use App\Services\BranchService\Branch;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Carbon\Carbon;
use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use QrCode;

class PaymentProof extends Service implements ServiceContract
{
  use HasBranch;

  private Branch $branchService;

  public function __construct(Branch $branchService)
  {
    parent::__construct();
    $this->branchService = $branchService;
  }

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function get(array $payload = [])
  {
    return $this->http->get("/proof-payment", $payload);
  }

  public function getByBranchCode($branch_code)
  {
    return $this->http->get("/proof-payment", ["branch_code" => $branch_code]);
  }

  public function getById(string $id)
  {
    return $this->http->get("/proof-payment/$id");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/proof-payment", data: $payload);
  }
}

<?php

namespace App\Services\FinanceService;

use App\Helpers\Cryptography;
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

class Bill extends Service implements ServiceContract
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

  public function getAll(int $length, int $start, $search)
  {
    $page = (int)($start / $length) + 1;
    $response = $this->http->get("/all-transaction", [
      "limit" => $length,
      "page" => $page,
      "search" => $search,
    ]);
    $data = json_decode($response?->body());
    return $data ?? null;
  }

  public function getByBranch(string $branchCode, string $type)
  {
    $response = $this->http->get("/billing-by-branch/{$branchCode}/{$type}");
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getBySmartBTWID(int $smartbtw_id)
  {
    $response = $this->http->get("/billing-by-smartbtwid/{$smartbtw_id}");
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getByProductType(string $type)
  {
    $response = $this->http->get("/billing-by-product-type/{$type}");
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getById(string $billId)
  {
    $response = $this->http->get("/billing/{$billId}");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getTransactions(string $billId)
  {
    $response = $this->http->get("/transaction-history/{$billId}");
    $data = json_decode($response->body());
    if ($data) {
      foreach ($data->data as $transaction) {
        $crypto = new Cryptography();
        $encryptedId = $crypto->encrypt($transaction->id);
        $transaction->encrypted_id = $encryptedId;
      }
    }
    return $data->data ?? [];
  }

  public function getDetailTransaction(string $transactionId)
  {
    $response = $this->http->get("/transaction-detail/{$transactionId}");
    $data = json_decode($response->body());
    return $data->data ?? null;
  }

  public function getReceiptViewHtml(string $transactionId, $type = 'pdf')
  {
    $transaction = $this->getDetailTransaction($transactionId);
    $trimmedLowercaseBillTitle = strtolower(preg_replace('/\s+/', '', $transaction?->bill?->title)) ?? '';
    $isBinsusBill = str_contains($trimmedLowercaseBillTitle, 'binsus');
    $isSiplahBill = $transaction?->bill?->product_type === "SIPLAH";
    $isAssessmentProductBill = in_array($transaction?->bill?->product_type, ["SIPLAH", "ASSESSMENT_BUNDLE_PRODUCT"]);
    $branch = $this->branchService->getBranchByCode($transaction?->bill?->branch_code);
    $downloadUrl = url("/tagihan/kwitansi/{$transactionId}/pdf");
    $qrCode = QrCode::format('svg')->size(200)->generate($downloadUrl);
    $qrCode = base64_encode($qrCode);
    $payload = [
      'transaction' => $transaction,
      'type' => $type,
      'qrCode' => $qrCode,
      'branch' => $branch,
      'isBinsusBill' => $isBinsusBill,
      'isSiplahBill' => $isSiplahBill,
      'isAssessmentProductBill' => $isAssessmentProductBill
    ];
    return view('pages.bill.receipt-print', $payload);
  }

  public function getReceiptPdf(string $transactionId)
  {
    return SnappyPdf::loadHTML($this->getReceiptViewHtml($transactionId));
  }

  private function getGreetingTime()
  {
    $hour = Carbon::now()->format('H');
    if ($hour < 12) {
      return 'pagi';
    }
    if ($hour < 15) {
      return 'siang';
    }
    if ($hour < 18) {
      return 'sore';
    }
    return 'malam';
  }

  public function sendInvoice(
    string $billId,
    string $studentName,
    string $amount,
    string $phone
  ) {
    $postfix = date('YmdHis');
    $fileName = "invoice_{$billId}_{$postfix}.pdf";
    $uploadPath = "/uploads/office/invoice/$fileName";
    $fileUrl = env('AWS_URL') . $uploadPath;
    Storage::disk('s3')->put($uploadPath, $this->getInvoicePdf($billId)->output());
    RabbitMq::send('message-gateway.whatsapp.new-invoice', json_encode([
      'version' => 1,
      'data' => [
        "to" => $phone,
        "name" => $studentName,
        "greeting" => $this->getGreetingTime(),
        "bill_id" => (int) $billId,
        "amount" => $amount,
        "file_name" => $fileName,
        "file_url" => $fileUrl
      ]
    ]));
    return $fileUrl;
  }

  public function sendReceipt(
    string $billId,
    string $transactionId,
    string $studentName,
    string $createdAt,
    string $phone
  ) {
    $postfix = date('YmdHis');
    $fileName = "receipt_{$billId}_{$transactionId}_{$postfix}.pdf";
    $uploadPath = "/uploads/office/receipt/$fileName";
    $fileUrl = env('AWS_URL') . $uploadPath;
    Storage::disk('s3')->put($uploadPath, $this->getReceiptPdf($transactionId)->output());
    RabbitMq::send('message-gateway.whatsapp.receipt', json_encode([
      'version' => 1,
      'data' => [
        "to" => $phone,
        "name" => $studentName,
        "greeting" => $this->getGreetingTime(),
        "custom_message" => "kwitansi pembayaran pada tanggal " . $createdAt,
        "file_name" => $fileName,
        "file_url" => $fileUrl
      ]
    ]));
    return $fileUrl;
  }

  public function sendPaymentLink(
    string $phone,
    string $studentName,
    string $productName,
    string $branchCode,
    string $link
  ) {
    RabbitMq::send('message-gateway.whatsapp.payment-link', json_encode([
      'version' => 1,
      'data' => [
        "to" => $phone,
        "name" => $studentName,
        "greeting" => $this->getGreetingTime(),
        "product_name" => $productName,
        "branch_code" => $branchCode,
        "link" => $link
      ]
    ]));
  }

  public function getInvoicePdf(string $billId, $type = 'stream')
  {
    $bill = $this->getById($billId);
    $trimmedLowercaseBillTitle = strtolower(preg_replace('/\s+/', '', $bill?->title)) ?? '';
    $isBinsusBill = str_contains($trimmedLowercaseBillTitle, 'binsus');
    $isSiplahBill = $bill->product_type === "SIPLAH";
    $isAssessmentProductBill = in_array($bill->product_type, ["SIPLAH", "ASSESSMENT_BUNDLE_PRODUCT"]);
    $branch = $this->branchService->getBranchByCode($bill->branch_code);
    $html = view('pages.bill.invoice-print', [
      'bill' => $bill,
      'type' => $type,
      'branch' => $branch,
      'isBinsusBill' => $isBinsusBill,
      'isSiplahBill' => $isSiplahBill,
      'isAssessmentProductBill' => $isAssessmentProductBill
    ]);
    return SnappyPdf::loadHTML($html);
  }

  public function getBillLetterPdf(string $billId, $type = 'stream')
  {
    $bill = $this->getById($billId);
    $billDate = Carbon::parse($bill->due_date)->timezone("Asia/Jakarta")->startOfDay();

    $currentDate = Carbon::today();
    $diffInDays = $currentDate->diffInDays($billDate, false);
    $bill->dueDateInDays = $diffInDays;

    $billCode = $bill->branch_code;
    $branch = $this->branchService->getBranchByCode($bill->branch_code);

    $fallbackContactNumber = env('APP_ENV') == 'dev' ? '6282260008545' : null;
    $branchContact = config('branch_contact.' . $branch->code) ?? $fallbackContactNumber;

    $branch->contact = $branchContact;

    $html = view('pages.bill.bill-letter', compact('bill', 'branch'));
    return SnappyPdf::loadHTML($html);
  }

  public function updateBilling(string $billId, array $payload, UploadedFile|null $file): Response
  {
    if (key_exists('paid_bill', $payload)) {
      $payload['paid_bill'] = (int)$payload['paid_bill'];
    }
    $payload = array_merge(
      ['id' => (int)$billId, 'updated_by' => Auth::user()?->name ?? ''],
      $payload = collect($payload)->only($this->getTransactionFields())->toArray(),
      ['due_date' => Carbon::parse($payload['due_date'])->format('Y-m-d\TH:i:s+08:00')]
    );
    if ($file) {
      $payload['proof_payment']['name'] = $file->getClientOriginalName();
      $payload['proof_payment']['path'] = S3::storeOriginal("/uploads/office/transaction/$billId", $file);
    }

    return $this->http->put("/billing", $payload);
  }

  public function updateBillingTransaction(string $billId, string $transactionId, array $payload, UploadedFile|null $file): Response
  {
    if (key_exists('paid_bill', $payload)) {
      $payload['paid_bill'] = (int)$payload['paid_bill'];
    }

    if ($payload['old_file_name'] !== "") {
      $payload['proof_payment']['name'] = $payload['old_file_name'];
      $payload['proof_payment']['path'] = $payload['old_file_path'];
    }

    $payload = array_merge(
      [
        'id' => (int)$transactionId,
        'created_by' => Auth::user()?->name ?? '',
      ],
      collect($payload)->only($this->getTransactionFields())->toArray(),
    );
    $payload['payment_status'] = $payload['paid_now'] ? 'APPROVED' : 'PENDING';

    if ($file) {
      $payload['proof_payment']['name'] = $file->getClientOriginalName();
      $payload['proof_payment']['path'] = S3::storeOriginal("/uploads/office/transaction/$billId", $file);
    }
    return $this->http->put("/transaction-history", $payload);
  }

  public function updateBillingTransactionV2(string $transactionId, array $payload): Response
  {
    if (key_exists('paid_bill', $payload)) {
      $payload['paid_bill'] = (int) $payload['paid_bill'];
    }

    $payload = array_merge(
      [
        'transaction_id' => (int) $transactionId,
        'updated_by' => Auth::user()?->name ?? '',
        'amount' => $payload['paid_bill'],
        'due_date' => Carbon::parse($payload['due_date'])->format('Y-m-d\TH:i:s+08:00'),
        'note' => $payload['note'] ?? ""
      ]
    );

    return $this->http->put("/transaction-edit-amount-new", $payload);
  }

  // updateBillingTransactionV3
  public function createNewBillingTransaction(string $billId, array $payload, UploadedFile|null $file): Response
  {
    if (key_exists('paid_bill', $payload)) {
      $payload['paid_bill'] = (int)$payload['paid_bill'];
    }
    $payload = array_merge(
      ['id' => (int)$billId, 'updated_by' => Auth::user()?->name ?? ''],
      $payload = collect($payload)->only($this->getTransactionFields())->toArray(),
      ['due_date' => Carbon::parse($payload['due_date'])->format('Y-m-d\TH:i:s+08:00')]
    );
    if ($file) {
      $payload['proof_payment']['name'] = $file->getClientOriginalName();
      $payload['proof_payment']['path'] = S3::storeOriginal("/uploads/office/transaction/$billId", $file);
    }
    return $this->http->post("/transaction", $payload);
  }

  public function updateOfflineTransaction(string $billId, string $transactionId, array $payload, UploadedFile|null $file): Response
  {
    if (key_exists('paid_bill', $payload)) {
      $payload['paid_bill'] = (int)$payload['paid_bill'];
    }

    if ($payload['old_file_name'] !== "") {
      $payload['proof_payment']['name'] = $payload['old_file_name'];
      $payload['proof_payment']['path'] = $payload['file'];
    }

    $payload = array_merge(
      [
        'transaction_id' => (int)$transactionId,
        'updated_by' => Auth::user()?->name ?? '',
        'transaction_status' => is_array($payload['transaction_status']) ? $payload['transaction_status'][0]->value : $payload['transaction_status']->value,
        'note' => $payload['note'] ?? "-",
        'created_at' => $payload['created_at']
      ],
      collect($payload)->only($this->getTransactionFields())->toArray(),
    );
    if ($file) {
      $payload['proof_payment']['name'] = $file->getClientOriginalName();
      $payload['proof_payment']['path'] = S3::storeOriginal("/uploads/office/transaction/$billId", $file);
    }
    return $this->http->put("/transaction-edit-offline", $payload);
  }

  public function updateOnlineTransaction(string $billId, string $transactionId, array $payload): Response
  {
    return $this->http->put("/transaction-edit-online", $payload);
  }

  public function getTransactionFields()
  {
    return [
      'id',
      'paid_bill',
      'payment_type',
      'payment_method',
      'created_by',
      'payment_status',
      'proof_payment',
      'paid_now',
      'note',
      'due_date',
    ];
  }

  public function deleteBill($billId)
  {
    $response = $this->http->delete("/billing/{$billId}");
    $data = json_decode($response?->body());
    return $data;
  }

  public function deleteTransaction($transactionId)
  {
    $response = $this->http->delete("/transaction/{$transactionId}");
    $data = json_decode($response?->body());
    return $data;
  }

  public function updateBillDiscount($payload)
  {
    $response = $this->http->put("/billing-edit-date", $payload);
    $data = json_decode($response?->body());
    return $data;
  }

  public function updateBillDiscountV2(array $payload)
  {
    return $this->http->put("/billing/update-discount-new", $payload);
  }

  public function updateBillDueDate(array $payload)
  {
    $payload["updated_by"] = Auth::user()->name;
    $response = $this->http->put("/billing-due-date", $payload);
    return $response;
  }

  public function reconcileBill(int $billId)
  {
    $payload = ["bill_id" => $billId, "created_by" => Auth::user()->name];
    return $this->http->post("/log-reconcile", $payload);
  }

  public function updateBillStatus(int $billId, array $payload)
  {
    return $this->http->put("/billing/update-status/$billId", $payload);
  }

  public function updateBillNote(int $billId, string $note)
  {
    return $this->http->put("/billing/update-note", ["bill_id" => $billId, "note" => $note]);
  }

  public function getAssessmentEventProductBill()
  {
    $assessmentEventProductCodeSuffix = "EV";
    return $this->http->get("/billing-by-event-product/$assessmentEventProductCodeSuffix");
  }
}

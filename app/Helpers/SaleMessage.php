<?php

namespace App\Helpers;

use Carbon\Carbon;
use App\Types\Message;
use App\Types\StudentSale;
use App\Services\BranchService\Branch;
use Illuminate\Support\Facades\Log;

class SaleMessage extends RabbitMq
{
  private StudentSale $studentSale;
  private Branch $branch;

  public function __construct(StudentSale $student)
  {
    $this->studentSale = $student;
    $this->branch = new Branch();
  }

  public function sendMessage()
  {
      $msg = $this->getSMSMessage();
      $this->sendContactSMS($msg);
  }

  public function sendWhatsappMessage()
  {
    $branchCode = $this->studentSale->branchCode;
    $branch = $this->branch->getBranchByCode($branchCode);
    $branchName = $branch ? $branch->name : '';
    $amount = number_format($this->studentSale->amount, 0, ',', '.');
    $date = Carbon::parse($this->studentSale->createdAt)->format('Y-m-d H:i') . " WIB";

    $file_extension = $this->get_file_extension($this->studentSale->fileName);
    $isPdfFile = $file_extension == "pdf";

    $payload = json_encode([
      "version" => 1,
      "data" => [
        "to" => $this->studentSale->phone,
        "name" => $this->studentSale->name,
        "email" => $this->studentSale->email,
        "branch_name" => $branchName,
        "branch_code" => $branchCode,
        "bill_id" => $this->studentSale->billId,
        "bill_date" => $date,
        "bill_product_name" => $this->studentSale->productName,
        "bill_amount" => $amount,
        "bill_payment_method" => $this->studentSale->paymentMethod,
        "bill_transaction_id" => $this->studentSale->transactionId,
        "file_name" => $this->studentSale->fileName,
        "file_url" => $this->studentSale->urlFile,
      ]
    ]);
    $isPdfFile ? self::send('message-gateway.whatsapp.payment-proof-pdf', $payload) : self::send('message-gateway.whatsapp.payment-proof-image', $payload);
  }

  private function sendContactSMS(Message $msg)
  {
    $payload = json_encode([
      "version" => 1,
      "data" => [
        "phone_number" => $msg->phoneNumber,
        "message_title" => $msg->title,
        "message_body" => $msg->body,
        "message_type" => $msg->type,
        "date_send" => $msg->dateSend,
      ]
    ]);
    self::send('message-gateway.sms.created', $payload);
  }

  private function getSMSMessage(): Message
  {
    $msg = new Message();
    $msg->phoneNumber = $this->studentSale->phone;
    $msg->title = 'Penjualan';
    $msg->body = $this->getMessageBody();
    $msg->type = 'REG';
    $msg->dateSend = Carbon::now()->toISOString();
    return $msg;
  }

  private function get_file_extension($file_name) {
    return substr(strrchr($file_name,'.'),1);
  }

  private function getMessageBody()
  {
    $branchCode = $this->studentSale->branchCode;
    $branch = $this->branch->getBranchByCode($branchCode);
    $branchName = $branch ? $branch->name : '';
    $amount = number_format($this->studentSale->amount, 0, ',', '.');
    $date = Carbon::parse($this->studentSale->createdAt)->format('Y-m-d H:i');

    return "Pembayaran masuk sebesar Rp {$amount} dari {$branchName} - {$branchCode} ({$this->studentSale->productName}).
Pada : {$date}
Nama Siswa: {$this->studentSale->name}
Email : {$this->studentSale->email}
Pembayaran: {$this->studentSale->paymentMethod}
ID Tagihan : {$this->studentSale->billId}
ID Transaksi : {$this->studentSale->transactionId}
Terimakasih.";
  }
}

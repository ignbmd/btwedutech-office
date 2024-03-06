<?php

namespace App\Helpers;

use Carbon\Carbon;
use App\Types\PayBill;
use App\Types\Message;
use App\Services\BranchService\Branch;

class PayBillMessage extends RabbitMq
{
  private PayBill $contact;
  private Branch $branch;

  public function __construct(PayBill $contact)
  {
    $this->contact = $contact;
    $this->branch = new Branch();
  }

  public function sendMessage()
  {
      $msg = $this->getWhatsAppMessage();
      $this->sendContactWhatsApp($msg);
  }

  private function sendContactWhatsApp(Message $msg)
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

  private function getWhatsAppMessage(): Message
  {
    $msg = new Message();
    $msg->phoneNumber = $this->contact->phone;
    $msg->title = 'Hutang & Piutang';
    $msg->body = $this->getBody($this->contact->type);
    $msg->type = 'REG';
    $msg->dateSend = Carbon::now()->toISOString();
    return $msg;
  }

  private function getPaymentDetail($accountName) {
    $accountNameLower = strtolower($accountName);
    $paymentKey = str_replace(' ', '_', $accountNameLower);
    $payment = config('payment.'.$paymentKey);

    return $payment;
  }

  private function getCentralPayMessage()
  {
    $payment = $this->getPaymentDetail($this->contact->paymentMethod);
    $amount = number_format($this->contact->amount, 0, ',', '.');
    return "YTH Bapak/Ibu {$this->contact->name}. Dana masuk sebesar *Rp {$amount}* dari Kantor Pusat Bimbel BTW.\n
Status Pembayaran: Bonus Penjualan
Pembayaran: {$payment['label']}";
  }

  private function getCentralCollectDebtMessage()
  {
    $branchCode = $this->contact->branchCode;
    $branch = $this->branch->getBranchByCode($branchCode);
    $branchName = $branch ? $branch->name : '';
    $payment = $this->getPaymentDetail($this->contact->paymentMethod);
    $amount = number_format($this->contact->amount, 0, ',', '.');
    return "YTH Bapak/Ibu {$this->contact->name}. Tagihan masuk sebesar *Rp {$amount}* ditujukan untuk cabang {$branchName}, segera lunasi tagihan tersebut via {$payment['label']} {$payment['number']} dan melakukan konfirmasi pembayaran melalui *BTW Edutech Office*.";
  }

  private function getBranchPayMessage()
  {
    $branchCode = $this->contact->branchCode;
    $branch = $this->branch->getBranchByCode($branchCode);
    $branchName = $branch ? $branch->name : '';
    $payment = $this->getPaymentDetail($this->contact->paymentMethod);
    $amount = number_format($this->contact->amount, 0, ',', '.');
    return "YTH Bapak/Ibu {$this->contact->name}. Dana masuk sebesar *Rp {$amount}* dari {$branchName}. Mohon untuk mengonfirmasi status pembayaran pada *BTW Edutech Office*
Status Pembayaran: *Pembayaran Hutang*
Kode Transaksi: *#{$this->contact->id}*
Pembayaran: *{$payment['label']}*";
  }

  private function getBody($status)
  {
    if ($status == 'CENTRAL_PAY') {
      return $this->getCentralPayMessage();
    } else if($status == 'CENTRAL_BILL') {
      return $this->getCentralCollectDebtMessage();
    } else if($status == 'BRANCH_PAY' || 'BRANCH_BILL') {
      return $this->getBranchPayMessage();
    }
    return '';
  }
}

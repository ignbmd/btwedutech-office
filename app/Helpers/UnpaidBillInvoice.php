<?php

namespace App\Helpers;

use App\Services\FinanceService\Bill;
use App\Services\BranchService\Branch;
use App\Services\ProfileService\Profile;

use Carbon\Carbon;
use App\Helpers\RabbitMq;

class UnpaidBillInvoice
{
  private Bill $billFinanceService;
  private Branch $branchService;
  private Profile $profileService;

  public function __construct(Bill $billFinanceService, Branch $branchService, Profile $profileService)
  {
    $this->billFinanceService = $billFinanceService;
    $this->branchService = $branchService;
    $this->profileService = $profileService;
  }

  public function sendInvoiceThreeDaysBeforeDueDate()
  {
    $time = Carbon::now()->format('Y-m-d H:i:s');
    echo "[{$time}] Sending unpaid invoice three days before due date...\n";

    $bills = $this->getOpenBills(3);
    if(!$bills) {
      echo "[{$time}] H-3 days unpaid bills not found\n";
      return;
    }
    $this->sendInvoiceMessageToBroker($bills);
    echo "[{$time}] Unpaid three days before due date invoice has been sent \n";
  }

  public function sendInvoiceTwoDaysBeforeDueDate()
  {
    $time = Carbon::now()->format('Y-m-d H:i:s');
    echo "[{$time}] Sending unpaid invoice two days before due date...\n";

    $bills = $this->getOpenBills(2);
    if(!$bills) {
      echo "[{$time}] H-2 days unpaid bills not found\n";
      return;
    }
    $this->sendInvoiceMessageToBroker($bills);
    echo "[{$time}] Unpaid two days before due date invoice has been sent \n";
  }

  public function sendInvoiceAWeekBeforeDueDate()
  {
    $time = Carbon::now()->format('Y-m-d H:i:s');
    echo "[{$time}] Sending unpaid invoice a week before due date...\n";

    $bills = $this->getOpenBills(7);
    if(!$bills) {
      echo "[{$time}] H-7 days unpaid bills not found\n";
      return;
    }
    $this->sendInvoiceMessageToBroker($bills);
    echo "[{$time}] Unpaid a week before due date invoice has been sent \n";
  }

  public function sendInvoiceADayBeforeDueDate()
  {
    $time = Carbon::now()->format('Y-m-d H:i:s');
    echo "[{$time}] Sending unpaid invoice a day before due date...\n";

    $bills = $this->getOpenBills(1);
    if(!$bills) {
      echo "[{$time}] H-1 days unpaid bills not found\n";
      return;
    }
    $this->sendInvoiceMessageToBroker($bills);
    echo "[{$time}] Unpaid a day before due date invoice has been sent \n";
  }

  public function sendInvoiceOnAndPastDueDate()
  {
    $time = Carbon::now()->format('Y-m-d H:i:s');
    echo "[{$time}] Sending unpaid invoice on/past due date...\n";

    $bills = $this->getOpenBills(0);
    if(!$bills) {
      echo "[{$time}] Unpaid on/past due date bills not found\n";
      return;
    }

    $this->sendInvoiceMessageToBroker($bills);
    echo "[{$time}] Unpaid on/past due date invoice has been sent \n";
  }

  private function getOpenBills(int $days_before_bill_due_date)
  {
    $currentDate = Carbon::today();

    $bills = $this->billFinanceService->getByProductType("OFFLINE_PRODUCT");
    $bills = array_filter($bills, function($bill) use($currentDate, $days_before_bill_due_date) {
      $billDate = Carbon::parse($bill->due_date)->timezone("Asia/Jakarta")->startOfDay();
      $diffInDays = $currentDate->diffInDays($billDate, false);
      $bill->days_left_until_due_date = $diffInDays;
      $condition = $days_before_bill_due_date > 0
        ? $bill->status == "OPEN" && $diffInDays == $days_before_bill_due_date
        : $bill->status == "OPEN" && $diffInDays <= 0;
      return $condition;
    }, ARRAY_FILTER_USE_BOTH);
    return array_values($bills);
  }

  private function sendInvoiceMessageToBroker($bills)
  {
    foreach($bills as $bill) {
      $student_bill = $this->getStudentBill($bill->id);
      $student_bill->days_left_until_due_date = $bill->days_left_until_due_date;

      $bill_branch = $this->getBillBranch($student_bill->branch_code);

      $profile = $this->profileService->getSingleStudent($student_bill->smartbtw_id);

      if(!$profile) {
        $time = Carbon::now()->format('Y-m-d H:i:s');
        echo "[{$time}] {$student_bill->bill_to}'s ({$student_bill->smartbtw_id}) data not found on profile service, skipping \n";
        continue;
      }

      $parent_phone = property_exists($profile, "parent_datas") ? $profile->parent_datas->parent_number : $profile->parent_number;
      if(!$parent_phone) {
        $time = Carbon::now()->format('Y-m-d H:i:s');
        echo "[{$time}] {$student_bill->bill_to}'s ({$student_bill->smartbtw_id}) parent phone number is not found on profile service, skipping \n";
        continue;
      }

      $bill_transaction = $this->removeExcessTransactionProperties($student_bill->transaction);
      $bill_product_item = $this->removeExcessProductItemProperties($student_bill->product_item);

      $latest_bill_transaction_method = $this->getLatestBillTransactionMethod($bill_transaction);
      $waBodyMessage = $this->generateWhatsAppBodyMessage($student_bill);

      $student_bill = $this->removeAdditionalStudentBillProperties($student_bill);
      $student_bill->bill_to = $profile->branch_code ? ucfirst($profile->name) . " (" . $profile->branch_code . ")" : ucfirst($profile->name);
      $payload = [
        "version" => 1,
        "data" => [
          "bill" => $student_bill,
          "branch" => $bill_branch,
          "product_item" => $bill_product_item,
          "transaction_method" => $latest_bill_transaction_method,
          "message" => $waBodyMessage,
          "send_message_to" => $parent_phone
        ]
      ];

      $time = Carbon::now()->format('Y-m-d H:i:s');
      RabbitMq::send("sendpdf.invoice", json_encode($payload));
      echo "[{$time}] Sending message to {$profile->name}'s ({$profile->smartbtw_id}) parent phone number at {$parent_phone}. Bill ID: {$student_bill->id} \n";
      sleep(10);
    }
  }

  private function getStudentBill($bill_id)
  {
    $student_bill = $this->billFinanceService->getById($bill_id);
    $this->setBillPriceFormat($student_bill);
    return $this->removeExcessStudentBillProperties($student_bill);
  }

  private function getBillBranch($branch_code)
  {
    $bill_branch = $this->branchService->getBranchByCode($branch_code);
    return $this->removeExcessBillBranchProperties($bill_branch);
  }

  private function setBillPriceFormat($student_bill)
  {
    $student_bill->sub_total_bill = $this->priceFormat(collect($student_bill?->product_item)->sum(fn($p) => $p?->final_amount));
    $student_bill->final_discount = $this->priceFormat($student_bill->final_discount);
    $student_bill->final_bill = $this->priceFormat($student_bill->final_bill);
    $student_bill->final_tax = $this->priceFormat($student_bill->final_tax);
    $student_bill->remain_bill = $this->priceFormat($student_bill->remain_bill);
    $student_bill->paid_bill = $this->priceFormat($student_bill->paid_bill);
    foreach($student_bill->product_item as $item) {
      $item->price = $this->priceFormat($item->price);
      $item->final_amount = $this->priceFormat($item->final_amount);
    }
  }

  private function getLatestBillTransactionMethod($bill_transaction)
  {
    $transaction_method = ["CASH" => "Cash", "MANUAL_TF_BCA" => "Manual Transfer BCA", "MANUAL_TF_BRI" => "Manual Transfer BRI", "MANUAL_TF_BNI" => "Manual Transfer BNI"];
    $latest_bill_transaction_method = collect($bill_transaction)->pluck('transaction_method')->first();
    return $transaction_method[$latest_bill_transaction_method] ?? $latest_bill_transaction_method;
  }

  private function removeExcessStudentBillProperties($student_bill)
  {
    unset($student_bill->updated_at);
    unset($student_bill->deleted_at);
    unset($student_bill->status);
    unset($student_bill->product_type);
    unset($student_bill->legacy_bill_id);
    unset($student_bill->product_code);
    return $student_bill;
  }

  private function removeAdditionalStudentBillProperties($student_bill)
  {
    unset($student_bill->transaction);
    unset($student_bill->product_item);
    unset($student_bill->branch_code);
    unset($student_bill->days_left_until_due_date);
    return $student_bill;
  }

  private function removeExcessBillBranchProperties($bill_branch)
  {
    unset($bill_branch->geolocation);
    unset($bill_branch->level);
    unset($bill_branch->number);
    unset($bill_branch->createdAt);
    unset($bill_branch->updatedAt);
    return $bill_branch;
  }

  private function removeExcessTransactionProperties($transactions)
  {
    foreach($transactions as $transaction) {
      unset($transaction->id);
      unset($transaction->created_at);
      unset($transaction->updated_at);
      unset($transaction->deleted_at);
      unset($transaction->ref_number);
      unset($transaction->bill_id);
      unset($transaction->bill);
      unset($transaction->amount);
      unset($transaction->transaction_fee);
      unset($transaction->transaction_status);
      unset($transaction->description);
      unset($transaction->created_by);
      unset($transaction->note);
      unset($transaction->final_transaction);
      unset($transaction->document);
    }
    return $transactions;
  }

  private function removeExcessProductItemProperties($products)
  {
    foreach($products as $product) {
      unset($product->id);
      unset($product->created_at);
      unset($product->updated_at);
      unset($product->deleted_at);
      unset($product->bill_id);
      unset($product->Bill);
      unset($product->product_code);
      unset($product->price);

    }
    return $products;
  }

  private function generateWhatsAppBodyMessage($student_bill)
  {
    $bill_due_date = Carbon::parse($student_bill->due_date)->format('d/m/Y');
    $diff_in_days = abs($student_bill->days_left_until_due_date);

    if($student_bill->days_left_until_due_date == 7) {
      $bodyMessage = "Yth. Bapak/Ibu Orang Tua Siswa *{$student_bill->bill_to}*\n
Tagihan transaksi *{$student_bill->title}* akan jatuh tempo {$diff_in_days} hari lagi pada {$bill_due_date}.\n
Mohon untuk segera membayar tagihan. Terima Kasih.\n";
    } else if($student_bill->days_left_until_due_date == 3) {
      $bodyMessage = "Yth. Bapak/Ibu Orang Tua Siswa *{$student_bill->bill_to}*\n
Tagihan transaksi *{$student_bill->title}* akan jatuh tempo {$diff_in_days} hari lagi pada {$bill_due_date}.\n
Mohon untuk segera membayar tagihan. Terima Kasih.\n";
    } else if($student_bill->days_left_until_due_date == 2) {
      $bodyMessage = "Yth. Bapak/Ibu Orang Tua Siswa *{$student_bill->bill_to}*\n
Tagihan transaksi *{$student_bill->title}* akan jatuh tempo {$diff_in_days} hari lagi pada {$bill_due_date}.\n
Mohon untuk segera membayar tagihan. Terima Kasih.\n";
    } else if($student_bill->days_left_until_due_date == 1) {
      $bodyMessage = "Yth. Bapak/Ibu Orang Tua Siswa *{$student_bill->bill_to}*\n
Tagihan transaksi *{$student_bill->title}* akan jatuh tempo {$diff_in_days} hari lagi pada {$bill_due_date}.\n
Mohon untuk segera membayar tagihan. Terima Kasih.\n";

    } else if($student_bill->days_left_until_due_date == 0) {
      $bodyMessage = "Yth. Bapak/Ibu Orang Tua Siswa *{$student_bill->bill_to}*\n
Tagihan transaksi *{$student_bill->title}* jatuh tempo pada hari ini.\n
Mohon untuk segera membayar tagihan. Terima Kasih.\n";
    } else if($student_bill->days_left_until_due_date < 0) {
      $bodyMessage = "Yth. Bapak/Ibu Orang Tua Siswa *{$student_bill->bill_to}*\n
Tagihan transaksi *{$student_bill->title}* sudah melewati {$diff_in_days} hari dari tanggal jatuh tempo ({$bill_due_date}).\n
Mohon untuk segera membayar tagihan. Terima Kasih.\n";

    }
    $bodyMessage = "{$bodyMessage}\nPesan ini dikirim secara otomatis, mohon untuk tidak membalas pesan ini. Untuk mengetahui informasi lebih lanjut, konfirmasi pembayaran, pertanyaan ataupun aduan silahkan menghubungi cabang terdekat kami atau ke Customer Service kami (Whatsapp: 082260008545). Terima Kasih";
    return $bodyMessage;
  }

  private function priceFormat($num) {
    return "Rp " . number_format($num, 0, ",", ".");
  }
}

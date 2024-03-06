<?php

namespace App\Helpers;

use App\Services\FinanceService\Bill;
use App\Services\BranchService\Branch;
use App\Services\ProfileService\Profile;

use Carbon\Carbon;
use App\Helpers\RabbitMq;

class BillingLetter
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

  public function sendBillingLetterAWeekBeforeDueDate()
  {
    $time = Carbon::now()->format('Y-m-d H:i:s');
    echo "[{$time}] Sending unpaid invoice a week before due date...\n";

    $bills = $this->getOpenBills(7);

    if(!$bills) {
      echo "[{$time}] H-7 days unpaid bills not found\n";
      return;
    }
    $this->sendBillLetterMessageToBroker($bills);
    echo "[{$time}] Unpaid a week before due date invoice has been sent \n";
  }

  public function sendBillingLetterOnAndPastDueDate()
  {
    $time = Carbon::now()->format('Y-m-d H:i:s');
    echo "[{$time}] Sending unpaid invoice on/past due date...\n";

    $bills = $this->getOpenBills(0);
    if(!$bills) {
      echo "[{$time}] Unpaid on/past due date bills not found\n";
      return;
    }

    $this->sendBillLetterMessageToBroker($bills);
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

  private function sendBillLetterMessageToBroker($bills)
  {
    foreach($bills as $bill) {

      $bill_branch = $this->getBillBranch($bill->branch_code);
      $profile = $this->profileService->getSingleStudent($bill->smartbtw_id);

      if(!$profile) {
        $time = Carbon::now()->format('Y-m-d H:i:s');
        echo "[{$time}] {$profile->name}'s ({$profile->smartbtw_id}) data not found on profile service, skipping \n";
        continue;
      }

      $parent_phone = property_exists($profile, "parent_datas") ? $profile->parent_datas->parent_number : $profile->parent_number;
      if(!$parent_phone) {
        $time = Carbon::now()->format('Y-m-d H:i:s');
        echo "[{$time}] {$profile->name}'s ({$profile->smartbtw_id}) parent phone number is not found on profile service, skipping \n";
        continue;
      }

      $branchContactNumber = config('branch_contact.'.$bill->branch_code);

      $billDate = Carbon::parse($bill->due_date)->timezone("Asia/Jakarta")->startOfDay();
      $currentDate = Carbon::today();
      $diffInDays = $currentDate->diffInDays($billDate, false);

      $payload = [
        "version" => 1,
        "data" => [
          "id" => $bill->id,
          "package_name" => $bill->title,
          "bill_to" => $bill->bill_to,
          "remain_bill" => $this->priceFormat($bill->remain_bill),
          "due_date" => $bill->due_date,
          "due_date_count" => $diffInDays,
          "branch_phone" => $branchContactNumber,
          "branch_name" => $bill_branch->name,
          "branch_address" => $bill_branch->address,
          "send_message_to" => $parent_phone
        ]
      ];

      $time = Carbon::now()->format('Y-m-d H:i:s');
      RabbitMq::send("sendpdf.invoice-new", json_encode($payload));
      echo "[{$time}] Sending message to {$profile->name}'s ({$profile->smartbtw_id}) parent phone number at {$parent_phone}. Bill ID: {$bill->id} \n";
      sleep(10);
    }
  }

  private function getBillBranch($branch_code)
  {
    $bill_branch = $this->branchService->getBranchByCode($branch_code);
    return $this->removeExcessBillBranchProperties($bill_branch);
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

  private function priceFormat($num) {
    return "Rp " . number_format($num, 0, ",", ".");
  }
}

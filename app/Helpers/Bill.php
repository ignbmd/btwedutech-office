<?php

namespace App\Helpers;

use App\Services\FinanceService\Bill As BillService;
use App\Services\BranchService\Branch;
use Carbon\Carbon;

class Bill {
    public static function getUnpaidBillsCounts(string $branchCode, string $productType)
    {
        $unpaidBillsCounts = [];
        $unpaidBillsCounts["0"] = $unpaidBillsCounts["1"] = $unpaidBillsCounts["2"] = $unpaidBillsCounts["3"] = [];

        $bills = self::getBillsByBranchCodeAndProductType($branchCode, $productType);
        $unpaidBillsCounts["0"]["count"] = count(self::getUnpaidBillsByDaysBeforeDueDate($bills, 3));
        $unpaidBillsCounts["0"]["message"] = "Anda memiliki <a href='/tagihan?type=unpaid-h-3' class='alert-link'>".$unpaidBillsCounts["0"]["count"]." tagihan</a> yang akan jatuh tempo 3 hari lagi.";
        $unpaidBillsCounts["0"]["alert-class"] = "alert alert-h-min-3 my-1";

        $unpaidBillsCounts["1"]["count"] = count(self::getUnpaidBillsByDaysBeforeDueDate($bills, 1));
        $unpaidBillsCounts["1"]["message"] = "Anda memiliki <a href='/tagihan?type=unpaid-h-1' class='alert-link'>".$unpaidBillsCounts["1"]["count"]." tagihan</a> yang akan jatuh tempo besok.";
        $unpaidBillsCounts["1"]["alert-class"] = "alert alert-h-min-1 my-1";

        $unpaidBillsCounts["2"]["count"] = count(self::getUnpaidBillsByDaysBeforeDueDate($bills, 0));
        $unpaidBillsCounts["2"]["message"] = "Anda memiliki <a href='/tagihan?type=unpaid-today' class='alert-link'>".$unpaidBillsCounts["2"]["count"]." tagihan</a> yang jatuh tempo pada hari ini.";
        $unpaidBillsCounts["2"]["alert-class"] = "alert alert-h-min-0 my-1";

        $unpaidBillsCounts["3"]["count"] = count(self::getUnpaidBillsPastDueDate($bills));
        $unpaidBillsCounts["3"]["message"] = "Anda memiliki <a href='/tagihan?type=unpaid-past' class='alert-link'>".$unpaidBillsCounts["3"]["count"]." tagihan</a> yang sudah melewati tanggal jatuh tempo.";
        $unpaidBillsCounts["3"]["alert-class"] = "alert alert-h-plus-1 my-1";
        $unpaidBillsCounts['total'] = array_sum(array_column($unpaidBillsCounts, 'count'));

        ksort($unpaidBillsCounts);
        return $unpaidBillsCounts;
    }

    public static function getAllBranchesUnpaidPastDueDateBills()
    {
      // Define required service
      $billService = self::initializeBillService();
      $branchService = new Branch();

      $offlineProductBills = $billService->getByProductType("OFFLINE_PRODUCT");
      $onlineProductBills = $billService->getByProductType("ONLINE_PRODUCT");

      // Filter bills - Get past due date bills only
      $filteredOfflineProductBills = self::getUnpaidBillsPastDueDate($offlineProductBills);
      $filteredOnlineProductBills = self::getUnpaidBillsPastDueDate($onlineProductBills);

      // Group filtered bills by branch code
      $groupedOfflineProductBills = collect($filteredOfflineProductBills)->groupBy("branch_code")->toArray();
      $groupedOnlineProductBills = collect($filteredOnlineProductBills)->groupBy('branch_code')->toArray();

      $branches = $branchService->getBranchs();
      $branchCodeNames = collect($branches)->pluck('name', 'code'); // ["PT0000" => "Bimbel BTW (Kantor Pusat)"]

      $finalBills = [];

      foreach($branchCodeNames as $code => $name) {
        $finalBills["$name ($code)"]["branch_code"] = $code;
        $finalBills["$name ($code)"]["branch_name"] = $name;
        $finalBills["$name ($code)"]["online_product_bill_count"] = array_key_exists($code, $groupedOnlineProductBills) ? count($groupedOnlineProductBills[$code]) : 0;
        $finalBills["$name ($code)"]["offline_product_bill_count"] = array_key_exists($code, $groupedOfflineProductBills) ? count($groupedOfflineProductBills[$code]) : 0;
        $finalBills["$name ($code)"]["total_bill_count"] = $finalBills["$name ($code)"]["online_product_bill_count"] + $finalBills["$name ($code)"]["offline_product_bill_count"];
        $finalBills["$name ($code)"]["message"] = "$name ($code) memiliki <a href='/tagihan?type=unpaid-past&branch_code=$code' class='alert-link'>".$finalBills["$name ($code)"]["total_bill_count"]." tagihan</a> yang sudah melewati jatuh tempo";
      }

      $finalBills = array_values(array_filter($finalBills, function($bill) {
        return $bill["total_bill_count"] > 0;
      }, ARRAY_FILTER_USE_BOTH));
      return $finalBills;
    }

    public static function getUnpaidBillsPastDueDate($bills)
    {
      $currentDate = Carbon::today();

      $bills = array_filter($bills, function($bill) use($currentDate) {
        $billDate = Carbon::parse($bill->due_date)->timezone("Asia/Jakarta")->startOfDay();
        $diffInDays = $currentDate->diffInDays($billDate, false);
        $bill->days_left_until_due_date = $diffInDays;
        return $bill->status == "OPEN" && $diffInDays < 0;
      }, ARRAY_FILTER_USE_BOTH);
      return array_values($bills);
    }

    private static function initializeBillService()
    {
        $branchService = new Branch(); // variable to be passed to BillService object below
        $billService = new BillService($branchService);
        return $billService;
    }

    private static function getBillsByBranchCodeAndProductType($branchCode, $productType)
    {
        $billService = self::initializeBillService();
        return $billService->getByBranch($branchCode, $productType);
    }

    private static function getUnpaidBillsByDaysBeforeDueDate($bills, $daysBeforeDueDate)
    {
        $currentDate = Carbon::today();

        $bills = array_filter($bills, function($bill) use($currentDate, $daysBeforeDueDate) {
          $billDate = Carbon::parse($bill->due_date)->timezone("Asia/Jakarta")->startOfDay();
          $diffInDays = $currentDate->diffInDays($billDate, false);
          $bill->days_left_until_due_date = $diffInDays;
          $condition = $daysBeforeDueDate > 0
            ? $bill->status == "OPEN" && $diffInDays == $daysBeforeDueDate
            : $bill->status == "OPEN" && $diffInDays == 0;
          return $condition;
        }, ARRAY_FILTER_USE_BOTH);
        return array_values($bills);
    }
}

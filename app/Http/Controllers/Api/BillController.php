<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinanceService\Bill;
use App\Services\AffiliateService\Affiliate;
use App\Services\ProductService\Product;
use App\Services\ApiGatewayService\Internal;
use App\Services\FinanceService\Finance;
use App\Services\FinanceService\ReturnPayment;
use App\Helpers\Bill as BillHelper;
use App\Helpers\S3;
use App\Types\StudentSale;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{

  private Bill $billService;
  private Internal $internalService;
  private Product $productService;
  private Affiliate $affiliateService;
  private ReturnPayment $financeReturnPaymentService;
  private Finance $serviceFinance;

  public function __construct(
    Bill $billService,
    Internal $internalService,
    Product $productService,
    Affiliate $affiliateService,
    ReturnPayment $financeReturnPaymentService,
    Finance $financeService
  ) {
    $this->billService = $billService;
    $this->internalService = $internalService;
    $this->productService = $productService;
    $this->affiliateService = $affiliateService;
    $this->serviceFinance = $financeService;
    $this->financeReturnPaymentService = $financeReturnPaymentService;
  }

  public function getAll(Request $request)
  {
    $draw = $request->get('draw');

    $length = $request->get("length");
    $start = $request->get('start');
    $search = $request->get('search')['value'] ?? "";

    $bills = $this->billService->getAll($length, $start, $search);
    return response()->json([
      "draw" => intval($draw),
      "recordsTotal" => $bills?->total ?? 0,
      "recordsFiltered" => $bills?->filtered ?? 0,
      "data" => $bills?->data ?? []
    ], 200);
  }

  public function getById(string $billId)
  {
    $data = $this->billService->getById($billId);
    return response()->json($data);
  }

  public function getByBranch(string $branchCode, string $type)
  {
    $data = $this->billService->getByBranch($branchCode, $type);
    return response()->json($data);
  }

  public function getByProductType(string $type)
  {
    $data = $this->billService->getByProductType($type);
    return response()->json($data);
  }

  public function getBranchPastDueDateUnpaidBill(string $branch_code)
  {
    $onlineProductBills = BillHelper::getUnpaidBillsPastDueDate($this->billService->getByBranch($branch_code, "ONLINE_PRODUCT"));
    $offlineProductBills = BillHelper::getUnpaidBillsPastDueDate($this->billService->getByBranch($branch_code, "OFFLINE_PRODUCT"));
    $finalBiils = collect(array_merge($onlineProductBills, $offlineProductBills))->sortBy("id")->values()->toArray();
    return response()->json($finalBiils, 200);
  }

  public function getTransactions(string $billId)
  {
    $data = $this->billService->getTransactions($billId);
    return response()->json($data);
  }

  public function updateBillDiscount(Request $request, string $billId)
  {
    $payload = [
      'bill_id' => (int)$billId,
      'new_date' => $request->get('bill_date'),
      'new_discount' => $request->get('final_discount')
    ];
    $response = $this->billService->updateBillDiscount($payload);
    return $response;
  }

  public function updateBillDiscountV2(Request $request, string $billId)
  {
    $payload = [
      'bill_id' => (int)$billId,
      'final_discount' => $request->get('final_discount'),
      'updated_by' => Auth::user()->name
    ];
    $response = $this->billService->updateBillDiscountV2($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function updateBilling(Request $request, string $billId)
  {
    $file = $request->file('file');
    if ($file) {
      $proofFileName = $file->getClientOriginalName();
      $fileExtension = $file->extension();
      $fileMimeType = $file->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif", "pdf"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if (!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar atau pdf"], 422);
    }

    $payload = (array)json_decode($request->get('data'));

    $response = $this->billService->updateBilling($billId, $payload, $request->file('file'));
    $data = json_decode($response->body())->data ?? null;
    $transactionId = $data?->transaction_id ?? null;

    // if($transactionId) {
    //   $transactionDetail = $this->billService->getDetailTransaction((string)$transactionId);
    //   $transactionDocument = $transactionDetail->document[0] ?? null;
    // }


    if ($response->successful()) {
      // if($payload['paid_now']) {
      //   $student = new StudentSale();
      //   $student->name = $payload['student_name'];
      //   $student->email = $payload['student_email'];
      //   $student->phone = env('APP_ENV') == 'dev' ? '6282237808008' : '6289602721213';
      //   $student->amount = $payload['paid_bill'];
      //   $student->billId = $payload['bill_id'];
      //   $student->branchCode = $payload['branch_code'];
      //   $student->paymentMethod = $payload['payment_name'];
      //   $student->productName = $payload['product_name'];
      //   $student->createdAt = Carbon::now();
      //   $student->transactionId = $transactionId;
      //   $student->fileName = $transactionDocument ? $transactionDocument->name : null;
      //   $student->urlFile = $transactionDocument ? $transactionDocument->path : null;
      //   if($student->fileName && $student->urlFile) $this->serviceFinance->sendSaleMessage($student);
      // }

      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Membuat transaksi berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $data->message ?? 'Membuat transaksi gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data, $response->status());
  }

  public function getDetailTransaction($billId, $transactionId)
  {
    return $this->billService->getDetailTransaction($transactionId);
  }

  public function updateBillingTransaction(Request $request, string $billId, string $transactionId)
  {
    $file = $request->file('file');
    if ($file) {
      $proofFileName = $file->getClientOriginalName();
      $fileExtension = $file->extension();
      $fileMimeType = $file->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif", "pdf"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if (!$isValidFile) {
        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Gagal!',
            'type' => 'error',
            'message' => "File yang ditambahkan tidak valid. Silakan masukkan file gambar atau pdf"
          ]
        );
        return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar atau pdf"], 422);
      }
    }

    $transaction = $this->billService->getDetailTransaction($transactionId);

    $payload = (array)json_decode($request->get('data'));
    $payload["old_file_name"] = $transaction->document[0]->name ?? "";
    $payload["old_file_path"] = $transaction->document[0]->path ?? "";

    $response = $this->billService->updateBillingTransaction(
      $billId,
      $transactionId,
      $payload,
      $request->file('file')
    );
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update transaksi berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $data->message ?? 'Update transaksi gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data, $response->status());
  }

  public function updateBillingTransactionV2(Request $request, string $transactionId)
  {
    $payload = $request->get('data');

    $response = $this->billService->updateBillingTransactionV2(
      $transactionId,
      $payload
    );
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update transaksi berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $data->message ?? 'Update transaksi gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data, $response->status());
  }

  public function createNewBillingTransaction(Request $request, string $billId)
  {
    $file = $request->file('file');
    if ($file) {
      $proofFileName = $file->getClientOriginalName();
      $fileExtension = $file->extension();
      $fileMimeType = $file->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif", "pdf"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if (!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar atau pdf"], 422);
    }

    $payload = (array)json_decode($request->get('data'));

    $response = $this->billService->createNewBillingTransaction($billId, $payload, $request->file('file'));
    $data = json_decode($response->body())->data ?? null;
    $transactionId = $data?->transaction_id ?? null;

    if ($transactionId) {
      $transactionDetail = $this->billService->getDetailTransaction((string)$transactionId);
      $transactionDocument = $transactionDetail->document[0] ?? null;
    }

    $manualBankTransferPaymentMethods = ["MANUAL_TF_BCA", "MANUAL_TF_BRI", "MANUAL_TF_BNI"];
    $manualBankTransferPaymentNames = ["MANUAL_TF_BCA" => "Bank BCA", "MANUAL_TF_BRI" => "Bank BRI", "MANUAL_TF_BNI" => "Bank BNI"];

    if ($response->successful()) {
      if (in_array($payload['payment_method'], $manualBankTransferPaymentMethods)) {
        $student = new StudentSale();
        $student->name = $payload['student_name'];
        $student->email = $payload['student_email'];
        $student->phone = env('APP_ENV') == 'dev' ? '6282237808008' : '6281933033433';
        $student->amount = $payload['paid_bill'];
        $student->billId = $payload['bill_id'];
        $student->branchCode = $payload['branch_code'];
        $student->paymentMethod = $manualBankTransferPaymentNames[$payload['payment_method']];
        $student->productName = $payload['product_name'];
        $student->createdAt = Carbon::now();
        $student->transactionId = $transactionId;
        $student->fileName = $transactionDocument ? $transactionDocument->name : null;
        $student->urlFile = $transactionDocument ? $transactionDocument->path : null;
        if ($student->fileName && $student->urlFile) $this->serviceFinance->sendSaleMessage($student);
      }

      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Membuat transaksi berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $data->message ?? 'Membuat transaksi gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data, $response->status());
  }

  public function updateOfflineTransaction(Request $request, string $billId, string $transactionId)
  {
    $transaction = $this->billService->getDetailTransaction($transactionId);
    $payload = (array)json_decode($request->get('data'));
    $payload["old_file_name"] = $transaction->document[0]->name ?? "";

    $response = $this->billService->updateOfflineTransaction(
      $billId,
      $transactionId,
      $payload,
      $request->file('file')
    );
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update transaksi berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $data->message ?? 'Update transaksi gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data, $response->status());
  }

  public function updateOnlineTransaction(Request $request, string $billId, string $transactionId)
  {
    try {
      $payload = [
        'transaction_id' => (int)$transactionId,
        'transaction_status' => $request->transaction_status
      ];

      $response = $this->billService->updateOnlineTransaction($billId, $transactionId, $payload);
      if ($response->successful()) {
        $bill = $this->billService->getById($billId);
        $transaction = $this->getDetailTransaction($billId, $transactionId);
        $legacyBillId = $bill->legacy_bill_id;
        $billProduct = $bill->product_item[0];

        $studentId = $transaction->bill->smartbtw_id;
        $studentName = $transaction->bill->bill_to;
        $studentEmail = $transaction->bill->email;
        $studentPhone = $transaction->bill->phone;

        $productPrice = $billProduct->final_amount;
        $productDesc = "Pembelian " . $billProduct->product_description;

        if ($legacyBillId) {
          $this->internalService->updateLegacyTransaction($legacyBillId, 'settlement');
        }

        $promoTransactionBody = [
          "code" => "",
          "student_id" => $studentId,
          "product_price" => $productPrice,
          "desc" => $productDesc,
        ];

        $this->affiliateService->createTransaction($promoTransactionBody);

        $productActivationBody = [
          "product_code" => $billProduct->product_code,
          "branch_code" => "PT0000",
          "smartbtw_id" => $studentId,
          "name" => $studentName,
          "email" => $studentEmail,
          "phone" => $studentPhone,
          "status" => true,
          "date_activated" => Carbon::now(),
        ];

        $this->productService->createActivation($productActivationBody);
        $this->internalService->sendReceiveModule($studentId);

        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Berhasil!',
            'type' => 'success',
            'message' => 'Data transaksi berhasil diupdate'
          ]
        );
        return response()->json(['success' => true, 'message' => "Transaksi berhasil di approve"], 200);
      } else {
        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Terjadi kesalahan!',
            'type' => 'error',
            'message' => 'Proses update transaksi gagal, silakan coba lagi nanti'
          ]
        );
        return $response->throw();
      }
    } catch (\Throwable $th) {
      return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
    }
  }

  public function sendInvoice(Request $request, string $billId)
  {
    try {
      $url = $this->billService->sendInvoice(
        $billId,
        $request->studentName,
        $request->amount,
        $request->phone
      );
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Kirim Invoice!',
          'type' => 'success',
          'message' => 'Silahkan check whatsapp anda'
        ]
      );
      return response()->json(['url' => $url]);
    } catch (\Throwable $th) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $th->getMessage()
        ]
      );
    }
  }

  public function sendReceipt(Request $request, string $billId, string $transactionId)
  {
    try {
      $url = $this->billService->sendReceipt(
        $billId,
        $transactionId,
        $request->studentName,
        $request->createdAt,
        $request->phone
      );
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Kirim Kwitansi!',
          'type' => 'success',
          'message' => 'Silahkan check whatsapp anda'
        ]
      );
      return response()->json(['url' => $url]);
    } catch (\Throwable $th) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $th->getMessage()
        ]
      );
    }
  }

  public function sendPaymentLinkToWhatsapp(Request $request)
  {
    try {
      $this->billService->sendPaymentLink(
        phone: $request->phone,
        studentName: $request->studentName,
        productName: $request->productName,
        branchCode: $request->branchCode,
        link: $request->link
      );
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Kirim Link Pembayaran Berhasil!',
          'type' => 'success',
          'message' => 'Informasikan customer untuk mengecek pesan whatsapp'
        ]
      );
      return response()->json(['link' => $request->link]);
    } catch (\Throwable $th) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => $th->getMessage()
        ]
      );
    }
  }

  public function deleteBill(Request $request, $billId)
  {
    try {
      $response = $this->billService->deleteBill($billId);
      return $response;
    } catch (\Throwable $th) {
      return response()->json(['success' => false, 'message' => $th->getMessage()]);
    }
  }

  public function deleteTransaction(Request $request, $transactionId)
  {
    try {
      $response = $this->billService->deleteTransaction($transactionId);
      return $response;
    } catch (\Throwable $th) {
      return response()->json(['success' => false, 'message' => $th->getMessage()]);
    }
  }

  public function approveOnlineTransaction(Request $request, $billId, $transactionId)
  {
    try {
      $payload = [
        'transaction_id' => (int)$transactionId,
        'transaction_status' => 'APPROVED'
      ];

      $response = $this->billService->updateOnlineTransaction($billId, $transactionId, $payload);

      if ($response->successful()) {
        $bill = $this->billService->getById($billId);
        $transaction = $this->getDetailTransaction($billId, $transactionId);

        $legacyBillId = $bill->legacy_bill_id;
        $billProduct = $bill->product_item[0];

        $studentId = $transaction->bill->smartbtw_id;
        $studentName = $transaction->bill->bill_to;
        $studentEmail = $transaction->bill->email;
        $studentPhone = $transaction->bill->phone;

        $productPrice = $billProduct->final_amount;
        $productDesc = "Pembelian " . $billProduct->product_description;

        if ($legacyBillId) {
          $this->internalService->updateLegacyTransaction($legacyBillId, 'settlement');
        }

        $promoTransactionBody = [
          "code" => "",
          "student_id" => $studentId,
          "product_price" => $productPrice,
          "desc" => $productDesc,
        ];
        $this->affiliateService->createTransaction($promoTransactionBody);

        $productActivationBody = [
          "product_code" => $billProduct->product_code,
          "branch_code" => "PT0000",
          "smartbtw_id" => $studentId,
          "name" => $studentName,
          "email" => $studentEmail,
          "phone" => $studentPhone,
          "status" => true,
          "date_activated" => Carbon::now(),
        ];
        $this->productService->createActivation($productActivationBody);
        $this->internalService->sendReceiveModule($studentId);

        return response()->json(['success' => true, 'message' => "Transaksi tagihan berhasil diterima"], 200);
      } else {
        return $response->throw();
      }
    } catch (\Throwable $th) {
      return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
    }
  }

  public function rejectOnlineTransaction(Request $request, $billId, $transactionId)
  {
    try {
      $bill = $this->billService->getById($billId);
      $legacyBillId = $bill->legacy_bill_id;

      if ($legacyBillId) {
        $this->internalService->updateLegacyTransaction($legacyBillId, 'failed');
      }

      $this->billService->updateOnlineTransaction($billId, $transactionId, [
        "transaction_id" => (int)$transactionId,
        "transaction_status" => "FAIL"
      ]);

      return response()->json(['success' => false, 'message' => "Transasksi tagihan berhasil ditolak"], 200);
    } catch (\Throwable $th) {
      return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
    }
  }

  public function reconcileBill($billId)
  {
    try {
      $response = $this->billService->reconcileBill((int)$billId);
      $body = json_decode($response->body());
      $status = $response->status();

      return response()->json($body, $status);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }

  public function getBillProduct($billId)
  {
    $bill = $this->billService->getById($billId);
    if (!$bill) return response()->json(['success' => false, 'data' => null, 'message' => 'Bill not found'], 404);

    $product = $this->productService->getProductByProductAndBranchCode($bill->product_code, $bill->branch_code);
    if (!$product) return response()->json(['success' => false, 'data' => null, 'message' => 'Bill Product not found'], 404);

    $isCentralTatapMukaOnlineProduct = $bill?->branch_code === "PT0000" && in_array("TATAP_MUKA_ONLINE", $product?->tags);
    $product->is_tatap_muka_online_product = $isCentralTatapMukaOnlineProduct;

    return response()->json(['success' => true, 'data' => $product, 'message' => 'Bill product data found'], 200);
  }

  public function createReturnPayment(Request $request)
  {
    $data = (array)json_decode($request->get('data'));
    $data["created_by"] = Auth::user()?->name;
    $billId = $data["bill_id"];

    $file = $request->file('file');

    if ($file) {
      $fileExtension = $file->extension();
      $fileMimeType = $file->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif", "pdf"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if (!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar atau pdf"], 422);

      $data['proof_payment']['name'] = $file->getClientOriginalName();
      $data['proof_payment']['path'] = S3::storeOriginal("/uploads/office/return-payment/$billId", $file);
    }

    $response = $this->financeReturnPaymentService->create($data);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getAssessmentEventProductBill()
  {
    $response = $this->billService->getAssessmentEventProductBill();
    $body = json_decode($response->body())?->data ?? [];
    $status = $response->status();
    return response()->json($body, $status);
  }
}

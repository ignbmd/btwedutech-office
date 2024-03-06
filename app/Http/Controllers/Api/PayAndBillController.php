<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Helpers\S3;
use App\Types\PayBill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Services\FinanceService\Finance;
use App\Services\FinanceService\PayAndBill;

class PayAndBillController extends Controller
{
  private Finance $serviceFinance;
  private PayAndBill $servicePayAndBill;

  public function __construct(Finance $financeService, PayAndBill $payAndBillService) {
    $this->serviceFinance = $financeService;
    $this->servicePayAndBill = $payAndBillService;
  }

  // private function sendAttachFileMessage(
  //   string $phoneNumber,
  //   string $fileName,
  //   string $fileUrl,
  // ) {
  //   RabbitMq::send('message-gateway.wa-file.created', json_encode([
  //     'version' => 1,
  //     'data' => [
  //       'phone_number' => $phoneNumber,
  //       'message_title' => 'Proof File',
  //       'file_name' => $fileName,
  //       'url_file' => $fileUrl,
  //       'caption' => $fileName,
  //       'date_send' => Carbon::now()->toISOString(),
  //     ]
  //   ]));
  // }

  public function getCentralDebtOrReceivables(string $type) {
    $body = $this->serviceFinance->getCentralDebtOrReceivables($type);
    if($body->success) {
      $data = $body->data;
      return response()->json(['data' => $data]);
    }
  }

  public function getSourceAccount() {
    $body = $this->serviceFinance->getSource();
    if($body->success) {
      $data = $body->data;
      return response()->json(['data' => $data]);
    }
  }

  public function getDebtAmount(string $accountId) {
    $body = $this->serviceFinance->getDebtTotal($accountId);
    if($body->success) {
      $data = $body->data;
      return response()->json(['data' => $data]);
    }
  }

  public function getCentralPayDebtHistory(string $type, string $accountId) {
    $body = $this->serviceFinance->getCentralDebtHistory($type, $accountId);
    if($body->success) {
      $data = $body->data;
      return response()->json(['data' => $data]);
    }
  }

  public function getBranchDebt() {
    $user = Auth::user();
    $branchCode = $user->branch_code;

    $response = $this->serviceFinance->getBranchDebt($branchCode);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getBranchReceivable() {
    $user = Auth::user();
    $branchCode = $user->branch_code;

    $response = $this->serviceFinance->getBranchReceivable($branchCode);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getCentralCollectReceivableHistory(Request $request) {
    $user = Auth::user();
    $branchCode = $user->branch_code;
    $status = $request->status;

    $response = $this->serviceFinance->getCentralBillHistory($branchCode, $status);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function postCentralPayOrBill(Request $request, string $type) {
    $user = Auth::user();
    $proofImg = $request->file('proof');
    $proofFileName = "";
    $proofImgUrl = "";

    if($proofImg) {
        $proofFileName = $proofImg->getClientOriginalName();
        $targetPath = "/uploads/office/pay-and-bill/proof";
        $proofImgUrl = S3::storeOriginal($targetPath, $proofImg);
    }

    $reqBody = json_decode($request->reqBody);
    $payload = [
      "account_id" => (int) $reqBody->account_id,
      "branch_code" => $reqBody->branch_code,
      "contact_id" => (int) $reqBody->contact_id,
      "status" => $reqBody->status,
      "source_account_id" => (int) $reqBody->source_account_id,
      "amount" => (int) $reqBody->amount,
      "log_type" => $reqBody->log_type,
      "created_by" => $user->name,
      "log_date" => Carbon::now()->format('Y-m-d'),
      "created_at" => $reqBody->created_at,
      "proof_payment" =>
          $proofImg ? [
            "name" => $proofFileName,
            "path" => $proofImgUrl
          ] : (object) [],
    ];

    $response = $this->serviceFinance->createPayBillLog($type, $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    $branchPayDebtPhoneNumberTarget = env('APP_ENV') == 'dev' ? '628983471183' : '6289602721213';

    $contact = new PayBill();
    $contact->name = $reqBody->contact_name;
    $contact->phone = $reqBody->from == 'BRANCH' ? $branchPayDebtPhoneNumberTarget : $reqBody->contact_phone;
    $contact->amount = $reqBody->amount;
    $contact->branchCode = $reqBody->branch_code;
    $contact->paymentMethod = $reqBody->payment_method;
    $contact->type = $reqBody->from."_".$reqBody->log_type;
    $this->servicePayAndBill->sendContactMessage($contact);
    // if($type == 'pay') {
    //   $this->sendAttachFileMessage(
    //     phoneNumber: $contact->phone,
    //     fileName: 'Bukti Pembayaran - '.$proofFileName,
    //     fileUrl: $proofImgUrl
    //   );
    // }

    return response()->json($responseBody, $responseStatus);
  }

  public function getDetailHistory(string $historyId) {
    $body = $this->serviceFinance->getDetailHistory($historyId);
    if($body->success) {
      $data = $body->data;
      return response()->json(['data' => $data]);
    }
  }

  public function updateHistoryCentral(Request $request) {
    $user = Auth::user();
    $payload = [
      "id" => (int) $request->id,
      "status" => $request->status,
      "source_account_id" => (int) $request->source_account_id,
      "contact_id" => (int) $request->contact_id,
      "amount" => (int) $request->amount,
      "created_by" => $user->name
    ];

    $response = $this->serviceFinance->updateHistory($payload, 'update-central');
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if($responseStatus == 201 || $responseStatus == 200) {
      $request->session()->flash('flash-message',
          [
            'title' => 'Berhasil!',
            'type' => 'success',
            'message' => 'Transaksi berhasil diperbarui'
          ]
        );
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function updateHistoryBranch(Request $request) {
    $proofImg = $request->file('proof');
    $proofFileName = "";
    $proofImgUrl = "";

    if($proofImg) {
        $proofFileName = $proofImg->getClientOriginalName();
        $targetPath = "/uploads/office/pay-and-bill/proof";
        $proofImgUrl = S3::storeOriginal($targetPath, $proofImg);
    }

    $payload = [
      "id" => (int) $request->id,
      "proof_payment" =>
          $proofImg ? [
            "name" => $proofFileName,
            "path" => $proofImgUrl
          ] : (object) [],
    ];

    $response = $this->serviceFinance->updateHistory($payload, 'update-branch');
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    $contact = new PayBill();
    $contact->name = env('APP_ENV') == 'dev' ? 'Siti' : 'Made';
    $contact->id = $request->id;
    $contact->type = 'BRANCH_PAY';
    $contact->amount = $request->amount;
    $contact->phone = env('APP_ENV') == 'dev' ? '6281558726051' : '6289602721213';
    $contact->branchCode = $request->branch_code;
    $contact->paymentMethod = $request->payment_method;
    $this->servicePayAndBill->sendContactMessage($contact);
    // $this->sendAttachFileMessage(
    //   phoneNumber: $contact->phone,
    //   fileName: 'Bukti Pembayaran - '.$proofFileName,
    //   fileUrl: $proofImgUrl
    // );

    return response()->json($responseBody, $responseStatus);
  }
}

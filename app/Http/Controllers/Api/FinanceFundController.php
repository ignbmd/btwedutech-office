<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinanceService\TransferFund;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinanceFundController extends Controller
{
  private TransferFund $service;

  public function __construct(TransferFund $service)
  {
    $this->service = $service;
  }

  public function getAll(Request $request)
  {
    $response = $this->service->getAll($request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getById($id)
  {
    $response = $this->service->getById((int)$id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function storeBranch(Request $request)
  {
    try {
      $user = collect(Auth::user())->first();
      $transferFundsResponse = $this->service->getAll(['branch_code' => $user["branch_code"], "transfer_status" => "PENDING", "show_branch_only" => true]);
      if($transferFundsResponse->failed()) return response()->json(['status' => false, 'message' => 'Proses gagal, silakan coba lagi'], 500);
      $transferFundsBody = json_decode($transferFundsResponse->body())?->data;
      if(count($transferFundsBody) > 0) return response()->json(['status' => false, 'message' => 'Terdapat transaksi yang masih pending. Tidak bisa menambah permintaan penarikan dana baru'], 400);
      $payload = [
        "amount" => $request->amount,
        "contact_id" => $request->contact_id["id"],
        "request_by" => $user["name"],
        "branch_code" => $request->branch_code
      ];
      $response = $this->service->storeBranch($payload);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);

    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => 'Terjadi kesalahan, Silakan coba lagi nanti', "data" => $e->getMessage()], 500);
    }
  }

  public function storeCentral(Request $request)
  {
    $file = $request->file('file');
    if($file) {
      $proofFileName = $file->getClientOriginalName();
      $fileExtension = $file->extension();
      $fileMimeType = $file->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if(!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar"], 422);
    }
    $payload = (array)json_decode($request->get('data'));

    $response = $this->service->storeCentral($payload, $file);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function update(Request $request, $id)
  {
    $payload = ["amount" => $request->amount];
    $response = $this->service->update((int)$id, $payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function confirm(Request $request, $id)
  {
    $file = $request->file('file');
    if($file) {
      $fileExtension = $file->extension();
      $fileMimeType = $file->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if(!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar"], 422);
    }
    $transferFundResponse = $this->service->getById($id);
    $transferFundBody = json_decode($transferFundResponse->body())->data ?? null;
    $payload = (array)json_decode($request->get('data'));
    if($transferFundBody) {
      $payload["old_transfer_fund_attachment"]["name"] = $transferFundBody->transfer_fund_attachment->proof_name;
      $payload["old_transfer_fund_attachment"]["path"] = $transferFundBody->transfer_fund_attachment->proof_path;
      $payload["branch_code"] = $transferFundBody->branch_code;
    } else {
      return response()->json(["success" => false, "message" => "Proses gagal, silakan coba lagi"], 422);
    }
    $response = $this->service->confirm($payload, (int)$id, $file);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function updateProof(Request $request, $id)
  {
    $file = $request->file('file');
    if($file) {
      $fileExtension = $file->extension();
      $fileMimeType = $file->getMimeType();

      $validFileExtensions = ["jpg", "jpeg", "png", "gif"];
      $validFileMimeType = ["image/jpeg", "image/png", "image/gif"];

      $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
      if(!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar"], 422);
    }
    $transferFundResponse = $this->service->getById($id);
    $transferFundBody = json_decode($transferFundResponse->body())->data ?? null;
    $payload = (array)json_decode($request->get('data'));
    if($transferFundBody) {
      $payload["old_transfer_fund_attachment"]["name"] = $transferFundBody->transfer_fund_attachment->proof_name;
      $payload["old_transfer_fund_attachment"]["path"] = $transferFundBody->transfer_fund_attachment->proof_path;
    } else {
      return response()->json(["success" => false, "message" => "Proses gagal, silakan coba lagi"], 422);
    }
    $response = $this->service->updateTransferFundProof($payload, (int)$id, $file);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

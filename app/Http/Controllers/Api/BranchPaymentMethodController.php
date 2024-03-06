<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinanceService\BranchPaymentMethod;
use Illuminate\Http\Request;
use App\Helpers\S3;

class BranchPaymentMethodController extends Controller
{
    private BranchPaymentMethod $financeBranchPaymentMethod;

    public function __construct(BranchPaymentMethod $financeBranchPaymentMethod)
    {
      $this->financeBranchPaymentMethod = $financeBranchPaymentMethod;
    }

    public function getAll()
    {
      $response = $this->financeBranchPaymentMethod->getAll();
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    }

    public function getByBranchCode(string $branch_code)
    {
      $response = $this->financeBranchPaymentMethod->getByBranchCode($branch_code);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    }

    public function create(Request $request, $branch_code)
    {
      $payload = [
        "branch_code" => $branch_code,
        "transaction_method" => strtoupper(preg_replace('/\s+/', '_', $request->transaction_method)),
        "rek_name" => $request->is_bank_transfer ? $request->rek_name : null,
        "rek_number" => $request->is_bank_transfer ? $request->rek_number : null,
      ];

      $file = $request->file('file');
      if($file) {
        $fileExtension = $file->extension();
        $fileMimeType = $file->getMimeType();

        $validFileExtensions = ["jpg", "jpeg", "png", "gif"];
        $validFileMimeType = ["image/jpeg", "image/png", "image/gif"];

        $isValidFile = in_array($fileExtension, $validFileExtensions) && in_array($fileMimeType, $validFileMimeType);
        if(!$isValidFile) return response()->json(["success" => false, "message" => "File yang ditambahkan tidak valid. Silakan masukkan file gambar"], 422);
        $payload['document']['name'] = $file->getClientOriginalName();
        $payload['document']['path'] = S3::storeOriginal("/uploads/office/branch-payment-method", $file);
      }

      $response = $this->financeBranchPaymentMethod->create($payload);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    }

    public function delete(int $id)
    {
      $response = $this->financeBranchPaymentMethod->delete($id);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    }
}

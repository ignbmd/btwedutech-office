<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinanceService\CentralOperationalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class CentralOperationalItemController extends Controller
{
  private CentralOperationalItem $service;

  public function __construct(CentralOperationalItem $service)
  {
    $this->service = $service;
  }

  public function getAll()
  {
    return $this->service->getAll();
  }

  public function getById($id)
  {
    return $this->service->getById($id);
  }

  public function getByProductCode($productCode)
  {
    return $this->service->getByProductCode($productCode);
  }

  public function create(Request $request)
  {
    $validation = $this->validateOnCreate($request);
    if ($validation->fails()) return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    return $this->service->create([
      "product_code" => $request->product_code,
      "items_name" => $request->items_name,
      "branch_code" => $request->branch_code,
      "qty" => (int)$request->qty,
      "amount" => (int)$request->amount
    ]);
  }

  public function update(Request $request, $id)
  {
    $validation = $this->validateOnUpdate($request);
    if ($validation->fails()) return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validation->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);

    return $this->service->update([
      "id" => (int)$id,
      "product_code" => $request->product_code,
      "branch_code" => $request->branch_code,
      "items_name" => $request->items_name,
      "qty" => (int)$request->qty,
      "amount" => (int)$request->amount
    ]);
  }

  private function validateOnCreate($request)
  {
    return Validator::make(
      $request->all(),
      [
        "product_code" => ["required"],
        "items_name" => ["required"],
        "branch_code" => ["required"],
        "qty" => ["required", "numeric", "integer", "min:0"],
        "amount" => ["required", "numeric", "integer", "min:0"]
      ],
      [
        "product_code.required" => "Kode tidak boleh kosong",
        "branch_code.required" => "Cabang tidak boleh kosong",
        "items_name.required" => "Produk tidak boleh kosong",
        "qty.required" => "Jumlah tidak boleh kosong",
        "qty.numeric" => "Jumlah tidak valid",
        "qty.integer" => "Jumlah tidak valid",
        "qty.min" => "Jumlah tidak valid",
        "amount.required" => "Harga tidak boleh kosong",
        "amount.numeric" => "Harga tidak valid",
        "amount.integer" => "Harga tidak valid",
        "amount.min" => "Harga tidak valid"
      ]
    );
  }

  private function validateOnUpdate($request)
  {
    return Validator::make(
      $request->all(),
      [
        "product_code" => ["required"],
        "items_name" => ["required"],
        "branch_code" => ["required"],
        "qty" => ["required", "numeric", "integer", "min:0"],
        "amount" => ["required", "numeric", "integer", "min:0"]
      ],
      [
        "product_code.required" => "Kode tidak boleh kosong",
        "branch_code.required" => "Cabang tidak boleh kosong",
        "items_name.required" => "Produk tidak boleh kosong",
        "qty.required" => "Jumlah tidak boleh kosong",
        "qty.numeric" => "Jumlah tidak valid",
        "qty.integer" => "Jumlah tidak valid",
        "qty.min" => "Jumlah tidak valid",
        "amount.required" => "Harga tidak boleh kosong",
        "amount.numeric" => "Harga tidak valid",
        "amount.integer" => "Harga tidak valid",
        "amount.min" => "Harga tidak valid"
      ]
    );
  }
}

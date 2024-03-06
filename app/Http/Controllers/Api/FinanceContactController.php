<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinanceService\Contact;

class FinanceContactController extends Controller
{
  private Contact $contactService;

  public function __construct(Contact $contactService)
  {
    $this->contactService = $contactService;
  }

  public function getAllByBranchCode(Request $request, $branchCode)
  {
    $contacts = $branchCode == "PT0000"
      ? $this->contactService->getAll()
      : $this->contactService->getAllByBranchCode($branchCode);
    return response()->json($contacts);
  }

  public function getAll(Request $request)
  {
    $contacts = $this->contactService->getAll();
    return response()->json($contacts);
  }

  public function create(Request $request)
  {
    $result = $this->contactService->create($request->all());
    return response()->json($result);
  }

  public function createBranchContact(Request $request)
  {
    $payload = [
      'type' => ['Cabang'],
      'branch_code' => $request->branch_code,
      'name' => $request->name,
      'phone' => $request->phone,
      'address' => $request->address,
      'email' => $request->email,
      'bank_account_type' => $request->bank_account_type["value"],
      'bank_account_name' => $request->bank_account_name,
      'bank_account_number' => $request->bank_account_number
    ];
    $result = $this->contactService->createBranchContact($payload);
    return response()->json($result);
  }

  public function update(Request $request, $id)
  {
    $payload = [
      'type' => ['Cabang'],
      'branch_code' => $request->branch_code,
      'name' => $request->name,
      'phone' => $request->phone,
      'address' => $request->address,
      'email' => $request->email,
      'bank_account_type' => $request->bank_account_type["value"],
      'bank_account_name' => $request->bank_account_name,
      'bank_account_number' => $request->bank_account_number
    ];
    $result = $this->contactService->updateContact((int)$id, $payload);
    return response()->json($result);
  }
}

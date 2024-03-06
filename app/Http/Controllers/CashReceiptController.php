<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Barryvdh\Snappy\Facades\SnappyPdf;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Helpers\Number;
use App\Services\BranchService\Branch;
use App\Services\FinanceService\PaymentProof;
use App\Services\FinanceService\Bill;

class CashReceiptController extends Controller
{
  private Branch $branchService;
  private PaymentProof $financePaymentProofService;
  private Bill $financeBillService;

  public function __construct(Branch $branchService, PaymentProof $financePaymentProofService, Bill $financeBillService)
  {
    Breadcrumb::setFirstBreadcrumb("Surat Terima Cash", "/surat-terima-cash");
    $this->branchService = $branchService;
    $this->financePaymentProofService = $financePaymentProofService;
    $this->financeBillService = $financeBillService;
  }

  public function index()
  {
    $isValidUserRole = UserRole::isAdmin() || UserRole::isKeuangan();
    if(!$isValidUserRole) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/home');
    }
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $response = $this->financePaymentProofService->get(["branch_code" => Auth::user()->branch_code ?? "PT0000", "type" => "RETURN"]);
    $responseBody = json_decode($response?->body());
    $view_data = ["proofs" => $responseBody, "breadcrumbs" => $breadcrumbs];
    return view('pages.cash-receipt.index', $view_data);
  }

  public function create($billId = null)
  {
    $isValidUserRole = UserRole::isAdmin() || UserRole::isKeuangan();
    if(!$isValidUserRole) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/home');
    }

    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah']];
    if(UserRole::isAdmin()) $branches = $this->branchService->getBranchs();
    else {
      $branchCode = Auth::user()->branch_code;
      $branches = $this->branchService->getBranchByCode($branchCode);
    }
    if(!$billId) $view_data = ["breadcrumbs" => $breadcrumbs, "branches" => $branches];
    else {
      $bill = $this->financeBillService->getById($billId);
      $view_data = ["breadcrumbs" => $breadcrumbs, "branches" => $branches, 'bill' => $bill];
    }

    return view("pages.cash-receipt.create", $view_data);
  }

  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), $this->getValidationRules(), $this->getValidationMessages());
    if($validator->fails()) return redirect('/bukti-terima-uang/tambah')->withErrors($validator)->withInput();

    $amount = intval(str_replace(",","",$request->amount));
    $payload = [
      "name" => $request->name,
      "phone" => $request->phone ?? "-",
      "address" => $request->address ?? "-",
      "amount" => $amount,
      "amount_text" => $this->generateTerbilang($amount),
      "payment_for" => $request->payment_for,
      "branch_code" => "PT0000",
      "created_by" => Auth::user()->name,
      "type" => "RETURN"
    ];

    $response = $this->financePaymentProofService->create($payload);
    $responseStatus = $response->status();
    $responseBody = json_decode($response?->body());
    if(!$responseStatus == Response::HTTP_CREATED) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses gagal, silakan coba lagi nanti'
      ]);
      return redirect('/bukti-terima-uang/tambah')->withInput();
    }
    $branch = $this->branchService->getBranchByCode("PT0000");

    $payload["is_preview"] = false;
    $payload["proof_id"] = $responseBody->data->proof_payment->id;
    $payload["created_at"] = $responseBody->data->proof_payment->created_at;
    $payload["ref_number"] = $responseBody->data->ref ?? "";
    $payload["download_url"] = url("/bukti-terima-uang/{$payload["proof_id"]}/download");
    $payload["branch"] = $branch;
    return $this->showPaymentProofPdf($payload);
  }

  public function show(Request $request)
  {
    $validator = Validator::make($request->all(), $this->getValidationRules(), $this->getValidationMessages());
    if($validator->fails()) return redirect('/bukti-terima-uang/tambah')->withErrors($validator)->withInput();

    $branch = $this->branchService->getBranchByCode("PT0000");
    $amount = intval(str_replace(",","",$request->amount));

    $view_data = [
      "name" => $request->name,
      "phone" => $request->phone ?? "-",
      "amount" => $amount,
      "address" => $request->address ?? "-",
      "amount_text" => $this->generateTerbilang($amount),
      "payment_for" => $request->payment_for,
      "branch_code" => "PT0000",
      "branch" => $branch,
      "created_by" => Auth::user()->name,
      "is_preview" => true,
    ];
    return view('pages.cash-receipt.show', $view_data);
  }

  public function download(string $id)
  {
    $isValidUserRole = UserRole::isAdmin() || UserRole::isKeuangan();
    if(!$isValidUserRole) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Anda tidak diperbolehkan mengakses halaman ini'
      ]);
      return redirect('/home');
    }

    $response = $this->financePaymentProofService->getById($id);
    $responseBody = json_decode($response?->body());
    $responseStatus = $response->status();
    if($responseStatus !== Response::HTTP_OK && !$responseBody?->data) return "Data tidak ditemukan";
    $branch = $this->branchService->getBranchByCode("PT0000");
    $payload = [
      "name" => $responseBody->data->name ?? "",
      "phone" => $responseBody->data->phone ?? "",
      "amount" => intval(str_replace(",","",$responseBody->data->amount)),
      "address" => $responseBody->data->address ?? "",
      "amount_text" => $responseBody->data->amount_text ?? "",
      "payment_for" => $responseBody->data->payment_for ?? "",
      "branch_code" => "PT0000",
      "branch" => $branch,
      "created_by" => $responseBody->data->created_by ?? "",
      "is_preview" => false,
      "proof_id" => $responseBody->data->id,
      "created_at" => $responseBody->data->created_at,
      "ref_number" => $responseBody->data->ref_number ?? "N/A",
      "download_url" => url("/bukti-terima-cash/{$responseBody->data->id}/download")
    ];
    return $this->showPaymentProofPdf($payload);
  }

  private function getValidationRules()
  {
    return [
      "name" => ["required"],
      "amount" => [
        "required",
        function($attribute, $value, $fail) {
          $amount = intval(str_replace(",","",$value));
          if ($amount <= 0) $fail("Nominal tidak valid");
        },
      ],
      "payment_for" => ["required"],
    ];
  }

  private function getValidationMessages()
  {
    return [
      "name.required" => "Nama harus diisi",
      "amount.required" => "Nominal harus diisi",
      "payment_for.required" => "Tujuan pembayaran harus diisi",
    ];
  }

  private function showPaymentProofPdf(array $payload)
  {
    $html = view('pages/cash-receipt/show', $payload);
    $pdf = SnappyPdf::loadHTML($html);
    $pdf->setOption('enable-javascript', true);
    $pdf->setOption('javascript-delay', 13500);
    $pdf->setOption('enable-smart-shrinking', true);
    $pdf->setOption('no-stop-slow-scripts', true);
    return $pdf->stream("Surat Tanda Terima Uang-" . $payload["ref_number"] . ".pdf");
  }

  private function generateTerbilang($num)
  {
    return ucwords(preg_replace(array('/\s{2,}/', '/[\t\n]/'), ' ', Number::terbilang(intval(str_replace(",","",$num)))) . " Rupiah");
  }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Services\BranchService\Branch;
use App\Services\FinanceService\PaymentProof;
use App\Services\FinanceService\Bill;
use App\Helpers\UserRole;
use App\Helpers\Number;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Barryvdh\Snappy\Facades\SnappyPdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
class CashPaymentProofController extends Controller
{
  private Branch $branchService;
  private PaymentProof $financePaymentProofService;
  private Bill $financeBillService;

  public function __construct(Branch $branchService, PaymentProof $financePaymentProofService, Bill $financeBillService)
  {
    Breadcrumb::setFirstBreadcrumb("Bukti Pembayaran Cash", "/bukti-pembayaran-cash");
    $this->branchService = $branchService;
    $this->financePaymentProofService = $financePaymentProofService;
    $this->financeBillService = $financeBillService;
  }

  public function index()
  {
    $isAdmin = UserRole::isAdmin();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $response = !$isAdmin ? $this->financePaymentProofService->getByBranchCode(Auth::user()->branch_code) : $this->financePaymentProofService->get();
    $responseBody = json_decode($response?->body());
    $view_data = ["proofs" => $responseBody, "breadcrumbs" => $breadcrumbs];
    return view('/pages/cash-payment-proof/index', $view_data);
  }

  public function create($billId = null)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => "Tambah"]];
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
    return view('/pages/cash-payment-proof/create', $view_data);
  }

  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), $this->getValidationRules(), $this->getValidationMessages());
    if($validator->fails()) return redirect('/bukti-pembayaran-cash/tambah')->withErrors($validator)->withInput();

    $amount = intval(str_replace(",","",$request->amount));
    $payload = [
      "name" => $request->name,
      "phone" => $request->phone,
      "address" => $request->address ?? null,
      "amount" => $amount,
      "amount_text" => $this->generateTerbilang($amount),
      "payment_for" => $request->payment_for,
      "branch_code" => $request->branch_code,
      "created_by" => Auth::user()->name,
      "type" => "RECEIVE"
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
      return redirect('/bukti-pembayaran-cash/tambah')->withInput();
    }
    $branch = $this->branchService->getBranchByCode($request->branch_code);

    $payload["is_preview"] = false;
    $payload["proof_id"] = $responseBody->data->proof_payment->id;
    $payload["created_at"] = $responseBody->data->proof_payment->created_at;
    $payload["ref_number"] = $responseBody->data->ref ?? "";
    $payload["download_url"] = url("/bukti-pembayaran-cash/{$payload["proof_id"]}/download");
    $payload["branch"] = $branch;
    return $this->showPaymentProofPdf($payload);
  }

  public function show(Request $request)
  {
    $validator = Validator::make($request->all(), $this->getValidationRules(), $this->getValidationMessages());
    if($validator->fails()) return redirect('/bukti-pembayaran-cash/tambah')->withErrors($validator)->withInput();

    $branch = $this->branchService->getBranchByCode($request->branch_code);

    $amount = intval(str_replace(",","",$request->amount));
    $view_data = [
      "name" => $request->name,
      "phone" => $request->phone,
      "amount" => $amount,
      "address" => $request->address ?? "",
      "amount_text" => $this->generateTerbilang($amount),
      "payment_for" => $request->payment_for,
      "branch_code" => $request->branch_code,
      "branch" => $branch,
      "created_by" => Auth::user()->name,
      "is_preview" => true,
    ];
    return view('pages/cash-payment-proof/show', $view_data);
  }

  public function download(string $id)
  {
    $response = $this->financePaymentProofService->getById($id);
    $responseBody = json_decode($response?->body());
    $responseStatus = $response->status();
    if($responseStatus !== Response::HTTP_OK && !$responseBody?->data) return "Data bukti pembayaran tidak ditemukan";
    $branch = $this->branchService->getBranchByCode($responseBody->data->branch_code);
    $payload = [
      "name" => $responseBody->data->name ?? "",
      "phone" => $responseBody->data->phone ?? "",
      "amount" => intval(str_replace(",","",$responseBody->data->amount)),
      "address" => $responseBody->data->address ?? "",
      "amount_text" => $responseBody->data->amount_text ?? "",
      "payment_for" => $responseBody->data->payment_for ?? "",
      "branch_code" => $responseBody->data->branch_code ?? "",
      "branch" => $branch,
      "created_by" => $responseBody->data->created_by ?? "",
      "is_preview" => false,
      "proof_id" => $responseBody->data->id,
      "created_at" => $responseBody->data->created_at,
      "ref_number" => $responseBody->data->ref_number ?? "N/A",
      "download_url" => url("/bukti-pembayaran-cash/{$responseBody->data->id}/download")
    ];
    return $this->showPaymentProofPdf($payload);
  }

  private function showPaymentProofPdf(array $payload)
  {
    $html = view('pages/cash-payment-proof/show', $payload);
    $pdf = SnappyPdf::loadHTML($html);
    $pdf->setOption('enable-javascript', true);
    $pdf->setOption('javascript-delay', 13500);
    $pdf->setOption('enable-smart-shrinking', true);
    $pdf->setOption('no-stop-slow-scripts', true);
    return $pdf->stream("Kwitansi Pembayaran Cash-" . $payload["ref_number"] . ".pdf");
  }

  private function getValidationRules()
  {
    return [
      "name" => ["required"],
      "phone" => ["required"],
      "amount" => [
        "required",
        function($attribute, $value, $fail) {
          $amount = intval(str_replace(",","",$value));
          if ($amount <= 0) $fail("Nominal tidak valid");
        },
      ],
      "payment_for" => ["required"],
      "branch_code" => ["required"],
    ];
  }

  private function getValidationMessages()
  {
    return [
      "name.required" => "Nama harus diisi",
      "phone.required" => "No. HP harus diisi",
      "amount.required" => "Harga harus diisi",
      "payment_for.required" => "Tujuan pembayaran harus diisi",
      "branch_code.required" => "Kode cabang harus diisi"
    ];
  }

  private function generateTerbilang($num)
  {
    return ucwords(preg_replace(array('/\s{2,}/', '/[\t\n]/'), ' ', Number::terbilang(intval(str_replace(",","",$num)))) . " Rupiah");
  }
}

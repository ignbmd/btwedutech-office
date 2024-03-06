<?php

namespace App\Http\Controllers\EbookCode;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Helpers\RabbitMq;
use App\Services\EbookCodeService\EbookCode;
use App\Services\StagesService\Reward;
use App\Helpers\UserRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Rap2hpoutre\FastExcel\FastExcel;

class EbookCodeController extends Controller
{
  private EbookCode $ebookCodeService;
  private Reward $rewardStageService;

  public function __construct(EbookCode $ebookCodeService, Reward $rewardStageService)
  {
    $this->ebookCodeService = $ebookCodeService;
    $this->rewardStageService = $rewardStageService;
  }

  public function index(Request $request)
  {
    $breadcrumbs = [['name' => 'Kode Buku']];
    $allowedAccess = UserRole::getAllowed('roles.ebook_code');
    $isAuthorized = in_array('generate', $allowedAccess);
    $inputDateStart = request()->get('start');
    $inputDateEnd = request()->get('end');
    $oneOfDateIsEmpty = ($inputDateStart && !$inputDateEnd) || (!$inputDateStart && $inputDateEnd);

    if(!$isAuthorized) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan mengakses halaman ini"
      ]);
      return redirect("/home");
    }

    if($oneOfDateIsEmpty) {
      $request->session()->flash('flash-message', [
            "title" => "Peringatan",
            "type" => "warning",
            "message" => "Salah Satu Tanggal Tidak Boleh Kosong"
          ]);
          return redirect("/kode-buku");
        }
    $ebookCodeResponse = $this->ebookCodeService->getAll($request->all());
    $codes = json_decode($ebookCodeResponse->body())?->data ?? [];
    return view('pages.ebook-code.index', compact('breadcrumbs', 'codes'));
  }

  // public function createForm(Request $request)
  // {
  //   $breadcrumbs = [['name' => 'Kode Diskon', 'link' => '/kode-diskon'], ['name' => 'Tambah']];
  //   $isAuthorized = UserRole::isAdmin() || UserRole::isBranchHead();
  //   if(!$isAuthorized) {
  //     $request->session()->flash('flash-message', [
  //       "title" => "Peringatan",
  //       "type" => "warning",
  //       "message" => "Anda tidak diperbolehkan mengakses halaman ini"
  //     ]);
  //     return redirect("/kode-diskon");
  //   }

  //   $user = Auth::user();
  //   $allowedAccess = UserRole::getAllowed('roles.discount_code');
  //   $isAuthorized = in_array('create', $allowedAccess);

  //   if(!$isAuthorized) {
  //     $request->session()->flash('flash-message', [
  //       "title" => "Peringatan",
  //       "type" => "warning",
  //       "message" => "Anda tidak diperbolehkan mengakses halaman ini"
  //     ]);
  //     return redirect("/kode-diskon");
  //   }
  //   $userBranchCode = $user->branch_code === null ? "PT0000" : $user->branch_code;
  //   $isCentralAdminUser = UserRole::isAdmin() && $userBranchCode === "PT0000" ? "1" : "0";
  //   return view('pages.discount-code.create', compact('breadcrumbs', 'userBranchCode', 'isCentralAdminUser'));
  // }

  public function generateForm(Request $request)
  {
    $allowedAccess = UserRole::getAllowed('roles.ebook_code');
    $isAuthorized = in_array('generate', $allowedAccess);
    if(!$isAuthorized) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan mengakses halaman ini"
      ]);
      return redirect("/kode-buku");
    }
    $breadcrumbs = [['name' => 'Kode Buku', 'link' => '/kode-buku'], ['name' => 'Generate']];

    $coinRewardResponse = $this->rewardStageService->getAll(['reward_type' => 'COIN']);
    $coinRewards = json_decode($coinRewardResponse->body())?->data ?? [];
    return view('pages.ebook-code.generate-form', compact('breadcrumbs', 'coinRewards'));
  }

  public function generate(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'code_count' => 'required|numeric|min:1',
      'program' => 'required',
      'bonus_value' => 'required',
    ], [
      '*.required' => 'Harus diisi',
      '*.numeric' => 'Harus berupa angka',
      '*.min' => 'Nilai minimal 1'
    ]);
    if($validator->fails()) return redirect()->back()->withInput()->withErrors($validator);

    $brokerPayload = [
      "version" => 1,
      "data" => [
        "code_count" => (int)$request->code_count,
        "program" => $request->program,
        "bonus_type" => "COIN",
        "bonus_value" => $request->bonus_value,
        "bonus_type_smartbtw" => $request->has('product') && isset($request->product) ? "MODULE" : null,
        "bonus_value_smartbtw" => $request->has('product') && isset($request->product) ? $request->product : null
      ]
    ];
    RabbitMq::send("generate-codes.code.created", json_encode($brokerPayload));
    return redirect("/kode-buku")->with('flash-message', [
      "title" => "Informasi",
      "type" => "info",
      "message" => "Proses generate kode buku sedang berlangsung"
    ]);

  }

  public function redeemHistory(Request $request)
  {
    $breadcrumbs = [['name' => 'Riwayat Redeem Kode Buku']];
    $allowedAccess = UserRole::getAllowed('roles.ebook_code');
    $isAuthorized = in_array('show_history_redeem', $allowedAccess);

    if(!$isAuthorized) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan mengakses halaman ini"
      ]);
      return redirect("/home");
    }
    $redeemHistoryResponse = $this->ebookCodeService->getRedeemHistory();
    $redeemHistory = json_decode($redeemHistoryResponse->body())?->data ?? [];
    return view('pages.ebook-code.redeem-history', compact('breadcrumbs', 'redeemHistory'));
  }

  public function downloadCodeBook(Request $request)
  {
    try{
      // $ebookCodeResponse = $this->ebookCodeService->getAll();
      $ebookCodeResponse = $this->ebookCodeService->getAll($request->all());
      $ebookCode = json_decode($ebookCodeResponse->body())?->data ?? [];
      $ebookCode = array_filter($ebookCode, function($ebook) {
        return $ebook->bonus_type == 'COIN';
      });
      $ebookCodeProgram = request()->get('program')?'_'.request()->get('program') : '_Semua Program';
      $ebookCodeDateStart = request()->get('start') ?'_'.request()->get('start') : null;
      $ebookCodeDateEnd = request()->get('end') ? '_'.request()->get('end') : null;
      $fileName = 'Kode Buku'.$ebookCodeProgram.$ebookCodeDateStart.$ebookCodeDateEnd.'.xlsx';

      $ebookCodeDownload = collect($ebookCode)->map(function ($item){
        return [
              'Kode' => $item->code,
              'Program' => $item->program,
              'Tipe Bonus' => $item->bonus_type,
              'Nilai Bonus' => $item->bonus_value
          ];
      });
    return (new FastExcel($ebookCodeDownload))->download($fileName);
    } 
    catch(\Exception $e){
      dd($e->getMessage());
   } 
    // $allowedAccess = UserRole::getAllowed('roles.ebook_code');
    // $isAuthorized = in_array('download', $allowedAccess);
    // if(!$isAuthorized) {
    //   $request->session()->flash('flash-message', [
    //     "title" => "Peringatan",
    //     "type" => "warning",
    //     "message" => "Anda tidak diperbolehkan mengakses halaman ini"
    //   ]);
    //   return redirect("/kode-buku");
    // }
   
  }
}

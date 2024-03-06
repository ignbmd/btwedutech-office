<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\RabbitMq;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;


class CashTopUpCoinsController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Top Up Koin', '');
  }

  public function index(){
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('pages.cash-top-up-coins.index', compact('breadcrumbs'));
  }

  public function storeCoins(Request $request){
    try{
        $validator = Validator::make($request->all(), [
            'smartbtw_id' => 'required',
            'coins' => 'required'
        ],[
            'smartbtw_id.required' => 'Harus isi',
            'coins.required' => 'Harus isi'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withInput()->withErrors($validator->errors());
        }
        $coins = $request->input('coins');
        
        $payload = [
          "version" => 1,
          "data" => [
            "smartbtw_id" => (int)$request->smartbtw_id,
            "point" => (int)$request->coins,
            "type" => "BONUS",
            "description" => "Assign Koin, Rp.$coins"
          ]
        ];

        
        RabbitMq::send("wallet.received", json_encode($payload));
        return redirect("/top-up-coin")->with('flash-message', [
          "title" => "Informasi",
          "type" => "info",
          "message" => "Proses pembelian koin sedang berlangsung"
        ]);
    }catch(\Exception $e){
          $request->session()->flash('flash-message', [
            'title' => 'Error!',
            'type' => 'error',
            'message' => 'Proses pembelian coin gagal: ' . $e->getMessage()
        ]);
      
      return redirect('/top-up-coin');
    }
  }
}
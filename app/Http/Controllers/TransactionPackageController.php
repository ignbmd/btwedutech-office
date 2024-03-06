<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Services\ApiGatewayService\Internal\TransactionPackage;
use Illuminate\Pagination\LengthAwarePaginator;

class TransactionPackageController extends Controller
{
  private $transactionPackage;
  public function __construct(TransactionPackage $transactionPackage)
  {
    $this->transactionPackage = $transactionPackage;
  }

  public function indexPending(Request $request)
  {
    $currentPage = LengthAwarePaginator::resolveCurrentPage() ?? 1;
    $params = ['page' => $currentPage];
    if($request->has('search')) $params['search'] = $request->get('search');

    $transactions = $this->transactionPackage->pending($params);
    $transactions = new LengthAwarePaginator($transactions->data, $transactions->total, $transactions->per_page, $transactions->current_page, ['path' => url()->current(), 'pageName' => 'page']);

    return view('pages/transaction-package/index-pending', compact('transactions', 'params'));
  }

  public function edit($id)
  {
    $transaction = $this->transactionPackage->getSingle($id);
    if(!$transaction->success) {
      return redirect(route('transaction.package.indexPending'))
      ->with('flash_message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => $transaction->message
      ]);
    }

    if($transaction->data->payment_status !== 'pending') {
      return redirect(route('transaction.package.indexPending'))
      ->with('flash_message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Transaksi ini bukan termasuk transaksi belum lunas'
      ]);
    }

    $breadcrumbs = [
      ['name' => 'Transaksi Paket Belum Lunas', 'link' => route('transaction.package.indexPending')],
      ['name' => 'Edit']
    ];
    return view('pages/transaction-package/edit', compact('breadcrumbs', 'transaction'));
  }

  public function update(Request $request, $id)
  {
    $update = $this->transactionPackage->update($id, ['is_approved' => $request->is_approved]);
    return $update;

    if(!$update->success) {
      return redirect(route('transaction.package.indexPending'))
      ->with('flash_message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => $update->message
      ]);
    }

    return redirect(route('transaction.package.indexPending'))
    ->with('flash_message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => $update->message
    ]);
  }

  public function indexSettlement()
  {
    return view('pages/transaction-package/index-settlement');
  }
}

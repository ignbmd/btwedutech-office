<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Services\FinanceService\Account;
class COAController extends Controller
{
    private Account $account;
    public function __construct(Account $account)
    {
      $this->account = $account;
      BreadCrumb::setFirstBreadcrumb('Akun', 'coa');
    }

    public function index()
    {
      $is_user_pusat = auth()->user()->branch_code == "PT0000" || auth()->user()->branch_code == null;
      return view('pages/coa/index', compact('is_user_pusat'));
    }

    public function create()
    {
      $breadcrumbs = [
        Breadcrumb::getFirstPageBreadcrumb(true),
        ['name' => 'Tambah Akun']
      ];
      return view('pages/coa/create', compact('breadcrumbs'));
    }

    public function edit($id)
    {
      $is_user_pusat = auth()->user()->branch_code == "PT0000" || auth()->user()->branch_code == null;
      $breadcrumbs = [
        Breadcrumb::getFirstPageBreadcrumb(true),
        ['name' => 'Edit Akun']
      ];
      $account = $this->account->getSingleAccount($id);
      if($account->is_protected) {
        return redirect(route('coa.index'))->with('flash-message', [
          'title' => 'Error!',
          'type' => 'error',
          'message' => 'Akun ini diproteksi'
        ]);
      };
      if(!$is_user_pusat && auth()->user()->branch_code !== $account->branch_code) {
        return redirect(route('coa.index'))->with('flash-message', [
          'title' => 'Error!',
          'type' => 'error',
          'message' => 'Anda tidak diperbolehkan mengubah data akun cabang lain'
        ]);
      }
      return view('pages/coa/edit', compact('breadcrumbs'));
    }
}

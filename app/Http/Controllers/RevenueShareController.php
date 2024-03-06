<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use Illuminate\Support\Facades\Auth;

class RevenueShareController extends Controller
{
  private $user;

  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Porsi Pendapatan', 'porsi-pendapatan');
  }

  public function index()
  {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $data = ['breadcrumbs' => $breadcrumbs, 'user' => $user];
    return view('/pages/revenue-share/index', $data);
  }

  public function showCreate()
  {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Create']
    ];
    $data = ['breadcrumbs' => $breadcrumbs, 'user' => $user];
    return view('/pages/revenue-share/create', $data);
  }

  public function showEdit($id)
  {
    $user = collect(Auth::user())->first();
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => 'Create']
    ];
    $data = ['breadcrumbs' => $breadcrumbs, 'user' => $user, 'id' => $id];
    return view('/pages/revenue-share/edit', $data);
  }
}

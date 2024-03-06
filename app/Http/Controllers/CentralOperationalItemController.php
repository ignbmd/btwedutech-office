<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;

class CentralOperationalItemController extends Controller
{
  public function __construct()
  {
    Breadcrumb::setFirstBreadcrumb('Produk Operasional Pusat', 'central-operational-item');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('pages.central-operational-item.index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah']];
    return view('pages.central-operational-item.create', compact('breadcrumbs'));
  }

  public function edit($id)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Ubah']];
    return view('pages.central-operational-item.edit', compact('breadcrumbs'));
  }
}

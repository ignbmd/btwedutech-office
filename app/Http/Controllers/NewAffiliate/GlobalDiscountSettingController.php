<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;

class GlobalDiscountSettingController extends Controller
{
  public function index()
  {
    $breadcrumbs = [$this->getFirstBreadcrumbItem(false)];
    return view('pages.global-discount-setting.index', compact('breadcrumbs'));
  }
  public function create()
  {
    $breadcrumbs = [$this->getFirstBreadcrumbItem(true), ['name' => 'Tambah']];
    return view('pages.global-discount-setting.add', compact('breadcrumbs'));
  }
  public function edit()
  {
    $breadcrumbs = [$this->getFirstBreadcrumbItem(true), ['name' => 'Edit']];
    return view('pages.global-discount-setting.edit', compact('breadcrumbs'));
  }

  private function getFirstBreadcrumbItem(bool $withLink = false)
  {
    return ["name" => "Atur Besaran Diskon Global", "link" => $withLink ? "/pengaturan-diskon/global" : null];
  }
}

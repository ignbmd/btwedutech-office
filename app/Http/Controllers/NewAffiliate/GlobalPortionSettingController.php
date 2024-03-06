<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Services\NewAffiliateService\PortionSetting;
use App\Helpers\UserRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GlobalPortionSettingController extends Controller
{
  private PortionSetting $portionSetting;

  public function __construct(PortionSetting $portionSetting)
  {
    $this->portionSetting = $portionSetting;
  }

  public function index()
  {
    return view('pages.portion-setting.index');
  }
  public function create()
  {
    $breadcrumbs = [['name' => 'Atur Besaran Komisi', 'link' => '/pengaturan-porsi/global'], ['name' => 'Tambah']];
    return view('pages.portion-setting.create', compact('breadcrumbs'));
  }
  public function edit()
  {
    $breadcrumbs = [['name' => 'Atur Besaran Komisi', 'link' => '/pengaturan-porsi/global'], ['name' => 'edit']];
    return view('pages.portion-setting.edit', compact('breadcrumbs'));
  }
}

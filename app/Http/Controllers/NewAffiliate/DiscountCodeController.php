<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Services\NewAffiliateService\DiscountCode;
use App\Helpers\UserRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DiscountCodeController extends Controller
{
  private DiscountCode $discountCode;

  public function __construct(DiscountCode $discountCode)
  {
    $this->discountCode = $discountCode;
  }

  public function index(Request $request)
  {
    $breadcrumbs = [['name' => 'Kode Diskon']];

    $user = Auth::user();
    $allowedAccess = UserRole::getAllowed('roles.discount_code');
    $isAuthorized = in_array('show', $allowedAccess);

    if (!$isAuthorized) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan mengakses halaman ini"
      ]);
      return redirect("/kode-diskon");
    }

    $canCreateDiscountCode = in_array('create', $allowedAccess);
    $canEditDiscountCode = in_array('edit', $allowedAccess);
    $canDeleteDiscountCode = in_array('delete', $allowedAccess);
    $canShowDiscountCodeUsage = in_array('show_usage', $allowedAccess);

    $userBranchCode = $user->branch_code === null ? "PT0000" : $user->branch_code;
    $isCentralAdminUser = UserRole::isAdmin() && $userBranchCode === "PT0000" ? "1" : "0";
    return view(
      'pages.discount-code.index',
      compact(
        'breadcrumbs',
        'userBranchCode',
        'isCentralAdminUser',
        'canCreateDiscountCode',
        'canEditDiscountCode',
        'canDeleteDiscountCode',
        'canShowDiscountCodeUsage'
      )
    );
  }

  public function create(Request $request)
  {
    $breadcrumbs = [['name' => 'Kode Diskon', 'link' => '/kode-diskon'], ['name' => 'Tambah']];

    $user = Auth::user();
    $allowedAccess = UserRole::getAllowed('roles.discount_code');
    $isAuthorized = in_array('create', $allowedAccess);

    if (!$isAuthorized) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan mengakses halaman ini"
      ]);
      return redirect("/kode-diskon");
    }
    $userBranchCode = $user->branch_code === null ? "PT0000" : $user->branch_code;
    $isCentralAdminUser = UserRole::isAdmin() && $userBranchCode === "PT0000" ? "1" : "0";
    return view('pages.discount-code.create', compact('breadcrumbs', 'userBranchCode', 'isCentralAdminUser'));
  }

  public function edit(Request $request, $id)
  {
    $breadcrumbs = [['name' => 'Kode Diskon', 'link' => '/kode-diskon'], ['name' => 'Edit']];

    $user = Auth::user();
    $allowedAccess = UserRole::getAllowed('roles.discount_code');
    $isAuthorized = in_array('edit', $allowedAccess);

    if (!$isAuthorized) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan mengakses halaman ini"
      ]);
      return redirect("/kode-diskon");
    }
    $userBranchCode = $user->branch_code === null ? "PT0000" : $user->branch_code;
    $isCentralAdminUser = UserRole::isAdmin() && $userBranchCode === "PT0000" ? "1" : "0";
    return view('pages.discount-code.edit', compact('breadcrumbs', 'userBranchCode', 'isCentralAdminUser'));
  }

  public function indexUsage(Request $request, $id)
  {
    $user = Auth::user();
    $allowedAccess = UserRole::getAllowed('roles.discount_code');
    $isAuthorized = in_array('show_usage', $allowedAccess);

    if (!$isAuthorized) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan mengakses halaman ini"
      ]);
      return redirect("/kode-diskon");
    }
    $userBranchCode = $user->branch_code === null ? "PT0000" : $user->branch_code;
    $isCentralAdminUser = UserRole::isAdmin() && $userBranchCode === "PT0000" ? "1" : "0";

    $discountCodeResponse = $this->discountCode->getById((int)$id);
    $discountCodeBody = json_decode($discountCodeResponse->body());
    $discountCodeStatus = $discountCodeResponse->status();
    if (!$discountCodeResponse->successful()) {
      Log::error("Error on getting discount code usages -- Fail when trying to get discount code data", ["body" => $discountCodeBody, "status" => $discountCodeStatus]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Terjadi kesalahan, silakan coba lagi nanti"
      ]);
      return redirect("/kode-diskon");
    }

    $discountCodeIdentifier = $discountCodeBody->data->identifier;
    $discountCodeIdentifierType = $discountCodeBody->data->identifier_type;
    if (
      // Check whether discount code identifier type value either "CENTRAL" or "BRANCH"
      in_array($discountCodeIdentifierType, ["CENTRAL", "BRANCH"]) &&
      // Check whether branch's discount code is their own
      (UserRole::isBranchHead() && $discountCodeIdentifier !== $userBranchCode)
    ) {
      $request->session()->flash('flash-message', [
        "title" => "Peringatan",
        "type" => "warning",
        "message" => "Anda tidak diperbolehkan untuk mengakses halaman ini"
      ]);
      return redirect("/kode-diskon");
    }

    $discountCode = $discountCodeBody->data->code;
    $breadcrumbs = [['name' => 'Kode Diskon', 'link' => '/kode-diskon'], ['name' => "Histori Penggunaan Kode Diskon - $discountCode"]];
    return view('pages.discount-code.index-usage', compact('breadcrumbs', 'userBranchCode', 'isCentralAdminUser', 'discountCode'));
  }
}

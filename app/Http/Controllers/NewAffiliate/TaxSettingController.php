<?php

namespace App\Http\Controllers\NewAffiliate;

use App\Http\Controllers\Controller;
use App\Services\NewAffiliateService\TaxSetting;
use App\Services\ProductService\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TaxSettingController extends Controller
{
  private TaxSetting $taxSettingAffiliateService;
  private Product $productService;
  private string $indexPageEndpoint;
  private string $firstPageBreadcrumbTitle;
  public function __construct(TaxSetting $taxSettingAffiliateService, Product $productService)
  {
    $this->taxSettingAffiliateService = $taxSettingAffiliateService;
    $this->productService = $productService;
    $this->indexPageEndpoint = "/pengaturan-pajak";
    $this->firstPageBreadcrumbTitle = "Pengaturan Pajak";
  }

  public function index()
  {
    $breadcrumbs = [["name" => $this->firstPageBreadcrumbTitle]];
    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse)?->data ?? [])
      ->unique("product_code")
      ->mapWithKeys(fn ($product) => [$product->product_code => $product])
      ->toArray();
    if (count($products) == 0) {
      return redirect($this->indexPageEndpoint);
    }

    $taxSettingsResponse = $this->taxSettingAffiliateService->getAll();
    $taxSettings = json_decode($taxSettingsResponse->body())?->data ?? [];
    return view("pages.tax-setting.index", compact("breadcrumbs", "products", "taxSettings"));
  }

  public function create()
  {
    $breadcrumbs = [
      ["name" => $this->firstPageBreadcrumbTitle, "link" => $this->indexPageEndpoint],
      ["name" => "Tambah"]
    ];
    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse)?->data ?? [])
      ->unique("product_code")
      ->values()
      ->toArray();
    return view("pages.tax-setting.create", compact("breadcrumbs", "products"));
  }

  public function store(Request $request)
  {
    $validator = Validator::make(
      $request->all(),
      ["product_code" => "required"],
      ["product_code.required" => "Produk harus dipilih"]
    );
    if ($validator->fails()) {
      return redirect()->back()->withInput()->withErrors($validator);
    }

    $payload = [
      "product_code" => $request->product_code,
      "is_tax_active" => $request->has('is_tax_active') && $request->is_tax_active == "on"
        ? true
        : false
    ];
    $response = $this->taxSettingAffiliateService->create($payload);
    $body = json_decode($response->body());
    if (!$response->successful()) {
      Log::error("Fail on create tax setting", ['response' => $body]);
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Sistem sedang dalam perbaikan, silakan coba lagi nanti'
      ]);
      return redirect($this->indexPageEndpoint);
    }
    $request->session()->flash('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => 'Data berhasil ditambah'
    ]);
    return redirect($this->indexPageEndpoint);
  }

  public function edit(int $id)
  {
    $breadcrumbs = [
      ["name" => $this->firstPageBreadcrumbTitle, "link" => $this->indexPageEndpoint],
      ["name" => "Edit"]
    ];
    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse)?->data ?? [])
      ->unique("product_code")
      ->values()
      ->toArray();
    $taxSettingResponse = $this->taxSettingAffiliateService->getById($id);
    $taxSetting = json_decode($taxSettingResponse->body())?->data ?? null;
    return view("pages.tax-setting.edit", compact("breadcrumbs", "products", "taxSetting"));
  }

  public function update(Request $request, int $id)
  {
    $validator = Validator::make(
      $request->all(),
      ["product_code" => "required"],
      ["product_code.required" => "Produk harus dipilih"]
    );
    if ($validator->fails()) {
      return redirect()->back()->withInput()->withErrors($validator);
    }

    $payload = [
      "product_code" => $request->product_code,
      "is_tax_active" => $request->has('is_tax_active') && $request->is_tax_active == "on"
        ? true
        : false
    ];
    $response = $this->taxSettingAffiliateService->update($id, $payload);
    $body = json_decode($response->body());
    if (!$response->successful()) {
      Log::error("Fail on update tax setting", ['response' => $body]);
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Sistem sedang dalam perbaikan, silakan coba lagi nanti'
      ]);
      return redirect($this->indexPageEndpoint);
    }
    $request->session()->flash('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => 'Data berhasil diperbarui'
    ]);
    return redirect($this->indexPageEndpoint);
  }
}

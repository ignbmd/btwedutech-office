<?php

namespace App\Http\Controllers;

use App\Services\NewAffiliateService\Affiliate;
use App\Services\NewAffiliateService\DiscountAffiliateSetting;
use App\Services\NewAffiliateService\DiscountSpecificProduct;
use App\Services\ProductService\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AffiliateDiscountSettingController extends Controller
{
  private Product $productService;
  private Affiliate $affiliateService;
  private DiscountSpecificProduct $discountSpecificProductService;
  private DiscountAffiliateSetting $discountAffiliateSettingsService;
  private $indexPageEndpoint;

  public function __construct()
  {
    $this->productService = new Product;
    $this->affiliateService = new Affiliate;
    $this->discountSpecificProductService = new DiscountSpecificProduct;
    $this->discountAffiliateSettingsService = new DiscountAffiliateSetting;
    $this->indexPageEndpoint = "/pengaturan-diskon/per-mitra";
  }

  public function index()
  {
    $breadcrumbs = [$this->getFirstBreadcrumbItem(false)];

    $affiliatesResponse = $this->affiliateService->getAll();
    $affiliates = json_decode($affiliatesResponse->body())?->data ?? [];

    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse->body())?->data ?? [])
      ->unique("product_code")
      ->values()
      ->toArray();

    $productCodeName = collect($products)
      ->mapWithKeys(fn ($item) => [$item->product_code => $item->title])
      ->toArray();

    return view('pages.affiliate-discount-setting.index', compact('breadcrumbs', 'affiliates', 'productCodeName'));
  }

  public function create()
  {
    $breadcrumbs = [$this->getFirstBreadcrumbItem(true), ['name' => 'Tambah']];

    $discountAffiliateSettingsResponse = $this->discountAffiliateSettingsService->getAll();
    $discountAffiliateSettings = json_decode($discountAffiliateSettingsResponse->body())?->data ?? [];

    if (count($discountAffiliateSettings) == 0) {
      $this->sendTryAgainResponse();
    }

    $productCodes = collect($discountAffiliateSettings)
      ->unique('product_code')
      ->map(fn ($item) => $item->product_code)
      ->values()
      ->toArray();

    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse->body())?->data ?? [])
      ->unique("product_code")
      ->filter(fn ($product) => in_array($product->product_code, $productCodes))
      ->values()
      ->toArray();

    $affiliatesResponse = $this->affiliateService->getAll();
    $affiliates = json_decode($affiliatesResponse->body())?->data ?? [];

    return view(
      'pages.affiliate-discount-setting.create',
      compact(
        'breadcrumbs',
        'products',
        'affiliates'
      )
    );
  }

  public function store(Request $request)
  {
    $selectAllAffiliates = in_array("ALL", $request->affiliates);

    if ($selectAllAffiliates) {
      $affiliatesResponse = $this->affiliateService->getAll();
      $affiliates = collect(json_decode($affiliatesResponse->body())?->data ?? [])
        ->values()
        ->toArray();
    } else {
      $affiliates = collect($request->affiliates)
        ->map(fn ($affiliate) => json_decode($affiliate))
        ->values()
        ->toArray();
    }

    $affiliateRefCodes = collect($affiliates)
      ->map(fn ($affiliate) => $affiliate->ref_code)
      ->values()
      ->toArray();

    if (count($affiliateRefCodes) == 0) {
      $this->sendTryAgainResponse();
    }

    $selectAllProducts = in_array("ALL", $request->products);
    if ($selectAllProducts) {
      $discountAffiliateSettingsResponse = $this->discountAffiliateSettingsService->getAll();
      $discountAffiliateSettings = json_decode($discountAffiliateSettingsResponse->body())?->data ?? [];

      $discountAffiliateProductCodes = collect($discountAffiliateSettings)
        ->unique('product_code')
        ->map(fn ($item) => $item->product_code)
        ->values()
        ->toArray();

      if (count($discountAffiliateProductCodes)) {
        $this->sendTryAgainResponse();
      }

      $productsResponse = $this->productService->getProductByQueryString();
      $products = collect(json_decode($productsResponse->body())?->data ?? [])
        ->unique('product_code')
        ->filter(fn ($product) => in_array($product->product_code, $discountAffiliateProductCodes))
        ->values()
        ->toArray();
    } else {
      $products = collect($request->products)
        ->map(fn ($product) => json_decode($product))
        ->values()
        ->toArray();
    }

    $productCodes = collect($products)
      ->map(fn ($product) => $product->product_code)
      ->values()
      ->toArray();

    if (count($productCodes) == 0) {
      $this->sendTryAgainResponse();
    }

    $minimumProductPrice = collect($products)
      ->reject(fn ($product) => $product->sell_price === 0)
      ->min('sell_price');

    $amount = (int)preg_replace("/[\.,]/", "", $request->amount);
    $maxDiscount = (int)$minimumProductPrice * 0.4;

    $validator = Validator::make(
      $request->all(),
      [
        "affiliates" => "required",
        "products" => "required",
        "amount" => "required",
        "type" => "required"
      ],
      [
        "*.required" => ":attribute harus diisi"
      ],
      [
        "affiliates" => "Mitra",
        "products" => "Produk",
        "amount" => "Nominal Diskon",
        "type" => "Tipe Diskon"
      ]
    );

    $validator->after(function ($validator) use ($request, $amount, $maxDiscount) {
      $this->setAdditionalValidationRules($validator, $request, $amount, $maxDiscount);
    });

    if ($validator->fails()) {
      return back()->withInput()->withErrors($validator);
    }

    $payload = [
      "discount_codes" => $affiliateRefCodes,
      "product_codes" => $productCodes,
      "type" => $request->type,
      "amount" => $amount
    ];

    $response = $this->discountSpecificProductService->storeBulk($payload);
    $body = json_decode($response->body());
    if (!$response->successful()) {
      Log::error("Fail on create discount specific product for affiliate", ["response" => $body]);
      $this->sendRequestFailedResponse();
    }
    request()->session()->flash('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => 'Data berhasil ditambah'
    ]);
    return redirect($this->indexPageEndpoint);
  }

  public function edit(int $id)
  {
    $breadcrumbs = [$this->getFirstBreadcrumbItem(true), ['name' => 'Edit']];

    $discountAffiliateSettingsResponse = $this->discountAffiliateSettingsService->getAll();
    $discountAffiliateSettings = json_decode($discountAffiliateSettingsResponse->body())?->data ?? [];

    if (count($discountAffiliateSettings) == 0) {
      $this->sendTryAgainResponse();
    }

    $productCodes = collect($discountAffiliateSettings)
      ->unique('product_code')
      ->map(fn ($item) => $item->product_code)
      ->values()
      ->toArray();

    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse->body())?->data ?? [])
      ->unique("product_code")
      ->filter(fn ($product) => in_array($product->product_code, $productCodes))
      ->values()
      ->toArray();

    $affiliatesResponse = $this->affiliateService->getAll();
    $affiliates = json_decode($affiliatesResponse->body())?->data ?? [];

    $affiliateDiscountSettingResponse = $this->discountSpecificProductService->getById($id);
    $affiliateDiscountSetting = json_decode($affiliateDiscountSettingResponse->body())?->data ?? null;

    $affiliateData = collect($affiliates)
      ->where('ref_code', $affiliateDiscountSetting?->discount_code?->code ?? null)
      ->first();

    if (!$affiliateData) {
      $this->sendTryAgainResponse();
    }

    return view(
      'pages.affiliate-discount-setting.edit',
      compact(
        'breadcrumbs',
        'products',
        'affiliates',
        'affiliateDiscountSetting',
        'affiliateData'
      )
    );
  }

  public function update(Request $request, int $id)
  {
    $product = json_decode($request->product);
    $amount = (int)preg_replace("/[\.,]/", "", $request->amount);
    $maxDiscount = $product->sell_price * 0.4;

    $validator = Validator::make(
      $request->all(),
      [
        "product" => "required",
        "amount" => "required",
        "type" => "required"
      ],
      [
        "*.required" => ":attribute harus diisi"
      ],
      [
        "product" => "Produk",
        "amount" => "Nominal Diskon",
        "type" => "Tipe Diskon"
      ]
    );

    $validator->after(function ($validator) use ($request, $amount, $maxDiscount) {
      $this->setAdditionalValidationRules($validator, $request, $amount, $maxDiscount);
    });

    if ($validator->fails()) {
      return back()->withInput()->withErrors($validator);
    }

    $affiliateDiscountSettingResponse = $this->discountSpecificProductService->getById($id);
    $affiliateDiscountSetting = json_decode($affiliateDiscountSettingResponse->body())?->data ?? null;

    if (!$affiliateDiscountSetting) {
      $this->sendTryAgainResponse();
    }

    $discountSpecificProductsResponse = $this->discountSpecificProductService
      ->getByAffiliateCode($affiliateDiscountSetting->discount_code->code);
    $discountSpecificProducts = json_decode($discountSpecificProductsResponse->body())?->data ?? [];

    if (count($discountSpecificProducts) == 0) {
      $this->sendTryAgainResponse();
    }

    $isDiscountSpecificProductAlreadyExists = collect($discountSpecificProducts)
      ->where("product_code", $product->product_code)
      ->where("type", $request->type)
      ->count() > 0;

    $updateDiscountSettingToDifferentProduct = $product->product_code !== $affiliateDiscountSetting->product_code;
    if ($isDiscountSpecificProductAlreadyExists && $updateDiscountSettingToDifferentProduct) {
      $this->sendDataAlreadyExistsResponse();
    }


    $payload = [
      "product_code" => $product->product_code,
      "type" => $request->type,
      "amount" => $amount
    ];

    $response = $this->discountSpecificProductService->update($id, $payload);
    $body = json_decode($response->body());

    if (!$response->successful()) {
      Log::error("Fail on create discount specific product for affiliate", ["response" => $body]);
      $this->sendRequestFailedResponse();
    }
    request()->session()->flash('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => 'Data berhasil diperbarui'
    ]);
    return redirect($this->indexPageEndpoint);
  }

  private function getFirstBreadcrumbItem(bool $withLink = false)
  {
    return ["name" => "Atur Besaran Diskon Per Mitra", "link" => $withLink ? "/pengaturan-diskon/per-mitra" : null];
  }

  private function setAdditionalValidationRules($validator, $request, int $amount, int $maxDiscount)
  {
    if ($amount <= 0) {
      $validator->errors()->add("amount", "Nominal Diskon tidak boleh 0");
    }
    if ($request->type === "PERCENT" && $amount > 40) {
      $validator->errors()->add("amount", "Nominal Diskon maksimal 40%");
    }
    if ($request->type === "FIXED" && $amount > $maxDiscount) {
      $validator->errors()->add("amount", "Nominal Diskon maksimal Rp. " . number_format($maxDiscount));
    }
  }

  private function sendTryAgainResponse()
  {
    request()->session()->flash('flash-message', [
      'title' => 'Informasi',
      'type' => 'info',
      'message' => 'Silakan coba lagi'
    ]);
    return redirect()->back();
  }

  private function sendRequestFailedResponse()
  {
    request()->session()->flash('flash-message', [
      'title' => 'Terjadi Kesalahan!',
      'type' => 'error',
      'message' => 'Proses gagal, silakan coba lagi nanti'
    ]);
    return redirect($this->indexPageEndpoint);
  }

  private function sendDataAlreadyExistsResponse()
  {
    request()->session()->flash('flash-message', [
      'title' => 'Peringatan',
      'type' => 'warning',
      'message' => 'Pengaturan kode diskon ini sudah tersimpan sebelumnya'
    ]);
    return redirect()->back();
  }
}

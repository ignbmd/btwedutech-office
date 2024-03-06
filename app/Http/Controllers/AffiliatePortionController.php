<?php

namespace App\Http\Controllers;

use App\Services\NewAffiliateService\Affiliate;
use App\Services\NewAffiliateService\Portion;
use App\Services\NewAffiliateService\PortionSetting;
use App\Services\ProductService\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AffiliatePortionController extends Controller
{
  private Product $productService;
  private Affiliate $affiliateService;
  private Portion $portionService;
  private PortionSetting $portionSettingService;
  private $indexPageEndpoint;

  public function __construct()
  {
    $this->productService = new Product;
    $this->affiliateService = new Affiliate;
    $this->portionService = new Portion;
    $this->portionSettingService = new PortionSetting;
    $this->indexPageEndpoint = "/pengaturan-porsi/per-mitra";
  }

  private function getFirstBreadcrumbItem(bool $withLink = false)
  {
    return ["name" => "Atur Besaran Komisi Per Mitra", "link" => $withLink ? "/pengaturan-porsi/per-mitra" : null];
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

    return view('pages.affiliate-portion.index', compact('breadcrumbs', 'affiliates', 'productCodeName'));
  }
  public function create()
  {
    $breadcrumbs = [$this->getFirstBreadcrumbItem(true), ['name' => 'Tambah']];

    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse->body())?->data ?? [])
      ->unique("product_code")
      ->values()
      ->toArray();

    $affiliatesResponse = $this->affiliateService->getAll();
    $affiliates = json_decode($affiliatesResponse->body())?->data ?? [];

    return view(
      'pages.affiliate-portion.create',
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

    $affiliateId = collect($affiliates)
      ->map(fn ($affiliate) => $affiliate->id)
      ->values()
      ->toArray();

    if (count($affiliateId) == 0) {
      $this->sendTryAgainResponse();
    }

    $selectAllProducts = in_array("ALL", $request->products);
    if ($selectAllProducts) {
      $portionAffiliateSettingResponse = $this->portionSettingService->getAll();
      $portionAffiliateSetting = json_decode($portionAffiliateSettingResponse->body())?->data ?? [];

      $portionAffiliateSettingCode = collect($portionAffiliateSetting)
        ->unique('product_code')
        ->map(fn ($item) => $item->product_code)
        ->values()
        ->toArray();

      if (count($portionAffiliateSettingCode)) {
        $this->sendTryagainResponse();
      }

      $productsResponse = $this->productService->getProductByQueryString();
      $productsData = collect(json_decode($productsResponse->body())?->data ?? [])
        ->unique('product_code')
        ->filter(fn ($product) => in_array($product->product_code, $portionAffiliateSettingCode))
        ->values()
        ->toArray();
    } else {
      $productsData = collect($request->products)
        ->map(fn ($product) => json_decode($product))
        ->values()
        ->toArray();
    }

    $productCodes = collect($productsData)
      ->map(function ($products) {
        return (object)[
          'product_code' => $products->product_code,
          'product_name' => $products->title,
        ];
      })
      ->values()
      ->toArray();

    if (count($productCodes) == 0) {
      $this->sendTryAgainResponse();
    }

    $amount = (int)preg_replace("/[\.,]/", "", $request->amount);

    $minimumPrdouctPrice = collect($productsData)
      ->reject(fn ($product) => $product->sell_price === 0)
      ->min('sell_price');

    $maxPortion = (int)$minimumPrdouctPrice * 0.4;

    $validator = Validator::make(
      $request->all(),
      [
        "affiliates" => "required",
        "products" => "required",
        "amount" => "required",
        "type" => "required",
        "amount_type" => "required",
      ],
      [
        "*.required" => ":attribute harus diisi"
      ],
      [
        "affiliates" => "Mitra",
        "products" => "Produk",
        "amount" => "Nominal Porsi",
        "type" => "Tipe Porsi",
        "amount_type" => "Tipe Nominal"
      ]
    );

    $validator->after(function ($validator) use ($request, $amount, $maxPortion) {
      if ($amount <= 0) {
        $validator->errors()->add("amount", "Nominal Porsi tidak boleh 0");
      }
      if ($request->amount_type === "PERCENT" && $amount > 40) {
        $validator->errors()->add("amount", "Nominal Porsi maksimal 40%");
      }
      if ($request->amount_type === "FIXED" && $amount > $maxPortion) {
        $validator->errors()->add("amount", "Nominal Porsi maksimal Rp. " . number_format($maxPortion));
      }
    });

    if ($validator->fails()) {
      return back()->withInput()->withErrors($validator);
    }

    $payload = [
      "affiliate_id" => $affiliateId,
      "type" => $request->type,
      "amount_type" => $request->amount_type,
      "amount" => $amount,
      "products" => $productCodes
    ];

    $response = $this->portionService->storeBulk($payload);
    $body = json_decode($response->body());
    if (!$response->successful()) {
      Log::error("Fail on create portion specific product for affiliate", ["response" => $body]);
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses gagal, silakan coba lagi nanti'
      ]);
      return redirect($this->indexPageEndpoint);
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

    $productsResponse = $this->productService->getProductByQueryString();
    $products = collect(json_decode($productsResponse->body())?->data ?? [])
      ->unique("product_code")
      ->values()
      ->toArray();

    $affiliatesResponse = $this->affiliateService->getAll();
    $affiliates = json_decode($affiliatesResponse->body())?->data ?? [];

    $affiliatePortionResponse = $this->portionService->getById($id);
    $affiliatePortion = json_decode($affiliatePortionResponse->body())?->data ?? null;

    $affiliateData = collect($affiliates)
      ->where('id', $affiliatePortion?->affiliate_id ?? null)
      ->first();

    $productData = collect($products)
      ->where('product_code', $affiliatePortion?->product_code ?? null)
      ->first();

    if (!$affiliateData) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan!',
        'type' => 'error',
        'message' => 'Silakan coba lagi'
      ]);
      return redirect($this->indexPageEndpoint);
    }

    return view(
      'pages.affiliate-portion.edit',
      compact(
        'breadcrumbs',
        'products',
        'affiliates',
        'affiliatePortion',
        'affiliateData',
        'productData'
      )
    );
  }

  public function update(Request $request, int $id)
  {
    $product = json_decode($request->product);
    $amount = (int)preg_replace("/[\.,]/", "", $request->amount);
    $maxPortion = $product->sell_price * 0.4;

    $validator = Validator::make(
      $request->all(),
      [
        "product" => "required",
        "amount" => "required",
        "type" => "required",
        "amount_type" => "required",
      ],
      [
        "*.required" => ":attribute harus diisi"
      ],
      [
        "product" => "Produk",
        "amount" => "Nominal Porsi",
        "type" => "Tipe Porsi",
        "amount_type" => "Tipe Nominal"
      ]
    );

    $validator->after(function ($validator) use ($request, $amount, $maxPortion) {
      if ($amount <= 0) {
        $validator->errors()->add("amount", "Nominal Porsi tidak boleh 0");
      }
      if ($request->amount_type === "PERCENT" && $amount > 40) {
        $validator->errors()->add("amount", "Nominal Porsi maksimal 40%");
      }
      if ($request->amount_type === "FIXED" && $amount > $maxPortion) {
        $validator->errors()->add("amount", "Nominal Porsi maksimal Rp. " . number_format($maxPortion));
      }
    });

    if ($validator->fails()) {
      return back()->withInput()->withErrors($validator);
    }

    $payload = [
      "product_code" => $product->product_code,
      "product_name" => $product->title,
      "type" => $request->type,
      "amount_type" => $request->amount_type,
      "amount" => $amount
    ];

    $response = $this->portionService->update($id, $payload);
    $body = json_decode($response->body());

    if (!$response->successful()) {
      Log::error("Fail on create portion specific product for affiliate", ["response" => $body]);
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses gagal, silakan coba lagi nanti'
      ]);
      return redirect($this->indexPageEndpoint);
    }
    request()->session()->flash('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => 'Data berhasil diperbarui'
    ]);
    return redirect($this->indexPageEndpoint);
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
}

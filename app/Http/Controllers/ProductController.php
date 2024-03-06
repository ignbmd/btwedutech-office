<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\S3;
use Illuminate\Http\Request;
use App\Services\ProductService\Product;
use App\Services\ApiGatewayService\Internal;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
  private Product $service;
  private Internal $apiGateway;
  private array $programs = [
    'skd' => 'SKD',
    'skb' => 'SKB',
    'tps' => 'TPS',
    'tpa' => 'TPA',
    'lpdp' => 'LPDP',
    'sim' => 'SIM',
    'bumn' => 'BUMN',
    'tkda' => 'TKDA',
    'pppk' => 'PPPK',
    'tka-saintek' => 'TKA Saintek',
    'tka-soshum' => 'TKA Soshum',
    'tni-polri' => 'TNI/POLRI',
    'tka-campuran' => 'TKA Campuran',
    'general' => 'General'
  ];

  public function __construct(Product $productService, Internal $apiGateway)
  {
    $this->service = $productService;
    $this->apiGateway = $apiGateway;
    $this->middleware('acl');
    Breadcrumb::setFirstBreadcrumb('Product', 'produk');
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('/pages/product/index', compact('breadcrumbs'));
  }

  public function showDetail($productId)
  {
    $product = $this->service->getProduct($productId);
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail Produk']];
    return view('/pages/product/detail', compact('breadcrumbs', 'product'));
  }

  public function showAddProduct(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Paket']];
    return view('/pages/product/add', compact('breadcrumbs'));
  }

  public function showEditProduct($productId)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Produk']];
    $product = $this->service->getProduct($productId);
    $programs = $this->programs;
    if (!property_exists($product, 'max_discount')) {
      $product->max_discount = new \stdClass();
      $product->max_discount->type = "FIXED";
      $product->max_discount->amount = 0;
    }

    $isPackageProduct = $product->included_product && count($product->included_product) > 0;
    return view('/pages/product/edit', compact('breadcrumbs', 'programs', 'product', 'isPackageProduct'));
  }

  private function _validateCreateUpdate($request)
  {
    $validator = Validator::make($request->all(), [
      'title' => 'required',
      'description' => 'nullable',
      'program' => 'required',
      'legacy_id' => 'required',
      'base_price' => 'required',
      'sell_price' => 'required',
      'quantity' => 'required',
      'type' => 'required',
      'status' => 'required',
      'iap_product_id' => 'nullable',
      'duration' => 'required',
      'duration_type' => 'required',
      'branch_code' => 'required',
      'images' => 'nullable',
      'included_product' => 'nullable',
      'tags' => 'nullable',
      'max_discount_type' => 'required',
      'max_discount_amount' => 'required',
    ]);

    $validator->sometimes('max_discount_amount', 'required|numeric|max:100', function ($input, $item) {
      return $input->max_discount_type == 'percent';
    });
  }

  public function create(Request $request)
  {
    $this->_validateCreateUpdate($request);
    $decoded_description_json = json_decode($request->description_json);

    $sub_product_type = $request->sub_product_type
      ? array_map(fn ($sub_product_type) => Str::upper(Str::slug($sub_product_type, '_')), $request->sub_product_type)
      : [];

    $addNewLegacy = boolval($request["add-new-legacy"]);
    $legacyId = (int)$request->legacy_id;

    if ($addNewLegacy) {
      $legacyPackageResponse = $request->type === "OFFLINE_PRODUCT"
        ? $this->apiGateway->createTatapMuka([
          "title" => $request->legacy_package_title,
          "program" => $request->program,
          "description" => $request->description,
          "price" => (int)preg_replace("/[\.,]/", "", $request->sell_price),
          "status" => $request->status,
        ])
        : $this->apiGateway->createPremiumPackage([
          "title" => $request->legacy_package_title,
          "description" => $request->description,
          "status" => $request->status,
          "price" => (int)preg_replace("/[\.,]/", "", $request->sell_price),
          "is_platinum" => $request->is_platinum,
          "program" => $request->program,
          "iap_product_id" => $request->iap_product_id ?? null
        ]);
      $legacyPackageBody = json_decode($legacyPackageResponse->body());
      if (!$legacyPackageResponse->successful()) {
        Log::error("Proses tambah produk gagal", ['response' => $legacyPackageBody]);
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi Kesalahan!',
          'type' => 'error',
          'message' => 'Proses tambah produk gagal'
        ]);
        return redirect('/produk');
      }
      $legacyId = (int)$legacyPackageBody->data->id;
    }

    foreach ($request->branch_code as $branchCode) {
      $payload = [
        'title' => $request->title,
        'program' => $request->program,
        'legacy_id' => $legacyId,
        'base_price' => (int)preg_replace("/[\.,]/", "", $request->base_price),
        'sell_price' => (int)preg_replace("/[\.,]/", "", $request->sell_price),
        'amount' => (int) $request->quantity,
        'type' => $request->type,
        'coin_amount' => $request->has("type") && ($request->type === "COIN_PRODUCT" || $request->type === "COIN_CURRENCY")
          ? (int)preg_replace("/[\.,]/", "", $request->coin_amount)
          : null,
        'status' => (bool)$request->status,
        'iap_product_id' => $request->iap_product_id,
        'duration' => (int)$request->duration,
        'duration_type' => $request->duration_type,
        'branch_code' => $branchCode,
        'included_product' => $request->included_product ?? [],
        'tags' => $sub_product_type,
        'max_discount' => [
          'amount' => (int)preg_replace("/[\.,]/", "", $request->max_discount_amount),
          'type' => strtoupper($request->max_discount_type)
        ],
        'installment_price' => $request->has('installment_price') ? (int)preg_replace("/[\.,]/", "", $request->installment_price) : null,
        'installment_period' => $request->has('installment_period') ? (int)$request->installment_period : null,
        'description' => $request->description,
        'description_json' => $decoded_description_json ? $request->description_json : null,
        "parent_product_id" => $request->has("parent_product_id") ? $request->parent_product_id : null
      ];
      $images = $request->file('images');
      $fullImgUrls = [];

      if ($images) {
        foreach ($images as $file) {
          $fileName = $file->getClientOriginalName();
          $isImageFile = $this->isImageFile($file);
          if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => "Format file $fileName tidak valid, masukkan file dengan format yang benar"]);

          $targetPath = "/assets/office/image/product/" . $request->legacy_id;
          $fullImgPath = S3::storeOriginal($targetPath, $file);
          $fullImgUrls[] = $fullImgPath;
        }
        $payload['image'] = $fullImgUrls;
      } else {
        $payload['image'] = $request->current_images;
      }

      $response = $this->service->create($payload);
    }
    if ($response->success) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Produk berhasil ditambah'
      ]);
    } else {
      Log::error("Fail to create new product", ["response" => $response]);
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses tambah produk gagal'
      ]);
    }

    return redirect('/produk');
  }

  public function update(Request $request)
  {
    $this->_validateCreateUpdate($request);
    $decoded_description_json = json_decode($request->description_json);

    $sub_product_type = $request->sub_product_type
      ? array_map(fn ($sub_product_type) => Str::upper(Str::slug($sub_product_type, '_')), $request->sub_product_type)
      : [];
    $productId = $request->id;
    $legacyId = (int)$request->legacy_id;

    if (!in_array($request->type, ["ASSESSMENT_PRODUCT", "ASSESSMENT_PSYCHOLOG_PRODUCT", "BUNDLE_PSYCHOLOG_PRODUCT"])) {
      $legacyPackageData = $this->apiGateway->getPremiumPackageById($legacyId);
      if (!$legacyPackageData) {
        Log::error("Error when trying to update product data - Legacy package data with id: " . $legacyId . " not found");
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi Kesalahan!',
          'type' => 'error',
          'message' => 'Proses update produk gagal'
        ]);
        return redirect('/produk');
      }

      $legacyPackageResponse = $request->type === "OFFLINE_PRODUCT"
        ? $this->apiGateway->updateTatapMuka([
          "title" => $request->legacy_package_title,
          "program" => $request->program,
          "description" => $request->description,
          "price" => (int)preg_replace("/[\.,]/", "", $request->sell_price),
          "status" => $request->status,
        ], $legacyId)
        : $this->apiGateway->updatePremiumPackage([
          "title" => $legacyPackageData->title,
          "description" => $request->description,
          "status" => $request->status,
          "price" => (int)preg_replace("/[\.,]/", "", $request->sell_price),
          "is_platinum" => $legacyPackageData->is_platinum,
          "program" => $request->program,
          "iap_product_id" => $request->iap_product_id ?? null
        ], $legacyId);
      $legacyPackageBody = json_decode($legacyPackageResponse->body());
      if (!$legacyPackageResponse->successful()) {
        Log::error("Proses update produk gagal", ['response' => $legacyPackageBody]);
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi Kesalahan!',
          'type' => 'error',
          'message' => 'Proses update produk gagal'
        ]);
        return redirect('/produk');
      }
      $legacyId = (int)$legacyPackageBody->data->id;
    }

    $payload = [
      'title' => $request->title,
      'program' => $request->program,
      'legacy_id' => $legacyId,
      'base_price' => (int)preg_replace("/[\.,]/", "", $request->base_price),
      'sell_price' => (int)preg_replace("/[\.,]/", "", $request->sell_price),
      'type' => $request->type,
      'amount' => (int)$request->quantity,
      'coin_amount' => $request->has("type") && ($request->type === "COIN_PRODUCT" || $request->type === "COIN_CURRENCY")
        ? (int)preg_replace("/[\.,]/", "", $request->coin_amount)
        : null,
      'status' => (bool)$request->status,
      'iap_product_id' => $request->iap_product_id,
      'duration' => (int)$request->duration,
      'duration_type' => $request->duration_type,
      'branch_code' => $request->branch_code,
      'included_product' => $request->included_product ?? [],
      'tags' => $sub_product_type,
      'max_discount' => [
        'amount' => (int)preg_replace("/[\.,]/", "", $request->max_discount_amount),
        'type' => strtoupper($request->max_discount_type)
      ],
      'installment_price' => $request->has('installment_price') ? (int)preg_replace("/[\.,]/", "", $request->installment_price) : null,
      'installment_period' => $request->has('installment_period') ? (int)$request->installment_period : null,
      'description' => $request->description,
      'description_json' => $decoded_description_json ? $request->description_json : null,
      "parent_product_id" => $request->has("parent_product_id") ? $request->parent_product_id : null
    ];
    $images = $request->file('images');
    $fullImgUrls = [];

    if ($images) {
      foreach ($images as $file) {
        $fileName = $file->getClientOriginalName();
        $isImageFile = $this->isImageFile($file);
        if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => "Format file $fileName tidak valid, masukkan file dengan format yang benar"]);

        $targetPath = "/assets/office/image/product/" . $request->legacy_id;
        $fullImgPath = S3::storeOriginal($targetPath, $file);
        $fullImgUrls[] = $fullImgPath;
      }
      $payload['image'] = $fullImgUrls;
    } else {
      $payload['image'] = json_decode($request->current_images);
    }
    $response = $this->service->update($productId, $payload);
    if ($response->success) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Produk berhasil diupdate'
      ]);
    } else {
      Log::error("Fail to update product", ["response" => $response]);
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses Ubah Produk Gagal'
      ]);
    }
    return redirect('/produk');
  }

  private function isImageFile(UploadedFile $file)
  {
    $fileExtension = $file->extension();
    $fileMimeType = $file->getMimeType();

    $validImageExtensions = ["jpg", "jpeg", "png", "gif"];
    $validImageMimeType = ["image/jpeg", "image/png", "image/gif"];

    return in_array($fileExtension, $validImageExtensions) && in_array($fileMimeType, $validImageMimeType);
  }
}

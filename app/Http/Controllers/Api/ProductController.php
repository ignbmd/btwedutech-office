<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ProductService\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Helpers\Product as ProductHelper;

class ProductController extends Controller
{

  private Product $service;

  public function __construct(Product $productService)
  {
    $this->service = $productService;
  }

  public function getAllProduct(Request $request)
  {
    $data = $this->service->getProducts();
    if (count($data ?? []) > 0) {
      $filteredData = collect($data ?? [])
        ->filter(function ($product) {
          return !in_array(
            $product->type,
            ["ASSESSMENT_PRODUCT", "ASSESSMENT_PSYCHOLOG_PRODUCT", "BUNDLE_PSYCHOLOG_PRODUCT"]
          );
        })
        ->values()
        ->toArray();
      $data = $filteredData;
    }
    return response()->json(['data' => $data]);
  }

  public function getIncludedProduct(Request $request)
  {
    $status = true;
    $data = $this->service->getProducts(
      $status,
      $request->program ?? '',
      $request->type ?? '',
      $request->branch_code ?? 'PT0000'
    );
    return response()->json(['data' => $data]);
  }

  public function getSatuanProduct(Request $request)
  {
    $data = $this->service->getSatuanProducts();
    return response()->json(['data' => $data]);
  }

  public function getLegacyIds(Request $request)
  {
    $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/product/get-legacy-ids';
    $params = ['program' => $request->get('program'), 'isProductOnline' => $request->get('isProductOnline')];
    $headers = ['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')];

    return Http::withHeaders($headers)->get($url, $params);
  }

  public function getOnlinePackageOptionsByProgram(Request $request, $program_slug)
  {
    $slug = Str::slug($program_slug);
    if ($slug === "utbk") {
      $slug = "tps";
    }

    $response = $this->service->getOnlinePackageOptionsByProgram($slug);
    $responseStatus = $response->status();
    $responseBody = json_decode($response?->body());

    if ($request->has('module_packages_only') && $request->module_packages_only == 1) {
      $filteredProducts = collect($responseBody->data ?? [])->reject(function ($value) {
        return $value->type !== "ONLINE_PRODUCT" || (in_array("TATAP_MUKA_ONLINE", $value->tags) ||
          in_array("PUBLIC_PRODUCT", $value->tags) ||
          in_array("LEARNING_MATERIAL", $value->tags) ||
          in_array("VIDEO_MATERIAL", $value->tags)
        );
      })->values()->toArray();
      $responseBody->data = $filteredProducts;
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function getOnlinePackageOptionsByProgramV2($program_slug)
  {
    $slug = Str::slug($program_slug);
    if ($slug === "utbk") {
      $slug = "tps";
    }

    $onlineProductsResponse = $this->service->getOnlinePackageOptionsByProgram($slug);
    $onlineProductsBody = json_decode($onlineProductsResponse?->body())?->data ?? [];

    $coinProductsResponse = $this->service->getCoinProductOptionsByProgram($slug);
    $coinProductsBody = json_decode($coinProductsResponse?->body())?->data ?? [];

    $products = array_merge($onlineProductsBody, $coinProductsBody);
    return response()->json(["success" => true, "message" => "Get online & coin products", "data" => $products], 200);
  }

  public function getCoinProductOptionsByProgram($program_slug)
  {
    $slug = Str::slug($program_slug);
    if ($slug === "utbk") {
      $slug = "tps";
    }

    $response = $this->service->getCoinProductOptionsByProgram($slug);
    $responseStatus = $response->status();
    $responseBody = json_decode($response?->body());

    return response()->json($responseBody, $responseStatus);
  }

  public function getTryoutPremiumOptionsByProgram($program_slug)
  {
    $slug = Str::slug($program_slug);
    if ($slug === "utbk") {
      $slug = "tps";
    }

    $response = $this->service->getTryoutPremiumOptionsByProgram($slug);
    $responseStatus = $response->status();
    $responseBody = json_decode($response?->body());

    return response()->json($responseBody, $responseStatus);
  }

  public function getTryoutPremiumOptionsByProgramV2($program_slug)
  {
    $slug = Str::slug($program_slug);
    if ($slug === "utbk") {
      $slug = "tps";
    }

    $response = $this->service->getTryoutPremiumOptionsByProgram($slug);
    $responseBody = json_decode($response?->body())?->data ?? [];

    $coinProductsResponse = $this->service->getCoinProductOptionsByProgram($slug);
    $coinProductsBody = json_decode($coinProductsResponse?->body())?->data ?? [];

    $products = array_merge($responseBody, $coinProductsBody);
    return response()->json(["success" => true, "message" => "Get online & coin products", "data" => $products], 200);
  }

  public function getProductByQuery(Request $request)
  {
    $response = $this->service->getProductByQueryString(
      $request->status,
      $request->program,
      $request->type,
      $request->branch_code,
      $request->tags,
    );
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getAssessmentProductOnly(Request $request)
  {
    $response = $this->service->getAssessmentProductOnly();
    $body = json_decode($response->body());
    $status = $response->status();

    return response()->json($body, $status);
  }

  public function getSiplahProducts(Request $request)
  {
    $response = $this->service->getAssessmentProductOnly();
    $body = json_decode($response->body());
    $status = $response->status();

    if (property_exists($body, "data") && count($body->data)) {
      $body->data = ProductHelper::filterSiplahProducts(["request" => $request, "data" => $body->data]);
    }

    return response()->json($body, $status);
  }

  public function getFilteredAssessmentProducts(Request $request)
  {
    $response = $this->service->getAssessmentProductOnly();
    $body = json_decode($response->body());
    $status = $response->status();

    if (property_exists($body, "data") && count($body->data)) {
      $body->data = ProductHelper::filterAssessmentProducts(["request" => $request, "data" => $body->data]);
    }

    return response()->json($body, $status);
  }
}

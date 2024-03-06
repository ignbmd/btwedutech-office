<?php

namespace App\Services\ProductService;

use App\Helpers\RabbitMq;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Product extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.product', '');
  }

  public function getProduct(string $id)
  {
    $query = [
      '_id' => $id
    ];
    $response = $this->http->get(url: "/product/detail", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getProducts(
    string $status = null,
    string $program = '',
    string $type = '',
    string $branch_code = '',
    string $page = null,
    string $perPage = null,
    string $title = '',
    string $tags = null
  ) {
    $appliedBranchCode = auth()->user()->branch_code ?? $branch_code;
    if ($appliedBranchCode === 'PT0000') {
      $appliedBranchCode = "";
    }

    $query = [
      'status' => $status,
      'program' => $program,
      'type' => $type,
      'title' => $title,
      'branch_code' => $appliedBranchCode,
      'tags' => $tags,
      'program' => $program
    ];
    $url = "/product";

    if ($page && $perPage) {
      $query['page'] = $page;
      $query['per_page'] = $perPage;
      $url = "/product/paginated";
    }

    $response = $this->http->get(url: $url, query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getSatuanProducts()
  {
    $response = $this->http->get('/product/without-included');
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function create($payload)
  {
    $response = $this->http->post(
      url: "/product/create/",
      data: $payload
    );
    $data = json_decode($response->body());
    return $data ?? null;
  }

  public function update($productId, $payload)
  {
    $response = $this->http->put(
      url: "/product/update/" . $productId,
      data: $payload
    );
    $data = json_decode($response->body());
    return $data ?? null;
  }

  public function createActivation(array $payload)
  {
    $body = [
      "version" => 1,
      "data" => $payload
    ];
    $final_data = json_encode($body);
    RabbitMq::send('product.activation', $final_data);
  }

  public function getProductByProductAndBranchCode($product_code, $branch_code)
  {
    $response = $this->http->get(url: '/product/by-product-code-and-branch/' . $product_code . '/' . $branch_code);
    $data = json_decode($response->body());
    return $data?->data ?? null;
  }

  public function getAOPPerStudent(int $student_id, ?int $product_legacy_id, ?string $program_slug)
  {
    $query = ["smartbtw_id" => $student_id, "legacy_id" => $product_legacy_id, "program" => $program_slug, "status" => 1];

    if ($product_legacy_id) $query["legacy_id"] = $product_legacy_id;
    if ($program_slug) $query["program"] = $program_slug;

    $response = $this->http->get(url: '/aop/get-per-student', query: $query);
    $data = json_decode($response->body());
    return $data?->data ?? null;
  }

  public function getLearningMaterial(int $student_id, string $program_slug, string $learning_type)
  {
    $query = ["smartbtw_id" => $student_id, "program" => $program_slug, "learning_type" => $learning_type];
    $response = $this->http->get(url: "/aop/get-learning-material", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getOnlinePackageOptionsByProgram(string $program_slug)
  {
    $appliedBranchCode = auth()->user()->branch_code ?? '';
    if ($appliedBranchCode === 'PT0000') {
      $appliedBranchCode = "";
    }

    $query = [
      'status' => "true",
      'program' => $program_slug,
      'type' => "ONLINE_PRODUCT",
      'tags' => "PACKAGE",
      'branch_code' => $appliedBranchCode
    ];

    $response = $this->http->get(url: '/product', query: $query);
    return $response;
  }

  public function getCoinProductOptionsByProgram(string $program_slug)
  {
    $appliedBranchCode = auth()->user()->branch_code ?? '';
    if ($appliedBranchCode === 'PT0000') {
      $appliedBranchCode = "";
    }

    $query = [
      'status' => "true",
      'program' => $program_slug,
      'type' => "COIN_PRODUCT",
      'branch_code' => $appliedBranchCode
    ];

    $response = $this->http->get(url: '/product', query: $query);
    return $response;
  }

  public function getProductByQueryString(
    bool|null $status = true,
    string|null $program = null,
    string|null $type = null,
    string|null $branch_code = null,
    array|null $tags = null,
  ) {
    $query = ["status" => $status ? "true" : "false", "program" => $program, "type" => $type, "branch_code" => $branch_code, "tags" => $tags];
    if (is_null($status)) unset($query["status"]);

    $response = $this->http->get(url: "/product", query: $query);
    return $response;
  }

  public function getTryoutPremiumOptionsByProgram(string $program_slug)
  {
    $appliedBranchCode = auth()->user()->branch_code ?? '';
    if ($appliedBranchCode === 'PT0000') {
      $appliedBranchCode = "";
    }

    $query = [
      'status' => "true",
      'program' => $program_slug,
      'type' => "ONLINE_PRODUCT",
      'tags' => "TRYOUT",
      'branch_code' => $appliedBranchCode
    ];

    $response = $this->http->get(url: '/product', query: $query);
    return $response;
  }

  public function getAssessmentProductOnly()
  {
    return $this->http->get(url: "/product/assessment");
  }
}

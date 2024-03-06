<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TryoutCode extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam_cpns', '');
  }

  public function getAll(array|null $query = null)
  {
    $response = $this->http->get(
      url: "/tryout/codes",
      query: $query
    );
    return $response;
  }

  public function getByTag($tag)
  {
    $response = $this->http->get(
      url: "/tryout/codes",
      query: ["tags" => $tag]
    );
    return $response;
  }

  public function getById($id)
  {
    $response = $this->http->get(
      url: "/tryout/codes/$id"
    );
    return $response;
  }

  public function getCodeCategory()
  {
    $response = $this->http->get(
      url: "/tryout/code-category"
    );
    return $response;
  }


  public function detail(string $id)
  {
    $response = $this->http->get(
      url: "/tryout/codes/" . $id
    );
    return $response;
  }

  public function save(array $payload)
  {
    $response = $this->http->post(
      url: "/tryout/codes",
      data: $payload
    );
    return $response;
  }

  public function update(int $id, array $payload)
  {
    $response = $this->http->put(
      url: "/tryout/codes/$id",
      data: $payload
    );
    return $response;
  }
}

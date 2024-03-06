<?php 

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class SubQuestionCategory extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam_cpns', '');
  }

  public function get()
  {
    $response = $this->http->get(
      url: '/question/sub-category'
    );
    return $response;
  }
  public function getById(string $id)
  {
    $response = $this->http->get(
      url: '/question/sub-category?id=' . $id
    );
    return $response;
  }

  public function getCategoryId(string $categoryId)
  {
    $response = $this->http->get(
      url: '/question/sub-category?categoryId=' . $categoryId
    );
    return $response;
  }

  public function create(array $payload)
  {
    $response = $this->http->post(
      url: "/question/sub-category",
      data: $payload
    );
    return $response;
  }

  public function update(string $id, array $payload)
  {
    $response = $this->http->put(
      url: "/question/sub-category/" . $id,
      data: $payload
    );
    return $response;
  }
}

<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Instruction extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam_cpns', '');
  }

  public function get(string $program = null)
  {
    $url = $program
      ? '/instruction?program=' . $program
      : '/instruction';
    $response = $this->http->get(
      url: $url
    );
    return $response;
  }

  public function getById(string $id)
  {
    $response = $this->http->get(
      url: '/instruction/' . $id
    );
    return $response;
  }

  public function create(array $payload)
  {
    $response = $this->http->post(
      url: "/instruction",
      data: $payload
    );
    return $response;
  }

  public function update(string $id, array $payload)
  {
    $response = $this->http->put(
      url: "/instruction/" . $id,
      data: $payload
    );
    return $response;
  }

  public function delete(string $id)
  {
    $response = $this->http->delete(
      url: "/instruction/" . $id
    );
    return $response;
  }
}

<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Instruction extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam', '');
  }

  public function get(string $program = null)
  {
    $url = $program
      ? '/packages/instruction?program=' . $program
      : '/packages/instruction';
    $response = $this->http->get(
      url: $url
    );
    return $response;
  }

  public function getById(string $id)
  {
    $response = $this->http->get(
      url: '/packages/instruction/' . $id
    );
    return $response;
  }

  public function create(array $payload)
  {
    $response = $this->http->post(
      url: "/packages/instruction",
      data: $payload
    );
    return $response;
  }

  public function update(string $id, array $payload)
  {
    $response = $this->http->put(
      url: "/packages/instruction/" . $id,
      data: $payload
    );
    return $response;
  }

  public function delete(string $id)
  {
    $response = $this->http->delete(
      url: "/packages/instruction/" . $id
    );
    return $response;
  }
}

<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TryoutCode extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam', '');
  }

  public function getAll(array|null $query = null)
  {
    $response = $this->http->get(
      url: "/packages/tryout-codes",
      query: $query
    );
    return $response;
  }

  public function getByTag($tag)
  {
    $response = $this->http->get(
      url: "/packages/tryout-codes",
      query: ["tags" => $tag]
    );
    return $response;
  }

  public function getById($id)
  {
    $response = $this->http->get(
      url: "/packages/tryout-codes/$id"
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
      url: "/packages/tryout-codes/" . $id
    );
    return $response;
  }

  public function save(array $payload)
  {
    $response = $this->http->post(
      url: "/packages/tryout-codes",
      data: $payload
    );
    return $response;
  }

  public function update(array $payload)
  {
    $response = $this->http->put(
      url: "/packages/tryout-codes",
      data: $payload
    );
    return $response;
  }

  public function delete(string $id)
  {
    return $this->http->delete("/packages/tryout-codes/{$id}");
  }

  public function getTaskIdsWithGroup(string $id)
  {
    $response = $this->http->get(
      url: "/tryout/code-category/{$id}?get_task_group=true",
    );
    return $response;
  }

  public function getTaskIdsOnly(string $id)
  {
    $response = $this->http->get(
      url: "/tryout/code-category/{$id}?get_task_id=true",
    );
    return $response;
  }

  public function syncTryoutGeneratedStatus(array $payload)
  {
    return $this->http->post("/utility/redis/sync", $payload);
  }
}

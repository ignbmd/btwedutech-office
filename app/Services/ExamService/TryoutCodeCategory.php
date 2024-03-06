<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TryoutCodeCategory extends Service implements ServiceContract
{

    use HasBranch;

    protected function serviceAddress(): string
    {
        return config('services.btw.exam', '');
    }

    public function getAll()
    {
        $response = $this->http->get(
            url: "/tryout/code-category"
        );
        return $response;
    }

    public function detail(string $id)
    {
        $response = $this->http->get(
            url: "/tryout/code-category/" . $id
        );
        return $response;
    }

    public function groups(string $id)
    {
      $response = $this->http->get(
        url: "/tryout/code-category/{$id}?get_task_group=true",
      );
      return $response;
    }

    public function groupTaskIds(string $id)
    {
      $response = $this->http->get(
        url: "/tryout/code-category/{$id}?get_task_id=true",
      );
      return $response;
    }

    public function save(array $payload)
    {
        $response = $this->http->post(
            url: "/tryout/code-category",
            data: $payload
        );
        return $response;
    }

    public function update(array $payload)
    {
        $response = $this->http->put(
            url: "/tryout/code-category/{$payload['id']}",
            data: $payload
        );
        return $response;
    }

    public function delete(string $id)
    {
        return $this->http->delete("/tryout/code-category/{$id}");
    }
}

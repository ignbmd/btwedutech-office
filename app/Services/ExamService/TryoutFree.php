<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TryoutFree extends Service implements ServiceContract
{

    use HasBranch;

    protected function serviceAddress(): string
    {
        return config('services.btw.exam', '');
    }

    public function getAll()
    {
        $response = $this->http->get(
            url: "/packages/tryout-free"
        );
        return $response;
    }


    public function detail(string $id)
    {
        $response = $this->http->get(
            url: "/packages/tryout-free/" . $id
        );
        return $response;
    }

    public function getDetailCluster(string $id)
    {
        $response = $this->http->get(
            url: "/tryout/clusters/" . $id
        );
        return $response;
    }

    public function save(array $payload)
    {
        $response = $this->http->post(
            url: "/packages/tryout-free",
            data: $payload
        );
        return $response;
    }

    public function addSession(array $payload)
    {
        $response = $this->http->post(
            url: "/tryout/clusters",
            data: $payload
        );
        return $response;
    }

    public function update(array $payload)
    {
        $response = $this->http->put(
            url: "/packages/tryout-free/" . $payload['id'],
            data: $payload
        );
        return $response;
    }

    public function updateCluster(array $payload)
    {
        $response = $this->http->put(
            url: "/tryout/clusters/" . $payload['id'],
            data: $payload
        );
        return $response;
    }

    public function delete(string $id)
    {
        return $this->http->delete("/packages/tryout-free/{$id}");
    }

    public function deleteCluster(string $id)
    {
        return $this->http->delete("/tryout/clusters/{$id}");
    }
}

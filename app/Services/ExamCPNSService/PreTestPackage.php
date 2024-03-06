<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class PreTestPackage extends Service implements ServiceContract
{
    use HasBranch;

    protected function serviceAddress(): string
    {
        return config('services.btw.exam_cpns', '');
    }
    public function getAll()
    {
      $response = $this->http->get(url: '/packages/pre-test');
      $data = json_decode($response->body());
      return $data?->data ?? [];
    }

    public function getByProgram(string $program)
    {
      $response = $this->http->get(url: "/packages/pre-test/$program");
      $data = json_decode($response->body());
      return $data?->data ?? [];
    }


    public function getById(int $id)
    {
      $response = $this->http->get(url: '/packages/pre-test', query: ['id' => $id]);
      $data = json_decode($response->body());
      return $data?->data ?? [];
    }

    public function createBulk(array $payload) {
      $response = $this->http->post(
        url: "/packages/pre-test/bulk",
        data: $payload
      );
      return $response;
    }

    public function update(string $id, array $payload)
    {
      return $this->http->put(url: "/packages/pre-test/$id", data: $payload);
    }
}  
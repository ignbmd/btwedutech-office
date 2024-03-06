<?php

namespace App\Services\ExamService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class StudyMaterial extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam', '');
  }

  public function index()
  {
    $response = $this->http->get(url: '/study-materials');
    $data = json_decode($response->body());
    return $data?->data ?? [];
  }

  public function show(int $id)
  {
    $response = $this->http->get(url: '/study-materials', query: ['id' => $id]);
    $data = json_decode($response->body());
    return $data?->data ?? null;
  }

  public function store(array $payload) {
    $response = $this->http->post(
      url: "/study-materials",
      data: $payload
    );
    return $response;
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put(url: "/study-materials/$id", data: $payload);
  }

  public function indexDocument(int $studyMaterialId)
  {
    return $this->http->get("/documents", ["documentable_id" => $studyMaterialId, "documentable_type" => "study-material"]);
  }

  public function showDocument(int $documentId)
  {
    return $this->http->get("/documents", ["id" => $documentId]);
  }

  public function storeDocument(array $payload)
  {
    return $this->http->post(url: "/documents", data: $payload);
  }

  public function updateDocument(int $documentId, array $payload)
  {
    return $this->http->put(url: "/documents/$documentId", data: $payload);
  }
}

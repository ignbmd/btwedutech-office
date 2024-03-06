<?php

namespace App\Services\FinanceService;

use App\Helpers\S3;
use App\Services\Service;
use App\Services\ServiceContract;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Client\Response;

class Expense extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.finance', '');
  }

  public function getAllByBranchCode($branchCode)
  {
    $response = $this->http->get("/expense/$branchCode");
    $body = json_decode($response->body());
    return $body;
  }

  public function getCalculationByBranchCode($branchCode)
  {
    $response = $this->http->get("/expense/calculation/$branchCode");
    $body = json_decode($response->body());
    return $body;
  }

  public function getById($id)
  {
    $response = $this->http->get("/expense/id/{$id}");
    $body = json_decode($response->body());
    return $body->data ?? null;
  }

  public function create($payload, $files = []): Response
  {
    $payload = array_merge((array)$payload, [
      'attachment' => $this->getAttachments((array)$payload, $files),
    ]);
    return $this->http->post(url: "/expense", data: (array)$payload);
  }

  public function update($payload, $files = []): Response
  {
    $payload = array_merge((array)$payload, [
      'attachment' => $this->getAttachments((array)$payload, $files),
    ]);
    return $this->http->post(url: "/expense/edit", data: (array)$payload);
  }

  private function getAttachments(array $payload, ?array $files = [])
  {
    $prev = collect($payload['attachments'] ?? [])
      ->map(fn ($v) => (array)$v)
      ->toArray();
    $new = collect($files)
      ->map(fn ($file) => [
        'name' => $file->getClientOriginalName(),
        'path' => $this->uploadAttachmentFile($file),
      ])->toArray();
    return array_merge($new, $prev);
  }


  private function uploadAttachmentFile($file)
  {
    $path = "/uploads/office/expense";
    return S3::storeOriginal($path, $file);
  }
}

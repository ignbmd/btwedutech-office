<?php

namespace App\Services\LearningService;

use App\Helpers\S3;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Auth;

class Material extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getByRoles($query = [])
  {
    $user = Auth::user();
    // $filter = ['branch_code' => $user->branch_code];
    $filter = [];
    $filter = array_merge($filter, $query);
    $data = collect($this->getAll($filter))
      ->filter(function ($d) use ($user) {
        $isMine = $d?->sso_id == $user?->id;
        $isPublic = $d?->status == 'PUBLIC';
        $isPossible = $isMine || $isPublic;
        return $isPossible;
      });
    return $data->values()->all();
  }

  public function getAll($query = [])
  {
    $query = array_filter($query);
    $response = $this->http->get(url: '/material', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSingle($materialId)
  {
    $materials = $this->getAll(['_id' => $materialId]);
    return count($materials) ? $materials[0] : null;
  }

  public function delete($id): Response
  {
    return $this->http->delete(url: "/material/$id");
  }

  public function create(array $payload, array $files): Response
  {
    $payload = array_merge(
      ["branch_code" => Auth::user()?->branch_code],
      collect($payload)->only($this->getFields())->toArray(),
      ['attachments' => $this->getAttachments($payload, $files)]
    );
    return $this->http->post(url: '/material', data: $payload);
  }

  public function update($id, array $payload, ?array $files = []): Response
  {
    $payload = array_merge(
      collect($payload)->filter()->only($this->getFields())->toArray(),
      ['attachments' => $this->getAttachments($payload, $files)]
    );
    return $this->http->post(url: "/material/$id", data: $payload);
  }

  public function getFields()
  {
    return [
      'title',
      'sso_id',
      'branch_code',
      'status',
      'attachments',
    ];
  }

  private function getAttachments(array $payload, ?array $files = [])
  {
    $prev = collect($payload['attachments'] ?? [])
      ->map(fn ($v) => json_decode($v))
      ->toArray();
    $new = collect($files)
      ->map(fn ($file) => [
        'mime_type' => $file->getClientOriginalExtension(),
        'file_name' => $file->getClientOriginalName(),
        'file_url' => $this->uploadAttachmentFile($file),
      ])->toArray();
    return array_merge($new, $prev);
  }

  private function uploadAttachmentFile($file)
  {
    $path = "/uploads/office/material";
    return S3::storeOriginal($path, $file);
  }
}

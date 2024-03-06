<?php

namespace App\Services\LearningService;

use App\Helpers\S3;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class Report extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getBySchedule($scheduleId)
  {
    $url = "/learning-report/by-schedule/$scheduleId";
    $response = $this->http->get(url: $url);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function create(array $payload, $files): Response
  {
    $userId = Auth::user()?->id;
    $payload = array_merge(
      [
        'created_by' => $userId,
        'teacher_id' => $userId,
        'updated_by' => $userId,
      ],
      collect($payload)->only($this->getFields())->toArray(),
      ['attachments' => $this->getAttachments($payload, $files)],
    );
    return $this->http->post(url: "/learning-report", data: $payload);
  }

  public function update(string $reportId, array $payload, $files): Response
  {
    $userId = Auth::user()?->id;
    $payload = array_merge(
      ['updated_by' => $userId],
      collect($payload)->filter()->only($this->getFields())->toArray(),
      ['attachments' => $this->getAttachments($payload, $files)],
    );
    return $this->http->post(url: "/learning-report/$reportId", data: $payload);
  }

  public function getSingle(string $id)
  {
    $query = ['_id' => $id];
    $response = $this->http->get(url: "/learning-report", query: $query);
    $data = json_decode($response->body());
    $data = collect($data?->data ?? []);
    return $data->count() > 0 ? $data->first() : null;
  }

  public function getFields()
  {
    return [
      "classroom_id",
      'class_schedule_id',
      "title",
      "description",
      'teacher_id',
      'created_by',
      'updated_by',
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
        'file_url' => $this->uploadAttachmentFile($payload['class_schedule_id'], $file),
      ])->toArray();
    return array_merge($new, $prev);
  }

  private function uploadAttachmentFile($scheduleId, UploadedFile|null $file)
  {
    $path = "/uploads/office/learning-report/{$scheduleId}";
    return S3::storeOriginal($path, $file);
  }
}

<?php

namespace App\Services\LearningService;

use App\Helpers\AttendMessage;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use App\Types\StudentAttend;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class Presence extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function get(array $payload)
  {
    $response = $this->http->get(url: "/student-presence", query: $payload);
    $body = json_decode($response->body());
    return $body?->data ?? [];
  }

  public function create($payload): Response
  {
    $payload = array_merge(
      ['created_by' => Auth::user()?->id],
      collect($payload)->only($this->getFields())->toArray()
    );
    $response = $this->http->post(url: '/student-presence', data: $payload);
    if ($response->successful()) $this->sendAttendMessage($payload);
    return $response;
  }

  public function createForZoomWebhook($payload): Response
  {
    $response = $this->http->post(url: '/student-presence', data: $payload);
    return $response;
  }

  public function update($id, $payload): Response
  {
    $url = "/student-presence/$id";
    $payload = collect($payload)->only($this->getFields())->toArray();
    $updatedLogs = collect($payload["logs"])->map(function ($item, $key) {
      if ($item["presence"] === "ATTEND") $item["comment"] = null;
      return $item;
    })->toArray();
    $payload["logs"] = $updatedLogs;
    $payload = array_merge(
      ['created_by' => Auth::user()?->id],
      $payload
    );
    $response = $this->http->post(url: $url, data: $payload);
    if ($response->successful()) $this->sendAttendMessage($payload);
    return $response;
  }

  public function getFields()
  {
    return [
      'classroom_id',
      'class_schedule_id',
      'created_by',
      'comment',
      'logs',
    ];
  }

  public function getSummaryByStudentID(int $student_id)
  {
    return $this->http->get("/student-presence/student-summary/for-report/$student_id");
  }

  private function sendAttendMessage($payload)
  {
    // Message broker send WhatsApp
    $classScheduleID = $payload['class_schedule_id'];
    $createdByID = $payload['created_by'];

    $attends = collect($payload['logs'] ?? [])->map(function ($log) use ($classScheduleID, $createdByID) {
      $log = (object)$log;
      $attend = new StudentAttend();
      $attend->smartbtwID = $log?->smartbtw_id ?? null;
      $attend->parentPhone = $log?->parent_phone ?? '';
      $attend->name = $log?->name ?? '';
      $attend->status = $log?->presence ?? '';
      $attend->classScheduleID = $classScheduleID;
      $attend->createdByID = $createdByID;
      $attend->comment = $log?->comment ?? '';
      return $attend;
    });
    $msg = new AttendMessage($attends);
    $msg->sendMessage();
  }
}

<?php

namespace App\Services\LearningService;

use App\Helpers\UserRole;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Carbon\Carbon;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class Schedule extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getByRoles($query = [])
  {
    try {
      $user = Auth::user();
      $userACL = $user->resources ?? [];
      $canShowAllSchedule = in_array("office_v2.learning_classroom.show_all_schedule", $userACL);
      if (UserRole::isMentor()) {
        $filter['teacher_id'] = $user->id;
      } else {
        $filter = ['branch_code' => $user?->branch_code ?? ''];
      }
      if ($canShowAllSchedule) {
        unset($filter["teacher_id"]);
        $filter = ['branch_code' => $user?->branch_code ?? ''];
      }

      $filter = array_merge($filter, $query);
      if(UserRole::isBranchAdmin() && UserRole::isMentor()) unset($filter['teacher_id']);
      $data = collect($this->getAll($filter));
      return $data->values()->all();
    } catch (\Exception $e) {
      Log::error($e->getMessage(), ["message" => $e->getMessage(), "status" => $e->getCode()]);
      return [];
    }
  }

  public function getAll($query = [])
  {
    $response = $this->http->get(url: '/class-schedule/sort', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSingle($id)
  {
    $query = ['_id' => $id];
    $response = $this->http->get(url: '/class-schedule', query: $query);
    $data = json_decode($response?->body());
    $data = collect($data?->data ?? []);
    return $data->count() > 0 ? $data->first() : null;
  }

  public function getByClassroomId($id)
  {
    $query = ['classroom_id' => $id];
    $response = $this->http->get(url: '/class-schedule', query: $query);
    $data = json_decode($response?->body());
    $data = collect($data?->data ?? []);
    return $data;
  }

  public function getCalendarByRoles($query = [])
  {
    $user = Auth::user();
    $filter = ['branch_code' => $user->branch_code];
    $filter = array_merge($filter, $query);
    if (UserRole::isMentor()) {
      $filter['teacher_id'] = $user->id;
    }
    return $this->getCalendar($filter);
  }

  public function getCalendar($query = [])
  {
    $response = $this->http->get(url: '/class-schedule/calendar', query: $query);
    $data = json_decode($response->body());
    $data = collect($data?->data ?? []);
    return $data;
  }

  public function getScheduleWithStudent(string $scheduleId)
  {
    $url = "/class-schedule/with-student/$scheduleId";
    $response = $this->http->get(url: $url);
    $data = json_decode($response->body());
    return $data?->data ?? null;
  }

  public function createMany($schedules): Response
  {
    $schedules = collect($schedules)->map(
      function ($s) {
        $payload = collect($s)
          ->only($this->getFields())
          ->toArray();
        if (array_key_exists('start_date', $payload)) {
          $payload['start_date'] = $this->getTime($payload['start_date']);
        }
        if (array_key_exists('end_date', $payload)) {
          $payload['end_date'] = $this->getTime($payload['end_date']);
        }
        return $payload;
      }
    )
      ->toArray();

    return $this->http->post(url: "/class-schedule/many", data: [
      'schedules' => $schedules,
    ]);
  }

  public function delete(string $id): Response
  {
    return $this->http->delete(url: "/class-schedule/$id");
  }

  public function create($payload): Response
  {
    $payload = collect($payload)->only($this->getFields())->toArray();
    if (array_key_exists('start_date', $payload)) {
      $payload['start_date'] = $this->getTime($payload['start_date']);
    }
    if (array_key_exists('end_date', $payload)) {
      $payload['end_date'] = $this->getTime($payload['end_date']);
    }
    return $this->http->post(url: "/class-schedule", data: $payload);
  }

  public function update($id, $payload): Response
  {
    $payload = collect($payload)->only($this->getFields())->toArray();
    if (array_key_exists('start_date', $payload)) {
      $payload['start_date'] = $this->getTime($payload['start_date']);
    }
    if (array_key_exists('end_date', $payload)) {
      $payload['end_date'] = $this->getTime($payload['end_date']);
    }
    return $this->http->post(url: "/class-schedule/$id", data: $payload);
  }

  public function getFields()
  {
    return [
      "title",
      "start_date",
      "end_date",
      "teacher_id",
      "classroom_id",
      "topics",
      'material_id',
      'program',
      'is_post_test',
      'is_pre_test',
    ];
  }

  private function getTime($time)
  {
    return (new Carbon($time))
      ->setTimezone(config('app.timezone'))
      ->format('Y-m-d H:i:s');
  }
}

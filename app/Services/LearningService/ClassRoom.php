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

class ClassRoom extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getByRoles($query = [])
  {
    $user = Auth::user();
    $filter = ['branch_code' => $user?->branch_code ?? ''];
    $filter = array_merge($filter, $query);
    $userRoles = $user->roles ?? [];

    if (UserRole::isMentor()) {
      unset($query['branch_code']);
      $query = array_merge($query, ['teacher_id' => Auth::id()]);
      $data = collect($this->getAll($query));
      return $data->values()->all();
    }

    $data = collect($this->getAll($query));
    return $data->values()->all();
  }

  public function getAll($query = [])
  {
    $response = $this->http->get(url: '/classroom', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSummary(array $query)
  {
    $user = Auth::user();
    $query['branch_code'] = $user?->branch_code ?? '';
    if (UserRole::isMentor()) {
      $query['teacher_id'] = $user->id;
      unset($query['branch_code']);
    }
    $response = $this->http->get(url: '/classroom/summary', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSingleSummary($id)
  {
    try {
      $user = Auth::user();
      $userACL = $user->resources ?? [];
      $canShowAllSchedule = in_array("office_v2.learning_classroom.show_all_schedule", $userACL);
      $isCentralUser = $user->branch_code === "PT0000";
      $query = !$isCentralUser ? ['branch_code' => $user?->branch_code ?? ''] : [];
      if (UserRole::isMentor() && !UserRole::isBranchAdmin()) {
        $query['teacher_id'] = $user->id;
        unset($query['branch_code']);
      }
      if ($canShowAllSchedule) {
        unset($query['teacher_id']);
        unset($query['branch_code']);
      }

      $response = $this->http->get(url: "/classroom/summary/$id", query: $query);
      $data = json_decode($response?->body());
      return $data?->data ?? null;
    } catch (\Exception $e) {
      Log::error($e->getMessage(), ['message' => $e->getMessage(), "status" => $e->getCode()]);
      return null;
    }

  }

  public function getSingle(string $id)
  {
    $query = ['_id' => $id];
    $response = $this->http->get(url: "/classroom", query: $query);
    $data = json_decode($response?->body());
    $data = collect($data?->data ?? []);
    return $data->count() > 0 ? $data->first() : null;
  }

  public function getByIds(array $ids)
  {
    $query = ['id' => $ids];
    $response = $this->http->get(url: "/classroom/by-ids", query: $query);
    $data = json_decode($response?->body());
    return collect($data?->data ?? []);
  }

  public function getClassMember(string $class_id)
  {
    $response = $this->http->get(url: "/class-member/" . $class_id);

    $data = json_decode($response?->body());
    $data = collect($data?->data ?? []);
    return $data->count() > 0 ? $data : null;
  }

  public function getByMultipleBranchCodes(string $branch_codes)
  {
    $query = ['branch_codes' => $branch_codes];
    $response = $this->http->get(url: "/classroom/by-branchs", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function create($payload): Response
  {
    $payload = array_merge(
      [
        "class_code" => date('Ymd'),
        "quota_filled" => $quotaFilled ?? 0,
        "year" => $year ?? Carbon::now()->year(),
        "branch_code" => Auth::user()?->branch_code,
      ],
      collect($payload)->only($this->getFields())->toArray()
    );
    return $this->http->post(url: "/classroom", data: $payload);
  }

  public function getSharedClassroomBySSOID(string $sso_id)
  {
    $response = $this->http->get('/shared-classroom/by-sso-id/' . $sso_id);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSharedClassroomByClassroomID(string $classroom_id)
  {
    $response = $this->http->get('/shared-classroom/by-classroom-id/' . $classroom_id);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSharedClassroomByClassroomIDs(array $classroom_ids)
  {
    $response = $this->http->get('/shared-classroom/by-classroom-ids/', ['classroom_id' => $classroom_ids]);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function createSharedClassroom(array $payload): Response
  {
    return $this->http->post(url: '/shared-classroom', data: $payload);
  }

  public function createSharedClassroomBulk(array $payload): Response
  {
    return $this->http->post(url: '/shared-classroom/bulk', data: $payload);
  }

  public function update(string $id, $payload): Response
  {
    $payload = collect($payload)
      ->filter()
      ->only($this->getFields())
      ->toArray();
    if(array_key_exists("is_online", $payload)) $payload["is_online"] = true;
    else $payload["is_online"] = false;
    return $this->http->post(url: "/classroom/$id", data: $payload);
  }

  public function delete(string $id): Response
  {
    return $this->http->delete("/classroom/$id");
  }

  public function getFields()
  {
    return [
      "title",
      "branch_code",
      "quota",
      "quota_filled",
      "description",
      "product_id",
      "class_code",
      "year",
      "status",
      "tags",
      "is_online"
    ];
  }
}

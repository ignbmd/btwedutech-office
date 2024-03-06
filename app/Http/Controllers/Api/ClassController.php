<?php

namespace App\Http\Controllers\Api;

use App\Helpers\RabbitMq;
use App\Helpers\UserRole;
use App\Http\Controllers\Controller;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response as HttpFoundationResponse;

class ClassController extends Controller
{

  private ClassRoom $classService;
  private Branch $branchService;
  private Schedule $scheduleService;

  public function __construct(ClassRoom $classService, Branch $branchService, Schedule $scheduleService)
  {
    $this->classService = $classService;
    $this->branchService = $branchService;
    $this->scheduleService = $scheduleService;
  }

  public function getAll(Request $request)
  {
    $query = array_merge($request->all(), ['branch_code' => Auth::user()?->branch_code]);
    $classes = $this->classService->getByRoles($query);

    // ? This is combine data with branch
    // $branchCodes = collect($classes)->map(fn ($c) => $c->branch_code)->toArray();
    // $branches = $this->branchService->getBranchs();
    // $branches = collect($branches)->filter(fn ($b) => in_array($b->code, $branchCodes));
    // $data = collect($classes)->map(fn ($c) => array_merge((array)$c, [
    //   'branch_name' => collect($branches)
    //     ->first(fn ($b) => $b->code == $c->branch_code)->name ?? '',
    // ]));

    // ? This is alternative
    $data = collect($classes)->map(fn ($c) => array_merge((array)$c, ['branch_name' => null]));

    return response()->json(['data' => $data]);
  }

  public function getSummary(Request $request)
  {
    $query = [];
    if ($request->year) $query['year'] = $request->year;
    $data = $this->classService->getSummary($query);
    return response()->json($data);
  }

  public function getSingle(string $id)
  {
    return $this->classService->getSingle($id);
  }

  public function getClassMember(string $class_id)
  {
    return $this->classService->getClassMember($class_id);
  }


  public function getByBranch(string $branch_code)
  {
    $query = ['branch_code' => $branch_code];
    $data = $this->classService->getAll($query);
    return response()->json(['data' => $data]);
  }

  public function getByMultipleBranchCodes(string $branch_codes)
  {
    $user = Auth::user();
    $userACL = $user->resources ?? [];
    $canShowAllClassroom = in_array("office_v2.learning_classroom.show_all_classroom", $userACL);
    if($canShowAllClassroom) $data = $this->classService->getAll(["branch_code" => "PT0000"]);
    else $data = $this->classService->getByMultipleBranchCodes($branch_codes);
    return response()->json(['data' => $data]);
  }

  public function getSharedClassroomBySSOID(string $sso_id)
  {
    $data = $this->classService->getSharedClassroomBySSOID($sso_id);
    return response()->json(['data' => $data]);
  }

  public function create(Request $request)
  {
    $this->validate($request, [
      'title' => 'required',
      'description' => 'nullable',
      'year' => 'required',
      'quota' => 'required',
      'quota_filled' => 'nullable',
      'product_id' => 'nullable',
      'status' => 'required|in:ONGOING,ENDED,NOT_ACTIVE',
      'branch_code' => UserRole::isAdmin() ? 'required' : 'nullable',
      'tags' => 'required',
      'is_online' => 'required'
    ]);
    $is_online = $request->has('is_online') && in_array($request->is_online, ["true", "on"]);
    $product_id = $request->has('product_id') && $request->product_id ? $request->product_id : "1";
    $payload = array_merge($request->all(), ['product_id' => $product_id, 'is_online' => $is_online]);
    $response = $this->classService->create($payload);
    $body = json_decode($response->body());

    if ($response->successful()) {
      // Send created classroom data from $body to message broker
      $brokerPayload = [
        "version" => 1,
        "data" => [
          "id" => $body->data->_id,
          "title" => $body->data->title,
          "branch_code" => $body->data->branch_code,
          "year" => $body->data->year,
          "quota" => $body->data->quota,
          "quota_filled" => $body->data->quota_filled,
          "tags" => $body->data->tags,
          "description" => $body->data->description,
          "status" => $body->data->status,
          "is_online" => $body->data->is_online,
          "product_id" => $body->data->product_id
        ]
      ];
      RabbitMq::send("classroom.created", json_encode($brokerPayload));
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Membuat kelas berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Membuat kelas gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($body);
  }

  public function update(Request $request, string $id)
  {
    $this->validate($request, [
      'title' => 'nullable',
      'description' => 'nullable',
      'year' => 'nullable',
      'quota' => 'nullable',
      'quota_filled' => 'nullable',
      'product_id' => 'nullable',
      'status' => 'nullable|in:ONGOING,ENDED,NOT_ACTIVE',
      'branch_code' => 'nullable',
      'tags' => 'nullable',
      'is_online' => 'required'
    ]);
    $is_online = $request->has('is_online') && in_array($request->is_online, ["true", "on"]);
    $product_id = $request->has('product_id') && $request->product_id ? $request->product_id : "1";
    $payload = array_merge($request->all(), ['product_id' => $product_id, 'is_online' => $is_online]);
    $response = $this->classService->update($id, $payload);
    $body = json_decode($response->body());
    if ($response->successful()) {
      // Send updated classroom data from $body to message broker
      $brokerPayload = [
        "version" => 1,
        "data" => [
          "id" => $id,
          "title" => $body->data->title,
          "branch_code" => $body->data->branch_code,
          "year" => $body->data->year,
          "quota" => $body->data->quota,
          "quota_filled" => $body->data->quota_filled,
          "tags" => $body->data->tags,
          "description" => $body->data->description,
          "status" => $body->data->status,
          "is_online" => $body->data->is_online,
          "product_id" => $body->data->product_id
        ]
      ];
      RabbitMq::send("classroom.updated", json_encode($brokerPayload));
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update kelas berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Update kelas gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($body);
  }

  public function delete(Request $request, string $id)
  {
    $response = $this->classService->delete($id);
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Hapus kelas berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Hapus kelas gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data);
  }

  public function getAvailableOnlineSchedules(Request $request, string $id)
  {
    $childClassroomId = $request->get("child_classroom_id");
    $childClassSchedules = collect($childClassroomId ? $this->scheduleService->getAll(["classroom_id" => $childClassroomId]) : []);
    $childSchedulesMeetingIds = count($childClassSchedules) > 0 ? $childClassSchedules->pluck("online_class_meeting.zoom_meeting_id")->all() : [];

    $parentClassSchedules = collect($this->scheduleService->getAll(["classroom_id" => $id]));
    $availableSchedules = collect($parentClassSchedules ?? [])->filter(function($item, $key) use ($childSchedulesMeetingIds) {
      return property_exists($item, "online_class_meeting")
        && $item?->online_class_meeting?->zoom_meeting_status === "WAITING"
        && !in_array($item?->online_class_meeting?->zoom_meeting_id, $childSchedulesMeetingIds);
    })->values()->toArray();
    return response()->json(['status' => true, 'data' => $availableSchedules, 'message' => 'Get available online classrooms'], 200);
  }
}

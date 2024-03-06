<?php

namespace App\Http\Controllers\Api\OnlineClass;

use App\Http\Controllers\Controller;
use App\Services\OnlineClassService\OnlineAttendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
  private OnlineAttendance $onlineAttendanceService;
  public function __construct(OnlineAttendance $onlineAttendanceService)
  {
    $this->onlineAttendanceService = $onlineAttendanceService;
  }

  public function index(string $schedule_id)
  {
    $response = $this->onlineAttendanceService->getScheduleAttendance($schedule_id);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }

  public function upsert(Request $request, string $schedule_id)
  {
    $attendances = collect($request->get("attendances"))->map(function($value) {
      if($value["add_attendance"]) $value["updated_by"] = auth()->user()->name;
      else $value["updated_by"] = $value["updated_by"] ? $value["updated_by"] : auth()->user()->name;
      return $value;
    })->toArray();
    $response = $this->onlineAttendanceService->updateScheduleAttendance($schedule_id, $attendances);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }
}

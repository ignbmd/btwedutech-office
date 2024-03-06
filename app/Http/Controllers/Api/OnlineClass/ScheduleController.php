<?php

namespace App\Http\Controllers\Api\OnlineClass;

use App\Http\Controllers\Controller;
use App\Services\OnlineClassService\OnlineSchedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
  private OnlineSchedule $onlineScheduleService;
  public function __construct(OnlineSchedule $onlineScheduleService)
  {
    $this->onlineScheduleService = $onlineScheduleService;
  }

  public function index(string $classroom_id)
  {
    $response = $this->onlineScheduleService->getByClassroomIDV2($classroom_id);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }

  public function getById(string $schedule_id)
  {
    $response = $this->onlineScheduleService->getByScheduleID($schedule_id);
    $body = json_decode($response?->body());
    $status = $response?->status();
    return response()->json($body, $status);
  }
}

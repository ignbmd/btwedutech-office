<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LearningService\Presence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PresenceController extends Controller
{

  private Presence $service;

  public function __construct(Presence $presenceService)
  {
    $this->service = $presenceService;
  }

  public function create(Request $request)
  {
    $this->validate($request, [
      "classroom_id" => 'required',
      "class_schedule_id" => 'required',
      "comment" => 'nullable',
      "logs" => 'required',
    ]);
    $response = $this->service->create($request->all());
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Membuat kehadiran berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Membuat kehadiran gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data);
  }

  public function update(Request $request, string $presenceId)
  {
    $this->validate($request, [
      "classroom_id" => 'required',
      "class_schedule_id" => 'required',
      "comment" => 'nullable',
      "logs" => 'required',
    ]);
    $response = $this->service->update($presenceId, $request->all());
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update kehadiran berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Update kehadiran gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data);
  }
}

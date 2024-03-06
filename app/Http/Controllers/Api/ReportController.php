<?php

namespace App\Http\Controllers\Api;

use App\Helpers\S3;
use App\Http\Controllers\Controller;
use App\Services\LearningService\Report;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{

  private Report $service;

  public function __construct(Report $reportService)
  {
    $this->service = $reportService;
  }

  public function getSingle(string $id)
  {
    return $this->service->getSingle($id);
  }

  public function create(Request $request)
  {
    $this->validate($request, [
      'class_schedule_id' => 'required',
      'classroom_id' => 'required',
      'title' => 'required',
      'description' => 'nullable',
      // 'files' => 'required',
      // 'files.*' => 'file',
    ]);
    $response = $this->service->create($request->all(), $request->file('files'));
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Membuat laporan berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Membuat laporan gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data);
  }

  public function update(Request $request, string $id)
  {
    try {
      $this->validate($request, [
        'class_schedule_id' => 'required',
        'classroom_id' => 'required',
        'title' => 'required',
        'description' => 'nullable',
      ]);
      $response = $this->service->update($id, $request->all(), $request->file('files'));
      $data = json_decode($response->body());
      if (!$response->successful()) {
        throw new Exception('Update laporan gagal');
      }
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update laporan berhasil'
        ]
      );
      return response()->json($data);
    } catch (\Aws\Exception\CouldNotCreateChecksumException $e) {
      return api()
        ->status(Response::HTTP_UNPROCESSABLE_ENTITY)
        ->message('Ada File yang bermasalah mohon ganti file anda');
    } catch (\Exception $e) {
      return api()
        ->status(Response::HTTP_UNPROCESSABLE_ENTITY)
        ->message('Update laporan gagal. coba lagi nanti');
    }
  }
}

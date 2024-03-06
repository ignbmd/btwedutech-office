<?php

namespace App\Http\Controllers\Api;

use App\Helpers\S3;
use App\Helpers\UserRole;
use App\Http\Controllers\Controller;
use App\Services\StudyMaterialService\Material;
use App\Services\LearningService\Material as LearningMaterial;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class MaterialController extends Controller
{

  private Material $materialService;
  private LearningMaterial $learningMaterialService;

  public function __construct(Material $materialService, LearningMaterial $learningMaterialService)
  {
    $this->materialService = $materialService;
    $this->learningMaterialService = $learningMaterialService;
  }

  public function getAll(Request $request)
  {
    $query = ['program' => $request->get('program', null)];
    $data = $this->materialService->getAll($query);
    return response()->json($data);
  }

  public function getAllLearningMaterial(Request $request)
  {
    $data = $this->learningMaterialService->getByRoles($request->all());
    return response()->json($data);
  }
  public function getSingleLearningMaterial($materialId)
  {
    $data = $this->learningMaterialService->getSingle($materialId);
    return response()->json($data);
  }

  public function deleteLearningMaterial(Request $request, $materialId)
  {
    $response = $this->learningMaterialService->delete($materialId);
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Hapus materi berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Hapus materi gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data);
  }

  public function createLearningMaterial(Request $request)
  {
    try {
      $this->validate($request, [
        'title' => 'nullable',
        'sso_id' => 'nullable',
        'branch_code' => 'nullable',
        'status' => 'nullable',
        'attachments' => 'nullable|array',
        // 'files' => 'nullable',
        // 'files.*' => 'file',
      ]);
      $response = $this->learningMaterialService->create($request->all(), $request->file('files'));
      $data = json_decode($response->body());
      if (!$response->successful()) {
        throw new Exception('Update materi gagal');
      }
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Membuat materi berhasil'
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
        ->message('Membuat materi gagal. coba lagi nanti');
    }
  }

  public function updateLearningMaterial(Request $request, string $materialId)
  {
    try {
      $this->validate($request, [
        'title' => 'nullable',
        'sso_id' => 'nullable',
        'branch_code' => 'nullable',
        'status' => 'nullable',
        'attachments' => 'nullable|array',
        // 'files' => 'nullable',
        // 'files.*' => 'file',
      ]);
      $response = $this->learningMaterialService->update($materialId, $request->all(), $request->file('files'));
      $data = json_decode($response->body());
      if (!$response->successful()) {
        throw new Exception('Update materi gagal');
      }
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update materi berhasil'
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
        ->message('Update materi gagal. coba lagi nanti');
    }
  }
}

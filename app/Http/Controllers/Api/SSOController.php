<?php

namespace App\Http\Controllers\Api;

use App\Helpers\S3;
use Illuminate\Http\Request;
use App\Services\SSOService\SSO;
use App\Services\LearningService\User;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class SSOController extends Controller
{

  private SSO $service;
  private User $learningUserService;

  public function __construct(SSO $ssoService, User $learningUserService)
  {
    $this->service = $ssoService;
    $this->learningUserService = $learningUserService;
  }

  public function getAllUsers()
  {
    $data = $this->service->getAllUsers();
    return response()->json(['data' => $data]);
  }

  public function getBranchUsers($code)
  {
    $data = $this->service->getUserByBranch($code);
    return response()->json(['data' => $data]);
  }

  public function getSingleUser($ssoId)
  {
    $data = $this->service->getUser($ssoId);
    return response()->json(['data' => $data?->users ?? null]);
  }

  public function createUsers(Request $request)
  {
    try {
      $payload = json_decode($request->users);

      foreach ($payload as $key => $value) {
        $profileImg = $request->file('profile_image-' . $key);
        $ktpImg = $request->file('ktp_image-' . $key);
        $npwpImg = $request->file('npwp_image-' . $key);

        if ($profileImg) {
          $targetProfile = "/uploads/sso/profile";
          $profileImgUrl = S3::storeOriginal($targetProfile, $profileImg);
          $payload[$key]->profile_image = $profileImgUrl;
        }

        if ($ktpImg) {
          $targetKTP = "/uploads/sso/ktp";
          $ktpImgUrl = S3::storeOriginal($targetKTP, $ktpImg);
          $payload[$key]->ktp_image = $ktpImgUrl;
        }

        if ($npwpImg) {
          $targetNPWP = "/uploads/sso/npwp";
          $npwpImgUrl = S3::storeOriginal($targetNPWP, $npwpImg);
          $payload[$key]->npwp_image = $npwpImgUrl;
        }
      }

      $response = $this->service->createMultipleUsers($payload);
      if ($response->status == 200) {
        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Berhasil!',
            'type' => 'success',
            'message' => 'Pendaftaran data cabang & pengguna cabang berhasil'
          ]
        );
        return response()->json(['data' => $response?->data]);
      } else {
        Log::error("An error occured when trying to create branch user", ["payload" => $payload, "response" => $response, "status" => (int)$response->status]);
        return response()->json(['data' => $response], (int)$response->status);
      }
    } catch (\Aws\Exception\CouldNotCreateChecksumException $e) {
      return api()
        ->status(Response::HTTP_UNPROCESSABLE_ENTITY)
        ->message('Ada File yang bermasalah mohon ganti file anda');
    }
  }

  public function createUser(Request $request)
  {
    try {
      $user = [
        "name" => $request->name,
        "email" => $request->email,
        "phone" => $request->phone,
        "nik" => $request->nik,
        "gender" => (int)$request->gender,
        "address" => $request->address,
        "branch_code" => $request->branch_code,
        "roles" => json_decode($request->roles),
      ];

      $profileImg = $request->file('profile');
      $ktpImg = $request->file('ktp');
      $npwpImg = $request->file('npwp');

      if ($profileImg) {
        $targetProfile = "/uploads/sso/profile";
        $profileImgUrl = S3::storeOriginal($targetProfile, $profileImg);
        $user['profile_image'] = $profileImgUrl;
      }

      if ($ktpImg) {
        $targetKTP = "/uploads/sso/ktp";
        $ktpImgUrl = S3::storeOriginal($targetKTP, $ktpImg);
        $user['ktp_image'] = $ktpImgUrl;
      }

      if ($npwpImg) {
        $targetNPWP = "/uploads/sso/npwp";
        $npwpImgUrl = S3::storeOriginal($targetNPWP, $npwpImg);
        $user['npwp_image'] = $npwpImgUrl;
      }

      $response = $this->service->createMultipleUsers([$user]);
      if ($response->status == 200) {
        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Berhasil!',
            'type' => 'success',
            'message' => 'Pendaftaran pengguna cabang berhasil'
          ]
        );
        return response()->json(['data' => $response?->data]);
      } else {
        Log::error("An error occured when trying to create branch user", ["payload" => [$user], "response" => $response, "status" => (int)$response->status]);
        return response()->json(['data' => $response], (int)$response->status);
      }
    } catch (\Aws\Exception\CouldNotCreateChecksumException $e) {
      return api()
        ->status(Response::HTTP_UNPROCESSABLE_ENTITY)
        ->message('Ada File yang bermasalah mohon ganti file anda');
    }
  }

  public function updateUser(Request $request, $ssoId)
  {
    try {
      $user = $this->service->getUser($ssoId)->users ?? null;
      if (!$user) {
        Session::flash('flash-message', [
          'title' => 'Terjadi kesalahan',
          'type' => 'error',
          'message' => 'Silakan coba lagi'
        ]);
        return response()->json(['status' => 500, 'message' => 'Silakan coba lagi']);
      }

      $uniqueUserRoles = array_unique($user->roles);
      $payload = [
        "name" => $request->name,
        "email" => $request->email,
        "phone" => $request->phone,
        "nik" => $request->nik,
        "gender" => (int)$request->gender,
        "address" => $request->address,
        "branch_code" => $request->branch_code,
        "roles" => $uniqueUserRoles,
        "profile_image" => $user->profile_image,
        "ktp_image" => $user->ktp_image,
        "npwp_image" => $user->npwp_image,
        "bio" => "",
        "sso_id" => $user->id
      ];

      $userRolesCollection = collect($uniqueUserRoles);
      $isMentorUser = $userRolesCollection->contains(function ($role) {
        return strpos($role, "mentor") !== false;
      });
      if ($isMentorUser) {
        $learningUserData = collect($this->learningUserService->getUser(["sso_id" => $user->id]))->first();
        $payload["bio"] = isset($learningUserData) ? $learningUserData->bio : "";
      }

      $profileImg = $request->file('profile');
      $ktpImg = $request->file('ktp');
      $npwpImg = $request->file('npwp');

      if ($profileImg) {
        $targetProfile = "/uploads/sso/profile";
        $profileImgUrl = S3::storeOriginal($targetProfile, $profileImg);
        $payload['profile_image'] = $profileImgUrl;
      }

      if ($ktpImg) {
        $targetKTP = "/uploads/sso/ktp";
        $ktpImgUrl = S3::storeOriginal($targetKTP, $ktpImg);
        $payload['ktp_image'] = $ktpImgUrl;
      }

      if ($npwpImg) {
        $targetNPWP = "/uploads/sso/npwp";
        $npwpImgUrl = S3::storeOriginal($targetNPWP, $npwpImg);
        $payload['npwp_image'] = $npwpImgUrl;
      }

      $response = $this->service->update($ssoId, $payload);
      if ($response->status == 200) {
        Session::flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update pengguna cabang berhasil'
        ]);
      }
      return response()->json(['data' => $response]);
    } catch (\Aws\Exception\CouldNotCreateChecksumException $e) {
      return api()
        ->status(Response::HTTP_UNPROCESSABLE_ENTITY)
        ->message('Ada File yang bermasalah mohon ganti file anda');
    }
  }
  public function deleteUser($id)
  {
    try {
      $data = $this->service->deleteUser($id);
      if (!$data->success) throw new Exception("Terjadi kesalahan, silakan coba lagi nanti");
      return response()->json(['data' => $data]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }
  public function deleteUserRoles($id)
  {
    try {
      $data = $this->service->deleteUserRole($id);
      if (!$data->success) throw new Exception("Terjadi kesalahan, silakan coba lagi nanti");
      return response()->json(['data' => $data]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }
  public function deleteApplications($id)
  {
    try {
      $data = $this->service->deleteApplication($id);
      if (!$data->success) throw new Exception("Terjadi kesalahan, silahkan coba lagi nanti");
      return response()->json(['data' => $data]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }

  public function deleteACL($id)
  {
    try {
      $data = $this->service->deleteACL($id);
      if (!$data->success) throw new Exception("Terjadi kesalahan, silahkan coba lagi nanti");
      // dd($data);
      return response()->json(['data' => $data]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }
  public function deleteAdditionalControl($id)
  {
    try {
      $data = $this->service->deleteAdditionalControl($id);
      if (!$data->success) throw new Exception("Terjadi kesalahan, silahkan coba lagi nanti");
      return response()->json(['data' => $data]);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }
}

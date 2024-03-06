<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Breadcrumb;
use App\Helpers\S3;
use App\Services\SSOService\SSO;
use App\Services\LearningService\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\UploadedFile;

class MentorController extends Controller
{
  private SSO $sso;
  private User $learningUser;

  public function __construct(SSO $sso, User $learningUser)
  {
    Breadcrumb::setFirstBreadcrumb('Mentor', 'mentor');

    $this->sso = $sso;
    $this->learningUser = $learningUser;
  }

  public function index()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    return view('pages/mentor/index', compact('breadcrumbs'));
  }

  public function create()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Mentor Baru']];
    $is_pusat_user = auth()->user()->branch_code === null || auth()->user()->branch_code === "PT0000" ? true : false;
    return view('pages/mentor/create', compact('breadcrumbs', 'is_pusat_user'));
  }

  public function createLegacy()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Mentor Lama']];
    return view('pages/mentor/create-legacy', compact('breadcrumbs'));
  }

  public function storeLegacy(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'sso_id' => 'required|array',
      'branch_code' => 'required',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'status' => 422,
        'errors' => $validator->errors()
      ], 422);
    }

    $response = $this->sso->addLegacyMentorsRole(['sso_id' => $request->get('sso_id'), 'branch_code' => $request->get('branch_code')]);
    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Tambah mentor berhasil'
      ]);
    } else {
      $request->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses tambah mentor gagal, silakan coba lagi nanti'
      ]);
    }
    return redirect('/mentor');
  }

  public function store(Request $request)
  {
    try {
      $is_pusat_user = auth()->user()->branch_code === null || auth()->user()->branch_code === "PT0000" ? true : false;
      $roles = array_unique(array_merge($request->roles ?? [], ["mentor"]));
      $payload = [
        "name" => $request->name,
        "email" => $request->email,
        "phone" => $request->phone,
        "nik" => $request->nik,
        "gender" => (int)$request->gender,
        "address" => $request->address,
        "roles" => $roles
      ];

      $payload["bio"] = $request->bio ?? '';
      $payload["branch_code"] = $is_pusat_user ? $request->get('branch_code') : auth()->user()->branch_code;

      $profile_image = $request->file('profile_image');
      $ktp_image = $request->file('ktp_image');
      $npwp_image = $request->file('npwp_image');

      if ($profile_image) {
        $isImageFile = $this->isImageFile($profile_image);
        if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => 'Format file Foto Profil tidak valid, masukkan file dengan format yang benar']);

        $targetProfile = "/uploads/sso/profile";
        $profileImgUrl = S3::storeOriginal($targetProfile, $profile_image);
        $payload['profile_image'] = $profileImgUrl;
      }

      if ($ktp_image) {
        $isImageFile = $this->isImageFile($ktp_image);
        if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => 'Format file Foto KTP tidak valid, masukkan file dengan format yang benar']);

        $targetKTP = "/uploads/sso/ktp";
        $ktpImgUrl = S3::storeOriginal($targetKTP, $ktp_image);
        $payload['ktp_image'] = $ktpImgUrl;
      }

      if ($npwp_image) {
        $isImageFile = $this->isImageFile($npwp_image);
        if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => 'Format file Foto NPWP tidak valid, masukkan file dengan format yang benar']);

        $targetNPWP = "/uploads/sso/npwp";
        $npwpImgUrl = S3::storeOriginal($targetNPWP, $npwp_image);
        $payload['npwp_image'] = $npwpImgUrl;
      }
      $response = $this->sso->createMultipleUsers([$payload]);

      if ($response->status == 200) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Pendaftaran mentor berhasil'
        ]);
        return redirect('/mentor');
      }

      if ($response->status == 422) {
        $request->session()->flash('errors', $response->errors);
        return redirect()->back();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Pendaftaran mentor gagal'
      ]);
      return redirect('/mentor');
    }
  }

  public function edit($ssoId)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Mentor']];
    $is_pusat_user = auth()->user()->branch_code === null || auth()->user()->branch_code === "PT0000" ? true : false;
    $mentor = $this->sso->getUser($ssoId)->users;
    $mentorBio = $this->learningUser->getBio(['sso_id' => $mentor->id]);
    return view('pages/mentor/edit', compact('breadcrumbs', 'is_pusat_user', 'mentor', 'mentorBio'));
  }

  public function update(Request $request, $ssoId)
  {
    $user = $this->sso->getUser($ssoId)->users ?? null;
    if (!$user) {
      return back()->with('flash-message', ['title' => 'Terjadi Kesalahan', 'type' => 'error', 'message' => 'Silakan coba lagi']);
    }
    try {
      $is_pusat_user = auth()->user()->branch_code === null || auth()->user()->branch_code === "PT0000" ? true : false;
      $roles = array_unique(array_merge($request->roles ?? [], ["mentor"]));

      $payload = [
        "name" => $request->name,
        "email" => $request->email,
        "phone" => $request->phone,
        "nik" => $request->nik,
        "gender" => (int)$request->gender,
        "address" => $request->address,
        "roles" => $roles,
        "profile_image" => $user->profile_image,
        "ktp_image" => $user->ktp_image,
        "npwp_image" => $user->npwp_image
      ];

      $payload["bio"] = $request->bio ?? '';
      $payload["branch_code"] = $is_pusat_user ? $request->get('branch_code') : auth()->user()->branch_code;
      $payload["sso_id"] = $user->id;

      $profile_image = $request->file('profile_image');
      $ktp_image = $request->file('ktp_image');
      $npwp_image = $request->file('npwp_image');

      if ($profile_image) {
        $isImageFile = $this->isImageFile($profile_image);
        if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => 'Format file Foto Profil tidak valid, masukkan file dengan format yang benar']);

        $targetProfile = "/uploads/sso/profile";
        $profileImgUrl = S3::storeOriginal($targetProfile, $profile_image);
        $payload['profile_image'] = $profileImgUrl;
      }

      if ($ktp_image) {
        $isImageFile = $this->isImageFile($ktp_image);
        if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => 'Format file Foto KTP tidak valid, masukkan file dengan format yang benar']);

        $targetKTP = "/uploads/sso/ktp";
        $ktpImgUrl = S3::storeOriginal($targetKTP, $ktp_image);
        $payload['ktp_image'] = $ktpImgUrl;
      }

      if ($npwp_image) {
        $isImageFile = $this->isImageFile($npwp_image);
        if (!$isImageFile) return back()->with('flash-message', ['title' => 'Peringatan', 'type' => 'warning', 'message' => 'Format file Foto NPWP tidak valid, masukkan file dengan format yang benar']);

        $targetNPWP = "/uploads/sso/npwp";
        $npwpImgUrl = S3::storeOriginal($targetNPWP, $npwp_image);
        $payload['npwp_image'] = $npwpImgUrl;
      }

      $response = $this->sso->update($ssoId, $payload);

      if ($response->status == 200) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Ubah data mentor berhasil'
        ]);
        return redirect('/mentor');
      }

      if ($response->status == 422) {
        $request->session()->flash('errors', $response->errors);
        return redirect()->back();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Pendaftaran mentor gagal'
      ]);
      return redirect('/mentor');
    }
  }

  private function isImageFile(UploadedFile $file)
  {
    $fileExtension = $file->extension();
    $fileMimeType = $file->getMimeType();

    $validImageExtensions = ["jpg", "jpeg", "png", "gif"];
    $validImageMimeType = ["image/jpeg", "image/png", "image/gif"];

    return in_array($fileExtension, $validImageExtensions) && in_array($fileMimeType, $validImageMimeType);
  }
}

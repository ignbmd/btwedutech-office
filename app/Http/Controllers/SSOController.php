<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\Auth as AuthHelper;
use App\Services\SSOService\SSO;
use App\Services\BranchService\Branch;
use BTW\LaravelSSO\SSOAuthenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class SSOController extends Controller
{
  private SSO $service;
  private Branch $branchService;

  public function __construct(SSO $ssoService, Branch $branchService)
  {
    $this->service = $ssoService;
    $this->branchService = $branchService;
    Breadcrumb::setFirstBreadcrumb('Admin SSO', '');
  }

  public function showResetPassword()
  {
    if (!Auth::user()->is_default_password && Auth::user()->is_password_changed) return redirect('/');
    return view('pages.sso.reset-password');
  }

  public function updatePassword(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'reset_password_new' => 'required',
      'reset_password_confirm' => 'required|same:reset_password_new',
      'g-recaptcha-response' => ['required']
    ], [
      'reset_password_new.required' => 'Wajib diisi',
      'reset_password_confirm.required' => 'Wajib diisi',
      'reset_password_confirm.same' => 'Password tidak sesuai'
    ]);

    if ($validator->fails()) {
      return back()->withErrors($validator);
    }
    $user = Auth::user();
    $isPasswordMatch = $this->service->checkPasswordMatch(["id" => $user->id, "password" => $request->reset_password_new]);
    if (!is_bool($isPasswordMatch)) {
      return back()->with('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Sistem sedang mengalami gangguan, silakan coba lagi nanti'
      ]);
    }
    if ($isPasswordMatch) {
      $validator->errors()->add(
        'reset_password_new',
        'Maaf, password yang diinputkan sudah pernah digunakan sebelumnya. Silakan inputkan password yang berbeda untuk keamanan akun Anda.'
      );
      return back()->withErrors($validator);
    }
    $body = [
      "email" => $user->email,
      "password" => $request->reset_password_new,
      "password_confirmation" => $request->reset_password_confirm,
      "captcha_code" => $request["g-recaptcha-response"]
    ];

    $data = $this->service->setNewPassword($body);
    if ($data->status() === 200) {
      return redirect('/home');
    }

    if ($data->status() === 401) $validator->getMessageBag()->add('g-recaptcha-response', 'Silakan refresh halaman dan coba lagi');
    else $validator->errors()->add('form', 'Terjadi Kesalahan');
    return back()->withErrors($validator);
  }

  //Users
  public function indexUsers(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $usersResponse = $this->service->getUsers($request->all());
    $users = $usersResponse?->data ?? [];
    return view('pages.admin-sso.user.index', compact('breadcrumbs', 'users'));
  }

  public function createUsers()
  {
    $breadcrumbs = [['name' => 'Users', 'link' => '/admin-sso/users'], ['name' => 'Add Users']];
    return view('pages.admin-sso.user.create', compact('breadcrumbs'));
  }

  public function storeUsers(Request $request)
  {
    try {
      $validator = Validator::make($request->all(), [
        'name' => 'required',
        'email' => 'required',
        'base_role' => 'required',
      ], [
        'name.required' => 'Harus Diisi',
        'email.required' => 'Harus Diisi',
        'base_role.required' => 'Harus Diisi'
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'name' => $request->name,
        'email' => $request->email,
        'password' => $request->password,
        'base_role' => $request->base_role
      ];

      $response = $this->service->storeUsers($payload);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data User berhasil ditambahkan'
        ]);

        return redirect('/admin-sso/users');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Gagal menambahkan data User'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses tambah data User gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/users');
    }
  }

  public function editUsersForm($id)
  {
    $breadcrumbs = [['name' => 'Users', 'link' => '/admin-sso/users'], ['name' => 'Edit Users']];
    $usersResponse = $this->service->getUserById($id);
    $usersData = $usersResponse?->data ?? [];
    return view('pages.admin-sso.user.edit', compact('breadcrumbs', 'usersData'));
  }

  public function updateUsersLogic(Request $request, $id)
  {
    try {
      $validator = Validator::make($request->all(), [
        'name' => 'required',
        'email' => 'required',
        'base_role' => 'required',
      ], [
        'name.required' => 'Harus Diisi',
        'email.required' => 'Harus Diisi',
        'base_role.required' => 'Harus Diisi'
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'name' => $request->name,
        'email' => $request->email,
        'password' => $request->password === null ? '' : $request->password,
        'base_role' => $request->base_role

      ];


      $response = $this->service->updateUsers($id, $payload);


      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data User berhasil diupdate'
        ]);

        return redirect('/admin-sso/users');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Gagal mengupdate data User'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses update data User gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/users');
    }
  }

  // Application
  public function indexApplications(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $applicationResponse = $this->service->getApplication($request->all());
    $application = $applicationResponse?->data ?? [];
    return view('pages.admin-sso.applications.index', compact('breadcrumbs', 'application'));
  }

  public function createApplicationsForms()
  {
    $breadcrumbs = [['name' => 'Applications', 'link' => '/admin-sso/applications'], ['name' => 'Add Applications']];
    return view('pages.admin-sso.applications.create', compact('breadcrumbs'));
  }
  public function storeApplicationsLogic(Request $request)
  {
    try {
      $validator = Validator::make($request->all(), [
        'application_name' => 'required',
        'application_url' => 'required'
      ], [
        'application_name.required' => 'Harus Diisi',
        'application_url.required' => 'Harus Diisi'
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'application_name' => $request->application_name,
        'application_url' => $request->application_url
      ];

      $response = $this->service->createApplication($payload);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data Application berhasil ditambahkan'
        ]);

        return redirect('/admin-sso/applications');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Gagal menambahkan data application'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses tambah data application gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/applications');
    }
  }

  public function editApplicationsForm($id)
  {
    $breadcrumbs = [['name' => 'Applications', 'link' => '/admin-sso/applications'], ['name' => 'Add Applications']];
    $applicationResponse = $this->service->getApplicationById($id);
    $application = $applicationResponse?->data ?? [];
    return view('pages.admin-sso.applications.edit', compact('breadcrumbs', 'application'));
  }

  public function updateApplicationLogic(Request $request, $id)
  {
    try {
      $validator = Validator::make($request->all(), [
        'application_name' => 'required',
        'application_url' => 'required'
      ], [
        'application_name.required' => 'Harus Diisi',
        'application_url.required' => 'Harus Diisi'
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'application_name' => $request->application_name,
        'application_url' => $request->application_url
      ];

      $response = $this->service->updateApplications($id, $payload);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data application berhasil diedit'
        ]);

        return redirect('/admin-sso/applications');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Gagal mengedit data application'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses mengedit data application gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/applications');
    }
  }

  // User Role
  public function indexUserRole(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $userRoleResponse = $this->service->getUserRole($request->all());
    $userRole = $userRoleResponse?->data ?? [];
    return view('pages.admin-sso.user-role.index', compact('breadcrumbs', 'userRole'));
  }

  public function createUserRoleForms(Request $request)
  {
    $breadcrumbs = [['name' => 'User Role', 'link' => '/admin-sso/user-role'], ['name' => 'Add User Role']];
    $applicationResponse = $this->service->getApplication($request->all());
    $apps = $applicationResponse?->data ?? [];
    $usersResponse = $this->service->getUsers($request->all());
    $user = $usersResponse?->data ?? [];
    return view('pages.admin-sso.user-role.create', compact('breadcrumbs', 'apps', 'user'));
  }
  public function createUserRoleLogic(Request $request)
  {
    try {
      $validator = Validator::make($request->all(), [
        'application_name' => 'required',
        'user' => 'required',
        'role_name' => 'required',
      ], [
        'application_name.required' => 'Harus Diisi',
        'user.required' => 'Harus Diisi',
        'role_name.required' => 'Harus Diisi',
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'application_id' => $request->application_name,
        'user_id' => $request->user,
        'role_name' => $request->role_name,
      ];

      $response = $this->service->createUserRole($payload);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data user role berhasil ditambahkan'
        ]);

        return redirect('/admin-sso/user-role');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Gagal menambahkan data user role'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses tambah data user role gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/user-role');
    }
  }

  public function editUserRoleForms(Request $request, $id,)
  {
    $breadcrumbs = [['name' => 'User Role', 'link' => '/admin-sso/user-role'], ['name' => 'Edit User Role']];
    $userRoleResponse = $this->service->getUserRoleById($id);
    $userRoleData = $userRoleResponse?->data ?? [];
    $userRoleResponse = $this->service->getUserRole($request->all());
    $userRole = $userRoleResponse?->data ?? [];
    $applicationResponse = $this->service->getApplication();
    $application = $applicationResponse?->data ?? [];
    $usersResponse = $this->service->getUsers($request->all());
    $users = $usersResponse?->data ?? [];
    return view('pages.admin-sso.user-role.edit', compact('breadcrumbs', 'userRoleData', 'userRole', 'application', 'users'));
  }

  public function updateUserRoleLogic(Request $request, $id)
  {
    try {
      $validator = Validator::make($request->all(), [
        'application_name' => 'required',
        'user' => 'required',
        'role_name' => 'required',
      ], [
        'application_name.required' => 'Harus Diisi',
        'user.required' => 'Harus Diisi',
        'role_name.required' => 'Harus Diisi',
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'application_id' => $request->application_name,
        'user_id' => $request->user,
        'role_name' => $request->role_name,
      ];
      $response = $this->service->updateUserRole($id, $payload);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data user role berhasil diupdate'
        ]);

        return redirect('/admin-sso/user-role');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Gagal mengupdate data user role'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses update data user role  gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/user-role');
    }
  }

  // ACL
  public function indexACL(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $ACLResponse = $this->service->getACL($request->all());
    $ACL = $ACLResponse?->data ?? [];
    return view('pages.admin-sso.applications-control-list.index', compact('breadcrumbs', 'ACL'));
  }
  public function createACLForms(Request $request)
  {
    $breadcrumbs = [['name' => 'Applications Control List', 'link' => '/admin-sso/application-control-list'], ['name' => 'Add ACL']];
    $applicationResponse = $this->service->getApplication($request->all());
    $application = $applicationResponse?->data ?? [];
    return view('pages.admin-sso.applications-control-list.create', compact('breadcrumbs', 'application'));
  }

  public function storeACLLogic(Request $request)
  {
    try {
      $validator = Validator::make($request->all(), [
        'application_name' => 'required',
        'resource' => 'required',
        'default_role' => 'required'
      ], [
        'application_name.required' => 'Harus Diisi',
        'resource.required' => 'Harus Diisi',
        'default_role.required' => 'Harus Diisi'
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'application_id' => $request->application_name,
        'resource' => $request->resource,
        'default_role' => $request->default_role
      ];
      $response = $this->service->createACL($payload);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data ACL berhasil ditambahkan'
        ]);

        return redirect('/admin-sso/application-control-list');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data ACL Sudah Tersedia'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses tambah data ACL gagal' . $e->getMessage()
      ]);

      return redirect('/admin-sso/application-control-list');
    }
  }

  public function editACLForms(Request $request, $id)
  {
    $breadcrumbs = [['name' => 'ACL', 'link' => '/admin-sso/application-control-list'], ['name' => 'Edit ACL']];
    $ACLResponse = $this->service->getACLDataById($id);
    $ACLData = $ACLResponse?->data ?? [];
    $ACLResponse = $this->service->getApplicationForACL($request->all());
    $ACLDistinct = $ACLResponse?->data ?? [];
    return view('pages.admin-sso.applications-control-list.edit', compact('breadcrumbs', 'ACLData', 'ACLDistinct'));
  }

  public function updateACLLogic(Request $request, $id)
  {
    try {
      $validator = Validator::make($request->all(), [
        'application_name' => 'required',
        'resource' => 'required',
        'default_role' => 'required'
      ], [
        'application_name.required' => 'Harus Diisi',
        'resource.required' => 'Harus Diisi',
        'default_role.required' => 'Harus Diisi'
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'application_id' => $request->application_name,
        'resource' => $request->resource,
        'default_role' => $request->default_role
      ];
      $response = $this->service->updateACL($id, $payload);

      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data ACL berhasil diedit'
        ]);

        return redirect('/admin-sso/application-control-list');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data ACL Sudah Tersedia'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses edit data ACL gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/application-control-list');
    }
  }

  //Additional Control

  public function indexAdditionalControl(Request $request)
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
    $additionalControlResponse = $this->service->getAdditionalControl($request->all());
    $additional = $additionalControlResponse?->data ?? [];
    return view('pages.admin-sso.additional-control.index', compact('breadcrumbs', 'additional'));
  }

  public function createAdditionalControlForms(Request $request)
  {
    $breadcrumbs = [['name' => 'Additional Control', 'link' => '/admin-sso/additional-controls'], ['name' => 'Add Additional Control']];
    $userRoleResponse = $this->service->getUserRole($request->all());
    $userRole = $userRoleResponse?->data ?? [];
    $ACLResponse = $this->service->getACL($request->all());
    $ACL = $ACLResponse?->data ?? [];
    $ACLResponse = $this->service->getACLForAdditionalControlInCreate($request->all());
    $ACLDistinct = $ACLResponse->data ?? [];
    // dd($ACLDistinct);
    return view('pages.admin-sso.additional-control.create', compact('breadcrumbs', 'userRole', 'ACL', 'ACLDistinct'));
  }

  public function storeAdditionalControl(Request $request)
  {
    try {
      $validator = Validator::make($request->all(), [
        'username' => 'required',
        'acl' => 'required',
      ], [
        'username.required' => 'Harus Diisi',
        'acl.required' => 'Harus Diisi',
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'user_role_id' => $request->username,
        'resource' => $request->acl,
      ];
      $response = $this->service->storeAdditionalControl($payload);
      //  dd($response);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data Additional Control berhasil ditambahkan'
        ]);

        return redirect('/admin-sso/additional-controls');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data Additional Control Sudah Tersedia'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses tambah data Additional Control gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/additional-controls');
    }
  }

  public function editAdditionalControlForms(Request $request, $id)
  {
    $breadcrumbs = [['name' => 'Additional Control', 'link' => '/admin-sso/additional-controls'], ['name' => 'Edit Additional Control']];
    $additionalControlResponse = $this->service->getAdditionalControlById($id);
    $additionalControl = $additionalControlResponse?->data ?? [];
    $userResponseIndex = $this->service->getUserRole($request->all());
    $users = $userResponseIndex?->data ?? [];
    $ACLResponse = $this->service->getACLForAdditionalControlInCreate($request->all());
    $ACLDistinct = $ACLResponse->data ?? [];
    return view('pages.admin-sso.additional-control.edit', compact('breadcrumbs', 'additionalControl', 'ACLDistinct', 'users'));
  }

  public function updateAdditionalControl(Request $request, $id)
  {
    try {
      $validator = Validator::make($request->all(), [
        'username' => 'required',
        'acl' => 'required',
      ], [
        'username.required' => 'Harus Diisi',
        'acl.required' => 'Harus Diisi',
      ]);

      if ($validator->fails()) {
        return redirect()->back()->withInput()->withErrors($validator->errors());
      }

      $payload = [
        'user_role_id' => $request->username,
        'resource' => $request->acl,
      ];
      $response = $this->service->updateAdditionalControl($id, $payload);
      if ($response?->success == true) {
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Data Additional Control berhasil diedit'
        ]);

        return redirect('/admin-sso/additional-controls');
      } else {
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data Additional Control Sudah Tersedia'
        ]);

        return redirect()->back()->withInput();
      }
    } catch (\Exception $e) {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => 'Proses mengedit data Additional Control gagal: ' . $e->getMessage()
      ]);

      return redirect('/admin-sso/additional-controls');
    }
  }

  public function validateCredentialToken(Request $request)
  {
    $token = $request->has('token') ? $request->get('token') : null;
    if (!$token) {
      echo  "Token is not provided. redirecting to login page";
      sleep(2);

      return AuthHelper::redirectToAuthLandingPage();
    }

    $response = $this->service->getUserDataByCredentialToken($token);
    if ($response->failed()) {
      echo "Token is not valid";
      sleep(2);

      return AuthHelper::redirectToAuthLandingPage();
    }

    $body = $response->json();
    $user = new SSOAuthenticatable($body["user"]);

    Auth::login($user);
    $this->setBranchDetail($user);
    return redirect()->intended("/home");
  }

  private function setBranchDetail($user)
  {
    $branchCode = $user->branch_code;
    $hasMultipleBranchCode = strpos($branchCode, ',') !== false;

    if ($branchCode && $hasMultipleBranchCode) {
      $branchCodesArray = explode(',', $branchCode);

      $branchNames = [];
      $branchCodes = [];

      foreach ($branchCodesArray as $branchCode) {
        $branchDetail = $this->branchService->getBranchByCode($branchCode);
        $branchNames[] = $branchDetail->name;
        $branchCodes[] = $branchDetail->code;
      }

      $branchName = implode(', ', $branchNames);
      $branchCode = implode(', ', $branchCodes);

      Session::put(
        'branch',
        [
          'name' => $branchName,
          'code' => $branchCode,
        ]
      );
    }

    if ($branchCode && !$hasMultipleBranchCode) {
      $branchDetail = $this->branchService->getBranchByCode($branchCode);
      Session::put(
        'branch',
        [
          'name' => $branchDetail->name,
          'code' => $branchDetail->code,
        ]
      );
    }
  }
}

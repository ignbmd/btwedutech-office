<?php

namespace App\Services\SSOService;

use App\Services\Service;
use App\Services\ServiceContract;
use Illuminate\Support\Facades\Http;

class SSO extends Service implements ServiceContract
{

  protected function serviceAddress(): string
  {
    return config('services.btw.sso', '');
  }

  public function getAllUsers()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/users/data");

    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getUserByBranch(string $branchCode)
  {
    $query = [
      'branch_code' => $branchCode
    ];
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/all-branch-users", query: $query);

    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getAllMentor()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/all-mentor");

    $data = json_decode($response?->body());
    return $data?->mentors ?? null;
  }

  public function getLegacyMentor($query)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/legacy-mentor", query: $query);

    $data = json_decode($response?->body());
    return $data?->mentors ?? null;
  }

  public function getExcludedLegacyMentor($query)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/excluded-legacy-mentor", query: $query);
    $data = json_decode($response?->body());
    return $data?->mentors;
  }

  public function getMentorByBranchCode(string $branchCode)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/" . $branchCode . "/mentors");

    $data = json_decode($response?->body());
    return $data?->mentors ?? null;
  }

  public function getUser(string $ssoId)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/single-user/" . $ssoId);

    $data = json_decode($response?->body());
    return $data;
  }

  public function getUserByEmail(string $email)
  {
    $body = [
      "email" => $email
    ];
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: '/api/get-user-email', data: $body);

    $data = json_decode($response?->body());
    return $data;
  }

  public function getUserByIds(array $ids)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/api/get-user-array", data: ['id' => $ids]);
    $data = json_decode($response?->body());
    return $data->users ?? [];
  }

  public function createMultipleUsers(array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/api/register-users", data: $payload);

    $data = json_decode($response?->body());
    return $data;
  }

  public function update(string $ssoId, array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/api/update-user/" . $ssoId, data: $payload);

    $data = json_decode($response?->body());
    return $data;
  }

  public function setNewPassword(array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/api/reset-password", data: $payload);

    return $response;
  }

  public function checkBranchHasOwner(string $code)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/branch/" . $code . "/has-owner");

    return $response;
  }

  public function addLegacyMentorsRole($data)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/api/legacy-mentors/role", data: $data);

    return $response;
  }

  public function checkPasswordMatch($payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/api/check-password-match", data: $payload);
    $is_password_match = json_decode($response->body())?->data?->is_password_match ?? null;
    return $is_password_match;
  }

  // New SSO

  // Application
  public function createApplication(array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/applications/create", data: $payload);

    $data = json_decode($response?->body());
    return $data;
  }

  public function getApplication()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/applications/data");

    $data = json_decode($response?->body());
    return $data;
  }

  public function updateApplications(string $id, array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->patch(url: "/applications/update/$id", data: $payload);
    $data = json_decode($response?->body());
    return $data;
  }

  public function getApplicationById($id)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/applications/edit/$id");
    $data = json_decode($response?->body());
    return $data;
  }
  public function deleteApplication($id)
  { {
      $response = $this->http->withHeaders([
        "Content-Type" => "application/json",
        "X-SSO-Token" => env('SSO_TOKEN')
      ])->delete(url: "/applications/delete/$id");

      $data = json_decode($response?->body());
      return $data;
    }
  }

  // User Role

  public function getUserRole()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/users-roles/data");

    $data = json_decode($response?->body());
    return $data;
  }

  public function getApplicationForUserRole()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/users-roles/data?distinc=1");
    $data = json_decode($response?->body());
    return $data;
  }

  public function createUserRole(array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/users-roles/create", data: $payload);

    $data = json_decode($response?->body());
    return $data;
  }

  public function updateUserRole(string $id, array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->patch(url: "/users-roles/update/$id", data: $payload);

    $data = json_decode($response?->body());
    return $data;
  }
  public function getUserRoleById($id)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/user-roles/edit/$id");
    $data = json_decode($response?->body());
    return $data;
  }

  public function deleteUserRole($id)
  { {
      $response = $this->http->withHeaders([
        "Content-Type" => "application/json",
        "X-SSO-Token" => env('SSO_TOKEN')
      ])->delete(url: "/users-roles/delete/$id");

      $data = json_decode($response?->body());
      return $data;
    }
  }

  // ACL
  public function getACL()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/acl/data");

    $data = json_decode($response?->body());
    return $data;
  }

  public function getApplicationForACL()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/applications/data?distinc=1");
    $data = json_decode($response?->body());
    return $data;
  }

  public function getACLDataById($id)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/acl/edit/$id");
    $data = json_decode($response?->body());
    return $data;
  }

  public function createACL(array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->post(url: "/acl/create", data: $payload);

    $data = json_decode($response?->body());
    return $data;
  }

  public function updateACL(string $id, array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->patch(url: "/acl/update/$id", data: $payload);

    $data = json_decode($response?->body());
    return $data;
  }

  public function deleteACL($id)
  { {
      $response = $this->http->withHeaders([
        "Content-Type" => "application/json",
        "X-SSO-Token" => env('SSO_TOKEN')
      ])->delete(url: "/acl/delete/$id");

      $data = json_decode($response?->body());
      return $data;
    }
  }
  //users
  public function getUsers()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/users/data");

    $data = json_decode($response?->body());
    return $data;
  }
  public function getUserById($id)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/users/edit/$id");
    $data = json_decode($response?->body());
    return $data;
  }
  public function updateUsers(string $id, array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->patch(url: "/users/update/$id", data: $payload);
    $data = json_decode($response?->body());
    return $data;
  }

  public function storeUsers($payload)
  { {
      $response = $this->http->withHeaders([
        "Content-Type" => "application/json",
        "X-SSO-Token" => env('SSO_TOKEN')
      ])->post(url: "/users/create", data: $payload);

      $data = json_decode($response?->body());
      return $data;
    }
  }

  public function deleteUser($id)
  { {
      $response = $this->http->withHeaders([
        "Content-Type" => "application/json",
        "X-SSO-Token" => env('SSO_TOKEN')
      ])->delete(url: "/users/delete/$id");

      $data = json_decode($response?->body());
      return $data;
    }
  }

  //Additional Control
  public function getAdditionalControl()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/additional-controls/data");

    $data = json_decode($response?->body());
    return $data;
  }

  public function getAdditionalControlById($id)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/additional-controls/edit/$id");
    $data = json_decode($response?->body());
    return $data;
  }


  public function storeAdditionalControl($payload)
  { {
      $response = $this->http->withHeaders([
        "Content-Type" => "application/json",
        "X-SSO-Token" => env('SSO_TOKEN')
      ])->post(url: "/additional-controls/create", data: $payload);

      $data = json_decode($response?->body());
      return $data;
    }
  }

  public function updateAdditionalControl(string $id, array $payload)
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->patch(url: "/additional-controls/update/$id", data: $payload);
    $data = json_decode($response?->body());
    return $data;
  }

  public function deleteAdditionalControl($id)
  { {
      $response = $this->http->withHeaders([
        "Content-Type" => "application/json",
        "X-SSO-Token" => env('SSO_TOKEN')
      ])->delete(url: "/additional-controls/delete/$id");

      $data = json_decode($response?->body());
      return $data;
    }
  }

  public function getACLForAdditionalControlInCreate()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/acl/data?distinc=1");
    $data = json_decode($response?->body());
    return $data;
  }

  public function getApplicationForAdditionalControlInEdit()
  {
    $response = $this->http->withHeaders([
      "Content-Type" => "application/json",
      "X-SSO-Token" => env('SSO_TOKEN')
    ])->get(url: "/additional-controls/data?distinc=1");
    $data = json_decode($response?->body());
    return $data;
  }

  public function getUserDataByCredentialToken(string $token)
  {
    return $this->http->withHeaders(["Content-Type" => "application/json"])
      ->get("/sso/auth/validate-login-token/$token");
  }
}

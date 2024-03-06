<?php

namespace App\Http\Controllers\Api\NewAffiliate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\NewAffiliateService\Affiliate;
use App\Services\SSOService\SSO;

class AffiliateController extends Controller
{
  private Affiliate $affiliateService;
  private SSO $ssoService;

  public function __construct(Affiliate $affiliateService, SSO $ssoService)
  {
    $this->affiliateService = $affiliateService;
    $this->ssoService = $ssoService;
  }

  public function getAll()
  {
    $response = $this->affiliateService->getAll();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getSingleBySSOID(string $sso_id)
  {
    $response = $this->affiliateService->getSingleBySSOID($sso_id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getSingleBySchoolID(string $school_id)
  {
    $response = $this->affiliateService->getSingleBySchoolID($school_id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function create(Request $request)
  {
    $payload = $request->except('cancelToken');

    if (isset($request->password)) {
      $ssoPayload = [
        "name" => $request->name,
        "email" => $request->email,
        "password" => $request->password,
        "base_role" => "user"
      ];
      $ssoResponse = $this->ssoService->storeUsers($ssoPayload);
      if (!$ssoResponse->success) {
        return response()->json(
          [
            'success' => false,
            'error' => 'fail on create sso affiliate user data',
            'message' => "Silakan coba lagi"
          ],
          500
        );
      }
      if (!isset($ssoResponse->data->id)) {
        return response()->json(
          [
            'success' => false,
            'error' => 'fail on create sso affiliate user data',
            'message' => "Data akun sudah ada, tidak bisa membuat akun user baru"
          ],
          500
        );
      }
      $payload["sso_id"] = $ssoResponse->data->id;
    }
    unset($payload["password"]);

    $response = array_key_exists("school_id", $payload)
      ? $this->affiliateService->createForSiplah($payload)
      : $this->affiliateService->create($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function update(string $sso_id, Request $request)
  {
    $payload = $request->except('cancelToken');

    if (isset($request->password)) {
      $ssoPayload = [
        "name" => $request->name,
        "email" => $request->email,
        "password" => $request->password,
        "base_role" => "user"
      ];
      $ssoResponse = $this->ssoService->updateUsers($sso_id, $ssoPayload);
      if (!$ssoResponse->success) {
        return response()->json(
          [
            'success' => false,
            'error' => 'fail on update sso affiliate user data',
            'message' => "Silakan coba lagi"
          ],
          500
        );
      }
    }
    unset($payload["password"]);
    unset($payload["email"]);

    $response = $this->affiliateService->update($sso_id, $payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getAffiliateWallets(int $affiliate_id)
  {
    $response = $this->affiliateService->getAffiliateWallets($affiliate_id);
    $body = json_decode($response->body());
    $status = $response->status();
    if (is_object($body->data)) {
      $body->data = [$body->data];
    }
    return response()->json($body, $status);
  }

  public function getAffiliateTransactionHistories(int $affiliate_id)
  {
    $response = $this->affiliateService->getAffiliateTransactionHistories($affiliate_id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
  public function verificationAffiliateStatus(Request $request)
  {
    $payload = [
      "affiliate_id" => $request->affiliate_id,
      "status" => $request->verified_status
    ];
    $response = $this->affiliateService->verificationAffiliate($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function updateToUpliner(int $affiliate_id)
  {
    $response = $this->affiliateService->updateToUpliner($affiliate_id);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getBankAccountUpdateRequests()
  {
    $response = $this->affiliateService->getBankAccountUpdateRequest();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getBankAccountUpdateRequestByID(int $id)
  {
    $response = $this->affiliateService->getBankAccountUpdateRequest();
    $body = json_decode($response->body());
    $status = $response->status();

    if (count($body?->data ?? []) > 0) {
      $body->data = collect($body->data)
        ->where('affiliate_id', $id)
        ->first();
    }

    return response()->json($body, $status);
  }

  public function processBankAccountUpdateRequest(Request $request)
  {
    $payload = [
      "affiliate_id" => (int)$request->affiliate_id,
      "status" => $request->status,
      "reason" => $request?->reason ?? ""
    ];
    $response = $this->affiliateService->processBankAccountUpdateRequest($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getAffiliateTotals()
  {
    $response = $this->affiliateService->getAffiliateTotal();
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

<?php

namespace App\Helpers;

use App\Services\SSOService\SSO;
use Illuminate\Http\Request;

class Auth
{

  public static function redirectToAuthLandingPage()
  {
    $presignedUrl = self::generatePresignedURL();
    if ($presignedUrl == 404) {
      abort(404, "Application not found");
    }
    return redirect($presignedUrl);
  }

  private static function generatePresignedURL()
  {
    // Get Edutech Office Application Data From SSO Service
    $ssoService = new SSO;
    $applications = $ssoService->getApplication();
    if (count($applications?->data ?? []) == 0) {
      return 404;
    }

    $isLocalEnvironment = request()->getHost() == "localhost";
    $isDevEnvironment = env("APP_ENV") == "dev";
    if ($isLocalEnvironment) {
      $officeHost = "http://localhost:8080";
    } else {
      $officeHost = $isDevEnvironment
        ? "https://office-v2.btwazure.com"
        : "https://office.btwedutech.com";
    }

    $officeApplication = collect($applications?->data)
      ->filter(fn ($item) => $item->application_url == $officeHost)
      ->first();

    if (is_null($officeApplication)) {
      return 404;
    }

    // Construct sign token
    $sign = $officeApplication->id . $officeApplication->application_name . "PRIVATE" . env("PRESIGNED_URL_STRING_TOKEN");
    $hashedSign = hash("sha256", $sign);

    $tokenPayload = [
      "app_id" => $officeApplication->id,
      "app_name" => $officeApplication->application_name,
      "app_url" => $officeApplication->application_url,
      "app_access_token" => $officeApplication->access_token,
      "app_type" => "PRIVATE",
      "sign" => $hashedSign
    ];

    $encodedTokenPayload = base64_encode(json_encode($tokenPayload));
    $authLandingPageHost = $isDevEnvironment
      ? "https://sso-auth.btwazure.com"
      : "https://account.btwedutech.com";
    return "$authLandingPageHost/login?payload=$encodedTokenPayload";
  }
}

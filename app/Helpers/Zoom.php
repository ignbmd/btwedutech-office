<?php

namespace App\Helpers;

use \Firebase\JWT\JWT;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Zoom
{
  public static function generateJWTKey()
  {
    $key = env('ZOOM_API_KEY');
    $secret = env('ZOOM_API_SECRET');
    $token = ["iss" => $key, "exp" => time() + 3600];
    return JWT::encode($token, $secret);
  }

  public static function generateMeetingBasePayload()
  {
    return [
      "timezone" => "Asia/Jakarta",
      "type" => 2,
      "default_password" => false,
      "pre_schedule" => false,
      "settings" => [
        "allow_multiple_devices" => true,
        "alternative_hosts_email_notification" => true,
        "meeting_authentication" => true,
        "authentication_option" => "vrel_-MqTHqzyIvUUw10wQ",
        "authentication_name" => "Invitees Only",
        "approval_type" => 1, // Manually approve registration
        "registration_type" => 2, // Attendees must register for each meeting occurrence.
        "registrant_confirmation_email" => false,
        "registrant_email_notification" => false,
        "audio" => "both",
        "auto_recording" => "none",
        "close_registration" => false,
        "encryption_type" => "enhanced_encryption",
        "focus_mode" => true,
        "join_before_host" => false,
        "mute_upon_entry" => true,
        "participant_video" => false,
        "private_meeting" => false,
        "show_share_button" => false,
        "use_pmi" => false,
        "watermark" => false,
        "host_save_video_order" => true,
      ],
    ];
  }

  // For server-to-server OAuth Zoom App
  public static function getAccessToken()
  {
    try {
      $zoom_account_id = env('ZOOM_ACCOUNT_ID');
      $zoom_client_id = env('ZOOM_CLIENT_ID');
      $zoom_client_secret = env('ZOOM_CLIENT_SECRET');
      $zoom_oauth_endpoint = "https://zoom.us/oauth/token";
      $query = [
        "grant_type" => "account_credentials",
        "account_id" => $zoom_account_id
      ];
      $query_string = http_build_query($query);
      $base64_string = base64_encode("$zoom_client_id:$zoom_client_secret");
      $headers = [
        "Authorization" => "Basic $base64_string"
      ];

      $response = Http::withHeaders($headers)->post($zoom_oauth_endpoint . "?" . $query_string);
      $body = json_decode($response->body());
      $status = $response->status();

      if (!$response->successful()) {
        $body->status = $status;
        Log::error("Could not get bearer token from zoom", ["response" => $response->body(), "status" => $status]);

        throw new \Exception(json_encode($body));
      }

      $tokenExpiresInMinutes = 55;
      $tokenExpiresInSeconds = $tokenExpiresInMinutes * 60;

      return [
        "access_token" => $body->access_token,
        "expires_in" => $tokenExpiresInSeconds,
        "error" => null
      ];
    } catch (\Exception $e) {
      return [
        "access_token" => null,
        "expires_in" => null,
        "error" => $e->getMessage()
      ];
    }
  }

  public static function getAccessTokenForService()
  {
    // Get token from redis cache
    $redis_token = Redis::get("zoom_office_bearer_token");
    $token = $redis_token;

    // If redis doesn't have the token, get it from zoom API, then save it again to redis cache
    if (!$redis_token || in_array($redis_token, ["-1", "-2"])) {
      // Get access_token using HTTP request to zoom API
      $token_response = self::getAccessToken();

      // Handle when fail to get the token
      if ($token_response["error"]) {
        return null;
      }

      // Set token to redis
      Redis::set("zoom_office_bearer_token", $token_response["access_token"], $token_response["expires_in"]);
      $token = $token_response["access_token"];
    }
    return $token;
  }
}

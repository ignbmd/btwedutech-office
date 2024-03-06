<?php

namespace App\Http\Middleware;

use App\Helpers\Redis;
use App\Helpers\Zoom;
use Closure;
use Illuminate\Http\Request;

class CheckZoomAccessToken
{
  /**
   * Handle an incoming request.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
   * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
   */
  public function handle(Request $request, Closure $next)
  {
    // Get token from redis cache
    $redis_token = Redis::get("zoom_office_bearer_token");
    $token = $redis_token;

    // If redis doesn't have the token, get it from zoom API, then save it again to redis cache
    if (!$redis_token || in_array($redis_token, ["-1", "-2"])) {
      // Get access_token using HTTP request to zoom API
      $token_response = Zoom::getAccessToken();

      // Handle when fail to get the token
      if ($token_response["error"]) {
        $errorObj = json_decode($token_response["error"]);
        return response()->json($errorObj, $errorObj->status);
      }

      // Set token to redis
      Redis::set("zoom_office_bearer_token", $token_response["access_token"], $token_response["expires_in"]);
      $token = $token_response["access_token"];
    }

    // Set authorization header to the request
    $request->headers->add(["Authorization" => "Bearer $token"]);
    return $next($request);
  }
}

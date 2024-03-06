<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DownloadFileMiddleware
{
  /**
   * Handle an incoming request.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Closure  $next
   * @return mixed
   */
  public function handle(Request $request, Closure $next)
  {
    $token = $request->get('token');
    $isValid = $token == env('DOWNLOAD_FILE_TOKEN');
    return $isValid
      ? $next($request)
      : response()->json([
        'messages' => ['Unauthenticated']
      ], 401);
  }
}

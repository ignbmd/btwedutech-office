<?php

namespace App\Http\Middleware;

use App\Helpers\Auth as AuthHelper;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticateByCredentialToken
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
    $isAuthenticated = Auth::check();
    if (!$isAuthenticated) {
      return AuthHelper::redirectToAuthLandingPage();
    }
    return $next($request);
  }
}

<?php

namespace App\Http\Middleware;

use App\Utils\JWT\AuthJWT;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JWTMiddleware
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
       if( $this->verify($request)) {
           return $next($request);
       }else{
           return response("Unauthorized", 401);
       }
    }

    public function verify(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            $jwt = new AuthJWT();
            try {
                $decoded = $jwt->verifiedToken($token);
                Auth::loginUsingId($decoded['sub']);
                return true;
            } catch (\Throwable $th) {
                return false;
            }
        }else {
            return false;
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Utils\JWT\AuthJWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return api()
                ->status(422)
                ->data([
                    'errors' => $validator->errors()
                ]);
        }

        if(Auth::attempt($request->only(['email','password']))) {
            $jwt = new AuthJWT();
            return api()
                ->data([
                    'token' => $jwt->generateToken(Auth::user()->id)
                ]);
        }

        return api()
            ->status(401)
            ->message('Unauthorized');
    }

    public function me(Request $request)
    {
        return api()
            ->data([
                'name' => Auth::user()->name,
                'email' => Auth::user()->email
            ]);
    }
}

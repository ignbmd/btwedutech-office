<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\Services\SSOService\SSO;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    use ResetsPasswords;

    private SSO $service;

    public function __construct(SSO $ssoService)
    {
      $this->service = $ssoService;
    }

    /**
     * Where to redirect users after resetting their password.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    public function showResetForm($token = null)
    {
        $pageConfigs = [
            'bodyClass' => "bg-full-screen-image",
            'blankPage' => true
        ];

        $email = '';
        $token = base64_decode($token);
        if(Cache::has($token)) {
          $email = Crypt::decryptString($token);
        }

        return view('auth.passwords.reset')->with(
            ['token' => $token, 'email' => $email, 'pageConfigs' => $pageConfigs]
        );
    }

    public function reset(Request $request) {
      $request->validate($this->rules(), $this->validationErrorMessages());

      $token = $request->token;
      $email = $request->email;
      $body = [
        "email" => $email,
        "password" => $request->password,
        "password_confirmation" => $request->password_confirmation
      ];
      $res = $this->service->setNewPassword($body);
      if($res->successful()) {
        Cache::forget($token);
        return redirect()
            ->route('login')
            ->with('flash-message',
              [
                'title' => 'Berhasil!',
                'type' => 'success',
                'message' => 'Reset password berhasil'
              ]
            );
      } else {
        return redirect()
        ->back()
        ->with('flash-message',
          [
            'title' => 'Terjadi Kesalahan!',
            'type' => 'error',
            'message' => 'coba beberapa saat lagi'
          ]
        );
      }
    }
}

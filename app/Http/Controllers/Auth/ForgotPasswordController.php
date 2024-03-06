<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\RabbitMq;
use App\Http\Controllers\Controller;
use App\Mail\SendPasswordResetEmail;
use App\Rules\ReCaptcha;
use App\Services\SSOService\SSO;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

    private SSO $service;

    public function __construct(SSO $ssoService)
    {
      $this->service = $ssoService;
    }

    public function showLinkRequestForm()
    {
        $pageConfigs = [
            'bodyClass' => "bg-full-screen-image",
            'blankPage' => true
        ];

        return view('/auth/passwords/email', [
            'pageConfigs' => $pageConfigs
        ]);
    }

    public function sendResetLinkEmail(Request $request) {
      $this->validateEmail($request);

      $userEmail = $request->email;
      //generate URL 
      $token = Crypt::encryptString($userEmail);
      $expiresAt = now()->addMinutes(120);
      Cache::put($token, $userEmail, $expiresAt); //2 Hours
      $token = base64_encode($token);
      $url = url('/password/reset', ['token' => $token]);
      //----//
      $data = $this->service->getUserByEmail($userEmail);
      if(property_exists($data, 'errors')) {
        return redirect()
        ->back()
        ->with(
          'alert-danger',
          'Email tidak terdaftar'
        );
      } else {
        $userName = $data->users->name;
        
        $payload = [
          "version" => 1,
          "data" => [
            "recipient" => $userEmail,
            "url" => $url
          ]
        ];

        RabbitMq::send('message-gateway.email.forget-password.office', json_encode($payload));

        return redirect()
          ->back()
          ->with(
            'alert',
            'Email reset password berhasil dikirim, harap mengecek email Anda'
          );
      }
    }

    /**
     * Validate the email for the given request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
    */
    protected function validateEmail(Request $request)
    {
      $request->validate(['email' => 'required|email', 'g-recaptcha-response' => ['required', new ReCaptcha]]);
    }
}

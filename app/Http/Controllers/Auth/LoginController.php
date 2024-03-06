<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\Rules\ReCaptcha;
use App\Services\BranchService\Branch;
use App\Utils\JWT\AuthJWT;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    private Branch $serviceBranch;


    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(Branch $branchService)
    {
        $this->middleware('guest')->except('logout');
        $this->serviceBranch = $branchService;
    }

    // Login
    public function showLoginForm()
    {
        // Remove cookie office_pemetaan_jurusan_session when
        // this function gets executed, which is when the logged in session is expired
        $cookieName = "office_pemetaan_jurusan_session";
        $cookiePath = "/";
        $cookieDomain = env("APP_ENV") === "dev" ? ".btwazure.com" : ".btwedutech.com";
        setcookie($cookieName, null, time() - 3600, $cookiePath, $cookieDomain, true, true);

        $pageConfigs = [
            'bodyClass' => "bg-full-screen-image",
            'blankPage' => true
        ];

        return view('/auth/login', [
            'pageConfigs' => $pageConfigs
        ]);
    }

    private function setBranchDetail($user) {
      $branchCode = $user->branch_code;
      $hasMultipleBranchCode = strpos($branchCode, ',') !== false;

      if($branchCode && $hasMultipleBranchCode) {
        $branchCodesArray = explode(',', $branchCode);

        $branchNames = [];
        $branchCodes = [];

        foreach($branchCodesArray as $branchCode) {
          $branchDetail = $this->serviceBranch->getBranchByCode($branchCode);
          $branchNames[] = $branchDetail->name;
          $branchCodes[] = $branchDetail->code;
        }

        $branchName = implode(', ', $branchNames);
        $branchCode = implode(', ', $branchCodes);

        Session::put('branch',
          [
            'name' => $branchName,
            'code' => $branchCode,
          ]
        );

      }

      if($branchCode && !$hasMultipleBranchCode) {
        $branchDetail = $this->serviceBranch->getBranchByCode($branchCode);
        Session::put('branch',
          [
            'name' => $branchDetail->name,
            'code' => $branchDetail->code,
          ]
        );
      }

    }

    /**
     * The user has been authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  $user
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        $this->setBranchDetail($user);
        $jwt = new AuthJWT();
        $token = $jwt->generateToken($user->id);
        Cookie::queue("JWT-TOKEN", $token);
        return $request->wantsJson()
            ? new JsonResponse([], 204)
            : redirect()->intended($this->redirectPath());
    }

    protected function loggedOut(Request $request)
    {
      // Remove cookie office_pemetaan_jurusan_session when
      // user logged out via /logout POST request
      $cookieName = "office_pemetaan_jurusan_session";
      $cookiePath = "/";
      $cookieDomain = env("APP_ENV") === "dev" ? ".btwazure.com" : ".btwedutech.com";
      setcookie($cookieName, null, time() - 3600, $cookiePath, $cookieDomain, true, true);
    }

    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request)
    {
      try {
        $this->validateLogin($request);

        // If the class is using the ThrottlesLogins trait, we can automatically throttle
        // the login attempts for this application. We'll key this by the username and
        // the IP address of the client making these requests into this application.
        if (method_exists($this, 'hasTooManyLoginAttempts') &&
            $this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);

            return $this->sendLockoutResponse($request);
        }
        if ($this->attemptLogin($request)) {
            if ($request->hasSession()) {
                $request->session()->put('auth.password_confirmed_at', time());
            }

            return $this->sendLoginResponse($request);
        }

        // If the login attempt was unsuccessful we will increment the number of attempts
        // to login and redirect the user back to the login form. Of course, when this
        // user surpasses their maximum number of attempts they will get locked out.
        $this->incrementLoginAttempts($request);

        return $this->sendFailedLoginResponse($request);
      } catch (\Exception $e) {
        $explodedErrorMessage = explode(" ", $e->getMessage());
        $statusCode = $explodedErrorMessage[count($explodedErrorMessage) - 1];
        if(is_numeric($statusCode) && ((int)$statusCode >= 400 && (int)$statusCode <= 499)) return back()->withErrors(["g-recaptcha-response" => "Silakan refresh halaman dan coba lagi"]);
        if(is_numeric($statusCode) && (int)$statusCode >= 500) {
          Log::error("An error occured when an user trying to login", ["message" => $e->getMessage()]);
          return back()->withErrors(["email" => "Server error, silakan coba lagi nanti"]);
        }
        return $this->sendFailedLoginResponse($request);
      }
    }

    /**
     * Validate the user login request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function validateLogin(Request $request)
    {
      $request->validate([
        $this->username() => 'required|string',
        'password' => 'required|string',
        'g-recaptcha-response' => 'required'
      ]);
    }

    /**
     * Get the needed authorization credentials from the request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    protected function credentials(Request $request)
    {
        return ["email" => $request->email, "password" => $request->password, "captcha_code" => $request["g-recaptcha-response"]];
    }
}

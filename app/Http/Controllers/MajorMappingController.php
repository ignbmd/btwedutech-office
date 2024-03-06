<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MajorMappingController extends Controller
{
  public function redirectToSubApp(Request $request)
  {
    $canProceed = env("SHOW_OFFICE_PEMETAAN_JURUSAN_MENU") === true;
    if(!$canProceed) {
      $request->session()->flash('flash-message', [
        'title' => "Informasi",
        'type' => "info",
        'message' => "Akses untuk fitur ini belum dibuka"
      ]);
      return redirect("/home");
    }

    $currentTimestamp = time();
    $user = Auth::user();
    $cookieName = "office_pemetaan_jurusan_session";
    $cookieExpirationTime = $currentTimestamp + (2 * 60 * 60);
    $cookiePath = "/";
    $cookieDomain = env("APP_ENV") === "dev" ? ".btwazure.com" : ".btwedutech.com";
    $subAppHost = env('OFFICE_PEMETAAN_JURUSAN_HOST');

    // Create cookie if the cookie not present, then redirect to sub app
    // Otherwise, just redirect to sub app
    if(!isset($_COOKIE[$cookieName])) {
      $userId = $user->id;
      $encryptedCookie = $this->encrypt($userId, env("OFFICE_PEMETAAN_JURUSAN_SECRET_KEY"));
      setcookie($cookieName, $encryptedCookie, $cookieExpirationTime, $cookiePath, $cookieDomain, true, true);
    }
    return redirect()->away($subAppHost);
  }

  private function encrypt($plainMessage, $secret)
  {
    $iv_size        = openssl_cipher_iv_length("aes-256-cbc");
    $iv             = random_bytes($iv_size);
    $ciphertext     = openssl_encrypt($plainMessage, "aes-256-cbc", $secret, OPENSSL_RAW_DATA, $iv);
    $hmac           = hash_hmac("sha256", $ciphertext.$iv, $secret, true);
    $ciphertext_hex = bin2hex($ciphertext);
    $iv_hex         = bin2hex($iv);
    $hmac_hex       = bin2hex($hmac);

    return "$iv_hex:$ciphertext_hex:$hmac_hex";
  }

  private function decrypt($encreyptedMessage, $secret)
  {
    $data         = explode(":", $encreyptedMessage);
    $iv           = hex2bin($data[0]);
    $ciphertext   = hex2bin($data[1]);
    $expectedHmac = hex2bin($data[2]);

    $hmac = hash_hmac('sha256', $ciphertext.$iv, $secret, true);
    if (!hash_equals($hmac, $expectedHmac)) {
      throw new \Exception('HMAC verification failed - Signature does not match');
    }
    return openssl_decrypt($ciphertext, "aes-256-cbc", $secret, OPENSSL_RAW_DATA, $iv);
  }
}

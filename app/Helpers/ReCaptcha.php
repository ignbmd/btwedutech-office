<?php

namespace App\Helpers;

use Exception;
use GuzzleHttp\Client;

class ReCaptcha {

  protected $siteKey;
  protected $secretKey;
  protected $endpoint = 'https://www.google.com/recaptcha/api/siteverify';

  public function __construct()
  {
    $this->siteKey = config('recaptcha.sitekey');
    $this->secretKey = config('recaptcha.secret');

    if (!$this->secretKey) {
      throw new Exception('Google Recaptcha Secret not provided.');
    }
  }

  public function validate($captcha)
  {
    $data = [
      'secret' => $this->secretKey,
      'response' => $captcha
    ];

    $guzzleClient = new Client();
    $response = $guzzleClient->post($this->endpoint, ['form_params' => $data]);
    $body = json_decode((string) $response->getBody());
    if ($body->success) return true;
    return false;
  }

}

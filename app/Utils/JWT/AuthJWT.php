<?php
namespace App\Utils\JWT;

use Carbon\Carbon;
use Exception;
use Firebase\JWT\JWT;

class AuthJWT {

    const KEY = "VuEXWagoufQS6p865iJqlzUCK8r0E8sv@@";

    public function generateToken($userId)
    {
        $payload = [
            'iss' => 'office.btwedutech.com',
            'sub' => $userId,
            'exp' => Carbon::now()->addMinutes(config('jwt.lifetime'))->timestamp
        ];

        return JWT::encode($payload, $this->getKey(), 'HS512');
    }

    public function verifiedToken($token)
    {
        try {
            $decoded = (array) JWT::decode($token, $this->getKey(), ['HS512']);
            if(!$this->validateExpired($decoded['exp'])) {
                throw new Exception("Token expired");
            }
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
        return $decoded;
    }

    protected function validateExpired($time)
    {
        if ($time == null) return true;

        return Carbon::now() <= Carbon::parse($time);
    }

    protected function getKey() : string {
        return env('APP_KEY', AuthJWT::KEY);
    }
}
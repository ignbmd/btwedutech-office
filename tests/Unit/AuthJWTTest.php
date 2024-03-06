<?php

namespace Tests\Unit;

use App\Utils\JWT\AuthJWT;
use PHPUnit\Framework\TestCase;

class AuthJWTTest extends TestCase
{
    public function test_generate_token()
    {
        $t = new AuthJWT();
        $jwt = $t->generateToken(1,"widya.oktapratama@gmail.com");
        $decoded = $t->verifiedToken($jwt);
        dd($decoded);
    }
}

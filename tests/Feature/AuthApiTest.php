<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthApiTest extends TestCase
{

    public function test_login_failed()
    {
        $response = $this->post('/api/login');
        $response->assertStatus(422);    
    }

    public function test_login_success()
    {
        $response = $this->json('POST','/api/login',[
            'email' => 'dwikychandra21@gmail.com',
            'password' => '123456'
        ]);

        $response->assertStatus(200);
        $token = json_decode($response->getContent())->data->token;
        $response = $this->withHeaders([
            'authorization' => 'Bearer '.$token
        ])
            ->json('POST','/api/me');
        
        $response->assertStatus(200);


        $response = $this->json('POST','/api/me?token='.$token);
        $response->assertStatus(200);
    }

    public function test_expired_token()
    {
        $response = $this->json('POST','/api/login',[
            'email' => 'dwikychandra21@gmail.com',
            'password' => '123456'
        ]);

        $response->assertStatus(200);
        $token = json_decode($response->getContent())->data->token;
        $this->travel(1)->years();
        $response = $this->withHeaders([
            'authorization' => 'Bearer '.$token
        ])
            ->json('POST','/api/me');
        
        $response->assertStatus(401);


    }
}

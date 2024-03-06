<?php

return [

    /**
     * Base of authenticated server
     * 
     */
    'base_url' => env('SSO_BASE_URL', null),

    /**
     * Security token to access auth server
     */
    'token' => env('SSO_TOKEN', null),

    /**
     * List of endpoint
     */
    'prefix' => '/sso',

    'endpoint' => [
        'GET_USER_DETAIL' => '/user/detail',
        'AUTH_LOGIN' => '/auth/login',
        'GET_USER_BY_CREDENTIALS' => '/user/credentials',
    ]
];

<?php

return [

  /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

  'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
  ],

  'postmark' => [
    'token' => env('POSTMARK_TOKEN'),
  ],

  'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
  ],

  'btw' => [
    'sso' => env('SSO_BASE_URL', ''),
    'learning' => env('SERVICE_LEARNING_ADDRESS', ''),
    'product' => env('SERVICE_PRODUCT_ADDRESS', ''),
    'branch' => env('SERVICE_BRANCH_ADDRESS', ''),
    'examination' => env('SERVICE_EXAMINATION_ADDRESS', ''),
    'exam' => env('SERVICE_EXAM_ADDRESS', ''),
    'study_material' => env('SERVICE_STUDY_MATERIAL_ADDRESS', ''),
    'finance' => env('SERVICE_FINANCE_ADDRESS', ''),
    'student_result' => env('SERVICE_STUDENT_RESULT_ADDRESS', ''),
    'affiliate' => env('SERVICE_AFFILIATE_ADDRESS', ''),
    'profile' => env('SERVICE_PROFILE_ADDRESS', ''),
    'mcu' => env('SERVICE_MEDICAL_CHECKUP_ADDRESS', ''),
    'alumni' => env('SERVICE_ALUMNI_ADDRESS', ''),
    'api_gateway' => env('SERVICE_API_GATEWAY_ADDRESS', ''),
    'api_gateway_token_office' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE', ''),
    'comp-map' => env('SERIVCE_COMPETITION_MAP_ADDRESS', ''),
    'comp-map-v2' => env('SERVICE_COMPETITION_MAP_V2_ADDRESS', ''),
    'stages' => env('SERVICE_STAGES_ADDRESS', ''),
    'location' => env('SERVICE_LOCATION_ADDRESS', ''),
    'highschool' => env('SERVICE_HIGHSCHOOL_ADDRESS', ''),
    'onlineclass' => env('SERVICE_ONLINE_CLASS_ADDRESS', ''),
    'generateresult' => env('SERVICE_GENERATE_RESULT_ADDRESS', ''),
    'new_affiliate' => env('SERVICE_NEW_AFFILIATE_ADDRESS', ''),
    'ebook_code' => env('SERVICE_EBOOK_CODE_ADDRESS', ''),
    'exam_cpns' => env('SERVICE_EXAM_CPNS_ADDRESS', ''),
    'school_admin' => env('SERVICE_SCHOOL_ADMIN_ADDRESS', ''),
    'peminatan' => env('SERVICE_PEMINATAN_ADDRESS', ''),
    'dynamic_form' => env('SERVICE_DYNAMIC_FORM_ADDRESS', ''),
    'exam_result_cpns' => env('SERVICE_EXAM_RESULT_CPNS_ADDRESS', ''),
    'samapta' => env('SERVICE_SAMAPTA_ADDRESS', ''),
  ],

  'service_exception' => env('SERVICE_EXCEPTION', true)
];

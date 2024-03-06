<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StudentResultController extends Controller
{
  public function getOptionExamType(Request $request)
  {
    $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/student-result/option/exam-type';
    $params = ['student_id' => $request->get('student_id'), 'program' => $request->get('program') ?? 'skd'];
    $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url, $params);
    return $response->data ?? $response->throw()->json();
  }
}

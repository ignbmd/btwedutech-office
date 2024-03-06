<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IsStudentOnAuthBranchCode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $studentId = $request->route()->parameter('studentId');

        $student_profile_url = env('SERVICE_LEARNING_ADDRESS').'/student';
        $filter = ['smartbtw_id' => $studentId];
        $student_profile_response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($student_profile_url, $filter);
        $student_profile = json_decode($student_profile_response)->data[0];

        $is_authenticated = $student_profile->branch_code === auth()->user()->branch_code || (auth()->user()->branch_code == null || auth()->user()->branch_code == "PT0000");

        if(!$is_authenticated) {
          $request->session()->flash('flash-message', [
            'title' => 'Error!',
            'type' => 'error',
            'message' => 'Siswa ini bukan siswa cabang anda'
          ]);
          return redirect('/siswa');
        }
        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IsStudentHasBeenSoftDeleted
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

        $student_profile_url = env('SERVICE_API_GATEWAY_ADDRESS').'/internal/students/'.$studentId.'/profile';
        $student_profile_response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($student_profile_url);
        $student_profile = json_decode($student_profile_response)->data;

        if($student_profile->deleted_at !== null) {
          $request->session()->flash('flash-message', [
            'title' => 'Error!',
            'type' => 'error',
            'message' => 'Siswa ini sudah terhapus'
          ]);
          return redirect('/siswa');
        }
        return $next($request);
    }
}

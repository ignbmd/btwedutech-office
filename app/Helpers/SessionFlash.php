<?php

namespace App\Helpers;

use Illuminate\Http\Request;

class SessionFlash
{
  public static function somethingWrong(Request $request) {
    $request->session()->flash('flash-message',
    [
      'title' => 'Terjadi kesalahan',
      'type' => 'error',
      'message' => 'Sistem dalam perbaikan, harap mencoba beberapa saat lagi'
    ]
  );
  }
}

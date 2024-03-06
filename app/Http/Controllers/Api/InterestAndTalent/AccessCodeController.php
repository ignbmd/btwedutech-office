<?php

namespace App\Http\Controllers\Api\InterestAndTalent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Rap2hpoutre\FastExcel\FastExcel;

class AccessCodeController extends Controller
{
  public function assign(Request $request)
  {
    $accessCodes = [$request->access_code];
    $accessCodeFile = $request->file("access_code_file");
    if($accessCodeFile) {
      // Validate file extension and mime type
      $fileExtension = $accessCodeFile->extension();
      $fileMimeType = $accessCodeFile->getMimeType();
      $validFileExtension = "xlsx";
      $validFileMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      $isValidFile = $fileExtension !== $validFileExtension && $fileMimeType !== $validFileMimeType;
      if(!$isValidFile) return response()->json(["success" => false, "message" => "File tidak valid. Silakan masukkan file xlsx"], 422);

      $accessCodeFileCollection = (new FastExcel)->import($accessCodeFile);
      $accessCodes = $accessCodeFileCollection->map(fn ($item) => strtoupper(trim($item["Kode Akses"])))->values()->toArray();
    }
    dd($accessCodes);
  }
}

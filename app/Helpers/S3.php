<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class S3
{
  public static function put(string $targetPath, object $file): string
  {
    $fullPath = env('AWS_URL', 'https://btw-cdn.com') . $targetPath;

    Storage::disk('s3')->put($targetPath, $file);
    $fullPath = $fullPath . $file->hashName();

    return $fullPath;
  }

  public static function storeOriginal(string $path, UploadedFile $file): string
  {
    $fileName = Text::removeSpecialChars($file->getClientOriginalName());
    $name = pathinfo($fileName, PATHINFO_FILENAME);
    $ext = pathinfo($fileName, PATHINFO_EXTENSION);
    $fileName = "{$name}_" . date('YmdHis') . ".{$ext}";
    $filePath = Storage::disk('s3')->putFileAs($path, $file, $fileName);
    $url = Storage::disk('s3')->url($filePath);
    return $url;
  }

  public static function storeOriginalForPeminatan(string $path, UploadedFile $file): string
  {
    $fileName = Text::removeSpecialChars($file->getClientOriginalName());
    $name = pathinfo($fileName, PATHINFO_FILENAME);
    $ext = pathinfo($fileName, PATHINFO_EXTENSION);
    $fileName = "{$name}_" . date('YmdHis') . ".{$ext}";
    $filePath = Storage::disk('s3-peminatan')->putFileAs($path, $file, $fileName);
    $baseUrl = Storage::disk('s3-peminatan')->url('');
    $relativePath = Str::after($filePath, $baseUrl);
    return "/$relativePath";
  }
}

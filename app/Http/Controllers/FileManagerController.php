<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;


class FileManagerController extends Controller
{
  public $disk;
  public $storage;
  public $base;

  public function setConfig($bucket = 'default')
  {
      $this->disk = $bucket === 'default'
      ? env('FILE_MANAGER_DISK', 'public')
      : env('FILE_MANAGER_DISK_VP', 'public');
      $this->storage = Storage::disk($this->disk);
      $this->base = "/";
  }

  public function index(Request $request)
  {
    $bucket = $this->getBucket($request);
    return view('pages.filemanager.index', compact('bucket'));
  }

  public function getDir(Request $request)
  {
      $this->setConfig($this->getBucket($request));
      $dir = $this->joinPaths([$this->base, $request->path]);
      $directories = collect($this->storage->directories($dir))
          ->map(function ($item) use ($dir) {
              return str_replace($dir, '', $item);
          });
      $files = collect($this->storage->files($dir))
          ->map(function ($file) use ($dir) {
              return [
                  'file_name' => str_replace($dir, '', $file),
                  // 'size' => $this->formatBytes($this->storage->size($file)),
                  // 'last_modified' => Carbon::parse($this->storage->lastModified($file))->format('h:i:s d-m-Y'),
                  // 'type' => $this->storage->mimeType($file),
                  'size' => "-",
                  'last_modified' => "-",
                  'type' => "-",
                  'url' => $this->storage->url($file)
              ];
          });

      return api()
          ->status(200)
          ->data([
              'directories' => $directories,
              'files' => $files,
              'base' => $request->path,
              'back_path' => $this->generateBackPath($request->path)
          ]);
  }

  public function upload(Request $request)
  {
      $dataValidationRules = $request->bucket === "video"
        ? 'required|file|mimes:mkv,mp4'
        : 'required|file|mimes:doc,docx,pdf,zip,rar,xlsx,xlsx,png,jpg,jpeg,mkv,mp4,ppt,pptx,bin,svg';

      $validation = Validator::make($request->all(), [
          'path' => 'required',
          'data' => $dataValidationRules
      ]);

      if ($validation->fails()) {
          return response()->json('File tidak valid', 400);
      }
      $this->setConfig($this->getBucket($request));
      $file = $request->file('data');
      $name = $this->alphanumeric(explode('.', $file->getClientOriginalName())[0], '_') . '.' . $file->getClientOriginalExtension();
      if ($this->storage->exists($this->joinPaths([$this->base, $request->path, $name]))) {
          return response()->json('File Sudah Ada', 400);
      }
      $path = $file->store($this->joinPaths([$this->base, $request->path]), $this->disk);
      $this->storage->move($path, $this->joinPaths([$this->base, $request->path, $name]));
  }

  public function createFolder(Request $request)
  {
      $validation = Validator::make($request->all(), [
          'base' => 'required',
          'folder' => 'required'
      ]);
      $this->setConfig($this->getBucket($request));
      if ($validation->fails()) {
          return response(null, 200);
      }

      $this->storage->makeDirectory($this->joinPaths([$this->base, $request->base, $this->alphanumeric($request->folder)]));
  }

  public function generateFilePreSignedURL(Request $request)
  {
    $this->setConfig($this->getBucket($request));
    $adapter = $this->storage->getDriver()->getAdapter();
    $command = $adapter->getClient()->getCommand('GetObject', [
      'Bucket' => $adapter->getBucket(),
      'Key' => $request->pathname
    ]);
    $presignedRequest = $adapter->getClient()->createPresignedRequest($command, "+1 minute");
    return response()->json(['url' => (string)$presignedRequest->getUri() ], 200);
  }

  public function joinPaths($args)
  {
      $paths = [];
      foreach ($args as $arg) {
          $paths[] = trim($arg, DIRECTORY_SEPARATOR);
      }

      $paths = array_filter($paths);

      return join(DIRECTORY_SEPARATOR, $paths) . DIRECTORY_SEPARATOR;
  }

  public function generateBackPath($path)
  {
      $path = substr($path, -1) == '/' ? substr($path, 0, -1) : $path;
      $dir = explode('/', $path);
      array_pop($dir);
      return implode('/', $dir) == '' ? '/' : implode('/', $dir).'/';
  }

  private function alphanumeric($string, $delimitier = '')
  {
      return preg_replace('/[^\w]/', $delimitier, $string);
  }

  private function formatBytes($size)
  {
      $base = log($size) / log(1024);
      $suffix = array("", "KB", "MB", "GB", "TB");
      $f_base = floor($base);
      return round(pow(1024, $base - floor($base)), 1) . ' ' . $suffix[$f_base];
  }

  private function getBucket(Request $request)
  {
    return $request->has('bucket') && $request->bucket === "video"
      ? "video"
      : "default";
  }

}

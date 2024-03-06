<?php

namespace App\Http\Controllers\Api\ExamCPNS;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\ExamCPNSService\Module;
use Symfony\Component\HttpFoundation\Response;

class ModuleController extends Controller
{
  private Module $examModule;

  public function __construct(Module $examModule)
  {
    $this->examModule = $examModule;
  }

  public function get(Request $request)
  {
    $search = $request->search ?? '';
    $limit = $request->limit ?? '';
    $pages = $request->pages ?? '';
    $branch_code = $request->branch_code ?? '';
    $program = $request->program ?? '';
    $tags = $request->tags ?? null;

    $response = $this->examModule->get($search, $limit, $pages, $branch_code, $program, $tags);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getByModuleCode(string $module_code)
  {
    $response = $this->examModule->getByModuleCode($module_code);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getByProgram($program)
  {
    $response = $this->examModule->getByProgram($program);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);
  }

  public function getByProgramAndTag($program, $tag)
  {
    $response = $this->examModule->getByProgramAndTag($program, $tag);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    return response()->json($responseBody, $responseStatus);

  }

  public function create(Request $request)
  {
    $payload = $request->data;
    $response = $this->examModule->save($payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Modul berhasil dibuat!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function update(Request $request, $id)
  {
    $payload = $request->data;
    $response = $this->examModule->update($id, $payload);
    $responseBody = json_decode($response->body());
    $responseStatus = $response->status();

    if ($response->successful()) {
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Modul berhasil diubah!'
      ]);
    }

    return response()->json($responseBody, $responseStatus);
  }

  public function delete($id)
  {
    $response = $this->examModule->delete($id);
    $responseBody = json_decode($response?->body());
    $responseStatus = $response->status();
    return response()->json($responseBody, $responseStatus);
  }
}

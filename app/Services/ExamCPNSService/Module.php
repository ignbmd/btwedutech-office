<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Module extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam_cpns', '');
  }

  public function get(
    string $search = '',
    string $limit = '',
    string $pages = '',
    string $branch_code = '',
    string $program = '',
    array|null $tags = null,
  ) {
    $base_url = '/modules?search=' . $search . '&branch_code=' . $branch_code;
    $url = $base_url;

    if ($limit && $pages) {
      $url = $base_url . '&limit=' . $limit . '&pages=' . $pages;
    }

    if (is_array($tags) && count($tags) > 0) {
      foreach($tags as $tag) {
        $url = $url . "&tags=" . $tag;
      }
    }

    if ($program) {
      $url = $url . "&program=" . $program;
    }

    $response = $this->http->get(
      url: $url
    );
    return $response;
  }

  public function getByProgramAndTag(string $program, string $tag)
  {
    $response = $this->http->get(url: "/modules?program=$program&tags=$tag");
    return $response;
  }

  public function getByModuleCode(string $moduleCode)
  {
    $explodedModuleCode = explode("-", $moduleCode);
    $moduleCodeProgram = strtolower($explodedModuleCode[1]);
    $response = $this->http->get(
      url: '/modules?module_code=' . $moduleCode . '&program=' . $moduleCodeProgram
    );
    return $response;
  }

  public function getByProgram(string $program)
  {
    $response = $this->http->get(
      url: '/modules/program/' . $program
    );
    return $response;
  }

  public function save($payload)
  {
    $response = $this->http->post(
      url: "/modules",
      data: $payload
    );
    return $response;
  }

  public function update(string $id, array $payload)
  {
    $response = $this->http->put(
      url: "/modules/" . $id,
      data: $payload
    );
    return $response;
  }

  public function getById(int $id)
  {
    $response = $this->http->get(url: "/modules/{$id}");
    $data = json_decode($response?->body());
    return $data?->success ? $data?->data : null;
  }

  public function delete(string $id)
  {
    return $this->http->delete(url: "/modules/{$id}");
  }
}

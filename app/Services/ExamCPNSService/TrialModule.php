<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TrialModule extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam_cpns', '');
  }

  public function get(array $query)
  {
    $url = "/packages/trial-module";
    if(isset($query["program"])) {
      $program = $query["program"];
      $url = $url . "/$program";
    }
    return $this->http->get(url: $url);
  }

  public function show(int $id)
  {
    return $this->http->get("/packages/trial-module?id=$id");
  }

  public function create(array $payload)
  {
    return $this->http->post(url: "/packages/trial-module", data: $payload);
  }

  public function update(int $id, array $payload)
  {
    return $this->http->put(url: "/packages/trial-module/$id", data: $payload);
  }

}

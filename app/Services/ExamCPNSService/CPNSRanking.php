<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class CPNSRanking extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.exam_cpns', '');
  }
  public function getRankingCPNS($category)
  {
    $query = ["category" => $category];
    return $this->http->get(url: "/packages/cpns-uka", query: $query);
  }

  public function getSingleUKACPNS($taskId)
  {
    return $this->http->get("/packages/by-task-id/office/$taskId");
  }
}

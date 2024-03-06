<?php

namespace App\Services\NewRankingService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class StudentRanking extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.profile', '');
  }

  public function getRankingsByTaksId(string $program, int $taskId)
  {
    $limit = 1000;
    $page = 1;
    $query = ["limit" => $limit, "page" => $page];
    return $this->http->get("/stages/challenge/schools/{$program}/ranking/detail/{$taskId}", query: $query);
  }
}

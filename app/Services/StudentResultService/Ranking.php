<?php

namespace App\Services\StudentResultService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Carbon\Carbon;

class Ranking extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.student_result', '');
  }

  public function getIRTRanking(array $payload)
  {
    $task_id = $payload["task_id"];
    $page = $payload["page"] ?? null;
    $per_page = $payload["per_page"] ?? null;

    return $this->http->get('/app/ranking-result/irt-old', ["task_id" => $task_id, "page" => $page, "per_page" => $per_page]);
  }

  public function getExamResult(array $payload)
  {
    $task_id = $payload["task_id"];
    $smartbtw_id = $payload["smartbtw_id"];

    return $this->http->get('/app/ranking-result', ["task_id" => $task_id, "smartbtw_id" => $smartbtw_id]);
  }

  public function getRankingByTaskIds(array $task_ids)
  {
    $query = ["task_ids" => $task_ids];
    $url =  Url::combineQueryString("/app/ranking-result/group", $query);;
    return $this->http->get($url);
  }

  public function getIRTRankingByTaskIds(array $query)
  {
    $url =  Url::combineQueryString("/app/ranking-result/irt-old/bulk", $query);
    return $this->http->get($url);
  }
}

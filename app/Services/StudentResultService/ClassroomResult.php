<?php

namespace App\Services\StudentResultService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Carbon\Carbon;

class ClassroomResult extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.student_result', '');
  }

  public function getSummary(array $smartbtw_ids, ?string $program, ?string $exam_type)
  {
    $query = ["smartbtw_ids" => $smartbtw_ids, "program" => $program, 'with_report' => 1];
    if ($exam_type) $query["exam_type"] = $exam_type;
    $url = Url::combineQueryString("/app/classroom-result/summary", $query);
    $response = $this->http->get($url);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getIRTSummary(array $smartbtw_ids, ?string $program, ?string $exam_type)
  {
    $query = ["smartbtw_ids" => $smartbtw_ids, "program" => $program, "with_report" => 1];
    if ($exam_type) $query["exam_type"] = $exam_type;
    $url = Url::combineQueryString("/app/classroom-result/irt-summary", $query);
    $response = $this->http->get($url);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getIRTSummaryWithAllRepeat(array $smartbtw_ids, ?string $program, ?string $exam_type)
  {
    $query = ["smartbtw_ids" => $smartbtw_ids, "program" => $program, "with_report" => 1];
    if ($exam_type) $query["exam_type"] = $exam_type;
    $url = Url::combineQueryString("/app/classroom-result/irt-summary-all-repeat", $query);
    $response = $this->http->get($url);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getSummaryWithAllRepeat(array $smartbtw_ids, string $program, ?string $exam_type)
  {
    $query = ["smartbtw_ids" => $smartbtw_ids, "program" => $program, 'with_report' => 1];
    if ($exam_type) $query["exam_type"] = $exam_type;
    $url = Url::combineQueryString("/app/classroom-result/summary-all-repeat", $query);
    $response = $this->http->get($url);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getCodeTryoutSummary(array $smartbtw_ids, array $task_ids, string $program)
  {
    $query = ["smartbtw_ids" => $smartbtw_ids, "task_ids" => $task_ids, "program" => $program, 'with_report' => 1];
    $url = Url::combineQueryString("/app/classroom-result/code-tryout/summary", $query);
    $response = $this->http->get($url);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getLastSevenDaysReportSummary(array $smartbtw_ids)
  {
    $lastSevenDaysDate = Carbon::now()->subDays(7)->format('Y-m-d');
    $query = ["smartbtw_ids" => $smartbtw_ids, "program" => 'skd', 'with_report' => 1, 'report_start_date' => $lastSevenDaysDate];
    $url = Url::combineQueryString("/app/classroom-result/summary", $query);
    $response = $this->http->get($url);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }
}

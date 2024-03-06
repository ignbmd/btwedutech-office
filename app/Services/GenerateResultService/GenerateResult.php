<?php

namespace App\Services\GenerateResultService;

use App\Services\Service;
use App\Services\ServiceContract;

class GenerateResult extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.generateresult', '');
  }

  // SKD 16 Modul
  public function generateSKDGraph($payload = [])
  {
    $response = $this->http->post(url: "/pdf-graph", data: $payload);
    $body = json_decode($response->body());
    return $body?->data ?? null;
  }

  // TPS 16 Modul
  public function generateTPSGraph($payload = [])
  {
    $response = $this->http->post(url: "/pdf-graph-tps", data: $payload);
    $body = json_decode($response->body());
    return $body?->data ?? null;
  }

  public function getStudentPTKReportPDFLink(string $student_id,  string|null $filter)
  {
    $url = $filter
      ? "/student-report/ptk/$student_id?filter=$filter"
      : "/student-report/ptk/$student_id";
    return $this->http->post(url: $url);
  }

  public function getStudentPTKResumePDFLink(string $student_id, string|null $filter)
  {
    $url = $filter
      ? "/student-resume/ptk/$student_id?filter=$filter"
      : "/student-resume/ptk/$student_id";
    return $this->http->post(url: $url);
  }

  public function generatePDFRanking($program, $taskId)
  {
    return $this->http->post(url: "/download-ranking-$program/$taskId");
  }

  public function generatePDFPerformaKelas(array $payload)
  {
    return $this->http->post("/download-performa-kelas", $payload);
  }

  public function generatePDFSamaptaGroup($payload)
  {
    return $this->http->post(url: "/samapta-group-report/generate", data: $payload);
  }

  public function generatePDFStudentSamapta($payload)
  {
    return $this->http->post(url: "/samapta-student-report/generate", data: $payload);
  }
}

<?php

namespace App\Services\ExaminationService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class ExamResult extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.examination', '');
  }

  public function getPostTestResult(array $student_ids, array $modul_ids)
  {
    $data = ['student_ids' => $student_ids, 'modul_ids' => $modul_ids];
    $response = $this->http->post(url: "/admin/exam-answers/post-test", data: $data);
    $data = json_decode($response)->data ?? [];
    return $data;
  }

  public function getPreTestResult(array $student_ids, array $modul_ids)
  {
    $data = ['student_ids' => $student_ids, 'modul_ids' => $modul_ids];
    $response = $this->http->post(url: "/admin/exam-answers/pre-test", data: $data);
    $data = json_decode($response)->data ?? [];
    return $data;
  }
}

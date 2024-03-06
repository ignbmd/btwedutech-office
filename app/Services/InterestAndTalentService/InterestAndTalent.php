<?php

namespace App\Services\InterestAndTalentService;

use App\Services\Service;
use App\Services\ServiceContract;

class InterestAndTalent extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.peminatan', '');
  }

  public function getInstanceStudentCountByInstanceIDs(array $instance_ids)
  {
    return $this->http->post(url: "/student-results/count-total/bulk", data: ["instance_id" => $instance_ids]);
  }

  public function getInstanceExamCodeCountByInstanceIDs(array $instance_ids)
  {
    return $this->http->post(url: "/exam-code/count-codes/bulk", data: ["instance_id" => $instance_ids]);
  }

  public function getStudentResultPDFDownloadLink(string $participant_id)
  {
    return $this->http->get(url: "/student-results/download-result/$participant_id");
  }

  public function updateAssignAccessCode(string $grup_test_id, array $payload){
    return $this->http->put(url: "/group-tests/$grup_test_id", data: $payload);
  }

  public function getStudentResultByEmail(string $email)
  {
    return $this->http->get(url: "/student-results/email/$email");
  }

  public function getAllCodeRequest()
  {
    $response = $this->http->get("/code-requests/get-all");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getExamCodeByInstanceId(string $id)
  {
    $response = $this->http->get("/exam-code/by-instance-id/$id");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getStudentResult(string $id)
  {
    $response = $this->http->get("/student-results/by-instance-id/$id");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }
}

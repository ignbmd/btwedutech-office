<?php

namespace App\Services\MedicalCheckupService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class MedicalCheckup extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.mcu', '');
  }

  /**
   *  POINT Medical Checkup
   */
  public function getAllPoint() {
    $response = $this->http->get(
      url: "/point-checkup/all"
    );
    return $response;
  }

  public function getPointCheckup() {
    $response = $this->http->get(
      url: "/point-checkup"
    );
    return $response;
  }

  public function createPoint(array $payload) {
    $response = $this->http->post(
      url: "/point-checkup",
      data: $payload
    );
    return $response;
  }

  public function updatePoint(string $pointId, array $payload) {
    $response = $this->http->put(
      url: "/point-checkup/".$pointId,
      data: $payload
    );
    return $response;
  }

  public function detail(string $id) {
    $response = $this->http->get(
      url: "/point-checkup/".$id
    );
    return $response;
  }


  /**
   *  Record Medical Checkup
   */
  public function getAllRecordHistory() {
    $response = $this->http->get(
      url: "/record-student"
    );
    return $response;
  }

  public function getRecordHistory(string $studentId) {
    $response = $this->http->get(
      url: "/record-student/log/".$studentId
    );
    return $response;
  }

  public function getRecordSummary(string $historyId) {
    $response = $this->http->get(
      url: "/record-student/detail/".$historyId
    );
    return $response;
  }

  public function createRecord(array $payload) {
    $response = $this->http->post(
      url: "/record-student",
      data: $payload
    );
    return $response;
  }

  public function updateRecord(string $historyId, array $payload) {
    $response = $this->http->put(
      url: "/record-student/".$historyId,
      data: $payload
    );
    return $response;
  }
}

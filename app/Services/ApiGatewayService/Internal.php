<?php

namespace App\Services\ApiGatewayService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class Internal extends Service implements ServiceContract
{
  use HasBranch;


  protected function serviceAddress(): string
  {
    return config('services.btw.api_gateway', '') . "/internal";
  }

  private function getHeaders()
  {
    return [
      'X-Office-Token' => config('services.btw.api_gateway_token_office'),
    ];
  }

  public function searchStudents($query = [])
  {
    $response = $this->http->withHeaders($this->getHeaders())->get(url: '/students/search', query: $query);
    $data = json_decode($response->body());
    return $data?->data ?? [];
  }

  public function getPremiumPackageById($id)
  {
    $response = $this->http->withHeaders($this->getHeaders())->get("/premium-package/$id");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getTatapMukaById($id)
  {
    $response = $this->http->withHeaders($this->getHeaders())->get("/tatap-muka/$id");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getPrograms($query = [])
  {
    $query = array_filter($query);
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->get(url: '/programs/option', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getAllStudentIds()
  {
    $response = $this->http->withHeaders($this->getHeaders())->get(url: '/students/ids');
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getStudentByEmail($query = [])
  {
    $response = $this->http->withHeaders($this->getHeaders())->get(url: "/students/get-by-email", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getStudentsNewIds($old_ids = [])
  {
    $response = $this->http->withHeaders($this->getHeaders())->post(url: "/students/new-ids", data: ["old_ids" => $old_ids]);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getStudentProfile($student_id)
  {
    return $this->http->withHeaders($this->getHeaders())->get(url: "/students/" .$student_id. "/profile");
  }

  public function getQuestionCategory($program_id)
  {
    $query = $program_id ? ['program_id' => $program_id] : [];
    $response = $this->http->withHeaders($this->getHeaders())->get(url: "/question-category", query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function downloadStudentReport(int $student_id, ?string $exam_type)
  {
    $query = ["program" => "skd", "student_id" => $student_id];
    if ($exam_type) $query['exam_type'] = $exam_type;

    $response = $this->http->withHeaders($this->getHeaders())->get(url: "/student-result/download-report", query: $query);
    if (!$response->successful()) $response->throw();
    else {
      header('Content-Type:application/pdf');
      header('Content-Disposition:inline');
      file_put_contents('file.pdf', $response);
      readfile('file.pdf');
      unlink('file.pdf');
      exit();
    }
  }

  public function downloadStudentRanking($query = [])
  {
    $response = $this->http->withHeaders($this->getHeaders())->get(url: "/student-result/download-ranking", query: $query);
    if (!$response->successful()) $response->throw();
    else {
      header('Content-Type:application/pdf');
      header('Content-Disposition:inline');
      file_put_contents('file.pdf', $response);
      readfile('file.pdf');
      unlink('file.pdf');
      exit();
    }
  }

  public function downloadClassProgressReport(string $classroom_id, array $query)
  {
    $response = $this->http->withHeaders($this->getHeaders())->get(url: "/classroom-result/" . $classroom_id . "/progress-report", query: $query);
    if (!$response->successful()) $response->throw();
    else {
      header('Content-Type:application/pdf');
      header('Content-Disposition:inline');
      file_put_contents('file.pdf', $response);
      readfile('file.pdf');
      unlink('file.pdf');
      exit();
    }
  }

  public function updateStudentBranchCode(string $studentId, string $branchCode)
  {
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->put(url: '/students/' . $studentId . '/branch-code', data: ["branch_code" => $branchCode]);
    return $response;
  }

  public function sendReceiveModule(string $studentId)
  {
    $response = $this->http
      ->withHeaders([
        'Content-Type' => 'application/json',
        'X-Public-Token' => env('PUBLIC_TOKEN', '383463177109361c68e2020d492b7b477fa2bcb031fa62e29872d7ae1dacca46')
      ])
      ->post(url: '/make-received-module', data: ["id" => (int)$studentId]);
    return $response;
  }

  public function updateLegacyTransaction(int $legacyBillId, string $paymentStatus)
  {
    $response = $this->http->withHeaders($this->getHeaders())
      ->post(
        url: "/transaction/update-legacy",
        data: [
          'legacy_bill_id' => $legacyBillId,
          'payment_status' => $paymentStatus
        ]
      );

    return $response;
  }

  public function deleteStudent($smartbtw_id)
  {
    $response = $this->http->withHeaders($this->getHeaders())->delete(url: "/students/$smartbtw_id");
    return $response;
  }

  public function getProvince()
  {
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->get(url: '/location/get-province');
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function getRegion($provinceId)
  {
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->get(url: '/location/get-region/' . $provinceId);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function createLegacyTask($payload)
  {
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->post(url: '/tryout/create-tugas-code', data: $payload);
    return $response;
  }

  public function createLegacyTryoutCode($payload)
  {
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->post(url: '/tryout/create-tryout-offline', data: $payload);
    return $response;
  }

  public function createLegacyTryoutFree($payload)
  {
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->post(url: '/tryout/create-tryout-free', data: $payload);
    return $response;
  }

  public function getSettlementOrganicTransaction($payload)
  {
    $response = $this->http
      ->withHeaders($this->getHeaders())
      ->post(url: '/dashboard/organic/settlement', data: $payload);
    return $response;
  }

  public function getCodeTryoutBreakTime($tryoutCode)
  {
    $response = $this->http
      ->withHeaders(($this->getHeaders()))
      ->get(url: '/code-tryout/schedule/break-time/' . $tryoutCode);
    return $response;
  }

  public function setTryoutCodeSchedule($payload)
  {
    $response = $this->http
      ->withHeaders(($this->getHeaders()))
      ->post(url: '/code-tryout/schedule', data: $payload);
    return $response;
  }

  public function setTryoutSchedule($payload)
  {
    $response = $this->http
      ->withHeaders(($this->getHeaders()))
      ->post(url: '/tryout/schedule', data: $payload);
    return $response;
  }

  public function removeTryoutCodeSchedule($tryoutCode)
  {
    $response = $this->http
      ->withHeaders(($this->getHeaders()))
      ->delete(url: '/code-tryout/schedule/' . $tryoutCode);
    return $response;
  }

  public function getCodeTryoutSchedules()
  {
    return $this->http->withHeaders(($this->getHeaders()))->get(url: '/code-tryout/schedule');
  }

  public function createPremiumPackage(array $payload)
  {
    return $this->http->withHeaders(($this->getHeaders()))->post(url: '/premium-package', data: $payload);
  }

  public function updatePremiumPackage(array $payload, int $id)
  {
    return $this->http->withHeaders(($this->getHeaders()))->put(url: '/premium-package/' . $id, data: $payload);
  }

  public function createTatapMuka(array $payload)
  {
    return $this->http->withHeaders(($this->getHeaders()))->post(url: '/tatap-muka', data: $payload);
  }

  public function updateTatapMuka(array $payload, int $id)
  {
    return $this->http->withHeaders(($this->getHeaders()))->put(url: '/tatap-muka/' . $id, data: $payload);
  }

  public function updateStudentInterest(int $id, string $interest)
  {
    return $this->http->withHeaders(($this->getHeaders()))->put(url: "/students/$id/interest", data: ["interest" => $interest]);
  }
}

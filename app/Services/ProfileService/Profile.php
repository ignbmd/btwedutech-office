<?php

namespace App\Services\ProfileService;

use App\Helpers\Url;
use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use Illuminate\Http\Client\Response;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ServerException;

class Profile extends Service implements ServiceContract
{
  use HasBranch;

  protected function serviceAddress(): string
  {
    return config("services.btw.profile", "");
  }

  public function getAllStudent()
  {
    $response = $this->http->get("/students");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getStudentByIds(array $query)
  {
    $url = Url::combineQueryString("/students", $query);
    $response = $this->http->get($url);
    return $response;
    // $data = json_decode($response->body());
    // return $data?->data ?? [];
  }

  public function getStudentsByBranchCode(string $branch_code = "PT0000", int $limit = 7, int $skip = 0, string $search = "")
  {
    $payload = ["branch_code" => $branch_code, "limit" => $limit, "skip" => $skip, "search" => $search];
    $response = $this->http->get("/students-with-branch", $payload);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getStudentsByMultipleBranchCode(string $branch_code = "PT0000", int $limit = 7, int $skip = 0, string $search = "")
  {
    $payload = ["branch_code" => $branch_code, "limit" => $limit, "skip" => $skip, "search" => $search];
    $response = $this->http->get("/students-with-many-branch", $payload);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getSingleStudent(int $smartbtw_id)
  {
    $response = $this->http->get("/students/{$smartbtw_id}");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getSingleStudentFromElastic(int $smartbtw_id)
  {
    $response = $this->http->get("/students-elastic/{$smartbtw_id}");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getSingleScoreBKN(string $scoreId)
  {
    $response = $this->http->get("/score-skd/detail/{$scoreId}");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getManyScore(array $payload)
  {
    $response = $this->http->post("/score-skd/year", $payload);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getAllScoreBKN(int $smartbtw_id)
  {
    $response = $this->http->get("/score-skd/student/{$smartbtw_id}");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function deleteScoreBKN(string $scoreId)
  {
    return $this->http->delete("/score-skd/{$scoreId}");
  }

  public function addScore(array $payload)
  {
    $response = $this->http->post("/score-skd", $payload);
    $data = json_decode($response?->body());
    return $data ?? null;
  }

  public function createParentData(array $payload)
  {
    $response = $this->http->post("/parent-data", $payload);
    $data = json_decode($response?->body());
    return $data ?? null;
  }

  public function updateParentData(array $payload)
  {
    $response = $this->http->put("/parent-data", $payload);
    $data = json_decode($response?->body());
    return $data ?? null;
  }

  public function updateScore(array $payload, string $scoreId)
  {
    $response = $this->http->put("/score-skd/$scoreId", $payload);
    $data = json_decode($response?->body());
    return $data ?? null;
  }

  public function getBannedAccess(string $studentID, string $account_type)
  {
    $response = $this->http->get("/student-access/by-student-id/$studentID/", ["app_type" => $account_type]);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }

  public function createBannedAccess(array $payload)
  {
    return $this->http->post("/student-access", $payload);
  }

  public function deleteBannedAccess(array $payload, string $studentID)
  {
    $response = $this->http->delete("/student-access/student-id/{$studentID}/", $payload);
    $data = json_decode($response?->body());
    return $data ?? null;
  }

  public function storeBannedAccess(array $payload)
  {
    $response = $this->http->post("/student-access", $payload);
    $data = json_decode($response?->body());
    return $data ?? null;
  }

  public function getStudentsByEmail(string $emails)
  {
    return $this->http->get("/students-branch", ["emails" => $emails]);
  }

  public function getBannedAccessByCode(string $app_type, string $banned_access_code)
  {
    return $this->http->get("/student-access/elastic", ["app_type" => $app_type, "code" => $banned_access_code]);
  }

  public function getStudentResultSummary(array $payload): Response
  {
    return $this->http->post("/student-performa-uka", $payload);
  }

  public function getSingleBKNScoreBySmartBTWIDAndYear(int $smartbtw_id, int $year)
  {
    return $this->http->get(url: "/bkn-score/single/$smartbtw_id/$year");
  }

  public function getBKNScoreByMultipleSmartBTWID(array $payload)
  {
    return $this->http->post(url: "/bkn-score/arr-student-id", data: $payload);
  }

  public function getBKNScoreByMultipleStudentEmails(array $payload)
  {
    return $this->http->post(url: "/bkn-score/arr-bulk-email", data: $payload);
  }

  public function upsertBKNScore(array $payload)
  {
    return $this->http->post(url: "/bkn-score", data: $payload);
  }
  public function getSingleReportStudent(int $smartbtw_id)
  {
    $response = $this->http->get(url: "/student-report/ptk/$smartbtw_id?filter=NO_TRIAL");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function getSamaptaScoreByMultipleStudentEmails(array $payload)
  {
    return $this->http->post(url: "/samapta-score/arr-bulk-email", data: $payload);
  }

  public function upsertSamaptaScore(array $payload)
  {
    return $this->http->post(url: "/samapta-score", data: $payload);
  }

  public function getSingleInterviewBySmartbtwAndYear(int $smartbtw_id, int $year)
  {
    $response = $this->http->get(url: "/interview-score/student-id/$smartbtw_id/year/$year");
    $data = json_decode($response?->body());
    return $data->data ?? null;
  }
  public function getInterviewByStudentEmails(array $payload)
  {
    return $this->http->post(url: "/interview-score/find-by-emails", data: $payload);
  }
  public function upsertInterviewTryout(array $payload)
  {
    return $this->http->post(url: "/interview-score", data: $payload);
  }

  public function getStudentTargetFromElastic(int $smartbtw_id, string $type = "PTK")
  {
    try {
      $client = new Client();
      $serviceURL = config("services.btw.profile", "");
      $payload = ["smartbtw_id" => $smartbtw_id, "target_type" => $type];
      $url = "$serviceURL/student-target/elastic";
      $response = $client->get($url, [
        "json" => $payload
      ]);
      return $response;
    } catch (RequestException $e) {
      return $e->getResponse();
    } catch (ClientException $e) {
      return $e->getResponse();
    } catch (ServerException $e) {
      return $e->getResponse();
    }
  }
  public function getAllSession()
  {
    $response = $this->http->get("/interview-session");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }
  public function getResultInterviewByIdAndSSO($session_id, $sso_id)
  {
    $response = $this->http->get("/interview-score/session/$session_id/user/$sso_id");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function createInterviewSession(array $payload)
  {
    return $this->http->post("/interview-session", $payload);
  }

  public function updateInterviewSession(string $id, array $payload)
  {
    return $this->http->put("/interview-session/$id", $payload);
  }

  public function deleteInterviewSession(string $id)
  {
    return $this->http->delete("/interview-session/$id");
  }

  public function getInterviewSessionByID(string $id)
  {
    return $this->http->get("/interview-session/$id");
  }

  public function getInterviewScoreByID(string $id)
  {
    $response = $this->http->get("/interview-score/$id");
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }

  public function updateInterviewScore(array $payload, $id)
  {
    return $this->http->put(url: "/interview-score/$id", data: $payload);
  }

  public function getUKACodeScoresByEmail(string $email)
  {
    return $this->http->get(url: "/history-scores/uka-code-scores/$email");
  }

  public function getAllSingleStudentTarget(int $smartbtw_id, string $target_type)
  {
    return $this->http->get(url: "/student-target/by-student-all?smartbtw_id=$smartbtw_id&target_type=$target_type");
  }

  public function getSingleStudentReportV2(
    string $program,
    int $smartbtw_id,
    string $stage_type = "UMUM",
    string $module_type = "ALL_MODULE"
  ) {
    $url = "/student-report-uka/$program/$smartbtw_id?filter=$module_type&type_stage=$stage_type";
    return $this->http->get(url: $url);
  }

  public function getSingleStudentUKAReportDocuments(array $params)
  {
    return $this->http->post(url: "/get-raport-list", data: $params);
  }

  public function getMultipleStudentsProgressReportDocuments(array $params)
  {
    return $this->http->post(url: "/progress-report", data: $params);
  }

  public function getSingleStudentPrePostTestReport(int $smartbtw_id, string $program)
  {
    return $this->http->get("/student-report-pre-post-test/$program/$smartbtw_id");
  }

  public function getStudentsByMultipleIds($payload)
  {
    $response = $this->http->post("/student-array/smartbtw-id", data: $payload);
    $data = json_decode($response?->body());
    return $data?->data ?? null;
  }
}

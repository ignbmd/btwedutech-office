<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SamaptaService\Student as SamaptaStudent;
use App\Services\SamaptaService\Classroom as SamaptaClassroom;
use App\Services\SamaptaService\Session as SamaptaSession;
use App\Services\GenerateResultService\GenerateResult;
use App\Services\ProfileService\Profile;
use Carbon\Carbon;
use Exception;
use ZipArchive;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SamaptaController extends Controller
{
  private SamaptaStudent $studentSamaptaService;
  private SamaptaClassroom $classroomSamaptaService;
  private SamaptaSession $sessionSamaptaService;
  private Profile  $profile;
  private GenerateResult $generateResult;

  public function __construct(
    SamaptaStudent $studentSamaptaService,
    SamaptaClassroom $classroomSamaptaService,
    SamaptaSession $sessionSamaptaService,
    Profile $profile,
    GenerateResult $generateResult,
  ) {
    $this->studentSamaptaService = $studentSamaptaService;
    $this->classroomSamaptaService = $classroomSamaptaService;
    $this->sessionSamaptaService = $sessionSamaptaService;
    $this->profile = $profile;
    $this->generateResult = $generateResult;
  }

  public function getAllStudents(Request $request)
  {
    $response = $this->studentSamaptaService->getAllStudents($request->all());
    return $response->json();
  }

  public function getStudentByClassroomId($id)
  {
    $classroomResponse = $this->classroomSamaptaService->getByClassroomId($id);
    $studentIds = array_column($classroomResponse, 'smartbtw_id');
    $ids = ["smartbtw_id" => array_values(array_unique($studentIds))];
    $studentsProfile = $this->profile->getStudentsByMultipleIds($ids);
    return response()->json($studentsProfile);
  }

  public function getAllClassroom()
  {
    $query = [
      'branch_code' => Auth::user()?->branch_code,
      'tags' => "SAMAPTA",
      // 'year' => 2023
    ];
    $response = $this->classroomSamaptaService->getAll($query);
    return response()->json($response);
  }

  public function getSessionByClassroomId($classroomId)
  {
    $response = $this->sessionSamaptaService->getSessionBySessionId($classroomId);
    return response()->json($response);
  }

  public function getStudentBySessionId($sessionId, $gender, $classroom_id)
  {
    $query = ['gender' => $gender];
    // get student record
    $studentSamaptaRecords = $this->sessionSamaptaService->getStudentBySessionId($sessionId, $query);
    // get classMember
    $classroomResponse = $this->classroomSamaptaService->getByClassroomId($classroom_id);
    $studentIds = array_column($classroomResponse, 'smartbtw_id');
    $ids = ["smartbtw_id" => array_values(array_unique($studentIds))];
    $studentsProfile = $this->profile->getStudentsByMultipleIds($ids);
    // dapatkan smartbtw_id dan berikan nilai false ("id" => false);
    $studentHasSamaptaSessionScore = [];
    foreach ($studentSamaptaRecords as $data) {
      $id = $data->smartbtw_id;
      $type = false;
      $studentHasSamaptaSessionScore[$id] = $type;
    }

    foreach ($studentsProfile as $member) {
      $studentHasScore = array_key_exists($member->smartbtw_id, $studentHasSamaptaSessionScore);

      if (!$studentHasScore) {
        $emptySamaptaScoreObject = [
          'add_score' => false,
          'smartbtw_id' => $member->smartbtw_id,
          'name' => $member->name,
          'email' => $member->email,
          'gender' => $member->gender,
          'exercise_a' => ['r_score' => 0, 't_score' => 0],
          'exercise_b' => [
            ['type' => 'SIT_UP', 'r_score' => 0, 't_score' => 0],
            ['type' => 'PUSH_UP', 'r_score' => 0, 't_score' => 0],
            ['type' => 'SHUTTLE', 'r_score' => 0, 't_score' => 0],
          ],
          'mean_exercise_b' => 0,
          'total_score' => ['score' => 0, 'grade' => 'D'],
          'created_at' => null, // Tambahkan properti sesuai kebutuhan
          'updated_at' => null, // Tambahkan properti sesuai kebutuhan
          'deleted_at' => null, // Tambahkan properti sesuai kebutuhan
        ];

        $studentHasSamaptaSessionScore[$member->smartbtw_id] = false;
        $studentSamaptaRecords[] = $emptySamaptaScoreObject;
        continue;
      }

      $studentHasSamaptaSessionScore[$member->smartbtw_id] = true;

      $studentSamaptaScoreIndex = array_search($member->smartbtw_id, array_column($studentSamaptaRecords, 'smartbtw_id'));
      $studentSamaptaRecords[$studentSamaptaScoreIndex]->add_score = true;
    }

    return response()->json($studentSamaptaRecords);
  }

  public function getStudentBySessionIdAndGender($sessionId, $gender)
  {
    $query = ['gender' => $gender];
    $studentSamaptaRecords = $this->sessionSamaptaService->getStudentBySessionId($sessionId, $query);
    return response()->json($studentSamaptaRecords);
  }

  public function getStudentBySessionIdAndGenderWithSort($sessionId, $gender, $sort)
  {
    $query = ['gender' => $gender, 'sort' => $sort];
    $studentSamaptaRecords = $this->sessionSamaptaService->getStudentBySessionId($sessionId, $query);
    return response()->json($studentSamaptaRecords);
  }

  public function getGroupSessionByClassroomId($classroom_id)
  {
    $response = $this->sessionSamaptaService->getGroupSessionByClassroomId($classroom_id);
    return response()->json($response);
  }

  public function getClassroomById($classroomId)
  {
    $response = $this->classroomSamaptaService->getSingle($classroomId);
    return response()->json($response);
  }
  public function createSession(Request $request)
  {
    $payload = $request->all();
    $response = $this->sessionSamaptaService->createSession($payload);
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getStudentBySelectionTypeAndSelectionYear($selected_year, $selected_session)
  {
    $query = [
      'branch_code' => Auth::user()?->branch_code,
      'tags' => $selected_session,
      'year' => $selected_year
    ];
    $getClassroomResponse = $this->classroomSamaptaService->getAll($query);
    $classroomIds = array_column($getClassroomResponse, '_id');
    $classroomResponse = $this->classroomSamaptaService->getByClassroomIds($classroomIds);
    $collection_id = [];
    foreach ($classroomResponse as $data) {
      $id = $data->smartbtw_id ?? "";
      $classroom_id = $data->classroom_id ?? "";
      // Menambahkan data ke array
      $collection_id[$id] = $classroom_id;
    }
    $studentIdsDecode = array_column(json_decode(json_encode($classroomResponse), true), 'smartbtw_id');
    $ids = ["smartbtw_id" => array_values(array_unique($studentIdsDecode))];
    $studentsProfile = $this->profile->getStudentsByMultipleIds($ids) ?? [];
    foreach ($studentsProfile as &$profile) {
      $smartbtw_id = $profile->smartbtw_id;
      if (isset($collection_id[$smartbtw_id])) {
        $profile->classroom_id = $collection_id[$smartbtw_id];
      }
    }
    $mappedStudentsProfileByClassroomID = collect($studentsProfile)
      ->groupBy("classroom_id")
      ->toArray();
    $payload = [];
    foreach ($mappedStudentsProfileByClassroomID as $index => $studentProfile) {
      $item = [
        "classroom_id" => $index,
        "record_classroom" => $studentProfile
      ];
      array_push($payload, $item);
    }
    return response()->json($studentsProfile);
  }

  public function getStudentBySmartbtwId($smartbtwId)
  {
    $response = $this->sessionSamaptaService->getStudentBySmartbtwId($smartbtwId);
    return response()->json($response);
  }
  public function updateSession(Request $request, $id)
  {
    $payload = $request->all();
    $response = $this->sessionSamaptaService->updateScoreSessionByClassroomId($id, $payload);
    $body = json_decode($response?->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function generatePDFGroupReport($sessionId)
  {
    $studentSamaptaRecords = $this->sessionSamaptaService->getSessionBySessionId($sessionId);
    $studentSamaptaRecordsArray = json_decode(json_encode($studentSamaptaRecords), true);
    Carbon::setLocale('id');
    $dateAndTime = date("Y-m-dTH:i:s");
    $carbonDate = Carbon::parse($dateAndTime);
    $formattedDate = $carbonDate->translatedFormat('l, d F Y');
    $payload = [
      "group" => $studentSamaptaRecordsArray['title'],
      "category" => $studentSamaptaRecordsArray['instance'] ? $studentSamaptaRecordsArray['instance'] : "SEKDIN",
      "date" => $formattedDate,
      "include_pull_up" => false,
      "male_reports" => [],
      "female_reports" => [],
    ];

    $maxReportsPerSection = 20;

    $maleReportCount = 0;
    $femaleReportCount = 0;
    $currentMaleSection = [];
    $currentFemaleSection = [];
    $maleSectionNumber = 1;
    $femaleSectionNumber = 1;
    $currentRecordIndex = 1;
    $totalRecords = count($studentSamaptaRecordsArray['record_classroom']);

    foreach ($studentSamaptaRecordsArray['record_classroom'] as $record) {
      $report = [
        "no" => null,
        "_id" => $record['_id'],
        "smartbtw_id" => $record['smartbtw_id'],
        "group_id" => $record['group_id'],
        "name" => $record['name'],
        "email" => $record['email'],
        "gender" => $record['gender'],
        "exercise_a" => $record['exercise_a'],
        "exercise_b" => $record['exercise_b'],
        "mean_exercise_b" => $record['mean_exercise_b'],
        "total_score" => $record['total_score'],
      ];

      if ($record['gender'] == 1) {
        // For male reports
        if ($maleReportCount < $maxReportsPerSection) {
          $report['no'] = $maleReportCount + 1;
          $currentMaleSection[] = $report;
          $maleReportCount++;
        } else {
          $isFirstMaleSection = $maleSectionNumber == 1;
          $isLastMaleSection = $currentRecordIndex == $totalRecords;
          $payload["male_reports"][] = $this->createSectionReport($currentMaleSection, $maleSectionNumber++, $isFirstMaleSection, $isLastMaleSection);
          $currentMaleSection = [$report];
          $maleReportCount = 1;
        }
      } elseif ($record['gender'] == 0) {
        // For female reports
        if ($femaleReportCount < $maxReportsPerSection) {
          $report['no'] = $femaleReportCount + 1;
          $currentFemaleSection[] = $report;
          $femaleReportCount++;
        } else {
          $isFirstFemaleSection = $femaleSectionNumber == 1;
          $isLastFemaleSection = $currentRecordIndex == $totalRecords;
          $payload["female_reports"][] = $this->createSectionReport($currentFemaleSection, $femaleSectionNumber++, $isFirstFemaleSection, $isLastFemaleSection);
          $currentFemaleSection = [$report];
          $femaleReportCount = 1;
        }
      }
      $currentRecordIndex++;
    }

    // Add the remaining male reports as a single section
    if (!empty($currentMaleSection)) {
      $isFirstMaleSection = $maleSectionNumber == 1;
      $isLastMaleSection = $maleSectionNumber == $currentRecordIndex - 1;
      $payload["male_reports"][] = $this->createSectionReport($currentMaleSection, $maleSectionNumber++, $isFirstMaleSection, $isLastMaleSection);
    }

    // Add the remaining female reports as a single section
    if (!empty($currentFemaleSection)) {
      $isFirstFemaleSection = $femaleSectionNumber == 1;
      $isLastFemaleSection = $femaleSectionNumber == $currentRecordIndex - 1;
      $payload["female_reports"][] = $this->createSectionReport($currentFemaleSection, $femaleSectionNumber++, $isFirstFemaleSection, $isLastFemaleSection);
    }

    //  Jika Tidak ada data Laki-Laki
    if (empty($payload["male_reports"])) {
      $payload["male_reports"][] = [
        "section_number" => 1,
        "section_reports" => [],
        "is_first_section" => true,
        "is_last_section" => true,
      ];
    }

    // Jika Tidak ada data Perempuan
    if (empty($payload["female_reports"])) {
      $payload["female_reports"][] = [
        "section_number" => 1,
        "section_reports" => [],
        "is_first_section" => true,
        "is_last_section" => true,
      ];
    }

    $generatePdfGroup = $this->generateResult->generatePDFSamaptaGroup($payload);
    $body = json_decode($generatePdfGroup?->body());
    $status = $generatePdfGroup->status();
    return response()->json($body, $status);
  }

  private function createSectionReport($reports, $sectionNumber, $isFirstSection, $isLastSection)
  {
    return [
      "section_number" => $sectionNumber,
      "section_reports" => $reports,
      "is_first_section" => $isFirstSection,
      "is_last_section" => $isLastSection,
    ];
  }


  public function generatePDFGroupReportBulk($classroomId)
  {
    $studentReport = $this->sessionSamaptaService->getStudentScoreByClassroomId($classroomId);
    $body = json_decode($studentReport->body());
    // Tanggal Saat DiJalankan Function ini
    Carbon::setLocale('id');
    $dateAndTime = date("Y-m-dTH:i:s");
    $carbonDate = Carbon::parse($dateAndTime);
    $formattedDate = $carbonDate->translatedFormat('l, d F Y');

    $classroomResponse = $this->classroomSamaptaService->getSingle($classroomId);
    $arrayTag = $classroomResponse->tags;
    $category = (in_array("SKD", $arrayTag) && in_array("SAMAPTA", $arrayTag)) ? "SEKDIN" : "SAMAPTA SEKDIN";

    foreach ($body->data as &$student) {
      $record_classroom = [
        'exercise_a' => $student->exercise_a,
        'exercise_b' => $student->exercise_b
      ];
      $student->record_classroom = $record_classroom;
      unset($student->exercise_a);
      unset($student->exercise_b);
    }
    unset($student);

    $payload = [
      "group" => $classroomResponse->title,
      "category" => $category,
      "date" => $formattedDate,
      "include_pull_up" => false,
      "male_reports" => [],
      "female_reports" => [],
    ];

    $maxReportsPerSection = 20;

    $maleReportCount = 0;
    $femaleReportCount = 0;
    $currentMaleSection = [];
    $currentFemaleSection = [];
    $maleSectionNumber = 1;
    $femaleSectionNumber = 1;
    $currentRecordIndex = 1;
    $totalRecords = 0;
    foreach ($body->data as $item) {
      if (isset($item->record_classroom)) {
        $totalRecords += 1;
      }
    }

    foreach ($body->data as $record) {
      $report = [
        "no" => null,
        "_id" => $record->_id,
        "smartbtw_id" => $record->smartbtw_id,
        "group_id" => $record->group_id,
        "name" => $record->name,
        "email" => $record->email,
        "gender" => $record->gender,
        "exercise_a" => $record->record_classroom['exercise_a'],
        "exercise_b" => $record->record_classroom['exercise_b'],
        "mean_exercise_b" => $record->mean_exercise_b,
        "total_score" => $record->total_score,
      ];

      if ($record->gender == 1) {
        // For male reports
        if ($maleReportCount < $maxReportsPerSection) {
          $report['no'] = $maleReportCount + 1;
          $currentMaleSection[] = $report;
          $maleReportCount++;
        } else {
          $isFirstMaleSection = $maleSectionNumber == 1;
          $isLastMaleSection = $currentRecordIndex == $totalRecords;
          $payload["male_reports"][] = $this->createSectionReport($currentMaleSection, $maleSectionNumber++, $isFirstMaleSection, $isLastMaleSection);
          $currentMaleSection = [$report];
          $maleReportCount = 1;
        }
      } elseif ($record->gender == 0) {
        // For female reports
        if ($femaleReportCount < $maxReportsPerSection) {
          $report['no'] = $femaleReportCount + 1;
          $currentFemaleSection[] = $report;
          $femaleReportCount++;
        } else {
          $isFirstFemaleSection = $femaleSectionNumber == 1;
          $isLastFemaleSection = $currentRecordIndex == $totalRecords;
          $payload["female_reports"][] = $this->createSectionReport($currentFemaleSection, $femaleSectionNumber++, $isFirstFemaleSection, $isLastFemaleSection);
          $currentFemaleSection = [$report];
          $femaleReportCount = 1;
        }
      }
      $currentRecordIndex++;
    }

    // Add the remaining male reports as a single section
    if (!empty($currentMaleSection)) {
      $isFirstMaleSection = $maleSectionNumber == 1;
      $isLastMaleSection = $maleSectionNumber == $currentRecordIndex - 1;
      $payload["male_reports"][] = $this->createSectionReport($currentMaleSection, $maleSectionNumber++, $isFirstMaleSection, $isLastMaleSection);
    }

    // Add the remaining female reports as a single section
    if (!empty($currentFemaleSection)) {
      $isFirstFemaleSection = $femaleSectionNumber == 1;
      $isLastFemaleSection = $femaleSectionNumber == $currentRecordIndex - 1;
      $payload["female_reports"][] = $this->createSectionReport($currentFemaleSection, $femaleSectionNumber++, $isFirstFemaleSection, $isLastFemaleSection);
    }

    //  Jika Tidak ada data Laki-Laki
    if (empty($payload["male_reports"])) {
      $payload["male_reports"][] = [
        "section_number" => 1,
        "section_reports" => [],
        "is_first_section" => true,
        "is_last_section" => true,
      ];
    }

    // Jika Tidak ada data Perempuan
    if (empty($payload["female_reports"])) {
      $payload["female_reports"][] = [
        "section_number" => 1,
        "section_reports" => [],
        "is_first_section" => true,
        "is_last_section" => true,
      ];
    }

    $generatePdfGroup = $this->generateResult->generatePDFSamaptaGroup($payload);
    $body = json_decode($generatePdfGroup?->body());
    $status = $generatePdfGroup->status();
    return response()->json($body, $status);
  }

  public function getChartBySmartbtwId($smartbtw_id, $query)
  {
    $query = ['type' => $query];
    $studentSamaptaRecords = $this->sessionSamaptaService->getChartBySmartbtwId($smartbtw_id, $query);
    return response()->json($studentSamaptaRecords);
  }

  public function generatePDFRankingsGlobal($selected_session, $selected_year)
  {
    $payload = [
      'year' => (int)$selected_year,
      'instance' => $selected_session === "SAMAPTA" && "SKD" ? "SEKDIN" : $selected_session
    ];
    $getAverageStudentScore = $this->sessionSamaptaService->getAverageScoreStudentWithFilter($payload);
    $body = json_decode($getAverageStudentScore->body());

    foreach ($body->data as &$student) {
      $record_classroom = [
        'exercise_a' => $student->exercise_a,
        'exercise_b' => $student->exercise_b
      ];
      $student->record_classroom = $record_classroom;
      unset($student->exercise_a);
      unset($student->exercise_b);
    }
    unset($student);

    Carbon::setLocale('id');
    $dateAndTime = date("Y-m-dTH:i:s");
    $carbonDate = Carbon::parse($dateAndTime);
    $formattedDate = $carbonDate->translatedFormat('l, d F Y');
    $category = $selected_session === "SAMAPTA" && "SKD" ? "SEKDIN" : $selected_session;

    $payload = [
      "category" => $category,
      "date" => $formattedDate,
      "include_pull_up" => false,
      "male_reports" => [],
      "female_reports" => [],
    ];

    $maxReportsPerSection = 20;

    $maleReportCount = 0;
    $femaleReportCount = 0;
    $currentMaleSection = [];
    $currentFemaleSection = [];
    $maleSectionNumber = 1;
    $femaleSectionNumber = 1;
    $currentRecordIndex = 1;
    $totalRecords = 0;
    foreach ($body->data as $item) {
      if (isset($item->record_classroom)) {
        $totalRecords += 1;
      }
    }

    foreach ($body->data as $record) {
      $report = [
        "no" => null,
        "_id" => $record->_id,
        "smartbtw_id" => $record->smartbtw_id,
        "group_id" => $record->group_id,
        "name" => $record->name,
        "email" => $record->email,
        "gender" => $record->gender,
        "exercise_a" => $record->record_classroom['exercise_a'],
        "exercise_b" => $record->record_classroom['exercise_b'],
        "mean_exercise_b" => $record->mean_exercise_b,
        "total_score" => $record->total_score,
      ];

      if ($record->gender == 1) {
        // For male reports
        if ($maleReportCount < $maxReportsPerSection) {
          $report['no'] = $maleReportCount + 1;
          $currentMaleSection[] = $report;
          $maleReportCount++;
        } else {
          $isFirstMaleSection = $maleSectionNumber == 1;
          $isLastMaleSection = $currentRecordIndex == $totalRecords;
          $payload["male_reports"][] = $this->createSectionReport($currentMaleSection, $maleSectionNumber++, $isFirstMaleSection, $isLastMaleSection);
          $currentMaleSection = [$report];
          $maleReportCount = 1;
        }
      } elseif ($record->gender == 0) {
        // For female reports
        if ($femaleReportCount < $maxReportsPerSection) {
          $report['no'] = $femaleReportCount + 1;
          $currentFemaleSection[] = $report;
          $femaleReportCount++;
        } else {
          $isFirstFemaleSection = $femaleSectionNumber == 1;
          $isLastFemaleSection = $currentRecordIndex == $totalRecords;
          $payload["female_reports"][] = $this->createSectionReport($currentFemaleSection, $femaleSectionNumber++, $isFirstFemaleSection, $isLastFemaleSection);
          $currentFemaleSection = [$report];
          $femaleReportCount = 1;
        }
      }
      $currentRecordIndex++;
    }

    // Add the remaining male reports as a single section
    if (!empty($currentMaleSection)) {
      $isFirstMaleSection = $maleSectionNumber == 1;
      $isLastMaleSection = $maleSectionNumber == $currentRecordIndex - 1;
      $payload["male_reports"][] = $this->createSectionReport($currentMaleSection, $maleSectionNumber++, $isFirstMaleSection, $isLastMaleSection);
    }

    // Add the remaining female reports as a single section
    if (!empty($currentFemaleSection)) {
      $isFirstFemaleSection = $femaleSectionNumber == 1;
      $isLastFemaleSection = $femaleSectionNumber == $currentRecordIndex - 1;
      $payload["female_reports"][] = $this->createSectionReport($currentFemaleSection, $femaleSectionNumber++, $isFirstFemaleSection, $isLastFemaleSection);
    }

    //  Jika Tidak ada data Laki-Laki
    if (empty($payload["male_reports"])) {
      $payload["male_reports"][] = [
        "section_number" => 1,
        "section_reports" => [],
        "is_first_section" => true,
        "is_last_section" => true,
      ];
    }

    // Jika Tidak ada data Perempuan
    if (empty($payload["female_reports"])) {
      $payload["female_reports"][] = [
        "section_number" => 1,
        "section_reports" => [],
        "is_first_section" => true,
        "is_last_section" => true,
      ];
    }

    $generatePdfGroup = $this->generateResult->generatePDFSamaptaGroup($payload);
    $body = json_decode($generatePdfGroup?->body());
    $status = $generatePdfGroup->status();
    return response()->json($body, $status);
  }

  public function generatePDFStudentSamaptaSingle($smartbtw_id)
  {
    $studentSamaptaRecords = $this->sessionSamaptaService->getStudentBySmartbtwId($smartbtw_id);
    $averageScore = collect($studentSamaptaRecords)->reject(function ($item, $key) {
      return $key === 'record_classroom';
    })->toArray();

    $averageScoreMap = collect($averageScore)->map(function ($item) {
      $scoreKey = key((array)$item);
      $scoreValue = $item->$scoreKey;
      unset($item->$scoreKey);
      $item->score = $scoreValue;
      return $item;
    });

    $item = (object) [
      'pull_up' => (object) [
        'grade' => 'K2',
        'score' => 0
      ]
    ];

    $pullUpValue = $averageScoreMap->get('shuttle');

    $averageScoreMap->forget('shuttle');

    $averageScoreMap->put('pull_up', $item->pull_up);

    if ($pullUpValue !== null) {
      $averageScoreMap->put('shuttle', $pullUpValue);
    }

    $studentSamaptaRecords->history_score = $studentSamaptaRecords->record_classroom;
    $historyScore = collect($studentSamaptaRecords->history_score)->map(function ($record, $index) {
      $recordArray = (array) $record;

      if (array_key_exists('implementation_date', $recordArray)) {
        $recordArray['implementation_date'] = Carbon::parse($recordArray['implementation_date'])->format('d/m/Y');
      }

      // Menambahkan nomor
      $recordArray['no'] = $index + 1;
      $recordArray['date'] = $recordArray['implementation_date'];

      return $recordArray;
    })->toArray();

    $containsPullUp = collect($historyScore)->contains(function ($item, $key) {
      return collect($item['exercise_b'])->contains('type', 'PULL_UP');
    });

    $firstChunkScores = collect($historyScore)
      ->take(20);

    $remainingChunkScores = collect($historyScore)
      ->skip(20)
      ->chunk(25);

    $splitScores = collect([$firstChunkScores])
      ->concat($remainingChunkScores);

    $splitScores = collect($splitScores)
      ->map(function ($item, $index) use ($splitScores) {
        return (object)[
          "section_number" => $index + 1,
          "section_reports" => $item->values()->toArray(),
          "is_first_section" => $index == 0,
          "is_last_section" => $index == (count($splitScores) - 1)
        ];
      })
      ->values()
      ->all();
    $studentSamaptaRecords->history_score = $splitScores;

    $lastRunScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
      $dateAndTime = $record->implementation_date;
      $carbonDate = Carbon::parse($dateAndTime);
      $formattedDate = $carbonDate->format('d/m/Y');
      return [
        "no" => $key + 1,
        "date" => $formattedDate,
        "scores" => [
          "r_score" => $record->exercise_a->r_score,
          "t_score" => $record->exercise_a->t_score,
          "grade" => $record->exercise_a->grade,
        ]
      ];
    })->take(10)->pad(10, 0)->toArray();

    $lastPushUpScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
      $dateAndTime = $record->implementation_date;
      $carbonDate = Carbon::parse($dateAndTime);
      $formattedDate = $carbonDate->format('d/m/Y');
      return [
        "no" => $key + 1,
        "date" => $formattedDate,
        "scores" => [
          "r_score" => $record->exercise_b[1]->r_score,
          "t_score" => $record->exercise_b[1]->t_score,
          "grade" => $record->exercise_b[1]->grade,
        ]
      ];
    })->take(10)->pad(10, 0)->toArray();

    $lastShuttleScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
      $dateAndTime = $record->implementation_date;
      $carbonDate = Carbon::parse($dateAndTime);
      $formattedDate = $carbonDate->format('d/m/Y');
      return [
        "no" => $key + 1,
        "date" => $formattedDate,
        "scores" => [
          "r_score" => $record->exercise_b[2]->r_score,
          "t_score" => $record->exercise_b[2]->t_score,
          "grade" => $record->exercise_b[2]->grade,
        ]
      ];
    })->take(10)->pad(10, 0)->toArray();

    $lastSitUpScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
      $dateAndTime = $record->implementation_date;
      $carbonDate = Carbon::parse($dateAndTime);
      $formattedDate = $carbonDate->format('d/m/Y');
      return [
        "no" => $key + 1,
        "date" => $formattedDate,
        "scores" => [
          "r_score" => $record->exercise_b[0]->r_score,
          "t_score" => $record->exercise_b[0]->t_score,
          "grade" => $record->exercise_b[0]->grade,
        ]
      ];
    })->take(10)->pad(10, 0)->toArray();

    $lastPullUpScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
      $dateAndTime = $record->implementation_date;
      $carbonDate = Carbon::parse($dateAndTime);
      $formattedDate = $carbonDate->format('d/m/Y');
      return [
        "no" => $key + 1,
        "date" => $formattedDate,
        "scores" => $record->exercise_b[4]->t_score  ?? 0
      ];
    })->take(10)->pad(10, 0)->toArray();

    $graphRunScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_a.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
    $graphSitUpScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.0.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
    $graphPushUpScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.1.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
    $graphShuttleScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.2.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
    $graphPullUpScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.3.t_score")->reverse()->values()->take(10)
      ->map(function ($score) {
        return $score ?? 0;
      })->pad(10, 0)->toArray();

    $name = collect($studentSamaptaRecords->record_classroom)->pluck("name")->first();
    $SmartbtwID = collect($studentSamaptaRecords->record_classroom)->pluck("smartbtw_id")->first();
    $gender = collect($studentSamaptaRecords->record_classroom)->pluck("gender")->first();
    $classroom_id = collect($studentSamaptaRecords->record_classroom)->pluck("classroom_id")->first();

    Carbon::setLocale('id');
    $dateAndTime = date("Y-m-dTH:i:s");
    $carbonDate = Carbon::parse($dateAndTime);
    $formattedDates = $carbonDate->translatedFormat('l, d F Y');

    $classroomResponse = $this->classroomSamaptaService->getSingle($classroom_id);
    $titleClasroom = $classroomResponse->title;
    $arrayTag = $classroomResponse->tags;
    $category = (in_array("SKD", $arrayTag) && in_array("SAMAPTA", $arrayTag)) ? "SEKDIN" : "SAMAPTA SEKDIN";

    $payload = [
      'name' => $name,
      'category' => $category,
      'group' => $titleClasroom,
      'report_date' => $formattedDates,
      'gender' => $gender === 0 ? "Perempuan" : "Laki - Laki",
      'include_pull_up' => $containsPullUp,
      'smartbtw_id' => $SmartbtwID,
      'average_scores' => $averageScoreMap,
      'history_scores' => $splitScores,
      'latest_run_scores' => $lastRunScore,
      'graph_run_scores' => $graphRunScores,
      'latest_sit_up_scores' => $lastSitUpScore,
      'graph_sit_up_scores' => $graphSitUpScores,
      'latest_push_up_scores' => $lastPushUpScore,
      'graph_push_up_scores' => $graphPushUpScores,
      'latest_pull_up_scores' => $containsPullUp === true ? $lastPullUpScore : [],
      'graph_pull_up_scores' => $graphPullUpScores,
      'latest_shuttle_scores' => $lastShuttleScore,
      'graph_shuttle_scores' => $graphShuttleScores
    ];
    $generatePdfGroup = $this->generateResult->generatePDFStudentSamapta($payload);
    $body = json_decode($generatePdfGroup?->body());
    $status = $generatePdfGroup->status();
    return response()->json($body, $status);
  }

  public function generatePDFStudentSamaptaBulk(Request $request, $ids)
  {
    $selectedIds = $request->input('selectedIds');
    $downloadLinks = [];

    collect($selectedIds)->each(function ($id) use (&$downloadLinks) {
      $studentSamaptaRecords = $this->sessionSamaptaService->getStudentBySmartbtwId($id);
      $averageScore = collect($studentSamaptaRecords)->reject(function ($item, $key) {
        return $key === 'record_classroom';
      })->toArray();

      $averageScoreMap = collect($averageScore)->map(function ($item) {
        $scoreKey = key((array)$item);
        $scoreValue = $item->$scoreKey;
        unset($item->$scoreKey);
        $item->score = $scoreValue;
        return $item;
      });

      $item = (object) [
        'pull_up' => (object) [
          'grade' => 'K2',
          'score' => 0
        ]
      ];

      $pullUpValue = $averageScoreMap->get('shuttle');

      $averageScoreMap->forget('shuttle');

      $averageScoreMap->put('pull_up', $item->pull_up);

      if ($pullUpValue !== null) {
        $averageScoreMap->put('shuttle', $pullUpValue);
      }

      $studentSamaptaRecords->history_score = $studentSamaptaRecords->record_classroom;

      $historyScore = collect($studentSamaptaRecords->history_score)->map(function ($record, $index) {
        $recordArray = (array) $record;

        if (array_key_exists('implementation_date', $recordArray)) {
          $recordArray['implementation_date'] = Carbon::parse($recordArray['implementation_date'])->format('d/m/Y');
        }

        // Menambahkan nomor
        $recordArray['no'] = $index + 1;
        $recordArray['date'] = $recordArray['implementation_date'];

        return $recordArray;
      })->toArray();

      $containsPullUp = collect($historyScore)->contains(function ($item, $key) {
        return collect($item['exercise_b'])->contains('type', 'PULL_UP');
      });

      $firstChunkScores = collect($historyScore)
        ->take(20);

      $remainingChunkScores = collect($historyScore)
        ->skip(20)
        ->chunk(25);

      $splitScores = collect([$firstChunkScores])
        ->concat($remainingChunkScores);

      $splitScores = collect($splitScores)
        ->map(function ($item, $index) use ($splitScores) {
          return (object)[
            "section_number" => $index + 1,
            "section_reports" => $item->values()->toArray(),
            "is_first_section" => $index == 0,
            "is_last_section" => $index == (count($splitScores) - 1)
          ];
        })
        ->values()
        ->all();
      $studentSamaptaRecords->history_score = $splitScores;

      $lastRunScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
        $dateAndTime = $record->implementation_date;
        $carbonDate = Carbon::parse($dateAndTime);
        $formattedDate = $carbonDate->format('d/m/Y');
        return [
          "no" => $key + 1,
          "date" => $formattedDate,
          "scores" => [
            "r_score" => $record->exercise_a->r_score,
            "t_score" => $record->exercise_a->t_score,
            "grade" => $record->exercise_a->grade,
          ]
        ];
      })->take(10)->pad(10, 0)->toArray();

      $lastPushUpScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
        $dateAndTime = $record->implementation_date;
        $carbonDate = Carbon::parse($dateAndTime);
        $formattedDate = $carbonDate->format('d/m/Y');
        return [
          "no" => $key + 1,
          "date" => $formattedDate,
          "scores" => [
            "r_score" => $record->exercise_b[1]->r_score,
            "t_score" => $record->exercise_b[1]->t_score,
            "grade" => $record->exercise_b[1]->grade,
          ]
        ];
      })->take(10)->pad(10, 0)->toArray();

      $lastShuttleScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
        $dateAndTime = $record->implementation_date;
        $carbonDate = Carbon::parse($dateAndTime);
        $formattedDate = $carbonDate->format('d/m/Y');
        return [
          "no" => $key + 1,
          "date" => $formattedDate,
          "scores" => [
            "r_score" => $record->exercise_b[2]->r_score,
            "t_score" => $record->exercise_b[2]->t_score,
            "grade" => $record->exercise_b[2]->grade,
          ]
        ];
      })->take(10)->pad(10, 0)->toArray();

      $lastSitUpScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
        $dateAndTime = $record->implementation_date;
        $carbonDate = Carbon::parse($dateAndTime);
        $formattedDate = $carbonDate->format('d/m/Y');
        return [
          "no" => $key + 1,
          "date" => $formattedDate,
          "scores" => [
            "r_score" => $record->exercise_b[0]->r_score,
            "t_score" => $record->exercise_b[0]->t_score,
            "grade" => $record->exercise_b[0]->grade,
          ]
        ];
      })->take(10)->pad(10, 0)->toArray();

      $lastPullUpScore = collect($studentSamaptaRecords->record_classroom)->reverse()->values()->map(function ($record, $key) {
        $dateAndTime = $record->implementation_date;
        $carbonDate = Carbon::parse($dateAndTime);
        $formattedDate = $carbonDate->format('d/m/Y');
        return [
          "no" => $key + 1,
          "date" => $formattedDate,
          "scores" => $record->exercise_b[4]->t_score  ?? 0
        ];
      })->take(10)->pad(10, 0)->toArray();

      $graphRunScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_a.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
      $graphSitUpScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.0.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
      $graphPushUpScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.1.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
      $graphShuttleScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.2.t_score")->reverse()->values()->take(10)->pad(10, 0)->toArray();
      $graphPullUpScores = collect($studentSamaptaRecords->record_classroom)->pluck("exercise_b.3.t_score")->reverse()->values()->take(10)
        ->map(function ($score) {
          return $score ?? 0;
        })->pad(10, 0)->toArray();

      $name = collect($studentSamaptaRecords->record_classroom)->pluck("name")->first();
      $SmartbtwID = collect($studentSamaptaRecords->record_classroom)->pluck("smartbtw_id")->first();
      $gender = collect($studentSamaptaRecords->record_classroom)->pluck("gender")->first();
      $classroom_id = collect($studentSamaptaRecords->record_classroom)->pluck("classroom_id")->first();

      Carbon::setLocale('id');
      $dateAndTime = date("Y-m-dTH:i:s");
      $carbonDate = Carbon::parse($dateAndTime);
      $formattedDates = $carbonDate->translatedFormat('l, d F Y');

      $classroomResponse = $this->classroomSamaptaService->getSingle($classroom_id);
      $titleClasroom = $classroomResponse->title;
      $arrayTag = $classroomResponse->tags;
      $category = (in_array("SKD", $arrayTag) && in_array("SAMAPTA", $arrayTag)) ? "SEKDIN" : "SAMAPTA SEKDIN";

      $payload = [
        'name' => $name,
        'category' => $category,
        'group' => $titleClasroom,
        'report_date' => $formattedDates,
        'gender' => $gender === 0 ? "Perempuan" : "Laki - Laki",
        'include_pull_up' => $containsPullUp,
        'smartbtw_id' => $SmartbtwID,
        'average_scores' => $averageScoreMap,
        'history_scores' => $splitScores,
        'latest_run_scores' => $lastRunScore,
        'graph_run_scores' => $graphRunScores,
        'latest_sit_up_scores' => $lastSitUpScore,
        'graph_sit_up_scores' => $graphSitUpScores,
        'latest_push_up_scores' => $lastPushUpScore,
        'graph_push_up_scores' => $graphPushUpScores,
        'latest_pull_up_scores' => $containsPullUp === true ? $lastPullUpScore : [],
        'graph_pull_up_scores' => $graphPullUpScores,
        'latest_shuttle_scores' => $lastShuttleScore,
        'graph_shuttle_scores' => $graphShuttleScores
      ];
      $generatePdfGroup = $this->generateResult->generatePDFStudentSamapta($payload);
      $body = json_decode($generatePdfGroup?->body());
      $link = $body->data->link;
      $downloadLinks[] = $link;
    });

    $classroom = $this->classroomSamaptaService->getSingle($ids);
    $classname = Str::slug($classroom->title, "_");
    $classYear = $classroom->year;
    $timeStamp = Carbon::now()->format('Y-m-d H:i:s');
    $timestampParse = Carbon::parse($timeStamp);
    $timestamp = $timestampParse->timestamp;
    $zipFileName = "raport_siswa-samapta_{$classname}_{$classYear}_{$timestamp}.zip";
    $zipFilePath = storage_path($zipFileName);
    $zip = new \ZipArchive();
    $zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

    foreach ($downloadLinks as $link) {
      $fileContent = file_get_contents($link);
      $fileNameWithExtension = basename($link);
      if ($fileContent !== false) {
        $zip->addFromString($fileNameWithExtension, $fileContent);
      }
    }

    $zip->close();

    return response()
      ->download($zipFilePath, $zipFileName, ["X-File-Name" => $zipFileName])
      ->deleteFileAfterSend(true);
  }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;

use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Student;
use App\Services\StudentResultService\ClassroomResult;
use App\Services\ProfileService\Profile;
use App\Services\ApiGatewayService\Internal;
use App\Helpers\RabbitMq;
use Illuminate\Support\Facades\Log;

class SendStudentReportChart extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'student-chart:send {exam_type}';

  private Classroom $learningClassroomService;
  private ClassMember $learningClassMemberService;
  private Student $learningStudentService;
  private ClassroomResult $classroomResultService;
  private Profile $profileService;
  private Internal $apiGatewayService;

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Send Student Module Summary Data to RabbitMQ Message Broker';

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct(
    Classroom $learningClassroomService,
    ClassMember $learningClassMemberService,
    Student $learningStudentService,
    ClassroomResult $classroomResultService,
    Profile $profileService,
    Internal $apiGatewayService
  ) {
    parent::__construct();
    $this->learningClassroomService = $learningClassroomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->learningStudentService = $learningStudentService;
    $this->classroomResultService = $classroomResultService;
    $this->profileService = $profileService;
    $this->apiGatewayService = $apiGatewayService;
  }

  /**
   * Execute the console command.
   *
   * @return int
   */
  public function handle()
  {
    $tags = ["Binsus", "BINSUS", "binsus"];
    $classrooms = collect($this->learningClassroomService->getAll(['status' => 'ONGOING']))
      ->reject(fn ($data, $key) => array_intersect($data->tags, $tags))
      ->values()
      ->all();
    $sent_to = [];
    $tryoutTitle = "";

    $exam_type = $this->argument('exam_type') ?? "";

    $isPackageExamType = strpos($exam_type, "package") !== false;
    $isFreeTryoutExamType = $exam_type == "free-tryout";
    $isSpecificTryoutExamType = $exam_type == "specific-tryout";
    $isPremiumTryoutExamType = $exam_type == "premium-tryout";

    if ($isPackageExamType) {
      $packageId = explode("-", $exam_type)[1];
      $package = $this->apiGatewayService->getPremiumPackageById($packageId);
      $tryoutTitle = $package?->title ?? "";
    }
    if ($isFreeTryoutExamType) $tryoutTitle = "Tryout Gratis";
    if ($isSpecificTryoutExamType) $tryoutTitle = "Tryout Kode";
    if ($isPremiumTryoutExamType) $tryoutTitle = "Tryout Premium";

    foreach ($classrooms as $classroom) {
      $class_members = $this->learningClassMemberService->getByClassroomId($classroom->_id);

      if (!empty($class_members)) {
        $member_ids = collect($class_members)->pluck('smartbtw_id')->toArray();
        $members = $this->learningStudentService->getBySmartbtwIds($member_ids);

        foreach ($members as $member) {

          if (array_key_exists($member->smartbtw_id, $sent_to)) {
            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) chart report has already been sent, skipping \n";
            continue;
          }

          $profile = $this->profileService->getSingleStudent($member->smartbtw_id);

          if (!$profile) {
            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) data not found on profile service, skipping \n";
            continue;
          }

          $parent_phone = property_exists($profile, "parent_datas") ? $profile->parent_datas->parent_number : $profile->parent_number;
          if (!$parent_phone) {
            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) parent phone number is not found on profile service, skipping \n";
            continue;
          }

          $studentResult = $this->classroomResultService->getSummaryWithAllRepeat([$member->smartbtw_id], "skd", $exam_type) ?? [];
          $moduleSummary = $this->classroomResultService->getSummary([$member->smartbtw_id], "skd", $exam_type) ?? [];

          $studentHasReportProperty = $studentResult ? property_exists($studentResult[0], 'report') : false;

          if ($studentResult && $studentHasReportProperty) {
            $studentResult = $studentResult[0];
            $moduleSummary = $moduleSummary[0];

            $studentBranchCode = $this->profileService->getSingleStudent($studentResult->student->smartbtw_id)->branch_code ?? "-";

            $studentResult->charts = new \stdClass();
            $studentResult->charts->score_dataset = new \stdClass();
            $studentResult->charts->average_score = new \stdClass();
            $studentResult->charts->average_done_minute = new \stdClass();

            $average_done_minute = collect($moduleSummary->report)->map(function ($item) {
              $startDate = Carbon::parse($item->start);
              $endDate = Carbon::parse($item->end);
              $diffInMinutes = $startDate->diffInMinutes($endDate);
              return $diffInMinutes;
            })->avg();

            $studentResult->charts->labels = collect($moduleSummary->report)->unique('title')->sortBy('task_id')->pluck('title')->all();
            $studentResult->charts->labelCount = count($studentResult->charts->labels);
            $studentResult->charts->mostRepetitionCount = collect($studentResult->report)->max('repeat');

            $studentResult->charts->score_dataset->TWK = [];
            $studentResult->charts->score_dataset->TIU = [];
            $studentResult->charts->score_dataset->TKP = [];
            $studentResult->charts->score_dataset->SKD = [];

            $groupedReports = collect($studentResult->report)
              ->sortBy('task_id')
              ->groupBy(['task_id', function ($item) {
                return $item->repeat;
              }])
              ->values()
              ->all();

            $sortedGroupedReportsByRepeatKeys = [];
            foreach ($groupedReports as $index => $groupedReport) {
              $sortedGroupedReportsByRepeatKeys[] = $groupedReport->sortKeys()->flatten()->unique('repeat')->sortKeys()->values();
            }

            $twkScores = [];
            $tiuScores = [];
            $tkpScores = [];
            $skdScores = [];
            $endDates = [];

            foreach ($sortedGroupedReportsByRepeatKeys as $reportKey => $reportValue) {
              $twkScores[] = array_pad($reportValue->pluck('score_values.TWK.score')->all(), $studentResult->charts->mostRepetitionCount, null);
              $tiuScores[] = array_pad($reportValue->pluck('score_values.TIU.score')->all(), $studentResult->charts->mostRepetitionCount, null);
              $tkpScores[] = array_pad($reportValue->pluck('score_values.TKP.score')->all(), $studentResult->charts->mostRepetitionCount, null);
              $skdScores[] = array_pad($reportValue->pluck('total_score')->all(), $studentResult->charts->mostRepetitionCount, null);
              $endDates[] = array_pad($reportValue->pluck('end')->all(), $studentResult->charts->mostRepetitionCount, null);
            }

            for ($i = 0; $i < $studentResult->charts->mostRepetitionCount; $i++) {
              $twk = [];
              $tiu = [];
              $tkp = [];
              $skd = [];
              $endDate = [];

              foreach ($twkScores as $score) {
                $twk[] = $score[$i];
              }

              foreach ($tiuScores as $score) {
                $tiu[] = $score[$i];
              }

              foreach ($tkpScores as $score) {
                $tkp[] = $score[$i];
              }

              foreach ($skdScores as $score) {
                $skd[] = $score[$i];
              }

              foreach ($endDates as $date) {
                $formattedDate = \Carbon\Carbon::parse($date[$i])->timezone('Asia/Jakarta') ?? "-";
                $endDate[] = $formattedDate->locale('id')->format('d M Y • H:i') . " WIB" ?? "-";
              }

              $studentResult->charts->score_dataset->TWK["dataset_$i"] = $twk;
              $studentResult->charts->score_dataset->TIU["dataset_$i"] = $tiu;
              $studentResult->charts->score_dataset->TKP["dataset_$i"] = $tkp;
              $studentResult->charts->score_dataset->SKD["dataset_$i"] = $skd;
              $studentResult->charts->endDates[$i] = $endDate ?? "-";
            }

            if ($isPackageExamType) {
              $chartLabel = array_map(function ($label) {
                $splittedLabel = explode(" | ", $label);
                $label = $splittedLabel[count($splittedLabel) - 1];
                return $label;
              }, $studentResult->charts->labels);
              $studentResult->charts->labels = $chartLabel;

              if (!$tryoutTitle) {
                $explodedTitle = explode(" | ", $studentResult->report[0]->title);
                $tryoutTitle = implode(" | ", array_slice($explodedTitle, 0, count($explodedTitle) - 1));
              }
            }

            $report_total_repeat = $moduleSummary->report_total_repeat;
            $twkTotalScore = $studentResult->subject->score_values->TWK->total_score ?? 0;
            $tiuTotalScore = $studentResult->subject->score_values->TIU->total_score ?? 0;
            $tkpTotalScore = $studentResult->subject->score_values->TKP->total_score ?? 0;
            $skdTotalScore = $twkTotalScore + $tiuTotalScore + $tkpTotalScore;

            $twkAverageScore = $twkTotalScore ? round($twkTotalScore / $report_total_repeat, 1) : 0;
            $tiuAverageScore = $tiuTotalScore ? round($tiuTotalScore / $report_total_repeat, 1) : 0;
            $tkpAverageScore = $tkpTotalScore ? round($tkpTotalScore / $report_total_repeat, 1) : 0;
            $skdAverageScore = $skdTotalScore ? round($skdTotalScore / $report_total_repeat, 1) : 0;

            $studentResult->charts->average_score->TWK = $twkAverageScore;
            $studentResult->charts->average_score->TIU = $tiuAverageScore;
            $studentResult->charts->average_score->TKP = $tkpAverageScore;
            $studentResult->charts->average_score->SKD = $skdAverageScore;
            $studentResult->charts->average_done_minute = round($average_done_minute, 0);

            $studentResult->report_repeat_sum = $report_total_repeat;
            $studentResult->report_total_repeat = $report_total_repeat;
            $studentResult->generated_at = Carbon::now()->timezone('Asia/Jakarta')->locale('id')->translatedFormat('l, d F Y');

            $studentResult->done = $moduleSummary->done;
            $studentResult->given = $moduleSummary->given;
            $studentResult->passed = $moduleSummary->passed;
            $studentResult->passed_percent = $moduleSummary->passed_percent;
            $studentResult->done_percent = $moduleSummary->done_percent;
            $studentResult->report_average_try = $moduleSummary->report_average_try;
            $studentResult->student->branch_code = $studentBranchCode;
            $studentResult->tryout_title = $tryoutTitle;
            $studentResult->parent_number = $parent_phone;

            $jam = Carbon::now()->hour;
            if ($jam > 6 && $jam <= 11) {
              $greeting = "pagi";
            } elseif ($jam >= 12 && $jam <= 14) {
              $greeting = "siang";
            } elseif ($jam >= 15 && $jam <= 18) {
              $greeting = "sore";
            } else {
              $greeting = "malam";
            }
            $studentResult->greeting = $greeting;

            // Remove unused props
            unset($studentResult->report);
            unset($studentResult->subject);
            unset($studentResult->charts->endDates);

            $categoryDatasetItemLength = [
              "TWK" => collect($studentResult->charts->score_dataset->TWK)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
              "TIU" => collect($studentResult->charts->score_dataset->TIU)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
              "TKP" => collect($studentResult->charts->score_dataset->TKP)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
              "SKD" => collect($studentResult->charts->score_dataset->SKD)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
            ];
            $totalDatasetItem = array_sum($categoryDatasetItemLength) / 4;
            $isDatasetItemCountNotMatch = $totalDatasetItem % $studentResult->charts->labelCount !== 0;

            if ($isDatasetItemCountNotMatch) {
              $time = Carbon::now()->format('Y-m-d H:i:s');
              echo "[{$time}] Dataset item length not match, skipping";
              Log::error("Dataset item length not match", ["data" => json_encode($studentResult)]);
              continue;
            }

            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] Sending student report chart to {$studentResult->student->name}'s ({$studentResult->student->smartbtw_id}) parent phone number at {$studentResult->parent_number}. \n";
            $bodyData = ["version" => 1, "data" => $studentResult];
            Rabbitmq::send("sendpdf.graph", json_encode($bodyData));
            $sent_to[$studentResult->student->smartbtw_id] = true;
            sleep(15);
          } else {
            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) doesn't have report data, skipping \n";
            continue;
          }
        }
      }
    }
  }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Student;
use App\Services\StudentResultService\ClassroomResult;
use App\Services\ProfileService\Profile;

use App\Helpers\RabbitMq;
use Carbon\Carbon;

class SendStudentTryoutReportToRabbitMq extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'report:rabbitmq {program} {exam_type?}';

  private Classroom $learningClassroomService;
  private ClassMember $learningClassMemberService;
  private Student $learningStudentService;
  private ClassroomResult $classroomResultService;
  private Profile $profileService;

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Send student\'s tryout report to rabbitmq';

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
    Profile $profileService
  ) {
    parent::__construct();
    $this->learningClassroomService = $learningClassroomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->learningStudentService = $learningStudentService;
    $this->classroomResultService = $classroomResultService;
    $this->profileService = $profileService;
  }

  /**
   * Execute the console command.
   *
   * @return int
   */
  public function handle()
  {
    $program = $this->argument('program');
    $validPrograms = ["skd", "tps_irt"];

    if(!in_array($program, $validPrograms)) {
      $this->warn("Program not valid, please type either 'skd' or 'tps_irt'");
      return 0;
    }

    $tags = ["Binsus", "BINSUS", "binsus"];
    $classrooms = collect($this->learningClassroomService->getAll(['status' => 'ONGOING']))
      ->reject(fn ($data, $key) => array_intersect($data->tags, $tags))
      ->values()
      ->all();
    foreach ($classrooms as $classroom) {
      $class_members = $this->learningClassMemberService->getByClassroomId($classroom->_id);
      if (!empty($class_members)) {
        $member_ids = collect($class_members)->pluck('smartbtw_id')->toArray();
        $members = $this->learningStudentService->getBySmartbtwIds($member_ids);

        foreach ($members as $member) {
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

          $exam_type = $this->argument('exam_type') ?? "";

          $isIRT = $program == "tps_irt";
          $studentResult = $isIRT ? $this->classroomResultService->getIRTSummary([$member->smartbtw_id], $exam_type) : $this->classroomResultService->getSummary([$member->smartbtw_id], $program, $exam_type);
          $studentHasReportProperty = $studentResult ? property_exists($studentResult[0], 'report') : false;

          if ($studentResult && $studentHasReportProperty) {
            $startDate = Carbon::now()->subWeek()->format('Y-m-d');
            $endDate = Carbon::now()->format('Y-m-d');

            foreach ($studentResult[0]->report as $r) {
              $parsedStartDate = \Carbon\Carbon::parse($r->start)->timezone('Asia/Jakarta');
              $parsedEndDate = \Carbon\Carbon::parse($r->end)->timezone('Asia/Jakarta');

              $start = $parsedStartDate < $parsedEndDate
                ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . " WIB"
                : '-';

              $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . " WIB";

              $doneInterval = $parsedStartDate < $parsedEndDate
                ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE])
                : '-';

              $r->start = $start;
              $r->end = $end;
              $r->done_interval = $doneInterval;
            }

            $user = collect($member)->only(["smartbtw_id", "branch_code", "name"])->toArray();
            $report = collect($studentResult[0])->except(["_id", "student", "report_repeat_sum", "report_average_try"])->toArray();
            $report["subject"] = collect($report["subject"])->only(["average_score", "score_keys", "score_values"])->toArray();

            $newUser = [];

            foreach ($user as $student) {
              $newUser["smartbtw_id"] = $profile->smartbtw_id;
              $newUser["branch_code"] = $profile->branch_code;
              $newUser["name"] = $profile->branch_code ? ucfirst($profile->name) . ' (' . $profile->branch_code . ')' : ucfirst($profile->name);
            }

            foreach ($report["subject"]["score_keys"] as $key) {
              unset($report["subject"]["score_values"]->$key->total);
              unset($report["subject"]["score_values"]->$key->passed);
              unset($report["subject"]["score_values"]->$key->failed);
              unset($report["subject"]["score_values"]->$key->total_score);
              unset($report["subject"]["score_values"]->$key->passed_percent);
              unset($report["subject"]["score_values"]->$key->failed_percent);
            }

            foreach ($report["report"] as $r) {
              unset($r->_id);
              unset($r->student_id);
              unset($r->task_id);
              unset($r->score);
              unset($r->exam_type);
              unset($r->__v);
              unset($r->createdAt);
              unset($r->updatedAt);
            }

            $jam = Carbon::now()->hour;

            if ($jam > 6 && $jam <= 11) {
              $salam = "pagi";
            } elseif ($jam >= 12 && $jam <= 14) {
              $salam = "siang";
            } elseif ($jam >= 15 && $jam <= 18) {
              $salam = "sore";
            } else {
              $salam = "malam";
            }

            $data = [
              'program' => $program,
              'program_title' => $isIRT ? "TPS IRT" : implode(' ', explode('-', $program)),
              'start_date' => $startDate,
              'end_date' => $endDate,
              'is_last_week_report' => false,
              "greeting" => $salam,
              'send_to' => $parent_phone,
              'user' => $newUser,
              'report' => $report
            ];
            $bodyData = json_encode(['version' => 2, 'data' => $data]);
            $topic = $isIRT ? "sendpdf.irt-report" : "sendpdf.report";
            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] Sending student report message to {$user["name"]}'s ({$user["smartbtw_id"]}) parent phone number at {$parent_phone}. \n";
            Rabbitmq::send($topic, $bodyData);
            sleep(10);
          } else {
            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) {$program} {$exam_type} report is not found on exam result service, skipping \n";
            continue;
          }
        }
      }
    }
  }
}

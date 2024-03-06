<?php

namespace App\Console\Commands;

use App\Helpers\{Redis, RabbitMq};
use App\Services\{
  LearningService\ClassRoom,
  LearningService\ClassMember,
  ExamService\TryoutCode,
  BranchService\Branch
};
use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Arr;

class GenerateIntensiveClassesTryoutCodeModuleSummary extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'code-tryout:generate-module-summary {type : Please choose between "all-class" or "per-class"}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = "Generate tryout code module summary for all ongoing intensive classes on current year";

  private Classroom $learningClassroomService;
  private ClassMember $learningClassMemberService;
  private TryoutCode $examTryoutCodeService;
  private Branch $branchService;
  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct(
    Classroom $learningClassroomService,
    ClassMember $learningClassMemberService,
    TryoutCode $examTryoutCodeService,
    Branch $branchService
  ) {
    parent::__construct();
    $this->learningClassroomService = $learningClassroomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->examTryoutCodeService = $examTryoutCodeService;
    $this->branchService = $branchService;
  }

  /**
   * Execute the console command.
   *
   * @return int
   */
  public function handle()
  {
    $currentYear = Carbon::now()->year;
    $branches = [];

    $validTypes = ["all-class", "per-class"];
    $type = $this->argument('type');
    if (!in_array($type, $validTypes)) {
      $this->error("Invalid type. Please choose between 'all-class' or 'per-class'");
      return 1;
    }

    $codeCategory = env('APP_ENV') == 'dev' ? 37 : 1;
    $program = "skd";

    $getCodeCategoryTaskIdsResponse = $this->examTryoutCodeService->getTaskIdsOnly($codeCategory);
    $codeCategoryTaskIds = collect(json_decode($getCodeCategoryTaskIdsResponse->body())->data);
    if ($codeCategoryTaskIds->count() === 0) {
      $this->printLogMessage("No task ids found, make sure you have at least one code tryout that have corresponding code category. Exiting command ...");
      return 0;
    }

    $query = ['status' => 'ONGOING', 'year' => $currentYear, 'tags' => ["Intensif", "intensif", "INTENSIF"]];
    $classrooms = collect($this->learningClassroomService->getAll($query));
    if ($classrooms->count() === 0) {
      $this->printLogMessage("No classroom found, exiting command ...");
      return 0;
    }

    if ($type === "all-class") {
      $moduleSummaryCacheKey = "performa_all_" . $codeCategory . "_" . $currentYear;
      $moduleSummary = Redis::get($moduleSummaryCacheKey);
      if ($moduleSummary) {
        $this->printLogMessage("Cache value for key : $moduleSummaryCacheKey exists, deleting cache key...");
        Redis::delete($moduleSummaryCacheKey);
      }
    }

    foreach ($classrooms as $classroom) {
      if (!isset($branches[$classroom->branch_code])) {
        $branch = $this->branchService->getBranchByCode($classroom->branch_code);
        $branches[$classroom->branch_code] = $branch;
      }

      if ($type === "per-class") {
        $moduleSummaryCacheKey = "performa_" . $classroom->_id . "_" . $codeCategory;
        $moduleSummary = Redis::get($moduleSummaryCacheKey);
        if ($moduleSummary) {
          $this->printLogMessage("Cache value for key : $moduleSummaryCacheKey exists, deleting cache key...");
          Redis::delete($moduleSummaryCacheKey);
        }
        $this->printLogMessage("Getting cache value of cache key: $moduleSummaryCacheKey");
      }
      $this->printLogMessage("Getting $classroom->title ($classroom->year | $classroom->branch_code) module summary data from cache");

      $classMembers = collect($this->learningClassMemberService->getByClassroomId($classroom->_id));
      if ($classMembers->count() === 0) {
        $this->printLogMessage("$classroom->title doesn't have any members, skipping ...");
        continue;
      }

      $this->printLogMessage("Sending message to message broker to set new cache value for key: $moduleSummaryCacheKey ...");
      $studentIds = $classMembers->pluck('smartbtw_id')->toArray();

      $topic = $type === "per-class" ? "code-tryout-module-summary.generate" : "code-tryout-module-summary.generate-all";
      $payload = $type === "per-class"
        ? [
          'version' => 1,
          'data' => [
            "generated_at" => Carbon::now()->format('Y-m-d H:i:s') . ' WIB',
            'program' => $program,
            'smartbtw_ids' => $studentIds,
            'task_ids' => $codeCategoryTaskIds,
            'cache_name' => $moduleSummaryCacheKey,
            'with_report' => true,
          ]
        ]
        : [
          'version' => 1,
          'data' => [
            'program' => $program,
            'smartbtw_ids' => $studentIds,
            'task_ids' => $codeCategoryTaskIds,
            'cache_name' => $moduleSummaryCacheKey,
            'classroom_name' => $classroom->title,
            'branch_name' => $branches[$classroom->branch_code]->name,
            'with_report' => true,
          ]
        ];

      RabbitMq::send($topic, json_encode($payload));
      $this->printLogMessage("Message has been sent to message broker");
      sleep(15);
    }

    if ($type === "all-class") {
      $cacheModuleSummary = Redis::getList($moduleSummaryCacheKey . "_temp");
      $decodedCacheModuleSummary = array_map(fn ($item) => json_decode($item), $cacheModuleSummary);
      $modifiedModuleSummary = Arr::add(['generated_at' => Carbon::now()->format('Y-m-d H:i:s') . ' WIB'], 'data', $decodedCacheModuleSummary);
      Redis::set($moduleSummaryCacheKey, json_encode($modifiedModuleSummary));
    }

    Redis::delete(["appended-student-ids", $moduleSummaryCacheKey . "_temp"]);
    return 0;
  }

  private function printLogMessage(string $message): void
  {
    $now = Carbon::now()->format('Y-m-d H:i:s');
    echo "[$now] $message \n";
  }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Student;
use App\Jobs\SendStudentTryoutReport;


class SendStudentTryoutReportPeriodically extends Command
{
  private Classroom $learningClassroomService;
  private ClassMember $learningClassMemberService;
  private Student $learningStudentService;

  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'report:send';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = "Send Student's SKD Premium 48 Modul Tryout Report Periodically";

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct(
    Classroom $learningClassroomService,
    ClassMember $learningClassMemberService,
    Student $learningStudentService,
  )
  {
      parent::__construct();
      $this->learningClassroomService = $learningClassroomService;
      $this->learningClassMemberService = $learningClassMemberService;
      $this->learningStudentService = $learningStudentService;
  }

  /**
   * Execute the console command.
   *
   * @return int
   */
  public function handle()
  {
    $classrooms = $this->learningClassroomService->getAll(['status' => 'ONGOING']);
    foreach($classrooms as $classroom) {
      $class_members = $this->learningClassMemberService->getByClassroomId($classroom->_id);

      if(!empty($class_members)) {
        $member_ids = collect($class_members)->pluck('smartbtw_id')->toArray();
        $members = $this->learningStudentService->getBySmartbtwIds($member_ids);
        foreach($members as $member) {
          if(property_exists($member, 'parent_phone')) {
            SendStudentTryoutReport::dispatch($member);
          }
        }
      }
    }
  }
}

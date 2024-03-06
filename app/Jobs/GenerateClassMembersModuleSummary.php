<?php

namespace App\Jobs;

use App\Services\StudentResultService\ClassroomResult;
use App\Services\LearningService\ClassMember;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class GenerateClassMembersModuleSummary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $data;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(ClassroomResult $result, ClassMember $classMember)
    {
      $members = $classMember->getByClassroomId(classroom_id: $this->data['classroom_id']);
      $student_ids = [];

      foreach($members as $member) {
        $student_ids[] = $member->smartbtw_id;
      }

      $cache_name = "performa_" . $this->data['classroom_id'] . "_" . $this->data['exam_type'];
      $results = $student_ids ? $result->getSummary(smartbtw_ids: $student_ids, program: $this->data['program'], exam_type: $this->data['exam_type']) : [];
      $payload = [
        "generated_at" => Carbon::now()->format('Y-m-d H:i:s').' WIB',
        "data" => $results
      ];

      $seconds = (3600 * 2);
      Cache::put($cache_name, $payload, $seconds);
    }

  }

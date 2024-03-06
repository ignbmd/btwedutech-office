<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Helpers\RabbitMq;

class ProgressTryoutAllClass implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    private $classrooms;
    private $branches;
    private $classMembers;
    private $program;
    private $codeCategoryTaskIds;
    private $cache_name;

    public function __construct($classrooms, $branches, $classMembers, $program, $codeCategoryTaskIds, $cache_name)
    {
        $this->classrooms = $classrooms;
        $this->branches = $branches;
        $this->classMembers = $classMembers;
        $this->program = $program;
        $this->codeCategoryTaskIds = $codeCategoryTaskIds;
        $this->cache_name = $cache_name;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $studentIds = $this->classMembers->pluck('smartbtw_id')->toArray();

        $topic = "code-tryout-module-summary.generate-all";
        $payload = [
            'version' => 1,
            'data' => [
                'program' => $this->program,
                'smartbtw_ids' => $studentIds,
                'task_ids' => $this->codeCategoryTaskIds,
                'cache_name' => $this->cache_name,
                'classroom_name' => $this->classrooms->title,
                'branch_name' => $this->branches[$this->classrooms->branch_code]->name,
                'with_report' => true,
            ]
        ];
        Log::info(print_r($payload, true));
        RabbitMq::send($topic, json_encode($payload));
        // sleep(15);
    }
}

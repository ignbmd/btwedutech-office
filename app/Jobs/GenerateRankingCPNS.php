<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\ExamCPNSService\TryoutCPNSResult;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GenerateRankingCPNS implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    private $taskId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($taskId)
    {
      $this->taskId = $taskId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
      try{
        $cache_name = 'ranking-cpns_' . $this->taskId;
        $tryoutCPNSResult = new TryoutCPNSResult();
        $rankingCPNS = $tryoutCPNSResult->getTryoutResultByID($this->taskId);
        $rankingCPNS->generate_at = Carbon::now()->format('Y-m-d H:i:s').' WIB';
        $expiry_time = 3600 * 6;
        Cache::put($cache_name, $rankingCPNS, $expiry_time);
      }catch(\Exception $e){
        Log::error($e->getMessage());
      }
      
    }
}

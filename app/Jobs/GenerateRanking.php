<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\ApiGatewayService\Internal\Ranking;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class GenerateRanking implements ShouldQueue
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
    public function handle(Ranking $ranking)
    {
      $cache_name = 'ranking_' . $this->taskId;
      $ranking = $ranking->getRanking(['task_id' => $this->taskId, 'is_paginated' => false]);
      $ranking->data->generated_at = Carbon::now()->format('Y-m-d H:i:s').' WIB';
      $expiry_time = 3600 * 6;
      Cache::put($cache_name, $ranking->data, $expiry_time);
    }
}

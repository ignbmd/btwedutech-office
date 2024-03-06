<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Helpers\RabbitMq;

class RegisterRegistrant implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    /**
     * Create a new job instance.
     *
     * @return void
     */

    public $registrants;
    public function __construct($registrants)
    {
      $this->registrants = $registrants;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
      Rabbitmq::send("onlineclass-schedule.add-participant", json_encode($this->registrants));
    }
}

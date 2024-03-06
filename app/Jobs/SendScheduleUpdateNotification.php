<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Helpers\RabbitMq;
use Illuminate\Support\Facades\Log;

class SendScheduleUpdateNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $classMembers;
    public $payload;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($classMembers, $payload)
    {
      $this->classMembers = $classMembers;
      $this->payload = $payload;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
      foreach($this->classMembers as $member) {
        $this->payload["recipient"] = $member->email;
        $this->payload["name"] = $member->name;
        RabbitMq::send("message-gateway.email.update-schedule", json_encode([
          "version" => 1,
          "data" => $this->payload
        ]));
      }
    }
}

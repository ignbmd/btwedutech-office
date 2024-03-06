<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Jobs\RegisterRegistrant;

class RegisterAdditionalMembers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $participants;
    public $schedule;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($participants, $schedule)
    {
      $this->participants = $participants;
      $this->schedule = $schedule;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
      $registrantPayload = [
        "version" => 1,
        "data" => [
          "send_confirmation_email" => false,
          "schedule_id" => $this->schedule->_id,
          "participants" => $this->participants
        ],
      ];
      RegisterRegistrant::dispatch($registrantPayload);
    }
}

<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Jobs\RegisterRegistrant;

class RegisterClassMembers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $participants;
    public $schedule;

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
      // Get class members then chunk it by 30
      $classParticipantsChunk = collect($this->participants)->chunk(30);

      // Create meeting registrant payload
      foreach($classParticipantsChunk as $index => $classParticipant) {
        $delayIntervalInSeconds = ($index + 1) * 15;
        $participants = $classParticipant->map(function($item, $key) {
          return [
            "smartbtw_id" => $item->smartbtw_id,
            "name" => $item->name,
            "email" => $item->email,
            "zoom_email" => $item->zoom_email,
            "role" => "PARTICIPANT",
            "status" => "APPROVED"
          ];
        })->values()->toArray();
        $registrantPayload = [
          "version" => 1,
          "data" => [
            "send_confirmation_email" => true,
            "schedule_id" => $this->schedule->_id,
            "participants" => $participants
          ],
        ];
        RegisterRegistrant::dispatch($registrantPayload)->delay($delayIntervalInSeconds);
      }
    }
}

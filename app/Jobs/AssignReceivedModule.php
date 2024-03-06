<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AssignReceivedModule implements ShouldQueue
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
    public function handle()
    {
      foreach($this->data as $data) {
        $response = Http::withHeaders($this->headers())->post($this->url(), ['id' => $data->smartbtw_id]);
        if(!$response->successful()) {
          Log::error('Proses assign modul diterima gagal: ' . $response);
          return $this->fail(throw new \Exception('Proses assign module diterima gagal'));
        }
      }
    }

    public function failed(\Throwable $exception)
    {
      return $exception;
    }


    private function host()
    {
      return (config('services.btw.api_gateway', '') . "/internal");
    }

    private function url()
    {
      return $this->host() . '/make-received-module';
    }

    private function headers()
    {
      return [
        'X-Public-Token' => "383463177109361c68e2020d492b7b477fa2bcb031fa62e29872d7ae1dacca46",
        'Content-Type' => 'application/json',
      ];
    }
}

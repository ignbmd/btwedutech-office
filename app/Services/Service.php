<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

abstract class Service {

    public PendingRequest $http;

    abstract protected function serviceAddress(): string;

    public function __construct()
    {
        $this->initConnection();
    }

    public function initConnection()
    {
        // FIXME: Please find other ways
        // if (!$this->serviceAddress() || !config('services.service_exception')) {
        //     throw new Exception("Service address is not set");
        // }
        $this->http = Http::baseUrl($this->serviceAddress())
            ->withHeaders([
                "Content-Type" => "application/json"
            ]);
    }

    public function ping()
    {
        $response = $this->http->get("/");
        if (!$response->ok()) {
            throw new Exception("Not connected to service.");
        }
        return true;
    }

}

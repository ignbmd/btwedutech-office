<?php

namespace App\Services\ExamCPNSService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class TryoutCPNSResult extends Service implements ServiceContract
{
    use HasBranch;
    protected function serviceAddress(): string
    {
        return config('services.btw.exam_result_cpns', '');
    }

    public function getTryoutResultByID(int $id){
        $response = json_decode ($this->http->get(url: "/results/get-by-taskid/$id"));
        return $response;
    }
}
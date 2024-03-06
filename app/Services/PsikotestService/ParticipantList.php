<?php

namespace App\Services\PsikotestService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;

class ParticipantList extends Service implements ServiceContract
{
    use HasBranch;
    protected function serviceAddress(): string
    {
        return config ('services.btw.peminatan', '');
    }

    public function getAll(){
        $response = $this->http->get(url: '/student-results/all');
         $data = json_decode($response->body());
         return $data?->data ?? [];
    }
}
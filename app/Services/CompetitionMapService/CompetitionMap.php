<?php

namespace App\Services\CompetitionMapService;

use App\Services\Service;
use App\Services\ServiceContract;

class CompetitionMap extends Service implements ServiceContract
{

    protected function serviceAddress(): string
    {
        return config('services.btw.comp-map', '');
    }

    public function getAll()
    {
        return $this->http->get(url: "/admin/competition/v2");
    }

    public function get()
    {
        return $this->http->get(url: "/admin/log-student/all");
    }
}

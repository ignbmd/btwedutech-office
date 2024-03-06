<?php

namespace App\Services\CompetitionMapService;

use App\Services\Service;
use App\Services\ServiceContract;

class SkdRank extends Service implements ServiceContract
{
    protected function serviceAddress(): string
    {
        return config('services.btw.comp-map-v2', '');
    }

    public function getSkdRankStudent(array $payload)
    {
        return $this->http->post(url: "/student/skd/rank", data: $payload);
    }

    public function getSkdRankTryout(array $payload)
    {
        return $this->http->post(url: "/student/skd/rank/tryout", data: $payload);
    }

    public function getSkdRankByQuery(array $query)
    {
      return $this->http->get(url: "/skd-rank-search", query: $query);
    }

    public function createBulk(array $payload)
    {
      return $this->http->post(url: "/skd-rank-multiple", data: $payload);
    }

    public function update(int $id, array $payload)
    {
      return $this->http->put(url: "/skd-rank", data: $payload);
    }

    public function updateBulk(array $payload)
    {
      return $this->http->put(url: "/skd-rank-update-bulk", data: $payload);
    }

    public function delete(int $id)
    {
      return $this->http->delete(url: "/skd-rank/" . $id);
    }

    public function deleteBulk(array $payload)
    {
      return $this->http->delete(url: "/skd-rank-delete-bulk", data: $payload);
    }

}

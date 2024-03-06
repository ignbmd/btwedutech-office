<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\StagesService\Stages;

class StagesController extends Controller
{
  private Stages $stagesService;

  public function __construct(Stages $stagesService)
  {
    $this->stagesService = $stagesService;
  }

  public function getStageByType(string $type, array $query = [])
  {
    $response = $this->http->get(url: "/stages-by-type/$type", query: $query);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function getStageByTypeAndLevel(int $level, string $type)
  {
    $response = $this->http->get(url: "/stages-by-type-and-level/$level/$type");
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function create(array $payload)
  {
    $response = $this->http->post(url: "/stages", data: $payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function update(int $id, array $payload)
  {
    $response = $this->http->put(url: "/stages/$id", data: $payload);
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }
}

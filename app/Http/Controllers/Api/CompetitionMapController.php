<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\CompetitionMapService\CompetitionMap;

class CompetitionMapController extends Controller
{
    private CompetitionMap $competitionMapService;

    public function __construct(CompetitionMap $competitionMapService)
    {
        $this->competitionMapService = $competitionMapService;
    }

    public function get(Request $request)
    {
        $response = $this->competitionMapService->get();
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        return response()->json($responseBody, $responseStatus);
    }
}

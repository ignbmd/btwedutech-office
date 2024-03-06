<?php

namespace App\Http\Controllers\Api\HighSchool;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\HighSchoolService\HighSchool;
use Illuminate\Support\Facades\Log;

class HighSchoolController extends Controller
{
  private HighSchool $highSchoolService;
  public function __construct(HighSchool $highSchoolService)
  {
    $this->highSchoolService = $highSchoolService;
  }

  public function index(Request $request)
  {
    // Query strings from datatables
    $draw = $request->get('draw');
    $page = (int)$request->get("start") ?? 0;
    $per_page = (int)$request->get("length") ?? 7;
    $search = $request->get('search')['value'] ?? "";

    // Additional query string
    $validHighSchoolTypes = ["SMA", "SMK"];
    $highSchoolType = $request->has('type') && in_array(strtoupper($request->get('type')), $validHighSchoolTypes)
      ? strtoupper($request->get('type'))
      : null;

    // Define query strings
    $query = ['page' => $page, 'per_page' => $per_page, 'type' => $highSchoolType];
    if($search) $query["name"] = $search;

    $highSchoolResponse = $this->highSchoolService->getWithPagination($query);
    $highSchoolBody = json_decode($highSchoolResponse->body());
    $highSchoolStatus = $highSchoolResponse->status();

    if(!$highSchoolResponse->successful()) {
      Log::error("Error when trying to get highschool data", ["response_body" => $highSchoolBody, "response_status" => $highSchoolStatus]);
      return response()->json($highSchoolBody, $highSchoolStatus);
    }

    return response()->json([
      "draw" => intval($draw),
      "recordsTotal" => $highSchoolBody?->total ?? 0,
      "recordsFiltered" => $highSchoolBody?->filteredTotal ?? 0,
      "data" => $highSchoolBody?->data ?? []
    ]);
  }

  public function getById($id)
  {
    $highSchoolResponse = $this->highSchoolService->getById($id);
    $highSchoolBody = json_decode($highSchoolResponse->body());
    $highSchoolStatus = $highSchoolResponse->status();

    if(!$highSchoolResponse->successful()) {
      Log::error("Error when trying to get highschool data", ["response_body" => $highSchoolBody, "response_status" => $highSchoolStatus]);
      return response()->json($highSchoolBody, $highSchoolStatus);
    }

    return response()->json($highSchoolBody, $highSchoolStatus);
  }

  public function indexPaginated(Request $request)
  {
    $highSchoolResponse = $this->highSchoolService->getWithPagination($request->all());
    $highSchoolBody = json_decode($highSchoolResponse->body());
    $highSchoolStatus = $highSchoolResponse->status();

    if(!$highSchoolResponse->successful()) {
      Log::error("Error when trying to get highschool data", ["response_body" => $highSchoolBody, "response_status" => $highSchoolStatus]);
      return response()->json($highSchoolBody, $highSchoolStatus);
    }

    return response()->json($highSchoolBody, $highSchoolStatus);
  }


  public function getByLocationID(int $location_id)
  {
    $highSchoolResponse = $this->highSchoolService->get(["location_id" => $location_id]);
    $highSchoolBody = json_decode($highSchoolResponse->body());
    $highSchoolStatus = $highSchoolResponse->status();

    if(!$highSchoolResponse->successful()) {
      Log::error("Error when trying to get highschool data", ["response_body" => $highSchoolBody, "response_status" => $highSchoolStatus]);
      return response()->json($highSchoolBody, $highSchoolStatus);
    }

    return response()->json($highSchoolBody, $highSchoolStatus);
  }

  public function getByType(string $type)
  {
    $highSchoolResponse = $this->highSchoolService->get(["type" => $type]);
    $highSchoolBody = json_decode($highSchoolResponse->body());
    $highSchoolStatus = $highSchoolResponse->status();

    if(!$highSchoolResponse->successful()) {
      Log::error("Error when trying to get highschool data", ["response_body" => $highSchoolBody, "response_status" => $highSchoolStatus]);
      return response()->json($highSchoolBody, $highSchoolStatus);
    }

    return response()->json($highSchoolBody, $highSchoolStatus);
  }

  public function getByTypeAndLocationID(string $type, int $location_id)
  {
    $highSchoolResponse = $this->highSchoolService->get(["type" => $type, "location_id" => $location_id]);
    $highSchoolBody = json_decode($highSchoolResponse->body());
    $highSchoolStatus = $highSchoolResponse->status();

    if(!$highSchoolResponse->successful()) {
      Log::error("Error when trying to get highschool data", ["response_body" => $highSchoolBody, "response_status" => $highSchoolStatus]);
      return response()->json($highSchoolBody, $highSchoolStatus);
    }

    return response()->json($highSchoolBody, $highSchoolStatus);
  }

  public function delete(Request $request, $id)
  {
    $response = $this->highSchoolService->delete($id);
    $body = json_decode($response->body());
    $status = $response->status();
    if(!$response->successful()) Log::error("Failed to delete highschool data", ["id" => $id, "response" => $body, "status" => $status]);
    return response()->json($body, $status);
  }
}

<?php

namespace App\Http\Controllers\Api\CompetitionMap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CompetitionMapService\SkdRank;
use Illuminate\Support\Facades\Validator;
use Rap2hpoutre\FastExcel\FastExcel;

class SkdRankController extends Controller
{
  protected SkdRank $service;

  public function __construct(SkdRank $service)
  {
    $this->service = $service;
  }

  public function get(Request $request)
  {
    $response = $this->service->getSkdRankByQuery($request->all());
    $body = json_decode($response->body());
    $status = $response->status();
    return response()->json($body, $status);
  }

  public function import(Request $request)
  {
    $validation = Validator::make($request->all(), [
      'file' => 'required|mimes:xls,xlsx',
    ],[
      'file.required' => 'File harus diupload',
      'file.mimes' => 'File yang diupload harus file tipe excel (xls, xlsx) '
    ]);
    if($validation->fails()) return response()->json(['success' => false, 'message' => $validation->errors()->all()[0]], 422);
    try {
      $data = json_decode($request->data);
      $location_id = null;
      if($data->province_id) $location_id = $data->province_id->id;
      if($data->region_id) $location_id = $data->region_id->id;
      $collection = (new FastExcel)->import($request->file('file'));
      $payload = $collection->map(function($value) use($data, $location_id) {
        $value["location_id"] = $location_id;
        $value["study_program_id"] = $data->study_program_id->id;
        $value["year"] = $data->year->value;
        return $value;
      })->toArray();
      $response = $this->service->createBulk($payload);
      $body = json_decode($response->body());
      $status = $response->status();
      return response()->json($body, $status);
    } catch (\Exception $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
  }

  public function createUpdateDelete(Request $request)
  {
    try {
      $payload = $request->data;
      $skdRanks = collect($request->skdRanks);
      $toBeInsertedDatas = $skdRanks->filter(fn($value) => !$value["isFromDB"] && $value["isManualCreated"] && !$value["isDeleted"])
      ->map(function($value) use($payload) {
        $value["location_id"] = $payload["region_id"] ? $payload["region_id"] : $payload["province_id"];
        $value["study_program_id"] = $payload["study_program_id"]["id"];
        $value["year"] = $payload["year"]["value"];
        return $value;
      })
      ->values()
      ->all();
      $toBeUpdatedDatas = $skdRanks->filter(fn($value) => $value["isFromDB"] && $value["isDirty"] && !$value["isDeleted"])->values()->all();
      $removedIds = $request->removedIds;
      // dd($payload, $skdRanks, $toBeInsertedDatas, $toBeUpdatedDatas, $request->removedIds);


      // Delete Skd Rank Datas
      if(count($removedIds) > 0) {
        $response = $this->service->deleteBulk(["id" => $removedIds]);
        if(!$response->successful()) return response()->json(['success' => false, 'message' => json_decode($response->body())], 500);
      }

      // Update SKD Rank Datas
      if(count($toBeUpdatedDatas) > 0) {
        $response = $this->service->updateBulk($toBeUpdatedDatas);
        if(!$response->successful()) return response()->json(['success' => false, "context" => "Update bulk skd rank datas", 'message' => json_decode($response->body())], 500);
      }

      // Create new SKD Rank
      if(count($toBeInsertedDatas) > 0)
      $response = $this->service->createBulk($toBeInsertedDatas);
      if(!$response->successful()) return response()->json(['success' => false, "context" => "Insert bulk skd rank datas", 'message' => json_decode($response->body())], 500);

      return response()->json(['success' => true, 'message' => 'Data berhasil diperbarui'], 200);
    } catch (\Exception $e) {
      return response()->json(['success' => true, 'message' => $e->getMessage()], 500);
    }
  }
}

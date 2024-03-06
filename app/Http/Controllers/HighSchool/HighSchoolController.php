<?php

namespace App\Http\Controllers\HighSchool;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\HighSchoolService\HighSchool;
use App\Services\LocationService\Location;
use Illuminate\Support\Facades\Log;

class HighSchoolController extends Controller
{

  private HighSchool $highSchoolService;
  private Location $locationService;

  public function __construct(Highschool $highSchoolService, Location $locationService)
  {
    $this->highSchoolService = $highSchoolService;
    $this->locationService = $locationService;
  }

  public function index(Request $request)
  {
    $validHighSchoolTypes = ["SMK", "SMA"];
    $highSchoolType = $request->has('type') && in_array(strtoupper($request->get('type')), $validHighSchoolTypes)
      ? strtoupper($request->get('type'))
      : "SMA";

    $breadcrumbs = [["name" => "Sekolah"]];

    $provincesResponse = $this->locationService->get(["type" => "PROVINCE"]);
    $provinces = json_decode($provincesResponse->body())?->data ?? [];
    if(count($provinces) > 0) $provinces = collect($provinces)->mapWithKeys(fn($item) => [$item->_id => $item])->toArray();

    $regionsResponse = $this->locationService->get(["type" => "REGION"]);
    $regions = json_decode($regionsResponse->body())?->data ?? [];
    if(count($regions) > 0) $regions = collect($regions)->mapWithKeys(fn($item) => [$item->_id => $item])->toArray();

    return view('pages/highschool/index', compact('breadcrumbs', 'highSchoolType', 'provinces', 'regions'));
  }

  public function create()
  {
    $breadcrumbs = [["name" => "Sekolah", "link" => "/sekolah"], ["name" => "Tambah", "link" => null]];
    return view('pages/highschool/create', compact('breadcrumbs'));
  }

  public function edit($id)
  {
    $schoolResponse = $this->highSchoolService->getById($id);
    $schoolData = json_decode($schoolResponse->body())?->data ?? null;

    $locationResponse = $this->locationService->getByIds([$schoolData->location_id]);
    $locationData = json_decode($locationResponse->body())?->data[0] ?? null;

    $breadcrumbs = [["name" => "Sekolah", "link" => "/sekolah"], ["name" => "Edit", "link" => null]];
    return view('pages/highschool/edit', compact('breadcrumbs', 'schoolData', 'locationData'));
  }

  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), [
      "type" => "required",
      "name" => "required",
      "province_id" => "required",
      "region_id" => "required"
    ], ["*.required" => "Harus diisi"]);
    if($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();
    $payload = ["type" => $request->type, "name" => $request->name, "location_id" => (int)$request->region_id];
    $response = $this->highSchoolService->create($payload);
    $body = json_decode($response->body());
    $status = $response->status();
    if(!$response->successful()) {
      Log::error("Failed to create highschool data", ["payload" => $payload, "response" => $body, "status" => $status]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Proses gagal, silakan coba lagi nanti"
      ]);
      return redirect("/sekolah?type=$request->type");
    }
    $request->session()->flash('flash-message', [
      "title" => "Berhasil",
      "type" => "success",
      "message" => "Sekolah berhasil ditambah"
    ]);
    return redirect("/sekolah?type=$request->type");
  }

  public function update(Request $request, $id)
  {
    $validator = Validator::make($request->all(), [
      "type" => "required",
      "name" => "required",
      "province_id" => "required",
      "region_id" => "required"
    ], ["*.required" => "Harus diisi"]);
    if($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();
    $payload = ["type" => $request->type, "name" => $request->name, "location_id" => (int)$request->region_id];
    $response = $this->highSchoolService->update($id, $payload);
    $body = json_decode($response->body());
    $status = $response->status();
    if(!$response->successful()) {
      Log::error("Failed to update highschool data", ["payload" => $payload, "response" => $body, "status" => $status]);
      $request->session()->flash('flash-message', [
        "title" => "Terjadi kesalahan",
        "type" => "error",
        "message" => "Proses gagal, silakan coba lagi nanti"
      ]);
      return redirect("/sekolah?type=$request->type");
    }
    $request->session()->flash('flash-message', [
      "title" => "Berhasil",
      "type" => "success",
      "message" => "Sekolah berhasil diperbarui"
    ]);
    return redirect("/sekolah?type=$request->type");
  }
}

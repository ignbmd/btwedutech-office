<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Services\LocationService\Location;

class LocationController extends Controller
{
    public function get(Request $request)
    {
        $locationService = new Location();
        $response = $locationService->get($request->all());
        $body = json_decode($response->body());
        $status = $response->status();
        return response()->json($body, $status);
    }

    public function getProvince()
    {
        $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/location/get-province';
        $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url);
        if(!$response->successful()) return $response->throw()->json();
        $province = array_map(function($data) {
            $data->text = $data->provinsi;
            unset($data->provinsi);
            unset($data->created_at);
            unset($data->updated_at);
            return $data;
        }, json_decode($response)->data);
        return response()->json($province, 200);
    }

    public function getRegion($province_id)
    {
        $url = env('SERVICE_API_GATEWAY_ADDRESS') . '/internal/location/get-region/' . $province_id;
        $response = Http::withHeaders(['X-Office-Token' => env('SERVICE_API_GATEWAY_TOKEN_OFFICE')])->get($url);
        if(!$response->successful()) return $response->throw()->json();
        $region = array_map(function($data) {
            $data->text = $data->kabupaten_kota;
            unset($data->kabupaten_kota);
            unset($data->created_at);
            unset($data->updated_at);
            unset($data->provinsi_id);
            return $data;
        }, json_decode($response)->data);
        return response()->json($region, 200);
    }
}

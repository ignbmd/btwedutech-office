<?php

namespace App\Http\Controllers\Api\Exam;

use App\Http\Controllers\Controller;
use App\Services\ApiGatewayService\Internal;
use App\Services\ExamService\TryoutFree;
use Illuminate\Support\Facades\Log;
use Error;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TryoutFreeController extends Controller
{
    private TryoutFree $examTryoutFree;
    private Internal $internalService;

    public function __construct(TryoutFree $examTryoutFree, Internal $serviceInternal)
    {
        $this->examTryoutFree = $examTryoutFree;
        $this->internalService = $serviceInternal;
    }

    public function getAll()
    {
        $response = $this->examTryoutFree->getAll();
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        return response()->json($responseBody, $responseStatus);
    }

    public function getDetail($id)
    {
        $response = $this->examTryoutFree->detail($id);
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        return response()->json($responseBody, $responseStatus);
    }

    public function getDetailCluster($id)
    {
        $response = $this->examTryoutFree->getDetailCluster($id);
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        return response()->json($responseBody, $responseStatus);
    }

    public function create(Request $request)
    {
      try {
        $payload = $request->all();

        $payload['duration'] = (int) $payload['duration'];
        $start_dateOnly = Carbon::parse($payload['date_start'])->format('Y-m-d');
        $end_dateOnly = Carbon::parse($payload['date_end'])->format('Y-m-d');
        $payload['start_date'] = $payload['date_start'];
        $payload['end_date'] = $payload['date_end'];
        $errorMessage = null;

        foreach($payload["cluster_data"] as $cluster) {
          $tryoutStartTimestamp = Carbon::parse($payload["date_start"])->timezone("Asia/Jakarta")->timestamp;
          $tryoutEndTimestamp = Carbon::parse($payload["date_end"])->timezone("Asia/Jakarta")->timestamp;

          $tryoutClusterStartTimestamp = Carbon::parse($cluster["start_datetime"])->timezone("Asia/Jakarta")->timestamp;
          $tryoutClusterEndTimestamp = Carbon::parse($cluster["end_datetime"])->timezone("Asia/Jakarta")->timestamp;

          $isTryoutStartTimestampNotValid = $tryoutStartTimestamp >= $tryoutEndTimestamp;
          $isTryoutEndTimestampNotValid = $tryoutEndTimestamp <= $tryoutStartTimestamp;

          $isStartClusterTimestampNotValid = $tryoutClusterStartTimestamp < $tryoutStartTimestamp
          || ($tryoutClusterStartTimestamp >= $tryoutStartTimestamp && $tryoutClusterStartTimestamp <= $tryoutEndTimestamp)
          || $tryoutClusterStartTimestamp >= $tryoutClusterEndTimestamp;
          $isEndClusterTimestampNotValid = $tryoutClusterEndTimestamp < $tryoutStartTimestamp
          || ($tryoutClusterEndTimestamp >= $tryoutStartTimestamp && $tryoutClusterEndTimestamp <= $tryoutEndTimestamp)
          || $tryoutClusterEndTimestamp <= $tryoutClusterStartTimestamp;

          if($isTryoutStartTimestampNotValid || $isTryoutEndTimestampNotValid) {
            $errorMessage = "Data Waktu Pendaftaran tidak valid";
          } else if($isStartClusterTimestampNotValid || $isEndClusterTimestampNotValid) {
            $errorMessage = "Data Waktu Dimulai/Waktu Berakhir tidak valid";
          }
        }

        if($errorMessage) return response()->json(['success' => false, 'message' => $errorMessage], 400);
        $responseLegacy = $this->internalService->createLegacyTryoutFree([
            "title" => $payload['title'],
            "modul_id" => $payload['modules_id'],
            "is_private" => ($payload['privacy_type'] == 'private') ? 1 : 0,
            "date_start" => $start_dateOnly,
            "date_end" => $end_dateOnly,
            "status" => $payload['status'],
            "description" => "-",
            "link_tele" => "-",
            "persyaratan" => "-",
        ]);
        $responseBodyLegacy = json_decode($responseLegacy->body());
        if ($responseLegacy->failed()) throw new Error('Failed create legacy tryout free!');

        $payload['section_id'] = $responseBodyLegacy->data->section_id;

        $responseLegacyCode = $this->internalService->createLegacyTask([
            "name" => $payload['title'],
            "waktu" => $payload['duration'],
            "kode_modul" => $payload['modules_code'],
            "section_id" => $payload['section_id']
        ]);
        $responseBodyLegacyCode = json_decode($responseLegacyCode->body());
        if ($responseLegacyCode->failed()) throw new Error('Failed create legacy task!');

        $payload['legacy_task_id'] = $responseBodyLegacyCode->data->inserted_tugas_id;

          $response = $this->examTryoutFree->save($payload);
          $responseBody = json_decode($response->body());
          $responseStatus = $response->status();

          if ($response->successful()) {
              $request->session()->flash('flash-message', [
                  'title' => 'Berhasil!',
                  'type' => 'success',
                  'message' => 'Tryout Gratis berhasil dibuat!'
              ]);
          }
      } catch (\Throwable $th) {
        throw $th;
      }
      return response()->json($responseBody, $responseStatus);
    }

    public function addSession(Request $request)
    {
        $payload = $request->all();
        $payload['max_capacity'] = (int) $payload['max_capacity'];
        $payload['packages_id'] = (int) $payload['packages_id'];
        try {
            $response = $this->examTryoutFree->addSession($payload);
            $responseBody = json_decode($response->body());
            $responseStatus = $response->status();

            if ($response->successful()) {
                $request->session()->flash('flash-message', [
                    'title' => 'Berhasil!',
                    'type' => 'success',
                    'message' => 'Sesi Tryout Gratis berhasil dibuat!'
                ]);
            }
        } catch (\Throwable $th) {
            throw $th;
        }

        return response()->json($responseBody, $responseStatus);
    }

    public function update(Request $request)
    {
        $payload = $request->all();
        $payload['max_repeat'] = (int) $payload['max_repeat'];
        $payload['duration'] = (int) $payload['duration'];
        $errorMessage = null;

        $tryoutStartTimestamp = Carbon::parse($payload["start_date"])->timezone("Asia/Jakarta")->subHours(7);
        $tryoutEndTimestamp = Carbon::parse($payload["end_date"])->timezone("Asia/Jakarta")->subHours(7);

        $isTryoutStartTimestampNotValid = $tryoutStartTimestamp >= $tryoutEndTimestamp;
        $isTryoutEndTimestampNotValid = $tryoutEndTimestamp <= $tryoutStartTimestamp;

        if($isTryoutStartTimestampNotValid || $isTryoutEndTimestampNotValid) {
          $errorMessage = "Data Waktu Pendaftaran tidak valid";
        }
        $clusterResponse  = $this->examTryoutFree->detail($payload["id"]);
        $clusterBody = json_decode($clusterResponse->body());
        // if(!$clusterBody?->data) {
        //   Log::error("Error when trying to get free tryout cluster data", $clusterBody);
        //   return response()->json(['success' => false, 'message' => 'Terjadi kesalahan, silakan coba lagi nanti'], 400);
        // }
        // if(count($clusterBody?->data?->tryout_clusters ?? []) > 0) {
        //   foreach($clusterBody?->data?->tryout_clusters as $cluster) {
        //     if(!$cluster->start_datetime || !$cluster->end_datetime) continue;
        //     $clusterStartTimestamp = Carbon::parse($cluster->start_datetime);
        //     $clusterEndTimestamp = Carbon::parse($cluster->end_datetime);
        //    }
        // }
        // dd($clusterBody);

        if($errorMessage) return response()->json(['success' => false, 'message' => $errorMessage], 400);

        $response = $this->examTryoutFree->update($payload);
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        if ($response->successful()) {
            $request->session()->flash('flash-message', [
                'title' => 'Berhasil!',
                'type' => 'success',
                'message' => 'Tryout Gratis berhasil diperbarui!'
            ]);
        }

        return response()->json($responseBody, $responseStatus);
    }

    public function updateCluster(Request $request)
    {
        $payload = $request->all();
        $payload['max_capacity'] = (int) $payload['max_capacity'];
        $response = $this->examTryoutFree->updateCluster($payload);
        $responseBody = json_decode($response->body());
        $responseStatus = $response->status();

        if ($response->successful()) {
            $request->session()->flash('flash-message', [
                'title' => 'Berhasil!',
                'type' => 'success',
                'message' => 'Tryout Gratis berhasil diperbarui!'
            ]);
        }

        return response()->json($responseBody, $responseStatus);
    }

    public function delete($id)
    {
        $response = $this->examTryoutFree->delete($id);
        $responseBody = json_decode($response?->body());
        $responseStatus = $response->status();
        return response()->json($responseBody, $responseStatus);
    }

    public function deleteCluster($id)
    {
        $response = $this->examTryoutFree->deleteCluster($id);
        $responseBody = json_decode($response?->body());
        $responseStatus = $response->status();
        return response()->json($responseBody, $responseStatus);
    }
}

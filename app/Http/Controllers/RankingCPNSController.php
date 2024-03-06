<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateRankingCPNS;
use App\Services\ExamCPNSService\TryoutCPNSResult;
use App\Services\ProfileService\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\GenerateResultService\GenerateResult;

class RankingCPNSController extends Controller
{
    private TryoutCPNSResult $tryoutCPNSResult;
    private Profile $profile;
    private GenerateResult $generateResult;

    public function __construct(
        TryoutCPNSResult $tryoutCPNSResult,
        Profile $profile,
        GenerateResult $generateResult
    ){
        $this->tryoutCPNSResult = $tryoutCPNSResult;
        $this->profile = $profile;
        $this->generateResult = $generateResult;
    }

    public function showRankingTryoutCPNS($taskId){
        $cache_name = 'ranking-cpns_'. $taskId;
        $homeRankingBreadcrumbLink = '/ujian-cpns/tryout-kode/';

        if(Cache::has($cache_name)) {
            $data = Cache::get($cache_name);
            if(empty($data->data)) {
              $breadcrumbs = [['name' => "Ranking CPNS", 'link' => $homeRankingBreadcrumbLink]];
            } else {
                $breadcrumbs = [['name' => "Ranking CPNS", 'link' => $homeRankingBreadcrumbLink], ['name' => "Ranking " . $data->data[0]->title]];
                $studentIds = collect($data->data ?? [])->map(fn($value) => $value->smartbtw_id)->all();
                $studentIdsChunk = collect($studentIds)->chunk(100)->all();
        
                $students = collect([]);
                foreach($studentIdsChunk as $sIds) {
                  $response = $this->profile->getStudentByIds(["smartbtw_id" => $sIds->toArray(), "fields" => "name,email,smartbtw_id,branchs,parent_datas,school_origin"]);
                  $body = json_decode($response->body());
                  if(!$response->successful()) continue;
        
                  $student = $body?->success ? $body?->data : [];
                  if(!$student) continue;
                  $students->push($student);
                }
        
                $students = $students->collapse()->unique("smartbtw_id")->mapWithKeys(function($item, $key) {
                  return [$item->smartbtw_id => $item];
                });
                $data->data = collect($data->data ?? [])->map(function($value) use($students) {
                  $value->school_origin = $students[$value?->smartbtw_id]?->school_origin ?? "-";
                  return $value;
                })
                ->values()
                ->all();
              }
            return view('pages.exam-cpns.tryout-code.ranking-cpns', compact('cache_name', 'data','breadcrumbs', 'taskId'));
        }else{
            $data = GenerateRankingCPNS::dispatch($taskId);
            // $response = $this->tryoutCPNSResult->getTryoutResultByID($taskId);
            // dd($response);
            $homeRankingBreadcrumbLink = url()->previous();
            $breadcrumbs = [['name' => "Ranking CPNS", 'link' => $homeRankingBreadcrumbLink]];
            return view('pages.exam-cpns.tryout-code.ranking-cpns', compact('cache_name', 'breadcrumbs', 'taskId'));
        }
    }

    public function refreshRankingCPNS($taskId)
    {
      $cache_name = 'ranking-cpns_'.$taskId;
      Cache::forget($cache_name);
      return redirect()->route('ranking-cpns.show', $taskId);
    }

    public function downloadRankingCPNS($taskId)
    {
      $response = $this->generateResult->generateRankingCPNSPDF($taskId);
      if (!$response->successful()) {
        return redirect("/ujian-cpns/tryout-kode/")->with('flash-message', [
          'title' => 'Peringatan',
          'type' => 'error',
          'message' => 'Gagal Mengunduh PDF Ranking'
        ]);
      }
      $body = json_decode($response->body());
      $fileLink = $body->data->link;
      return redirect()->away($fileLink);
    }

}
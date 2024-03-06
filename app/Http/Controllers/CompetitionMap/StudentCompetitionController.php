<?php

namespace App\Http\Controllers\CompetitionMap;

use App\Helpers\Breadcrumb;
use App\Http\Controllers\Controller;
use App\Services\StudentResultService\Ranking;
use App\Services\CompetitionMapService\SkdRank;
use App\Services\ExamService\TryoutCode;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Carbon\Carbon;
use stdClass;

class StudentCompetitionController extends Controller
{
    private Ranking $rankingService;
    private SkdRank $skdRankService;
    private TryoutCode $examTryoutCode;

    public function __construct(SkdRank $skdRankService, Ranking $rankingService, TryoutCode $examTryoutCode)
    {
        $this->rankingService = $rankingService;
        $this->skdRankService = $skdRankService;
        $this->examTryoutCode = $examTryoutCode;
        Breadcrumb::setFirstBreadcrumb('Peta Persaingan Siswa', '/peta-persaingan/siswa');
    }

    public function siswa()
    {
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        return view('/pages/competition-map/student', compact('breadcrumbs'));
    }

    public function tryout()
    {
        $breadcrumbs = [];
        $breadcrumbs[0]["name"] = "Peta Persaingan Tryout";
        return view('/pages/competition-map/tryout', compact('breadcrumbs'));
    }

    public function siswaDownload()
    {
        $url = explode('/', $_SERVER['REQUEST_URI']);
        $smartbtw_id = (int) $url[3];
        $task_id = (int) $url[4];
        $year = (int) $url[6];

        // get Exam Result
        $responseExamResult = $this->rankingService->getExamResult(['task_id' => $task_id, 'smartbtw_id' => $smartbtw_id]);
        $bodyResponseExamResult = json_decode($responseExamResult?->body());
        $examResult = $bodyResponseExamResult->data;

        if ($examResult?->user_result?->total_score && $year) {
            // get Skd Rank
            $payloadSkdRank = [];
            $payloadSkdRank["score"] = $examResult?->user_result?->total_score;
            $payloadSkdRank["year"] = $year;
            $responseSkdRank = $this->skdRankService->getSkdRankStudent($payloadSkdRank);
            $bodyResponseSkdRank = json_decode($responseSkdRank?->body());
            $skdRank = $bodyResponseSkdRank->data;
            $tryout_title = $examResult?->user_result?->title;
            $tryout_date = Carbon::parse($examResult?->user_result?->start)->locale('id')->isoFormat('LL');

            $html = view('pages/competition-map/student-download', compact('examResult', 'skdRank', 'tryout_title', 'tryout_date'));

            $pdf  = SnappyPdf::loadHTML($html)
                ->setPaper('a4')
                ->setOrientation('landscape')
                ->setOption('margin-top', 0)
                ->setOption('margin-left', 0)
                ->setOption('margin-right', 0)
                ->setOption('margin-bottom', 0)
                ->setOption('disable-smart-shrinking', true);

            return $pdf->stream('Peta Persaingan Siswa - ' . $tryout_title . ' - ' . $tryout_date . '.pdf');
        }
    }

    public function tryoutDownload()
    {
        $url = explode('/', $_SERVER['REQUEST_URI']);
        $task_id = (int) $url[3];
        $tryout_id = (int) $url[4];
        $year = (int) $url[6];
        $smartbtw_id = null;
        $allData = [];

        // get Tryout Detail
        $responseTryoutDetail = $this->examTryoutCode->detail($tryout_id);
        $responseBodyTryoutDetail = json_decode($responseTryoutDetail->body());
        $tryout = $responseBodyTryoutDetail->data;
        $tryout_title = $tryout?->packages?->title;
        $tryout_date = Carbon::parse($tryout?->created_at)->locale('id')->isoFormat('LL');

        // get Exam Result
        $responseExamResult = $this->rankingService->getExamResult(['task_id' => $task_id, 'smartbtw_id' => $smartbtw_id]);
        $bodyResponseExamResult = json_decode($responseExamResult?->body());
        $examResult = $bodyResponseExamResult->data;
        $resultRank = $examResult->ranks;

        // get Skd Rank
        $payloadSkdRank = [];
        $payloadSkdRank["year"] = $year;
        $payloadSkdRank["task_id"] = $task_id;
        $responseSkdRank = $this->skdRankService->getSkdRankTryout($payloadSkdRank);
        $bodyResponseSkdRank = json_decode($responseSkdRank?->body());
        $skdRank = $bodyResponseSkdRank->data;

        foreach ($resultRank
            as $student_no => $student) {
            foreach ($skdRank as $ranks) {
                if ($ranks->smartbtw_id == $student->smartbtw_id) {
                    $list_school = $ranks->skd_rank_list;
                    foreach ($list_school as $school) {
                        $tempData = new stdClass();
                        $tempData->name = $student?->student_name;
                        $tempData->twk = $student?->score_values->TWK->score;
                        $tempData->tiu = $student?->score_values->TIU->score;
                        $tempData->tkp = $student?->score_values->TKP->score;
                        $tempData->total = $ranks?->skd_score;
                        $tempData->status = $student?->status_text;
                        $tempData->sekolah = $school?->school_name;
                        $tempData->jurusan = $school?->study_program_name;
                        $tempData->kuota = $school?->study_program_quota ?? "-";
                        $tempData->ranking = $school?->student_rank  ?? "-";
                        if ($student_no % 2 == 0) {
                            $tempData->gray = true;
                        } else {
                            $tempData->gray = false;
                        }
                        array_push($allData, $tempData);
                    }
                }
            }
        }

        $html = view('pages/competition-map/tryout-download', compact('allData', 'tryout_title', 'tryout_date'));

        $pdf  = SnappyPdf::loadHTML($html)
            ->setPaper('a3')
            ->setOrientation('landscape')
            ->setOption('margin-top', 0)
            ->setOption('margin-left', 0)
            ->setOption('margin-right', 0)
            ->setOption('margin-bottom', 0)
            ->setOption('disable-smart-shrinking', true);

        return $pdf->stream('Peta Persaingan Tryout - ' . $tryout_title . ' - ' . $tryout_date . '.pdf');
    }
}

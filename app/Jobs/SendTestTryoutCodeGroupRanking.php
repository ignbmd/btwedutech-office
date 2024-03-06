<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;


use Carbon\Carbon;
use App\Helpers\RabbitMq;
use App\Services\ProfileService\Profile;
use App\Services\StudentResultService\Ranking;
use App\Services\ExamService\TryoutCode;
use Error;
use Exception;

class SendTestTryoutCodeGroupRanking implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  private $tryout_code_category_id;
  private $tryout_code_group;
  /**
   * Create a new job instance.
   *
   * @return void
   */
  public function __construct($tryout_code_category_id, $tryout_code_group)
  {
    $this->tryout_code_category_id = $tryout_code_category_id;
    $this->tryout_code_group = $tryout_code_group;
  }

  /**
   * Execute the job.
   *
   * @return void
   */
  public function handle()
  {
    try {
      $profileService = new Profile();
      $tryoutCodeExamService = new TryoutCode();

      $tcGroupResponse = $tryoutCodeExamService->getTaskIdsWithGroup($this->tryout_code_category_id);
      $tcGroupBody = json_decode($tcGroupResponse->body())?->data ?? [];
      if(!$tcGroupBody) throw new Error("Failed on getting group or tryout category doesnt have any group");

      $groupedTryoutCodeGroup = collect($tcGroupBody)
      ->groupBy("group")
      ->filter(fn($value, $key) => $key && $key === $this->tryout_code_group)
      ->all();

      foreach($groupedTryoutCodeGroup as $key => $group) {
        $keyLowerCase = Str::lower($key);
        $isTPS = Str::contains($keyLowerCase, ["tps", "TPS"]);
        $groupTaskIds = $group->map(fn($value) => $value->task_id)->all();

        if($isTPS) $ranks = $this->getTpsRanking($groupTaskIds);
        else $ranks = $this->getNonTpsRanking($groupTaskIds);

        if(!$ranks) {
          Log::error("Couldn't get ranking data for group ".$key. " from API or the selected group doesn't have any ranking");
          continue;
        }
        $mappedRanking = collect($ranks)
        ->map(function($value) {
          $parsedStartDate = \Carbon\Carbon::parse($value->start)->timezone('Asia/Jakarta');
          $parsedEndDate = \Carbon\Carbon::parse($value->end)->timezone('Asia/Jakarta');
          $start = $parsedStartDate < $parsedEndDate ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . ' WIB' : '-';
          $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . ' WIB';
          $duration = $parsedStartDate < $parsedEndDate ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE]) : '-';

          $value->id = $value->smartbtw_id;
          $value->name = $value->student_name;
          $value->location = "Offline";
          $value->pos = $value->position;
          $value->start = $start;
          $value->end = $end;
          $value->duration = $duration;
          if($value->program === "skd") $value->score_keys = ["TWK", "TIU", "TKP"];

          $value->score = array_map(function($val) use($value) {
            $newScore = [];
            $newScore["category"] = $val;
            $newScore["score"] = $value->score_values->$val->score;
            $newScore["passing_grade"] = $value->score_values->$val->passing_grade;
            return (object)$newScore;
          }, $value->score_keys);

          unset($value->_id);
          unset($value->createdAt);
          unset($value->updatedAt);
          unset($value->position);
          unset($value->exam_type);
          unset($value->is_user_result);
          unset($value->student_id);
          unset($value->student_name);
          unset($value->student_email);
          unset($value->status_text);
          unset($value->task_id);
          unset($value->score_keys);
          unset($value->score_values);
          unset($value->smartbtw_id);
          return $value;
        });

        $studentIds = $mappedRanking->map(fn($value) => $value->id)->all();
        $students = [];
        foreach($studentIds as $studentId) {
          $response = $profileService->getStudentByIds(["smartbtw_id" => $studentId, "fields" => "name,email,smartbtw_id,branchs,parent_datas"]);
          $body = json_decode($response->body());
          if(!$response->successful()) continue;

          $student = $body?->success ? $body?->data[0] : [];
          if(!$student) continue;

          $students[$student->smartbtw_id] = $student;
        }

        $students = collect($students);
        $mappedRanking = $mappedRanking->map(function($value) use($students) {
          $value->branch_name = $students[$value?->id]?->branchs?->branch_name ?? "-";
          $value->branch_code = $students[$value?->id]?->branchs?->branch_code ?? "-";
          return $value;
        })
        ->values()
        ->all();

        $contacts = $students->map(function($value) {
          $contact = [];
          $contact['name'] = $value?->name ?? null;
          $contact['send_to'] = "082237808008";
          $contact['greeting'] = $this->getGreetingTime();
          return (object)$contact;
        })->whereNotNull("send_to")->values()->all();

        if(!$contacts) {
          Log::error("Couldn't fetch students profile data from service profile");
          continue;
        }

        $title = explode("|", $mappedRanking[0]->title);
        $brokerPayload = [
          "version" => 1,
          "data" => [
            "title" => $title[0],
            "date" => Carbon::now()->timezone("Asia/Jakarta")->locale("id")->translatedFormat("d F Y"),
            "contacts" => $contacts,
            "data" => $mappedRanking
          ]
        ];
        $topic = $isTPS ? "sendpdf.ranking-tps" : "sendpdf.ranking";
        RabbitMq::send($topic, json_encode($brokerPayload));
        sleep(15);
      }
    } catch (Exception $e) {
      $this->fail($e);
    }
  }

  public function getGreetingTime()
  {
    $hour = Carbon::now()->format('H');
    if ($hour < 12) {
      return 'pagi';
    }
    if ($hour < 15) {
      return 'siang';
    }
    if ($hour < 18) {
      return 'sore';
    }
    return 'malam';
  }

  public function getTpsRanking($taskIds)
  {
    $rankingExamResultService = new Ranking();

    $ranks = [];
    $page = 1;
    $limitPage = 500;
    $tpsTaskIds = implode(",", $taskIds);

    $groupRankingResponse = $rankingExamResultService->getIRTRankingByTaskIds(["task_id" => $tpsTaskIds, "sort_rank" => true]);
    $groupRankingBody = json_decode($groupRankingResponse->body())?->data;
    array_push($ranks, $groupRankingBody->ranks);

    // if($groupRankingBody->info->total_pages > 1) {
    //   for($i = $page + 1; $i <= $groupRankingBody->info->total_pages; $i++) {
    //     $groupRankingResponse = $rankingExamResultService->getIRTRankingByTaskIds(["task_id" => $tpsTaskIds, "page" => $i, "limit_page" => $limitPage, "sort_rank" => true]);
    //     $groupRankingBody = json_decode($groupRankingResponse->body())?->data;
    //     array_push($ranks, $groupRankingBody->ranks);
    //   }
    // }

    $ranks = collect($ranks)->collapse() ?? [];
    return $ranks;
  }

  public function getNonTpsRanking($taskIds)
  {
    $rankingExamResultService = new Ranking();
    $groupRankingResponse = $rankingExamResultService->getRankingByTaskIds($taskIds);
    $groupRankingBody = json_decode($groupRankingResponse->body())?->data?->ranks ?? [];
    return $groupRankingBody;
  }

  public function failed($exception) {
    Log::error($exception->getMessage(), $exception);
  }
}

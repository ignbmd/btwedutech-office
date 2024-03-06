<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Helpers\Breadcrumb;
use App\Services\ApiGatewayService\Internal\Ranking;
use App\Services\StudentResultService\Ranking as RankingResult;
use App\Services\ApiGatewayService\Internal;
use App\Services\ProfileService\Profile;
use App\Services\ExamService\Exam;
use App\Services\ExamService\TryoutCode;
use App\Services\ExamService\TryoutCodeCategory;
use App\Services\ExamService\QuestionCategory;
use App\Jobs\GenerateRanking;
use Barryvdh\Snappy\Facades\SnappyPdf;
use App\Jobs\SendTryoutCodeGroupRanking;
use App\Jobs\SendTestTryoutCodeGroupRanking;
use Carbon\Carbon;


class RankingController extends Controller
{

  private Exam $examService;
  private RankingResult $rankingResult;
  private Internal $internal;
  private TryoutCode $tryoutCode;
  private TryoutCodeCategory $tryoutCodeCategory;
  private QuestionCategory $questionCategory;
  private Profile $profile;

  public function __construct(
    Ranking $ranking,
    Exam $examService,
    RankingResult $rankingResult,
    Internal $internal,
    TryoutCode $tryoutCode,
    TryoutCodeCategory $tryoutCodeCategory,
    QuestionCategory $questionCategory,
    Profile $profile
  )
  {
    $this->ranking = $ranking;
    $this->examService = $examService;
    $this->rankingResult = $rankingResult;
    $this->internal = $internal;
    $this->tryoutCode = $tryoutCode;
    $this->tryoutCodeCategory = $tryoutCodeCategory;
    $this->questionCategory = $questionCategory;
    $this->profile = $profile;
  }

  public function freeTryoutSection()
  {
    $breadcrumbs = [['name' => 'Ranking Tryout Gratis']];
    return view('pages/ranking/free-tryout/index', compact('breadcrumbs'));
  }

  public function premiumTryoutSection()
  {
    $breadcrumbs = [['name' => 'Ranking Tryout Premium']];
    return view('pages/ranking/premium-tryout/index', compact('breadcrumbs'));
  }

  public function packageTryoutSection()
  {
    $breadcrumbs = [['name' => 'Ranking Tryout Paket']];
    return view('pages/ranking/package-tryout/index', compact('breadcrumbs'));
  }

  public function specificTryoutSection()
  {
    $breadcrumbs = [['name' => 'Ranking Tryout Khusus']];
    return view('pages/ranking/specific-tryout/index', compact('breadcrumbs'));
  }

  public function recalculateIRTScore(Request $request, $tryoutCode)
  {
    $this->examService->recalculateIRT($tryoutCode);
    return redirect()->back()->with('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => 'Nilai akhir dikalkulasi'
    ]);
  }

  public function showRanking($taskId)
  {
    $cache_name = 'ranking_' . $taskId;
    if(Cache::has($cache_name)) {
      $data = Cache::get($cache_name);
      if(empty($data->ranks)) {
        $homeRankingBreadcrumbLink = url()->previous();
        $breadcrumbs = [['name' => 'Ranking', 'link' => $homeRankingBreadcrumbLink]];
      } else {
        if($data->ranks[0]->exam_type === 'free-tryout') $homeRankingBreadcrumbLink = '/ranking/free-tryout';
        if($data->ranks[0]->exam_type === 'premium-tryout') $homeRankingBreadcrumbLink = '/ranking/premium-tryout';
        if($data->ranks[0]->exam_type === 'specific-tryout') $homeRankingBreadcrumbLink = '/ranking/specific-tryout';
        else $homeRankingBreadcrumbLink = '/ranking/package-tryout';
        $breadcrumbs = [['name' => 'Ranking', 'link' => $homeRankingBreadcrumbLink], ['name' => $data->ranks[0]->title]];

        $studentIds = collect($data->ranks ?? [])->map(fn($value) => $value->smartbtw_id)->all();
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
        $data->ranks = collect($data->ranks ?? [])->map(function($value) use($students) {
          $value->school_origin = $students[$value?->smartbtw_id]?->school_origin ?? "-";
          return $value;
        })
        ->values()
        ->all();
      }
      return view('pages/ranking/ranking', compact('cache_name', 'data', 'breadcrumbs', 'taskId'));
    } else {
      $data = GenerateRanking::dispatch($taskId);

      $homeRankingBreadcrumbLink = url()->previous();
      $breadcrumbs = [['name' => 'Ranking', 'link' => $homeRankingBreadcrumbLink]];

      return view('pages/ranking/ranking', compact('cache_name', 'breadcrumbs', 'taskId'));
    }
  }

  public function showIRTRanking($taskId)
  {
    $response = $this->rankingResult->getIRTRanking(["task_id" => $taskId]);
    $data = json_decode($response->body())->data ?? [];
    $tryoutScheduleResponse = $this->internal->getCodeTryoutSchedules();
    $tryoutSchedule = $tryoutScheduleResponse->successful() ? json_decode($tryoutScheduleResponse->body())->data : null;

    $questionCategoryResponse = $this->questionCategory->get("tps");
    $questionCategories = json_decode($questionCategoryResponse->body())?->data ?? [];
    if($questionCategories) $questionCategories = collect($questionCategories)->pluck('description', 'category')->toArray();

    if(empty($data->ranks)) {
      $homeRankingBreadcrumbLink = url()->previous();
      $breadcrumbs = [['name' => 'Ranking', 'link' => $homeRankingBreadcrumbLink]];
      $tryoutCode = null;
    } else {
      if($data->ranks[0]->exam_type === 'free-tryout') $homeRankingBreadcrumbLink = '/ranking/free-tryout';
      if($data->ranks[0]->exam_type === 'premium-tryout') $homeRankingBreadcrumbLink = '/ranking/premium-tryout';
      if($data->ranks[0]->exam_type === 'specific-tryout') $homeRankingBreadcrumbLink = '/ranking/specific-tryout';
      else $homeRankingBreadcrumbLink = '/ranking/package-tryout';
      $tryoutTitles = explode(" | ", $data->ranks[0]->title);
      $tryoutCode = count($tryoutTitles) > 1 ? $tryoutTitles[1] : $tryoutTitles[0];
      $breadcrumbs = [['name' => 'Ranking', 'link' => $homeRankingBreadcrumbLink], ['name' => $data->ranks[0]->title]];

      $studentIds = collect($data->ranks ?? [])->map(fn($value) => $value->smartbtw_id)->all();
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
      $data->ranks = collect($data->ranks ?? [])->map(function($value) use($students) {
        $value->school_origin = $students[$value?->smartbtw_id]?->school_origin ?? "-";
        return $value;
      })
      ->values()
      ->all();
    }
    return view('pages/ranking/ranking-irt', compact('data', 'breadcrumbs', 'taskId', 'tryoutCode', 'tryoutSchedule', 'questionCategories'));
  }

  public function downloadRanking($taskId)
  {
    $cache_name = 'ranking_' . $taskId;
    if(Cache::has($cache_name)) {
      $ranking = Cache::get($cache_name);
      $studentIds = collect($ranking->ranks ?? [])->map(fn($value) => $value->smartbtw_id)->all();
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
      $ranking->ranks = collect($ranking->ranks ?? [])->map(function($value) use($students) {
        $value->school_origin = $students[$value?->smartbtw_id]?->school_origin ?? "-";
        return $value;
      })
      ->values()
      ->all();
      $html = view()->make('pages.ranking.print-ranking', (array)$ranking)->render();
      $pdf  = SnappyPdf::loadHTML($html)
          ->setPaper('a4')
          ->setOption('margin-top', 0)
          ->setOption('margin-left', 0)
          ->setOption('margin-right', 0)
          ->setOption('margin-bottom', 0)
          ->setOrientation("landscape");
      return $pdf->stream("ranking_" . $taskId . ".pdf");
    } else {
      $data = GenerateRanking::dispatch($taskId);
      echo "Data ranking sedang diperbarui. Mohon tunggu...";
      sleep(10);
      return redirect(route('ranking.download', $taskId));
    }
  }

  public function downloadIRTRanking($taskId)
  {
    $response = $this->rankingResult->getIRTRanking(["task_id" => $taskId]);
    $ranking = json_decode($response->body())->data ?? [];
    if(empty($ranking->ranks)) return redirect(route('ranking.show-irt', $taskId));
    $studentIds = collect($ranking->ranks ?? [])->map(fn($value) => $value->smartbtw_id)->all();
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
    $ranking->ranks = collect($ranking->ranks ?? [])->map(function($value) use($students) {
      $value->school_origin = $students[$value?->smartbtw_id]?->school_origin ?? "-";
      return $value;
    })
    ->values()
    ->all();

    $questionCategoryResponse = $this->questionCategory->get("tps");
    $questionCategories = json_decode($questionCategoryResponse->body())?->data ?? [];
    if($questionCategories) $questionCategories = collect($questionCategories)->pluck('description', 'category')->toArray();
    $ranking->questionCategories = $questionCategories;
    $html = view()->make('pages.ranking.print-ranking-irt', (array)$ranking)->render();
    $pdf  = SnappyPdf::loadHTML($html)
        ->setOrientation('landscape')
        ->setPaper('a3')
        ->setOption('margin-top', 0)
        ->setOption('margin-left', 0)
        ->setOption('margin-right', 0)
        ->setOption('margin-bottom', 0);
    return $pdf->stream("ranking_irt" . $taskId . ".pdf");
  }

  public function refreshRanking($taskId)
  {
    $cache_name = 'ranking_'.$taskId;
    Cache::forget($cache_name);
    return redirect()->route('ranking.show', $taskId);
  }

  public function sendGroupTryoutRankingForm()
  {
    $breadcrumbs = [["name" => "Kirim Ranking Grup Tryout Kode", "link" => null]];
    $tcCategoryResponse = $this->tryoutCodeCategory->getAll();
    $tcCategory = json_decode($tcCategoryResponse->body())?->data ?? [];
    if(!$tcCategory) return redirect()->back();
    $tcCategory = array_values(array_filter($tcCategory, fn($value) => !$value->deleted_at));
    return view("pages/ranking/send-group-tryout-ranking-form", compact('tcCategory', 'breadcrumbs'));
  }

  public function sendGroupTryoutRanking(Request $request)
  {
    $validation = Validator::make($request->all(), [
      "tryout_code_category_id" => ["required"],
      "tryout_code_group" => ["required"]
    ], [
      "tryout_code_category_id.required" => "Kategori tryout kode harus diisi",
      "tryout_code_group.required" => "Grup tryout kode harus diisi"
    ]);
    if($validation->fails()) return back()->withErrors($validation->errors());
    SendTryoutCodeGroupRanking::dispatch($request->tryout_code_category_id, $request->tryout_code_group);
    request()->session()->flash('flash-message', [
      'title' => 'Berhasil',
      'type' => 'success',
      'message' => "Ranking grup tryout kode sedang dikirim"
    ]);
    return redirect()->back();
  }

  public function downloadGroupTryoutRanking(Request $request)
  {
    $validation = Validator::make($request->all(), [
      "tryout_code_category_id" => ["required"],
      "tryout_code_group" => ["required"]
    ], [
      "tryout_code_category_id.required" => "Kategori tryout kode harus diisi",
      "tryout_code_group.required" => "Grup tryout kode harus diisi"
    ]);
    if($validation->fails()) return back()->withErrors($validation->errors());

    $mappedRanking = [];
    $studentSchools = [];
    $tcGroupResponse = $this->tryoutCode->getTaskIdsWithGroup($request->tryout_code_category_id);
    $tcGroupBody = json_decode($tcGroupResponse->body())?->data ?? [];
    if(!$tcGroupBody) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan',
        'type' => 'error',
        'message' => "Kategori tryout yang dipilih tidak memiliki group tryout"
      ]);
      return redirect()->back();
    }

    $groupedTryoutCodeGroup = collect($tcGroupBody)
    ->groupBy("group")
    ->filter(fn($value, $key) => $key && $key === $request->tryout_code_group)
    ->all();

    foreach($groupedTryoutCodeGroup as $key => $group) {
      $keyLowerCase = Str::lower($key);
      $isTPS = Str::contains($keyLowerCase, ["tps", "TPS"]);
      $groupTaskIds = $group->map(fn($value) => $value->task_id)->all();

      if($isTPS) $ranks = $this->getTpsRanking($groupTaskIds);
      else $ranks = $this->getNonTpsRanking($groupTaskIds);
      if(!$ranks) continue;

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
      $studentIdsChunk = collect($studentIds)->chunk(200)->all();

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
      $mappedRanking = $mappedRanking->map(function($value) use($students) {
        $value->branch_name = $students[$value?->id]?->branchs?->branch_name ?? "-";
        $value->branch_code = $students[$value?->id]?->branchs?->branch_code ?? "-";
        $value->school_origin = $students[$value?->id]?->school_origin ?? "-";
        return $value;
      })
      ->values()
      ->all();
    }
    if(count($mappedRanking) === 0) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan',
        'type' => 'error',
        'message' => "Data ranking kosong"
      ]);
      return redirect()->back();
    }

    $title = explode("|", $mappedRanking[0]->title);
    $viewPath = $isTPS ? "pages.ranking.print-group-tryout-code-irt" : "pages.ranking.print-group-tryout-code";
    $html = view()->make($viewPath, ["ranking" => (array)$mappedRanking, "title" => $title[0], "date" => Carbon::now()->timezone("Asia/Jakarta")->locale("id")->translatedFormat("d F Y")])->render();
    $pdf  = SnappyPdf::loadHTML($html)
        ->setPaper("a4")
        ->setOption('margin-top', 0)
        ->setOption('margin-left', 0)
        ->setOption('margin-right', 0)
        ->setOption('margin-bottom', 0)
        ->setOrientation("landscape");
    return $pdf->stream("ranking_" . $request->tryout_code_group . ".pdf");
  }

  public function sendTestGroupTryoutRankingForm()
  {
    $breadcrumbs = [["name" => "Kirim Ranking Grup Tryout Kode", "link" => null]];
    $tcCategoryResponse = $this->tryoutCodeCategory->getAll();
    $tcCategory = json_decode($tcCategoryResponse->body())?->data ?? [];
    if(!$tcCategory) return redirect()->back();
    $tcCategory = array_values(array_filter($tcCategory, fn($value) => !$value->deleted_at));
    return view("pages/ranking/send-test-group-tryout-ranking-form", compact('tcCategory', 'breadcrumbs'));
  }

  public function sendTestGroupTryoutRanking(Request $request)
  {
    $validation = Validator::make($request->all(), [
      "tryout_code_category_id" => ["required"],
      "tryout_code_group" => ["required"]
    ], [
      "tryout_code_category_id.required" => "Kategori tryout kode harus diisi",
      "tryout_code_group.required" => "Grup tryout kode harus diisi"
    ]);
    if($validation->fails()) return back()->withErrors($validation->errors());
    SendTestTryoutCodeGroupRanking::dispatch($request->tryout_code_category_id, $request->tryout_code_group);
    request()->session()->flash('flash-message', [
      'title' => 'Berhasil',
      'type' => 'success',
      'message' => "Ranking grup tryout kode sedang dikirim"
    ]);
    return redirect()->back();
  }

  public function dumpGroupTryoutRankingData(Request $request)
  {
    $validation = Validator::make($request->all(), [
      "tryout_code_category_id" => ["required"],
      "tryout_code_group" => ["required"]
    ], [
      "tryout_code_category_id.required" => "Kategori tryout kode harus diisi",
      "tryout_code_group.required" => "Grup tryout kode harus diisi"
    ]);
    if($validation->fails()) return back()->withErrors($validation->errors());

    $mappedRanking = [];
    $tcGroupResponse = $this->tryoutCode->getTaskIdsWithGroup($request->tryout_code_category_id);
    $tcGroupBody = json_decode($tcGroupResponse->body())?->data ?? [];
    if(!$tcGroupBody) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan',
        'type' => 'error',
        'message' => "Kategori tryout yang dipilih tidak memiliki group tryout"
      ]);
      return redirect()->back();
    }

    $groupedTryoutCodeGroup = collect($tcGroupBody)
    ->groupBy("group")
    ->filter(fn($value, $key) => $key && $key === $request->tryout_code_group)
    ->all();

    foreach($groupedTryoutCodeGroup as $key => $group) {
      $keyLowerCase = Str::lower($key);
      $isTPS = Str::contains($keyLowerCase, ["tps", "TPS"]);
      $groupTaskIds = $group->map(fn($value) => $value->task_id)->all();

      if($isTPS) $ranks = $this->getTpsRanking($groupTaskIds);
      else $ranks = $this->getNonTpsRanking($groupTaskIds);
      if(!$ranks) continue;
      dump($ranks);
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
      $studentIdsChunk = collect($studentIds)->chunk(100)->all();

      $students = collect([]);
      foreach($studentIdsChunk as $sIds) {
        $response = $this->profile->getStudentByIds(["smartbtw_id" => $sIds->toArray(), "fields" => "name,email,smartbtw_id,branchs,parent_datas"]);
        $body = json_decode($response->body());
        if(!$response->successful()) continue;

        $student = $body?->success ? $body?->data : [];
        if(!$student) continue;
        $students->push($student);
      }

      $students = $students->collapse()->unique("smartbtw_id")->mapWithKeys(function($item, $key) {
        return [$item->smartbtw_id => $item];
      });

      $mappedRanking = $mappedRanking->map(function($value) use($students) {
        $value->branch_name = $students[$value?->id]?->branchs?->branch_name ?? "-";
        $value->branch_code = $students[$value?->id]?->branchs?->branch_code ?? "-";
        return $value;
      })
      ->values()
      ->all();
    }
    if(count($mappedRanking) === 0) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan',
        'type' => 'error',
        'message' => "Data ranking kosong"
      ]);
      return redirect()->back();
    }

    $title = explode("|", $mappedRanking[0]->title);
    // $viewPath = $isTPS ? "pages.ranking.print-group-tryout-code-irt" : "pages.ranking.print-group-tryout-code";
    $data = ["ranking" => (array)$mappedRanking, "title" => $title[0], "date" => Carbon::now()->timezone("Asia/Jakarta")->locale("id")->translatedFormat("d F Y")];
    dd($data);

    // $html = view()->make($viewPath, ["ranking" => (array)$mappedRanking, "title" => $title[0], "date" => Carbon::now()->timezone("Asia/Jakarta")->locale("id")->translatedFormat("d F Y")])->render();
    // $pdf  = SnappyPdf::loadHTML($html)
    //     ->setPaper("a4")
    //     ->setOption('margin-top', 0)
    //     ->setOption('margin-left', 0)
    //     ->setOption('margin-right', 0)
    //     ->setOption('margin-bottom', 0);
    // if($isTPS) $pdf->setOrientation("landscape");
    // return $pdf->stream("ranking_" . $request->tryout_code_group . ".pdf");
  }

  private function getTpsRanking($taskIds)
  {
    $ranks = [];
    $page = 1;
    $limitPage = 500;
    $tpsTaskIds = implode(",", $taskIds);

    $groupRankingResponse = $this->rankingResult->getIRTRankingByTaskIds(["task_id" => $tpsTaskIds, "sort_rank" => true]);
    $groupRankingBody = json_decode($groupRankingResponse->body())?->data;
    array_push($ranks, $groupRankingBody->ranks);

    $ranks = collect($ranks)->collapse() ?? [];
    return $ranks;
  }

  private function getNonTpsRanking($taskIds)
  {
    $groupRankingResponse = $this->rankingResult->getRankingByTaskIds($taskIds);
    $groupRankingBody = json_decode($groupRankingResponse->body())?->data?->ranks ?? [];
    return $groupRankingBody;
  }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\StudentResultService\ClassroomResult;
use App\Services\ProfileService\Profile;
use App\Services\ApiGatewayService\Internal;
use App\Services\LearningService\Student;
use App\Services\ExamService\TryoutCode;
use App\Services\GenerateResultService\GenerateResult;
use App\Helpers\RabbitMq;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudentProgressController extends Controller
{
  private ClassroomResult $classroomResult;
  private Profile $profile;
  private Internal $apiGatewayInternal;
  private Classroom $classroom;
  private Classmember $classmember;
  private Student $student;
  private TryoutCode $tryoutCode;
  private GenerateResult $generateResultService;

  public function __construct(
    ClassroomResult $classroomResult,
    Profile $profile,
    Internal $apiGatewayInternal,
    ClassRoom $classroom,
    ClassMember $classMember,
    Student $student,
    TryoutCode $tryoutCode,
    GenerateResult $generateResultService
  ) {
    $this->classroomResult = $classroomResult;
    $this->profile = $profile;
    $this->apiGatewayInternal = $apiGatewayInternal;
    $this->classroom = $classroom;
    $this->classmember = $classMember;
    $this->student = $student;
    $this->tryoutCode = $tryoutCode;
    $this->generateResultService = $generateResultService;
  }

  public function chart(string $studentId, string $examType = null)
  {
    if($examType === "package-546" || $examType === "package-453") {
      $program = "tps";
      $studentResult = $this->classroomResult->getIRTSummaryWithAllRepeat([$studentId], "tps_irt", $examType);
      $moduleSummary = $this->classroomResult->getIRTSummary([$studentId], "tps_irt", $examType);
      $scoreKeys = ["Potensi Kognitif", "Penalaran Matematika", "Literasi Bahasa Indonesia", "Literasi Bahasa Inggris"];
      $scoreKeysSlug = ["potensi_kognitif", "penalaran_matematika", "literasi_bahasa_indonesia", "literasi_bahasa_inggris"];
    } else {
      $program = "skd";
      $studentResult = $this->classroomResult->getSummaryWithAllRepeat([$studentId], $program, $examType) ?? [];
      $moduleSummary = $this->classroomResult->getSummary([$studentId], $program, $examType) ?? [];
      $scoreKeys = ["TWK", "TIU", "TKP"];
      $scoreKeysSlug = ["TWK", "TIU", "TKP"];
    }
    if ($studentResult) {
      $studentResult = $studentResult[0];
      $moduleSummary = $moduleSummary[0];

      $studentResult->charts = new \stdClass();
      $studentResult->charts->score_dataset = new \stdClass();
      $studentResult->charts->average_score = new \stdClass();
      $studentResult->charts->average_done_minute = new \stdClass();

      if (!property_exists($studentResult, 'report') || !isset($studentResult->report)) {
        foreach($scoreKeys as $scoreKey) {
          $studentResult->charts->score_dataset->{$scoreKey} = new \stdClass();
          $studentResult->charts->average_score->{$scoreKey} = "-";
          $studentResult->charts->score_dataset->{$scoreKey}->dataset_0 = ["-"];
        }
        $studentResult->charts->score_dataset->{strtoupper($program)} = new \stdClass();
        $studentResult->charts->score_dataset->{strtoupper($program)}->dataset_0 = ["-"];

        $studentResult->charts->labels[] = "";
        $studentResult->charts->endDates[] = ["-"];

        $studentResult->charts->labelCount = 1;
        $studentResult->charts->mostRepetitionCount = null;
        $studentResult->charts->average_done_minute = "-";

        $view = $program === "tps" ? "pages/learning/student-progress/chart-tps" : "pages/learning/student-progress/chart";
        return view($view, compact('studentResult', 'moduleSummary', 'studentId', 'examType'));
      }

      $average_done_minute = collect($moduleSummary->report)->map(function ($item) {
        $startDate = Carbon::parse($item->start);
        $endDate = Carbon::parse($item->end);
        $diffInMinutes = $startDate->diffInMinutes($endDate);
        return $diffInMinutes;
      })->avg();

      $groupedReports = collect($studentResult->report)
        ->sortBy('task_id')
        ->groupBy(['task_id', function ($item) {
          return $item->repeat;
        }])
        ->values()
        ->all();

      $studentResult->charts->labels = collect($moduleSummary->report)->unique('title')->sortBy('task_id')->pluck('title')->all();
      $studentResult->charts->labelCount = count($studentResult->charts->labels);
      $studentResult->charts->mostRepetitionCount = collect($studentResult->report)->max('repeat');

      foreach($scoreKeys as $scoreKey) {
        $studentResult->charts->score_dataset->{$scoreKey} = [];
      }
      $studentResult->charts->score_dataset->{strtoupper($program)} = [];

      $sortedGroupedReportsByRepeatKeys = [];
      foreach ($groupedReports as $index => $groupedReport) {
        $sortedGroupedReportsByRepeatKeys[] = $groupedReport->sortKeys()->flatten()->unique('repeat')->sortKeys()->values();
      }

      foreach ($sortedGroupedReportsByRepeatKeys as $reportKey => $reportValue) {
        foreach($scoreKeysSlug as $index => $scoreKey) {
          ${"score"."_".$index}[] = array_pad($reportValue->pluck("score_values.$scoreKey.score")->all(), $studentResult->charts->mostRepetitionCount, null);
        }
        $totalScores[] = array_pad($reportValue->pluck('total_score')->all(), $studentResult->charts->mostRepetitionCount, null);
        $endDates[] = array_pad($reportValue->pluck('end')->all(), $studentResult->charts->mostRepetitionCount, null);
      }

      $isPackageExamType = strpos($examType, "package") !== false;
      if ($isPackageExamType) {
        $chartLabel = array_map(function ($label) {
          $splittedLabel = explode(" | ", $label);
          $label = $splittedLabel[count($splittedLabel) - 1];
          return $label;
        }, $studentResult->charts->labels);
        $studentResult->charts->labels = $chartLabel;
      }

      for ($i = 0; $i < $studentResult->charts->mostRepetitionCount; $i++) {
        foreach($scoreKeysSlug as $scoreKey) {
          ${$scoreKey} = [];
        }
        $total = [];
        $endDate = [];

        foreach($scoreKeys as $index => $scoreKey) {
          foreach (${"score"."_".$index} as $score) {
            ${$scoreKeysSlug[$index]}[] = $score[$i];
          }
        }

        foreach ($totalScores as $score) {
          $total[] = $score[$i];
        }

        foreach ($endDates as $date) {
          $formattedDate = \Carbon\Carbon::parse($date[$i])->timezone('Asia/Jakarta') ?? "-";
          $endDate[] = $formattedDate->locale('id')->format('d M Y • H:i') . " WIB" ?? "-";
        }

        foreach($scoreKeys as $index => $scoreKey) {
          $studentResult->charts->score_dataset->{$scoreKey}["dataset_$i"] = ${$scoreKeysSlug[$index]};
        }
        $studentResult->charts->score_dataset->{strtoupper($program)}["dataset_$i"] = $total;
        $studentResult->charts->endDates[$i] = $endDate ?? "-";
      }
      $report_total_repeat = $moduleSummary->report_total_repeat;
      $totalScore = 0;
      foreach($scoreKeysSlug as $index => $scoreKey) {
        ${$scoreKey."_"."score"} = $studentResult->subject->score_values->{$scoreKeys[$index]}->total_score ?? 0;
        $totalScore = $totalScore + ${$scoreKey."_"."score"};
      }
      foreach($scoreKeysSlug as $index => $scoreKey) {
        if($program === "skd") {
          ${$scoreKey."_"."average_score"} = ${$scoreKey."_"."score"} ? round(${$scoreKey."_"."score"} / $report_total_repeat, 1) : 0;
        }
        if($program === "tps") {
          ${$scoreKey."_"."average_score"} = $moduleSummary->subject->score_values->{$scoreKeys[$index]}->average_score;
        }
      }

      if($program === "skd") {
        $totalAverageScore = $totalScore ? round($totalScore / $report_total_repeat, 1) : 0;
      }
      if($program === "tps") {
        $totalAverageScore = $moduleSummary->subject->average_score;
      }

      foreach($scoreKeys as $index => $scoreKey) {
        $studentResult->charts->average_score->{$scoreKey} = ${$scoreKeysSlug[$index]."_"."average_score"};
      }
      $studentResult->charts->average_score->{strtoupper($program)} = $totalAverageScore;
      $studentResult->charts->average_done_minute = $average_done_minute;

      $studentResult->report_repeat_sum = $report_total_repeat;
      $studentResult->report_total_repeat = $report_total_repeat;
      $studentResult->generated_at = Carbon::now()->timezone('Asia/Jakarta')->locale('id')->translatedFormat('l, d F Y');

      $studentResult->done = $moduleSummary->done;
      $studentResult->given = $moduleSummary->given;
      $studentResult->passed = $moduleSummary->passed;
      $studentResult->passed_percent = $moduleSummary->passed_percent;
      $studentResult->done_percent = $moduleSummary->done_percent;
      $studentResult->report_average_try = $moduleSummary->report_average_try;
    } else $studentResult = [];
    $view = $program === "tps" ? "pages/learning/student-progress/chart-tps" : "pages/learning/student-progress/chart";
    return view($view, compact('studentResult', 'moduleSummary', 'studentId', 'examType'));
  }

  public function downloadChart(string $studentId, string $examType = null)
  {
    // Latihan 16 SKD (dev & prod), Latihan 16 TPS(prod), Latihan 16 TPS (dev)
    $validExamTypes = ["package-452", "package-453", "package-546"];

    if($examType === "package-546" || $examType === "package-453") {
      $program = "tps";
      $studentResult = $this->classroomResult->getIRTSummaryWithAllRepeat([$studentId], "tps_irt", $examType);
      $moduleSummary = $this->classroomResult->getIRTSummary([$studentId], "tps_irt", $examType);
      $scoreKeys = ["Potensi Kognitif", "Penalaran Matematika", "Literasi Bahasa Indonesia", "Literasi Bahasa Inggris"];
      $scoreKeysSlug = ["potensi_kognitif", "penalaran_matematika", "literasi_bahasa_indonesia", "literasi_bahasa_inggris"];
    } else {
      $program = "skd";
      $studentResult = $this->classroomResult->getSummaryWithAllRepeat([$studentId], $program, $examType) ?? [];
      $moduleSummary = $this->classroomResult->getSummary([$studentId], $program, $examType) ?? [];
      $scoreKeys = ["TWK", "TIU", "TKP"];
      $scoreKeysSlug = ["TWK", "TIU", "TKP"];
    }

    if ($studentResult) {
      $studentResult = $studentResult[0];
      $moduleSummary = $moduleSummary[0];

      $studentResult->charts = new \stdClass();
      $studentResult->charts->score_dataset = new \stdClass();
      $studentResult->charts->average_score = new \stdClass();
      $studentResult->charts->average_done_minute = new \stdClass();

      if (!property_exists($studentResult, 'report') || !isset($studentResult->report)) {
        request()->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan',
          'type' => 'error',
          'message' => 'Data raport siswa tidak ditemukan, silakan coba lagi nanti'
        ]);
        return redirect()->back();
      }

      if($studentResult?->done == 0) {
        request()->session()->flash('flash-message', [
          'title' => 'Informasi',
          'type' => 'info',
          'message' => 'Siswa belum mengerjakan modul, grafik tidak bisa di unduh'
        ]);
        return redirect()->back();
      }

      $isPackageExamType = strpos($examType, "package") !== false;
      if(!$isPackageExamType || !in_array($examType, $validExamTypes)) {
        request()->session()->flash('flash-message', [
          'title' => 'Informasi',
          'type' => 'info',
          'message' => 'Grafik untuk tipe latihan ini tidak dapat diunduh'
        ]);
        return redirect()->back();
      }

      $studentBranchCode = $this->profile->getSingleStudent($studentResult->student->smartbtw_id)->branch_code ?? "-";
      $average_done_minute = collect($moduleSummary->report)->map(function ($item) {
        $startDate = Carbon::parse($item->start);
        $endDate = Carbon::parse($item->end);
        $diffInMinutes = $startDate->diffInMinutes($endDate);
        return $diffInMinutes;
      })->avg();

      $groupedReports = collect($studentResult->report)
        ->sortBy('task_id')
        ->groupBy(['task_id', function ($item) {
          return $item->repeat;
        }])
        ->values()
        ->all();

      $studentResult->charts->labels = collect($moduleSummary->report)->unique('title')->sortBy('task_id')->pluck('title')->all();
      $studentResult->charts->labelCount = count($studentResult->charts->labels);
      $studentResult->charts->mostRepetitionCount = collect($studentResult->report)->max('repeat');

      foreach($scoreKeys as $scoreKey) {
        $studentResult->charts->score_dataset->{$scoreKey} = [];
      }
      $studentResult->charts->score_dataset->{strtoupper($program)} = [];

      $sortedGroupedReportsByRepeatKeys = [];
      foreach ($groupedReports as $index => $groupedReport) {
        $sortedGroupedReportsByRepeatKeys[] = $groupedReport->sortKeys()->flatten()->unique('repeat')->sortKeys()->values();
      }

      foreach ($sortedGroupedReportsByRepeatKeys as $reportKey => $reportValue) {
        foreach($scoreKeysSlug as $index => $scoreKey) {
          ${"score"."_".$index}[] = array_pad($reportValue->pluck("score_values.$scoreKey.score")->all(), $studentResult->charts->mostRepetitionCount, null);
        }
        $totalScores[] = array_pad($reportValue->pluck('total_score')->all(), $studentResult->charts->mostRepetitionCount, null);
        $endDates[] = array_pad($reportValue->pluck('end')->all(), $studentResult->charts->mostRepetitionCount, null);
      }

      $isPackageExamType = strpos($examType, "package") !== false;
      if ($isPackageExamType) {
        $chartLabel = array_map(function ($label) {
          if(str_contains($label, "|")) $splittedLabel = explode(" | ", $label);
          if(str_contains($label, "-")) $splittedLabel = explode(" - ", $label);
          $label = $splittedLabel[count($splittedLabel) - 1];
          return $label;
        }, $studentResult->charts->labels);
        $studentResult->charts->labels = $chartLabel;
      }

      for ($i = 0; $i < $studentResult->charts->mostRepetitionCount; $i++) {
        foreach($scoreKeysSlug as $scoreKey) {
          ${$scoreKey} = [];
        }
        $total = [];
        $endDate = [];

        foreach($scoreKeys as $index => $scoreKey) {
          foreach (${"score"."_".$index} as $score) {
            ${$scoreKeysSlug[$index]}[] = $score[$i];
          }
        }

        foreach ($totalScores as $score) {
          $total[] = $score[$i];
        }

        foreach ($endDates as $date) {
          $formattedDate = \Carbon\Carbon::parse($date[$i])->timezone('Asia/Jakarta') ?? "-";
          $endDate[] = $formattedDate->locale('id')->format('d M Y • H:i') . " WIB" ?? "-";
        }

        foreach($scoreKeys as $index => $scoreKey) {
          $studentResult->charts->score_dataset->{$scoreKey}["dataset_$i"] = ${$scoreKeysSlug[$index]};
        }
        $studentResult->charts->score_dataset->{strtoupper($program)}["dataset_$i"] = $total;
        $studentResult->charts->endDates[$i] = $endDate ?? "-";
      }
      $report_total_repeat = $moduleSummary->report_total_repeat;
      $totalScore = 0;
      foreach($scoreKeysSlug as $index => $scoreKey) {
        ${$scoreKey."_"."score"} = $studentResult->subject->score_values->{$scoreKeys[$index]}->total_score ?? 0;
        $totalScore = $totalScore + ${$scoreKey."_"."score"};
      }
      foreach($scoreKeysSlug as $index => $scoreKey) {
        if($program === "skd") {
          ${$scoreKey."_"."average_score"} = ${$scoreKey."_"."score"} ? round(${$scoreKey."_"."score"} / $report_total_repeat, 1) : 0;
        }
        if($program === "tps") {
          ${$scoreKey."_"."average_score"} = $moduleSummary->subject->score_values->{$scoreKeys[$index]}->average_score;
        }
      }

      if($program === "skd") {
        $totalAverageScore = $totalScore ? round($totalScore / $report_total_repeat, 1) : 0;
      }
      if($program === "tps") {
        $totalAverageScore = $moduleSummary->subject->average_score;
      }

      foreach($scoreKeys as $index => $scoreKey) {
        $studentResult->charts->average_score->{$scoreKey} = ${$scoreKeysSlug[$index]."_"."average_score"};
      }
      $studentResult->charts->average_score->{strtoupper($program)} = $totalAverageScore;
      $studentResult->charts->average_done_minute = round($average_done_minute, 0);

      $studentResult->report_repeat_sum = $report_total_repeat;
      $studentResult->report_total_repeat = $report_total_repeat;
      $studentResult->generated_at = Carbon::now()->timezone('Asia/Jakarta')->locale('id')->translatedFormat('l, d F Y');

      $studentResult->done = $moduleSummary->done;
      $studentResult->given = $moduleSummary->given;
      $studentResult->passed = $moduleSummary->passed;
      $studentResult->passed_percent = $moduleSummary->passed_percent;
      $studentResult->done_percent = $moduleSummary->done_percent;
      $studentResult->report_average_try = $moduleSummary->report_average_try;
      $studentResult->student->branch_code = $studentBranchCode;

      // Remove unused props
      unset($studentResult->report);
      unset($studentResult->subject);
      unset($studentResult->charts->endDates);

      if($program === "skd") $studentResult->tryout_title = "Latihan 16 Modul SKD";
      else if($program === "tps") $studentResult->tryout_title = "Latihan 16 Modul TPS";
      else $studentResult->tryout_title = $tryoutTitle;
      $data = $program === "tps" ? $this->generateResultService->generateTPSGraph(collect($studentResult)->toArray()) : $this->generateResultService->generateSKDGraph(collect($studentResult)->toArray());
      header('Content-type: application/pdf');
      header('Content-Disposition: inline; filename="' . $data->file_name . '"');
      header('Content-Transfer-Encoding: binary');
      header('Accept-Ranges: bytes');
      @readfile($data->link);
    } else {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi kesalahan',
        'type' => 'error',
        'message' => 'Data raport siswa tidak ditemukan, silakan coba lagi nanti'
      ]);
      return redirect()->back();
    }
  }

  public function sendTestChartData($classId, $examType, $sendTo)
  {
    $class_members = $this->classmember->getByClassroomId($classId);
    $sent_to = [];
    $tryoutTitle = "";

    $exam_type = $examType;

    $isPackageExamType = strpos($exam_type, "package") !== false;
    $isFreeTryoutExamType = $exam_type == "free-tryout";
    $isSpecificTryoutExamType = $exam_type == "specific-tryout";
    $isPremiumTryoutExamType = $exam_type == "premium-tryout";

    if ($isPackageExamType) {
      $packageId = explode("-", $exam_type)[1];
      $package = $this->apiGatewayInternal->getPremiumPackageById($packageId);
      $tryoutTitle = $package?->title ?? "";
    }
    if ($isFreeTryoutExamType) $tryoutTitle = "Tryout Gratis";
    if ($isSpecificTryoutExamType) $tryoutTitle = "Tryout Kode";
    if ($isPremiumTryoutExamType) $tryoutTitle = "Tryout Premium";

    if (!empty($class_members)) {
      $member_ids = collect($class_members)->pluck('smartbtw_id')->toArray();
      $members = $this->student->getBySmartbtwIds($member_ids);

      foreach ($members as $member) {

        if (array_key_exists($member->smartbtw_id, $sent_to)) {
          $time = Carbon::now()->format('Y-m-d H:i:s');
          echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) chart report has already been sent, skipping \n";
          continue;
        }

        $profile = $this->profile->getSingleStudent($member->smartbtw_id);

        if (!$profile) {
          $time = Carbon::now()->format('Y-m-d H:i:s');
          echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) data not found on profile service, skipping \n";
          continue;
        }

        $parent_phone = property_exists($profile, "parent_datas") ? $profile->parent_datas->parent_number : $profile->parent_number;
        if (!$parent_phone) {
          $time = Carbon::now()->format('Y-m-d H:i:s');
          echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) parent phone number is not found on profile service, skipping \n";
          continue;
        }

        $studentResult = $this->classroomResult->getSummaryWithAllRepeat([$member->smartbtw_id], "skd", $exam_type) ?? [];
        $moduleSummary = $this->classroomResult->getSummary([$member->smartbtw_id], "skd", $exam_type) ?? [];

        $studentHasReportProperty = $studentResult ? property_exists($studentResult[0], 'report') : false;

        if ($studentResult && $studentHasReportProperty) {
          $studentResult = $studentResult[0];
          $moduleSummary = $moduleSummary[0];

          $studentBranchCode = $this->profile->getSingleStudent($studentResult->student->smartbtw_id)->branch_code ?? "-";

          $studentResult->charts = new \stdClass();
          $studentResult->charts->score_dataset = new \stdClass();
          $studentResult->charts->average_score = new \stdClass();
          $studentResult->charts->average_done_minute = new \stdClass();

          $studentResult->charts->labels = collect($moduleSummary->report)->unique('title')->sortBy('task_id')->pluck('title')->all();
          $studentResult->charts->labelCount = count($studentResult->charts->labels);
          $studentResult->charts->mostRepetitionCount = collect($studentResult->report)->max('repeat');

          $studentResult->charts->score_dataset->TWK = [];
          $studentResult->charts->score_dataset->TIU = [];
          $studentResult->charts->score_dataset->TKP = [];
          $studentResult->charts->score_dataset->SKD = [];

          $average_done_minute = collect($moduleSummary->report)->map(function ($item) {
            $startDate = Carbon::parse($item->start);
            $endDate = Carbon::parse($item->end);
            $diffInMinutes = $startDate->diffInMinutes($endDate);
            return $diffInMinutes;
          })->avg();

          $groupedReports = collect($studentResult->report)
            ->sortBy('task_id')
            ->groupBy(['task_id', function ($item) {
              return $item->repeat;
            }])
            ->values()
            ->all();

          $sortedGroupedReportsByRepeatKeys = [];
          foreach ($groupedReports as $index => $groupedReport) {
            $sortedGroupedReportsByRepeatKeys[] = $groupedReport->sortKeys()->flatten()->unique('repeat')->sortKeys()->values();
          }

          $twkScores = [];
          $tiuScores = [];
          $tkpScores = [];
          $skdScores = [];
          $endDates = [];

          foreach ($sortedGroupedReportsByRepeatKeys as $reportKey => $reportValue) {
            $twkScores[] = array_pad($reportValue->pluck('score_values.TWK.score')->all(), $studentResult->charts->mostRepetitionCount, null);
            $tiuScores[] = array_pad($reportValue->pluck('score_values.TIU.score')->all(), $studentResult->charts->mostRepetitionCount, null);
            $tkpScores[] = array_pad($reportValue->pluck('score_values.TKP.score')->all(), $studentResult->charts->mostRepetitionCount, null);
            $skdScores[] = array_pad($reportValue->pluck('total_score')->all(), $studentResult->charts->mostRepetitionCount, null);
            $endDates[] = array_pad($reportValue->pluck('end')->all(), $studentResult->charts->mostRepetitionCount, null);
          }

          for ($i = 0; $i < $studentResult->charts->mostRepetitionCount; $i++) {
            $twk = [];
            $tiu = [];
            $tkp = [];
            $skd = [];
            $endDate = [];

            foreach ($twkScores as $score) {
              $twk[] = $score[$i];
            }

            foreach ($tiuScores as $score) {
              $tiu[] = $score[$i];
            }

            foreach ($tkpScores as $score) {
              $tkp[] = $score[$i];
            }

            foreach ($skdScores as $score) {
              $skd[] = $score[$i];
            }

            foreach ($endDates as $date) {
              $formattedDate = \Carbon\Carbon::parse($date[$i])->timezone('Asia/Jakarta') ?? "-";
              $endDate[] = $formattedDate->locale('id')->format('d M Y • H:i') . " WIB" ?? "-";
            }

            $studentResult->charts->score_dataset->TWK["dataset_$i"] = $twk;
            $studentResult->charts->score_dataset->TIU["dataset_$i"] = $tiu;
            $studentResult->charts->score_dataset->TKP["dataset_$i"] = $tkp;
            $studentResult->charts->score_dataset->SKD["dataset_$i"] = $skd;
            $studentResult->charts->endDates[$i] = $endDate ?? "-";
          }

          if ($isPackageExamType) {
            $chartLabel = array_map(function ($label) {
              $splittedLabel = explode(" | ", $label);
              $label = $splittedLabel[count($splittedLabel) - 1];
              return $label;
            }, $studentResult->charts->labels);
            $studentResult->charts->labels = $chartLabel;

            if (!$tryoutTitle) {
              $explodedTitle = explode(" | ", $studentResult->report[0]->title);
              $tryoutTitle = implode(" | ", array_slice($explodedTitle, 0, count($explodedTitle) - 1));
            }
          }

          $report_total_repeat = $moduleSummary->report_total_repeat;
          $twkTotalScore = $studentResult->subject->score_values->TWK->total_score ?? 0;
          $tiuTotalScore = $studentResult->subject->score_values->TIU->total_score ?? 0;
          $tkpTotalScore = $studentResult->subject->score_values->TKP->total_score ?? 0;
          $skdTotalScore = $twkTotalScore + $tiuTotalScore + $tkpTotalScore;

          $twkAverageScore = $twkTotalScore ? round($twkTotalScore / $report_total_repeat, 1) : 0;
          $tiuAverageScore = $tiuTotalScore ? round($tiuTotalScore / $report_total_repeat, 1) : 0;
          $tkpAverageScore = $tkpTotalScore ? round($tkpTotalScore / $report_total_repeat, 1) : 0;
          $skdAverageScore = $skdTotalScore ? round($skdTotalScore / $report_total_repeat, 1) : 0;

          $studentResult->charts->average_score->TWK = $twkAverageScore;
          $studentResult->charts->average_score->TIU = $tiuAverageScore;
          $studentResult->charts->average_score->TKP = $tkpAverageScore;
          $studentResult->charts->average_score->SKD = $skdAverageScore;
          $studentResult->charts->average_done_minute = round($average_done_minute, 0);

          $studentResult->report_repeat_sum = $report_total_repeat;
          $studentResult->report_total_repeat = $report_total_repeat;
          $studentResult->generated_at = Carbon::now()->timezone('Asia/Jakarta')->locale('id')->translatedFormat('l, d F Y');

          $studentResult->done = $moduleSummary->done;
          $studentResult->given = $moduleSummary->given;
          $studentResult->passed = $moduleSummary->passed;
          $studentResult->passed_percent = $moduleSummary->passed_percent;
          $studentResult->done_percent = $moduleSummary->done_percent;
          $studentResult->report_average_try = $moduleSummary->report_average_try;
          $studentResult->student->branch_code = $studentBranchCode;
          $studentResult->tryout_title = $tryoutTitle;
          $studentResult->parent_number = $sendTo;

          $jam = Carbon::now()->hour;
          if ($jam > 6 && $jam <= 11) {
            $greeting = "pagi";
          } elseif ($jam >= 12 && $jam <= 14) {
            $greeting = "siang";
          } elseif ($jam >= 15 && $jam <= 18) {
            $greeting = "sore";
          } else {
            $greeting = "malam";
          }
          $studentResult->greeting = $greeting;

          // Remove unused props
          unset($studentResult->report);
          unset($studentResult->subject);
          unset($studentResult->charts->endDates);

          $categoryDatasetItemLength = [
            "TWK" => collect($studentResult->charts->score_dataset->TWK)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
            "TIU" => collect($studentResult->charts->score_dataset->TIU)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
            "TKP" => collect($studentResult->charts->score_dataset->TKP)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
            "SKD" => collect($studentResult->charts->score_dataset->SKD)->flatten()->count() / $studentResult->charts->mostRepetitionCount,
          ];
          $totalDatasetItem = array_sum($categoryDatasetItemLength) / 4;
          $isDatasetItemCountNotMatch = $totalDatasetItem % $studentResult->charts->labelCount !== 0;

          if ($isDatasetItemCountNotMatch) {
            $time = Carbon::now()->format('Y-m-d H:i:s');
            echo "[{$time}] Dataset item length not match, skipping";
            Log::error("Dataset item length not match", ["data" => json_encode($studentResult)]);
            continue;
          }

          $time = Carbon::now()->format('Y-m-d H:i:s');
          echo "[{$time}] Sending student report chart to {$studentResult->student->name}'s ({$studentResult->student->smartbtw_id}) parent phone number at {$studentResult->parent_number}. \n";

          $bodyData = ["version" => 1, "data" => $studentResult];
          Rabbitmq::send("sendpdf.graph", json_encode($bodyData));
          $sent_to[$member->smartbtw_id] = true;
        } else {
          $time = Carbon::now()->format('Y-m-d H:i:s');
          echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) doesn't have report data, skipping \n";
          continue;
        }
      }
    }
  }

  public function tryoutCodeChart(string $studentId, string $code_category)
  {
    $get_task_ids = $this->tryoutCode->getTaskIdsOnly($code_category);
    $task_ids = json_decode($get_task_ids->body())->data ?? [];

    $studentResult = $this->classroomResult->getCodeTryoutSummary([$studentId], $task_ids, "skd");
    if ($studentResult) {
      $moduleSummary = $studentResult[0];
      $moduleSummary->tryout_code_category = $code_category;
      $studentResult = $this->modifyTryoutCodeModuleSummary($moduleSummary);
    } else $studentResult = [];
    return view('pages/learning/student-progress/chart-tryout-code', compact('studentResult'));
  }

  private function modifyTryoutCodeModuleSummary($moduleSummary)
  {
    $moduleSummary->charts = new \stdClass();
    $moduleSummary->charts->labels = [];
    $moduleSummary->charts->endDates = [];
    $moduleSummary->charts->score_dataset = new \stdClass();
    $moduleSummary->charts->average_score = new \stdClass();

    if (!property_exists($moduleSummary, 'report') || !isset($moduleSummary->report)) {
      $moduleSummary->charts->score_dataset->TWK = new \stdClass();
      $moduleSummary->charts->score_dataset->TIU = new \stdClass();
      $moduleSummary->charts->score_dataset->TKP = new \stdClass();
      $moduleSummary->charts->score_dataset->SKD = new \stdClass();

      $moduleSummary->charts->labels[] = "";
      $moduleSummary->charts->endDates[] = ["-"];
      $moduleSummary->charts->average_score->TWK = "-";
      $moduleSummary->charts->average_score->TIU = "-";
      $moduleSummary->charts->average_score->TKP = "-";
      $moduleSummary->charts->average_score->SKD = "-";
      $moduleSummary->charts->score_dataset->TWK->dataset_0 = ["-"];
      $moduleSummary->charts->score_dataset->TIU->dataset_0 = ["-"];
      $moduleSummary->charts->score_dataset->TKP->dataset_0 = ["-"];
      $moduleSummary->charts->score_dataset->SKD->dataset_0 = ["-"];

      $moduleSummary->charts->labelCount = 1;
      $moduleSummary->charts->mostRepetitionCount = null;
      $moduleSummary->charts->average_done_minute = "-";
      return $moduleSummary;
    }

    $filteredModuleSummary = collect([]);

    $get_code_tryout_category = $this->tryoutCode->getTaskIdsWithGroup($moduleSummary->tryout_code_category);
    $code_tryout_category = collect(json_decode($get_code_tryout_category->body())->data) ?? [];

    $grouped_code_tryout_category = $code_tryout_category->sortBy('group')->values()->groupBy('group');
    $grouped_code_tryout_category = $grouped_code_tryout_category->map(function ($group) {
      return $group->pluck('task_id')->sort()->values()->all();
    });

    $code_tryout_category_title = $code_tryout_category->sortBy('group')->values()->groupBy('group');
    $code_tryout_category_title = $code_tryout_category_title->map(function ($group) {
      return $group->pluck('title', 'task_id')->sort()->all();
    });

    foreach ($grouped_code_tryout_category as $group => $task_ids) {
      $studentReport = collect($moduleSummary->report)->filter(function ($report) use ($task_ids) {
        return in_array($report->task_id, $task_ids);
      })->sortBy('task_id')->last();
      if ($studentReport) {
        $filteredModuleSummary[] = $studentReport;
        $moduleSummary->charts->labels[$studentReport->task_id] = $code_tryout_category_title[$group][$studentReport->task_id];
      }
    }
    $moduleSummary->report = $filteredModuleSummary->values()->toArray();
    $moduleSummary->charts->endDates[0] = $filteredModuleSummary->map(function ($report) {
      $formattedDate = \Carbon\Carbon::parse($report->end)->timezone('Asia/Jakarta')->locale('id')->format('d M Y • H:i') . " WIB" ?? "-";
      return $formattedDate;
    })->values()->toArray();
    $moduleSummary->charts->labels = $filteredModuleSummary->map(function ($report) use ($moduleSummary) {
      return $moduleSummary->charts->labels[$report->task_id];
    })->values()->toArray();
    $moduleSummary->given = $moduleSummary->done = $filteredModuleSummary->count();
    $moduleSummary->done_percent = ($moduleSummary->done / $moduleSummary->given) * 100;
    $moduleSummary->passed_percent = ($moduleSummary->passed / $moduleSummary->done) * 100;
    $moduleSummary->report_repeat_sum = $moduleSummary->report_total_repeat = $filteredModuleSummary->sum('repeat');
    $moduleSummary->report_average_try = $moduleSummary->report_total_repeat / $moduleSummary->done;

    $moduleSummary->subject->average_score = 0;
    $moduleSummary->subject->failed = 0;
    $moduleSummary->subject->passed = 0;
    $moduleSummary->subject->total = 0;
    $moduleSummary->subject->total_score = 0;

    foreach ($moduleSummary->subject->score_keys as $key) {
      $moduleSummary->subject->score_values->$key->total = $filteredModuleSummary->count();
      $moduleSummary->subject->score_values->$key->passed = $filteredModuleSummary->where('status', true)->count();
      $moduleSummary->subject->score_values->$key->failed = $filteredModuleSummary->where('status', false)->count();
      $moduleSummary->subject->score_values->$key->total_score = $filteredModuleSummary->sum('score_values.' . $key . '.score');
      $moduleSummary->subject->score_values->$key->average_score = round($filteredModuleSummary->avg('score_values.' . $key . '.score'), 1);
      $moduleSummary->subject->score_values->$key->passed_percent = ($moduleSummary->subject->score_values->$key->passed / $moduleSummary->subject->score_values->$key->total) * 100;
      $moduleSummary->subject->score_values->$key->failed_percent = ($moduleSummary->subject->score_values->$key->failed / $moduleSummary->subject->score_values->$key->total) * 100;

      $moduleSummary->subject->average_score += $moduleSummary->subject->score_values->$key->average_score;
      $moduleSummary->subject->failed += $moduleSummary->subject->score_values->$key->failed;
      $moduleSummary->subject->passed += $moduleSummary->subject->score_values->$key->passed;
      $moduleSummary->subject->total += $moduleSummary->subject->score_values->$key->total;
      $moduleSummary->subject->total_score += $moduleSummary->subject->score_values->$key->total_score;

      $moduleSummary->charts->score_dataset->$key = new \stdClass();
      $moduleSummary->charts->score_dataset->$key->dataset_0 = $filteredModuleSummary->pluck('score_values.' . $key . '.score')->toArray();
      $moduleSummary->charts->average_score->$key = $moduleSummary->subject->score_values->$key->average_score;
    }

    $moduleSummary->charts->score_dataset->SKD = new \stdClass();
    $moduleSummary->charts->score_dataset->SKD->dataset_0 = $filteredModuleSummary->pluck('total_score')->toArray();
    $moduleSummary->charts->average_score->SKD = $moduleSummary->subject->average_score;
    $moduleSummary->charts->average_done_minute = $filteredModuleSummary->map(function ($item) {
      $startDate = Carbon::parse($item->start);
      $endDate = Carbon::parse($item->end);
      $diffInMinutes = $startDate->diffInMinutes($endDate);
      return $diffInMinutes;
    })->avg();
    $moduleSummary->charts->mostRepetitionCount = 1;
    $moduleSummary->charts->labelCount = count($moduleSummary->charts->labels);
    unset($moduleSummary->tryout_code_category);
    return $moduleSummary;
  }
}

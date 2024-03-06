<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\ApiGatewayService\Internal;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\ClassRoom;
use App\Services\ProfileService\Profile;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class StudentResultSummaryController extends Controller
{
  private ClassMember $classMember;
  private ClassRoom $classroom;
  private Profile $profile;
  private Branch $branch;
  private Internal $apiGateway;

  public function __construct(
    ClassMember $classMember,
    Profile $profile,
    Classroom $classroom,
    Branch $branch,
    Internal $apiGateway
  ) {
    $this->classMember = $classMember;
    $this->classroom = $classroom;
    $this->profile = $profile;
    $this->branch = $branch;
    $this->apiGateway = $apiGateway;
  }

  public function index(Request $request)
  {
    $user = Auth::user();
    if ($user->branch_code !== "PT0000") return redirect("/home")->with("flash-message", [
      'title' => 'Peringatan!',
      'type' => 'warning',
      'message' => 'Fitur hanya dapat digunakan oleh user pusat untuk saat ini'
    ]);
    return $this->performaPusat($request);
  }

  public function studentResult(int $smartbtw_id)
  {
    if ($smartbtw_id == 0) return back()->with('flash-message', [
      'title' => 'Terjadi kesalahan',
      'type' => 'error',
      'message' => 'Siswa yang dipilih tidak memiliki akun btwedutech. Pastikan siswa memiliki akun btwedutech'
    ]);

    $studentProfile = $this->profile->getSingleStudent($smartbtw_id);
    if (!$studentProfile) return back()->with('flash-message', [
      'title' => 'Terjadi kesalahan',
      'type' => 'error',
      'message' => 'Terjadi kesalahan, silakan coba lagi nanti'
    ]);
    $studentResultResponse = $this->profile->getSingleReportStudent($smartbtw_id);
    $result = $studentResultResponse?->histories ?? [];
    $breadcrumbs = [["name" => "Performa Siswa BTW Edutech", "link" => url()->previous()], ["name" => "Hasil UKA Siswa - $studentProfile->name"]];
    return view('pages.performa-siswa-edutech.pusat.hasil-uka', compact('breadcrumbs', 'result', 'studentProfile'));
  }

  public function pdf(Request $request)
  {
    // $html = view('pages/performa-siswa-edutech/pusat/performa-siswa-pdf', []);
    // $pdf  = SnappyPdf::loadHTML($html)
    //   ->setPaper('a3')
    //   ->setOrientation('landscape')
    //   ->setOption('margin-top', 0)
    //   ->setOption('margin-left', 0)
    //   ->setOption('margin-right', 0)
    //   ->setOption('margin-bottom', 0)
    //   ->setOption('disable-smart-shrinking', true);
    // return $pdf->stream('Laporan Rekapitulasi Perkembangan Siswa Kelas BTW Edutech.pdf');
    return view('pages/performa-siswa-edutech/pusat/performa-siswa-pdf', []);
    $is_class_selected = $request->has('classroom_id') && $request->get('classroom_id') !== null;
    $is_branch_code_selected = $request->has('branch_code') && $request->get('branch_code') !== null;
    if (!$is_class_selected && !$is_branch_code_selected) return view('/pages/performa-siswa-edutech/pusat/performa-siswa', compact('breadcrumbs', 'auth_user_roles', 'auth_user_id'));

    $classroom_id = $request->get('classroom_id') ?? null;
    $branch_code = $request->get('branch_code') ?? null;
    $exam_type = $request->has('exam_type') ? $request->get('exam_type') : null;

    if ($is_class_selected) {
      $members = collect($this->classMember->getByClassroomId($classroom_id))->whereNull('deleted_at')->toArray();
      $student_ids = array_values(array_unique(array_map(function ($item) {
        return $item->smartbtw_id;
      }, $members)));
    }

    if ($is_branch_code_selected) {
      $branch_code = $request->get('branch_code');
      $classrooms = collect($this->classMember->getByBranchCodes($branch_code))->filter(fn ($classroom) => count($classroom->class_members) > 0)->values();
      $student_ids = $classrooms->pluck('class_members')->flatten()->pluck('smartbtw_id')->unique()->sort()->values()->toArray();
    }

    $branches = [];
    $branchNames = [];
    $studentBranches = [];
    $branchTitle = null;
    $classTitle = null;

    $scoreKeysAbbreviation = [
      "TWK" => "TWK",
      "TIU" => "TIU",
      "TKP" => "TKP",
    ];

    if ($classroom_id) {
      $branch_code = null;
      $class = $this->classroom->getSingle($classroom_id);
      $classTitle = $class->title;
    }

    if ($branch_code) {
      $classroom_id = null;
      $sluggified_branch_code = Str::slug(implode(" ", $branch_code), '_');
      $codes = implode(',', $branch_code);
      $branches = collect($this->branch->getMultipleBranches($codes));
      $branchNames = count($branches) > 0 ? $branches->pluck('name', 'code') : null;
      $branchTitle = count($branches) > 1 ? $branches->map(fn ($branch) => $branch->name)->implode(', ') : $branches[0]->name;
    }

    $result_summary_response = $this->profile->getStudentResultSummary($student_ids, $exam_type);
    $result_summary = json_decode($result_summary_response);

    if ($branch_code) {
      $studentReport = $result_summary?->data ?? [];

      if ($studentReport) {
        $classrooms = collect($this->classMember->getByBranchCodes($branch_code))->filter(fn ($classroom) => count($classroom->class_members) > 0)->values();
        $students = $classrooms->map(function ($classroom) {
          return collect($classroom->class_members)->map(function ($class_member) use ($classroom) {
            $class_member->branch_code = $classroom->branch_code;
            return $class_member;
          })->toArray();
        });
        $students = $classrooms->pluck('class_members')->flatten()->unique('smartbtw_id')->sort()->values();
        $studentBranches = $students->pluck('branch_code', 'smartbtw_id')->toArray();
      }
    }

    $examType = null; // Exam type label, to be used on pdf
    $program = 'skd';
    if ($request->has('exam_type')) $examType = $this->setExamTypeLabel($exam_type);
    $scoreKeys = $this->getScoreKeys($program);

    $payload = ["results" => $result_summary->data];

    if ($request->has('orderBy')) $this->sortModuleSummary($request, $payload);

    $kategoriSoal = $this->apiGateway->getQuestionCategory(1);
    $nilaiMinimal = [];
    foreach ($kategoriSoal as $kategori) {
      $nilaiMinimal[$kategori->singkatan] = $kategori->nilai_minimal;
    }
    $nilaiMinimal = (object)$nilaiMinimal;

    $html = $request->has('orderBy')
      ? view('pages/performa-siswa-edutech/pusat/performa-siswa-pdf', [
        'payload' => $payload,
        'classTitle' => $classTitle,
        'nilaiMinimal' => $nilaiMinimal,
        'orderBy' => $request->get('orderBy'),
        'examType' => $examType,
        'branchTitle' => $branchTitle,
        'branchNames' => $branchNames,
        'studentBranches' => $studentBranches,
        'program' => $program,
        'scoreKeys' => $scoreKeys,
        'scoreKeysAbbreviation' => $scoreKeysAbbreviation
      ])
      : view(
        'pages/performa-siswa-edutech/pusat/performa-siswa-pdf',
        compact(
          'payload',
          'classTitle',
          'nilaiMinimal',
          'examType',
          'branchTitle',
          'branchNames',
          'studentBranches',
          'program',
          'scoreKeys',
          'scoreKeysAbbreviation'
        )
      );
    $pdf  = SnappyPdf::loadHTML($html)
      ->setPaper('a3')
      ->setOrientation('landscape')
      ->setOption('margin-top', 0)
      ->setOption('margin-left', 0)
      ->setOption('margin-right', 0)
      ->setOption('margin-bottom', 0)
      ->setOption('disable-smart-shrinking', true);

    return $pdf->stream('Laporan Rekapitulasi Perkembangan Siswa Kelas BTW Edutech - ' . $classTitle . '.pdf');
  }

  public function chart(int $student_id, string $exam_type = null)
  {
    $program = "skd";

    $result_summary_response = $this->profile->getStudentResultSummary([$student_id], $exam_type);
    $result_summary = json_decode($result_summary_response)?->data ?? [];
    $scoreKeys = ["TWK", "TIU", "TKP"];
    $scoreKeysSlug = ["TWK", "TIU", "TKP"];

    if ($result_summary) {
      $studentResult = $result_summary[0];

      $studentResult->charts = new \stdClass();
      $studentResult->charts->score_dataset = new \stdClass();
      $studentResult->charts->average_score = new \stdClass();
      $studentResult->charts->average_done_minute = new \stdClass();

      if (!property_exists($studentResult, 'history_record') || !isset($studentResult->history_record)) {
        foreach ($scoreKeys as $scoreKey) {
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

        $view = "/pages/performa-siswa-edutech/chart";
        return view($view, compact('studentResult', 'moduleSummary', 'studentId', 'examType'));
      }

      $average_done_minute = collect($studentResult->history_record)->map(function ($item) {
        $startDate = Carbon::parse($item->start);
        $endDate = Carbon::parse($item->end);
        $diffInMinutes = $startDate->diffInMinutes($endDate);
        return $diffInMinutes;
      })->avg();

      $groupedReports = collect($studentResult->history_record)
        ->sortBy('task_id')
        ->groupBy(['task_id', function ($item) {
          return $item->repeat;
        }])
        ->values()
        ->all();

      $studentResult->charts->labels = collect($studentResult->history_record)->unique('exam_name')->sortBy('task_id')->pluck('exam_name')->all();
      $studentResult->charts->labelCount = count($studentResult->charts->labels);
      $studentResult->charts->mostRepetitionCount = collect($studentResult->history_record)->max('repeat');

      foreach ($scoreKeys as $scoreKey) {
        $studentResult->charts->score_dataset->{$scoreKey} = [];
      }
      $studentResult->charts->score_dataset->{strtoupper($program)} = [];

      $sortedGroupedReportsByRepeatKeys = [];
      foreach ($groupedReports as $index => $groupedReport) {
        $sortedGroupedReportsByRepeatKeys[] = $groupedReport->sortKeys()->flatten()->unique('repeat')->sortKeys()->values();
      }

      foreach ($sortedGroupedReportsByRepeatKeys as $reportKey => $reportValue) {
        foreach ($scoreKeysSlug as $index => $scoreKey) {
          $lowerCasedScoreKey = strtolower($scoreKey);
          ${"score" . "_" . $index}[] = array_pad($reportValue->pluck("$lowerCasedScoreKey")->all(), $studentResult->charts->mostRepetitionCount, null);
        }
        $totalScores[] = array_pad($reportValue->pluck('total')->all(), $studentResult->charts->mostRepetitionCount, null);
        $endDates[] = array_pad($reportValue->pluck('end')->all(), $studentResult->charts->mostRepetitionCount, null);
      }

      /*
      $isPackageExamType = strpos($examType, "package") !== false;
      if ($isPackageExamType) {
        $chartLabel = array_map(function ($label) {
          $splittedLabel = explode(" | ", $label);
          $label = $splittedLabel[count($splittedLabel) - 1];
          return $label;
        }, $studentResult->charts->labels);
        $studentResult->charts->labels = $chartLabel;
      }
      */

      for ($i = 0; $i < $studentResult->charts->mostRepetitionCount; $i++) {
        foreach ($scoreKeysSlug as $scoreKey) {
          ${$scoreKey} = [];
        }
        $total = [];
        $endDate = [];

        foreach ($scoreKeys as $index => $scoreKey) {
          foreach (${"score" . "_" . $index} as $score) {
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

        foreach ($scoreKeys as $index => $scoreKey) {
          $studentResult->charts->score_dataset->{$scoreKey}["dataset_$i"] = ${$scoreKeysSlug[$index]};
        }
        $studentResult->charts->score_dataset->{strtoupper($program)}["dataset_$i"] = $total;
        $studentResult->charts->endDates[$i] = $endDate ?? "-";
      }
      $report_total_repeat = $studentResult->summary->total;
      $totalScore = 0;
      foreach ($scoreKeysSlug as $index => $scoreKey) {
        ${$scoreKey . "_" . "score"} = $studentResult->summary->score_values->{$scoreKeys[$index]}->total_score ?? 0;
        $totalScore = $totalScore + ${$scoreKey . "_" . "score"};
      }
      foreach ($scoreKeysSlug as $index => $scoreKey) {
        ${$scoreKey . "_" . "average_score"} = ${$scoreKey . "_" . "score"} ? round(${$scoreKey . "_" . "score"} / $report_total_repeat, 1) : 0;
      }
      $totalAverageScore = $totalScore ? round($totalScore / $report_total_repeat, 1) : 0;

      foreach ($scoreKeys as $index => $scoreKey) {
        $studentResult->charts->average_score->{$scoreKey} = ${$scoreKeysSlug[$index] . "_" . "average_score"};
      }
      $studentResult->charts->average_score->{strtoupper($program)} = $totalAverageScore;
      $studentResult->charts->average_done_minute = $average_done_minute;

      $studentResult->report_repeat_sum = $report_total_repeat;
      $studentResult->report_total_repeat = $report_total_repeat;
      $studentResult->generated_at = Carbon::now()->timezone('Asia/Jakarta')->locale('id')->translatedFormat('l, d F Y');

      $studentResult->done = $studentResult->summary->done;
      $studentResult->given = $studentResult->summary->owned;
      $studentResult->passed = $studentResult->summary->passed;
      $studentResult->passed_percent = $studentResult->summary->passed_percent;
      $studentResult->done_percent = $studentResult->summary->done_percent;
      $studentResult->report_average_try = $studentResult->summary->average_done;
    } else $studentResult = [];
    $view = "/pages/performa-siswa-edutech/chart";
    return view($view, compact('studentResult', 'student_id', 'exam_type'));
  }

  public function indexV2()
  {
    $user = Auth::user();
    if (!$user) {
      request()->session()->flash("flash-message", [
        'title' => 'Peringatan',
        'type' => 'warning',
        'message' => 'Silakan coba lagi'
      ]);
      return redirect("/home");
    }

    $isCentralUser = $user->branch_code == "PT0000" ? "1" : "0";
    $breadcrumbs = [["name" => "Laporan Perkembangan Siswa"]];
    return view("pages.laporan-perkembangan-siswa.index", compact('breadcrumbs', 'isCentralUser'));
  }

  public function studentReportV2(string $classroom_id, int $student_id)
  {
    $breadcrumbs = [["name" => "Laporan Perkembangan Siswa"], ["name" => "Rapor Siswa"]];
    return view("pages.learning-performance-report.learning-report.student-report", compact('breadcrumbs', 'classroom_id', 'student_id'));
  }

  private function performaPusat(Request $request)
  {
    $auth_user_roles = auth()->user()->roles;
    $auth_user_id = auth()->user()->id;
    $auth_user_branch_code = auth()->user()->branch_code;
    $breadcrumbs = [];

    // If branch is not selected, just redirect to performa page
    $is_branch_code_selected = $request->has('branch_code') && $request->get('branch_code') !== null;
    if (!$is_branch_code_selected) return view('/pages/performa-siswa-edutech/pusat/performa-siswa', compact('breadcrumbs', 'auth_user_roles', 'auth_user_id'));

    $branch_code = $request->get("branch_code");
    $classroom_type = $request->get('classroom_type') !== "ALL" ? $request->get('classroom_type') : null;
    $classroom_year = $request->get('classroom_year');
    $program = strtolower($request->get('program') ?? 'skd');
    $exam_type = $request->get('exam_type') ?? null;
    $with_deviation = $request->has('with_deviation') ? $request->get('with_deviation') : "0";
    $all_branch_code = in_array("ALL", $branch_code);

    if ($is_branch_code_selected && !$all_branch_code) {
      $branch_code = $request->get('branch_code');
      $classrooms = collect($this->classMember->getByBranchCodes($branch_code))
        ->filter(function ($classroom) use ($classroom_type, $classroom_year) {
          $baseCondition = $classroom->status === "ONGOING"
            && count($classroom->class_members) > 0
            && $classroom->year === (int)$classroom_year
            && (property_exists($classroom, "is_online") && $classroom->is_online === false) || (!property_exists($classroom, "is_online"));
          $classroomTagsCondition = $classroom_type
            ? in_array($classroom_type, $classroom->tags)
            : in_array("REGULER", $classroom->tags)
            || in_array("BINSUS", $classroom->tags)
            || in_array("INTENSIF", $classroom->tags);
          return $baseCondition && $classroomTagsCondition;
        })
        ->values();
      $student_emails = $classrooms->pluck('class_members')->flatten()->pluck('email')->unique()->sort()->values()->toArray();
    }

    if ($is_branch_code_selected && $all_branch_code) {
      $classrooms = collect($this->classroom->getAll([
        "tags" => ["INTENSIF", "REGULER", "BINSUS"],
        "year" => $classroom_year,
        "status" => "ONGOING",
        "is_online" => false
      ]))
        ->values()
        ->toArray();
      $classroom_ids = collect($classrooms)->pluck("_id")->toArray();
      $members = count($classroom_ids) > 0
        ? collect($this->classMember->getByClassroomIds($classroom_ids))->whereNull('deleted_at')->toArray()
        : [];
      $student_emails = array_values(
        array_unique(
          array_map(function ($item) {
            return $item->email;
          }, $members)
        )
      );
    }

    $student_bkn_score_response = $this->profile->getBKNScoreByMultipleStudentEmails(["email" => $student_emails, "year" => Carbon::now()->year]);
    $student_bkn_score = json_decode($student_bkn_score_response->body())?->data ?? [];

    $student_ids = collect($student_bkn_score)->reject(fn ($item) => $item->btwedutech_id === 0)->pluck("btwedutech_id")->toArray();

    $exam_type_breadcrumb_label = $this->getBreadcrumbLabel($exam_type);
    $score_keys = $this->getScoreKeys($program);

    $result_summary_query = [
      "smartbtw_id" => $student_ids,
      "type" => $exam_type,
      "class_tags" => $classroom_type,
      "class_year" => (int)$classroom_year
    ];
    $result_summary_response = $this->profile->getStudentResultSummary($result_summary_query);
    $result_summary = json_decode($result_summary_response)?->data ?? [];

    $view_data = compact('breadcrumbs', 'score_keys', 'classroom_type', 'result_summary', 'auth_user_roles', 'auth_user_id', 'program', 'with_deviation');
    return view('/pages/performa-siswa-edutech/pusat/performa-siswa', $view_data);
  }

  private function performaCabang(Request $request)
  {
    $auth_user_roles = auth()->user()->roles;
    $auth_user_id = auth()->user()->id;
    $auth_user_branch_code = auth()->user()->branch_code;
    $breadcrumbs = [];

    // If class is not selected, just redirect to performa page
    $is_class_selected = $request->has('classroom_id') && $request->get('classroom_id') !== null;
    if (!$is_class_selected) return view('/pages/performa-siswa-edutech/cabang/performa-siswa', compact('breadcrumbs', 'auth_user_roles', 'auth_user_id'));

    $classroom_id = $request->get('classroom_id');
    $program = strtolower($request->get('program') ?? 'skd');
    $exam_type = $request->get('exam_type') ?? null;

    $members = collect($this->classMember->getByClassroomIds($classroom_id))->whereNull('deleted_at')->toArray();
    $student_ids = array_values(array_unique(array_map(function ($item) {
      return $item->smartbtw_id;
    }, $members)));

    $exam_type_breadcrumb_label = $this->getBreadcrumbLabel($exam_type);
    $score_keys = $this->getScoreKeys($program);

    $result_summary_response = $this->profile->getStudentResultSummary($student_ids, $exam_type);
    $result_summary = json_decode($result_summary_response)?->data ?? [];

    $view_data = compact('breadcrumbs', 'score_keys', 'classroom_id', 'auth_user_roles', 'auth_user_id', 'program');
    return view('/pages/performa-siswa-edutech/cabang/performa-siswa', $view_data);
  }

  private function getBreadcrumbLabel($exam_type)
  {
    switch ($exam_type) {
      case 'package-23':
        return 'Paket C 60 Modul';
        break;
      case 'package-441':
        return 'Paket SKD 48 Modul';
        break;
      case 'package-450':
        return 'Paket SKD 48 Modul | Kelas Intensif';
        break;
      case 'package-452':
        return 'Latihan Modul 16 SKD';
        break;
        // case 'package-546': //dev
      case 'package-453': // prod
        return 'Latihan Modul 16 TPS';
        break;
      default:
        $exam_type = null;
        return 'Semua Modul';
        break;
    }
  }

  private function getScoreKeys($program)
  {
    switch ($program) {
      case "skd":
        return ["TWK", "TIU", "TKP"];
        break;
      default:
        return [];
        break;
    }
  }

  private function setExamTypeLabel($exam_type)
  {
    if ($exam_type == 'free_tryout') $examType = 'Tryout Gratis';
    else if ($exam_type == 'premium_tryout') $examType = 'Tryout Premium';
    else if ($exam_type == 'specific_tryout') $examType = 'Tryout Khusus';
    else if ($exam_type == 'package-23') $examType = 'SKD Premium 60 Modul';
    else if ($exam_type == 'package-448') $examType = 'SKD Premium 48 Modul';
    else if ($exam_type == 'package-450') $examType = 'SKD Premium 48 Modul | Kelas Intensif';
    else if ($exam_type == 'package-452') $examType = 'Latihan 16 Modul SKD';
    else if ($exam_type == 'package-546') $examType = 'Latihan 16 Modul TPS'; // dev
    else if ($exam_type == 'package-453') $examType = 'Latihan 16 Modul TPS'; // prod
    else $examType = null;
    return $examType;
  }

  private function sortModuleSummary($request, &$payload)
  {
    $scoreKeys = $payload['results'][0]->summary->score_keys;

    if ($request->get('orderBy') == "name") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->name < $b->name ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->name > $b->name ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "email") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->email < $b->email ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->email > $b->email ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "received-module") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->owned < $b->summary->owned ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->owned > $b->summary->owned ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "done-module") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->done < $b->summary->done ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->done > $b->summary->done ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "done-percent") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->done_percent < $b->summary->done_percent ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->done_percent > $b->summary->done_percent ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "passed-percent") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->passed_percent < $b->summary->passed_percent ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->passed_percent > $b->summary->passed_percent ? 1 : -1;
        });
      }
    }

    foreach ($scoreKeys as $index => $key) {
      if ($request->get('orderBy') == "average-$index") {

        if ($request->get('sort') == "desc") {
          usort($payload['results'], function ($a, $b) use ($key) {
            return $a->summary->score_values->{$key}->average_score < $b->summary->score_values->{$key}->average_score ? 1 : -1;
          });
        } else {
          usort($payload['results'], function ($a, $b) use ($key) {
            return $a->summary->score_values->{$key}->average_score > $b->summary->score_values->{$key}->average_score ? 1 : -1;
          });
        }
      }
    }

    if ($request->get('orderBy') == "average-total") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->average_score < $b->summary->average_score ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->average_score > $b->summary->average_score ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "average-try") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->average_done < $b->summary->average_done ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->average_done > $b->summary->average_done ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "repeat-total") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->average_done < $b->summary->average_done ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->summary->average_done > $b->summary->average_done ? 1 : -1;
        });
      }
    }
  }
}

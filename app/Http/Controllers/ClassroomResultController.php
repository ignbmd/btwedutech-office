<?php

namespace App\Http\Controllers;

use App\Helpers\Redis;
use App\Helpers\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\ApiGatewayService\Internal;
use Barryvdh\Snappy\Facades\SnappyPdf;
use App\Services\ExamService\TryoutCode;
use App\Helpers\ReportModuleSummary;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Student;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use stdClass;

class ClassroomResultController extends Controller
{
  private ClassMember $classMember;
  private Classroom $classroom;
  private Internal $apiGateway;
  private TryoutCode $tryoutCode;
  private Student $student;

  public function __construct(ClassRoom $classroom, Internal $apiGateway, TryoutCode $tryoutCode, ClassMember $classMember, Branch $branch, Student $student)
  {
    $this->classMember = $classMember;
    $this->classroom = $classroom;
    $this->apiGateway = $apiGateway;
    $this->tryoutCode = $tryoutCode;
    $this->branch = $branch;
    $this->student = $student;
  }

  public function downloadProgressReport(Request $request)
  {
    $user = Auth::user();
    $isCentralUser = ($user->branch_code === "PT0000" && UserRole::isAdmin()) || !$user->branch_code;
    return $isCentralUser ? $this->downloadCentralProgressReport($request) : $this->downloadBranchProgressReport($request);
  }

  private function downloadCentralProgressReport($request)
  {
    $classroom_id = $request->get('classroom_id') ?? null;
    $branch_code = $request->get('branch_code') ?? null;
    $exam_type = $request->has('exam_type') ? $request->get('exam_type') : null;

    $branches = [];
    $branchNames = [];
    $studentBranches = [];
    $branchTitle = null;
    $classTitle = null;

    $scoreKeysAbbreviation = [
      "TWK" => "TWK",
      "TIU" => "TIU",
      "TKP" => "TKP",
      "Potensi Kognitif" => "PK",
      "Penalaran Matematika" => "PM",
      "Literasi Bahasa Indonesia" => "LBIND",
      "Literasi Bahasa Inggris" => "LBING"
    ];

    if ($classroom_id) {
      $branch_code = null;
      $class = $this->classroom->getSingle($classroom_id);
      $classTitle = $class->title;
      $cache_name = "performa_" . $classroom_id . "_" . $exam_type;
    }

    if ($branch_code) {
      $classroom_id = null;
      $sluggified_branch_code = Str::slug(implode(" ", $branch_code), '_');
      $codes = implode(',', $branch_code);
      $branches = collect($this->branch->getMultipleBranches($codes));
      $branchNames = count($branches) > 0 ? $branches->pluck('name', 'code') : null;
      $branchTitle = count($branches) > 1 ? $branches->map(fn ($branch) => $branch->name)->implode(', ') : $branches[0]->name;
      $cache_name = "performa_" . $sluggified_branch_code . "_" . $exam_type;
    }

    $cache_value = Redis::get($cache_name);
    $decoded_cache_value = json_decode($cache_value);

    if ($branch_code) {
      $studentReport = $decoded_cache_value?->data;

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
    if ($request->has('exam_type')) {
      $examType = $this->setExamTypeLabel($exam_type);
      $tpsExamType = ["package-453", "package-546"];
      $program = in_array($exam_type, $tpsExamType) ? "tps" : "skd";
    }
    $scoreKeys = $this->getScoreKeys($program);

    $payload = [
      "generated_at" => $decoded_cache_value->generated_at,
      "results" => $decoded_cache_value->data
    ];

    if ($request->has('orderBy')) $this->sortModuleSummary($request, $payload);

    $kategoriSoal = $this->apiGateway->getQuestionCategory(1);
    $nilaiMinimal = [];
    foreach ($kategoriSoal as $kategori) {
      $nilaiMinimal[$kategori->singkatan] = $kategori->nilai_minimal;
    }
    $nilaiMinimal = (object)$nilaiMinimal;

    $html = $request->has('orderBy')
      ? view('pages/learning/class/performa-central/member-progress-download', [
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
        'pages/learning/class/performa-central/member-progress-download',
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
        ));
    $pdf  = SnappyPdf::loadHTML($html)
      ->setPaper('a3')
      ->setOrientation('landscape')
      ->setOption('margin-top', 0)
      ->setOption('margin-left', 0)
      ->setOption('margin-right', 0)
      ->setOption('margin-bottom', 0)
      ->setOption('disable-smart-shrinking', true);

    return $pdf->stream('Laporan Rekapitulasi Perkembangan Siswa Kelas SmartBTW - ' . $classTitle . '.pdf');
  }

  private function downloadBranchProgressReport($request)
  {
    $classroom_id = $request->get('classroom_id') ?? null;
    $branch_code = $request->get('branch_code') ?? null;
    $exam_type = $request->has('exam_type') ? $request->get('exam_type') : null;

    $studentClasses = [];
    $classTitle = null;
    $branchTitle = null;

    $scoreKeysAbbreviation = [
      "TWK" => "TWK",
      "TIU" => "TIU",
      "TKP" => "TKP",
      "Potensi Kognitif" => "PK",
      "Penalaran Matematika" => "PM",
      "Literasi Bahasa Indonesia" => "LBIND",
      "Literasi Bahasa Inggris" => "LBING"
    ];

    if ($classroom_id) {
      $sluggified_classroom_id = Str::slug(implode(" ", $classroom_id), '_');
      $class = $this->classroom->getByIds($classroom_id);
      $studentClasses = collect($this->classMember->getByClassroomIds($classroom_id) ?? [])->pluck('classroom_title', 'smartbtw_id')->toArray();
      $classTitle = count($classroom_id) > 1 ? $class->map(fn ($class) => $class->title)->implode(', ') : $class[0]->title;
      $cache_name = "performa_" . $sluggified_classroom_id . "_" . $exam_type;
    }

    $cache_value = Redis::get($cache_name);
    $decoded_cache_value = json_decode($cache_value);

    $examType = null; // Exam type label, to be used on pdf
    if ($request->has('exam_type')) {
      $examType = $this->setExamTypeLabel($exam_type);
      $tpsExamType = ["package-453", "package-546"];
      $program = in_array($exam_type, $tpsExamType) ? "tps" : "skd";
    }
    $scoreKeys = $this->getScoreKeys($program);

    $payload = [
      "generated_at" => $decoded_cache_value->generated_at,
      "results" => $decoded_cache_value->data
    ];
    if ($request->has('orderBy')) $this->sortModuleSummary($request, $payload);

    $kategoriSoal = $this->apiGateway->getQuestionCategory(1);
    $nilaiMinimal = [];
    foreach ($kategoriSoal as $kategori) {
      $nilaiMinimal[$kategori->singkatan] = $kategori->nilai_minimal;
    }
    $nilaiMinimal = (object)$nilaiMinimal;
    $html = $request->has('orderBy')
      ? view('pages/learning/class/performa-branch/member-progress-download', [
        'payload' => $payload,
        'class' => $class,
        'classTitle' => $classTitle,
        'nilaiMinimal' => $nilaiMinimal,
        'orderBy' => $request->get('orderBy'),
        'examType' => $examType,
        'branchTitle' => $branchTitle,
        'studentClasses' => $studentClasses,
        'program' => $program,
        'scoreKeys' => $scoreKeys,
        'scoreKeysAbbreviation' => $scoreKeysAbbreviation
      ])
      : view('pages/learning/class/performa-branch/member-progress-download', compact(
          'payload',
          'class',
          'classTitle',
          'nilaiMinimal',
          'examType',
          'branchTitle',
          'studentClasses',
          'program',
          'scoreKeys',
          'scoreKeysAbbreviation'
        ));

    $pdf  = SnappyPdf::loadHTML($html)
      ->setPaper('a3')
      ->setOrientation('landscape')
      ->setOption('margin-top', 0)
      ->setOption('margin-left', 0)
      ->setOption('margin-right', 0)
      ->setOption('margin-bottom', 0)
      ->setOption('disable-smart-shrinking', true);

    return $pdf->stream('Laporan Rekapitulasi Perkembangan Siswa Kelas SmartBTW - ' . $classTitle . '.pdf');
  }

  public function downloadProgressReportTryout(Request $request, $classId)
  {
    $auth_user_branch_code = auth()->user()->branch_code;
    $auth_user_id = auth()->user()->id;
    $class = new stdClass();
    $members = [];

    if ($classId == 'all-class') {
      $class->branch_code = 'PT0000';
      $class_year = Carbon::now()->year;
      $class->title = 'Semua Kelas Intensif ' . $class_year;
      $code_category = env('APP_ENV') == 'dev' ? 37 : 1;
    } else {
      $class = $this->classroom->getSingle($classId);
      $class_year = $class->year;
      $code_category = $request->has('code_category') ? $request->get('code_category') : null;
    }

    $sharedClassrooms = $this->classroom->getSharedClassroomByClassroomID($classId);
    $filteredSharedClassroom = array_values(array_filter($sharedClassrooms, function ($item) use ($auth_user_id) {
      return $item->sso_id === $auth_user_id;
    }, ARRAY_FILTER_USE_BOTH));
    $is_classroom_shared_to_user = (bool)$filteredSharedClassroom;

    if ($is_classroom_shared_to_user || $class->branch_code === $auth_user_branch_code  || ($auth_user_branch_code === "PT0000" || $auth_user_branch_code === null)) {
      if (property_exists($class, '_id'))
        $members = collect($this->classMember->getByClassroomId(classroom_id: $class->_id))->whereNull('deleted_at')->toArray();


      $taskids_response = $this->tryoutCode->getTaskIdsOnly($code_category);
      $taskids_response_group = $this->tryoutCode->getTaskIdsWithGroup($code_category);
      $taskids = json_decode($taskids_response->body())->data;
      $taskids_group = collect(json_decode($taskids_response_group->body())->data) ?? [];

      $client = new \Predis\Client([
        'scheme' => 'tcp',
        'host' => env('REDIS_HOST'),
        'port' => env('REDIS_PORT'),
        'password' => env('REDIS_PASSWORD'),
      ]);

      if ($classId == 'all-class') {
        $cache_name = "performa_" . "all" . "_" . $code_category . "_" . $class_year;
      } else {
        $cache_name = "performa_" . $classId . "_" . $code_category;
      }

      $cache_value = $client->get($cache_name);
      $decoded_cache_value = json_decode($cache_value);
      $results = collect($decoded_cache_value)->toArray();
      $results['class_year'] = $class_year;
      $results = ReportModuleSummary::modifySummaryData($results, $taskids_group, $members = []);

      $payload = $results;

      if ($request->has('orderBy')) {

        if ($request->get('orderBy') == 1) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->student->name < $b->student->name ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->student->name > $b->student->name ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 2) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->student->email < $b->student->email ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->student->email > $b->student->email ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 3) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->given < $b->given ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->given > $b->given ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 4) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->done < $b->done ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->done > $b->done ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 5) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->done_percent < $b->done_percent ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->done_percent > $b->done_percent ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 6) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->passed_percent < $b->passed_percent ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->passed_percent > $b->passed_percent ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 7) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->score_values->TWK->average_score < $b->subject->score_values->TWK->average_score ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->score_values->TWK->average_score > $b->subject->score_values->TWK->average_score ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 8) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->score_values->TIU->average_score < $b->subject->score_values->TIU->average_score ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->score_values->TIU->average_score > $b->subject->score_values->TIU->average_score ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 9) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->score_values->TKP->average_score < $b->subject->score_values->TKP->average_score ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->score_values->TKP->average_score > $b->subject->score_values->TKP->average_score ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 10) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->average_score < $b->subject->average_score ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->subject->average_score > $b->subject->average_score ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 11) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->report_average_try < $b->report_average_try ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->report_average_try > $b->report_average_try ? 1 : -1;
            });
          }
        }

        if ($request->get('orderBy') == 12) {

          if ($request->get('sort') == "desc") {
            usort($payload['results'], function ($a, $b) {
              return $a->report_repeat_sum < $b->report_repeat_sum ? 1 : -1;
            });
          } else {
            usort($payload['results'], function ($a, $b) {
              return $a->report_repeat_sum > $b->report_repeat_sum ? 1 : -1;
            });
          }
        }
      }
      $code_category_name = $this->getCodeCategoryName($code_category);
      $kategoriSoal = $this->apiGateway->getQuestionCategory(1);
      $score_keys = ["TWK", "TIU", "TKP"];

      $html = $request->has('orderBy')
        ? view('pages/learning/class/member-progress-tryout-download', [
          'payload' => $payload,
          'class' => $class,
          'orderBy' => $request->get('orderBy'),
          'code_category' => $code_category,
          'code_category_name' => $code_category_name,
          'score_keys' => $score_keys,
        ])
        : view('pages/learning/class/member-progress-tryout-download', compact('payload', 'class', 'code_category', 'code_category_name', 'score_keys'));

      $pdf  = SnappyPdf::loadHTML($html)
        ->setPaper('a3')
        ->setOrientation('landscape')
        ->setOption('margin-top', 0)
        ->setOption('margin-left', 0)
        ->setOption('margin-right', 0)
        ->setOption('margin-bottom', 0)
        ->setOption('disable-smart-shrinking', true);

      return $pdf->stream('Laporan Rekapitulasi Perkembangan Siswa Kelas SmartBTW - ' . $class->title . '.pdf');
    } else {
      request()->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => "Kelas ini bukan milik cabang anda"
      ]);
      return redirect()->back();
    }
  }

  private function getCodeCategoryName($category)
  {
    $allCodeCategory = $this->tryoutCode->getCodeCategory();
    $data = json_decode($allCodeCategory)->data;
    $code_category_name = collect($data)->filter(function ($code_category) use ($category) {
      return $code_category->id == $category;
    })->first();
    return $code_category_name->name ?? '';
  }

  private function sortModuleSummary($request, &$payload)
  {
    $scoreKeys = $payload['results'][0]->subject->score_keys;

    if ($request->get('orderBy') == "name") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->student->name < $b->student->name ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->student->name > $b->student->name ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "email") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->student->email < $b->student->email ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->student->email > $b->student->email ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "received-module") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->given < $b->given ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->given > $b->given ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "done-module") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->done < $b->done ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->done > $b->done ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "done-percent") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->done_percent < $b->done_percent ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->done_percent > $b->done_percent ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "passed-percent") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->passed_percent < $b->passed_percent ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->passed_percent > $b->passed_percent ? 1 : -1;
        });
      }
    }

    foreach($scoreKeys as $index => $key) {
      if ($request->get('orderBy') == "average-$index") {

        if ($request->get('sort') == "desc") {
          usort($payload['results'], function ($a, $b) use($key) {
            return $a->subject->score_values->{$key}->average_score < $b->subject->score_values->{$key}->average_score ? 1 : -1;
          });
        } else {
          usort($payload['results'], function ($a, $b) use($key) {
            return $a->subject->score_values->{$key}->average_score > $b->subject->score_values->{$key}->average_score ? 1 : -1;
          });
        }
      }
    }

    if ($request->get('orderBy') == "average-total") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->subject->average_score < $b->subject->average_score ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->subject->average_score > $b->subject->average_score ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "average-try") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->report_average_try < $b->report_average_try ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->report_average_try > $b->report_average_try ? 1 : -1;
        });
      }
    }

    if ($request->get('orderBy') == "repeat-total") {

      if ($request->get('sort') == "desc") {
        usort($payload['results'], function ($a, $b) {
          return $a->report_repeat_sum < $b->report_repeat_sum ? 1 : -1;
        });
      } else {
        usort($payload['results'], function ($a, $b) {
          return $a->report_repeat_sum > $b->report_repeat_sum ? 1 : -1;
        });
      }
    }
  }

  private function getScoreKeys($program)
  {
    switch ($program) {
      case "skd":
        return ["TWK", "TIU", "TKP"];
        break;
      case "tps":
        return ["Potensi Kognitif", "Penalaran Matematika", "Literasi Bahasa Indonesia", "Literasi Bahasa Inggris"];
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
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

use App\Helpers\Breadcrumb;
use App\Helpers\RabbitMq;
use App\Helpers\UserRole;
use Carbon\Carbon;

use App\Services\LearningService\ClassMember;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\Schedule;
use App\Services\StudyMaterialService\Material;
use App\Services\ExaminationService\ExamResult;
use App\Services\StudentResultService\ClassroomResult;
use App\Services\ApiGatewayService\Internal;
use App\Services\BranchService\Branch;
use App\Services\ExamService\TryoutCode;
use App\Services\LearningService\Student;
use App\Services\OnlineClassService\ClassParticipant;
use Illuminate\Support\Arr;
use App\Helpers\Redis;
use App\Helpers\ReportModuleSummary;
use App\Jobs\CreateClassParticipant;
use App\Jobs\ProgressTryoutAllClass;
use Illuminate\Support\Facades\Log;
use Barryvdh\Snappy\Facades\SnappyPdf;

class ClassMemberController extends Controller
{
  private ClassMember $classMember;
  private ClassRoom $classroom;
  private Schedule $schedule;
  private Material $studyMaterial;
  private ExamResult $exam;
  private ClassroomResult $result;
  private Internal $internalService;
  private Branch $branch;
  private TryoutCode $tryoutCode;
  private Student $student;
  private ClassParticipant $classParticipant;

  public function __construct(
    ClassMember $classMember,
    ClassRoom $classroom,
    ClassroomResult $result,
    Schedule $schedule,
    Material $studyMaterial,
    ExamResult $exam,
    Internal $internalService,
    Branch $branch,
    TryoutCode $tryoutCode,
    Student $student,
    ClassParticipant $classParticipant
  ) {
    Breadcrumb::setFirstBreadcrumb('Kelas', 'pembelajaran');
    $this->classMember = $classMember;
    $this->classroom = $classroom;
    $this->schedule = $schedule;
    $this->studyMaterial = $studyMaterial;
    $this->exam = $exam;
    $this->result = $result;
    $this->internalService = $internalService;
    $this->branch = $branch;
    $this->tryoutCode = $tryoutCode;
    $this->student = $student;
    $this->classParticipant = $classParticipant;
  }

  public function index(Request $request, $classroom_id)
  {
    $classmember_access_control = UserRole::getAllowed('roles.learning_classmember');

    $show_action_button = count(array_intersect(["*", "show_action_button"], $classmember_access_control)) > 0;
    $can_show_member_detail = count(array_intersect(["*", "show_member_detail"], $classmember_access_control)) > 0;
    $can_edit_member = count(array_intersect(["*", "edit_member"], $classmember_access_control)) > 0;
    $can_remove_member = count(array_intersect(["*", "remove_member"], $classmember_access_control)) > 0;
    $can_edit_member_zoom_email = count(
      array_intersect(
        ["*", "edit_member_zoom_email"],
        $classmember_access_control
      )
    ) > 0;

    $class = $this->classroom->getSingle($classroom_id);
    $isOnlineClass = property_exists($class, 'is_online') && $class?->is_online;

    $student_ids = [];
    $zoomParticipants = [];

    $members = $this->classMember->getByClassroomId(classroom_id: $classroom_id);
    if ($isOnlineClass) {
      $zoomParticipantsResponse = $this->classParticipant->getByClassroomID($classroom_id);
      if ($zoomParticipantsResponse->successful()) $zoomParticipants = json_decode($zoomParticipantsResponse->body())?->data ?? [];
      if (count($zoomParticipants) > 0) $zoomParticipants = collect($zoomParticipants)->mapWithKeys(fn ($item, $key) => [$item->smartbtw_id => $item]);
    }

    $breadcrumbs = [
      ['name' => 'Kelas', 'link' => "/pembelajaran"],
      ['name' => "Anggota Kelas $class->title"]
    ];

    return view(
      '/pages/learning/class/member',
      compact(
        'breadcrumbs',
        'class',
        'members',
        'show_action_button',
        'isOnlineClass',
        'zoomParticipants',
        'can_show_member_detail',
        'can_edit_member',
        'can_remove_member',
        'can_edit_member_zoom_email'
      )
    );
  }

  public function scores(Request $request, $classroom_id)
  {
    $class = $this->classroom->getSingle($classroom_id);

    $student_ids = [];
    $members = $this->classMember->getByClassroomId(classroom_id: $classroom_id);
    $schedule = $this->schedule->getByClassroomId($classroom_id);

    foreach ($members as $member) {
      $student_ids[] = $member->smartbtw_id;
      $member->scores = [];
    }

    // Filter schedule data based on program query params (use 'skd' as default if there isn't any)
    $program = $request->get('program') ?? 'skd';
    $schedule = $schedule->filter(function ($value, $key) use ($program) {
      return $value->program == $program;
    });

    // Get material titles (for table header)
    $schedule_material_ids = $schedule->pluck('material_id')->toArray();
    $materials = $this->studyMaterial->getByIds($schedule_material_ids);

    $pre_test_modul_ids = [];
    $post_test_modul_ids = [];

    foreach ($materials as $material) {
      $pre_test_modul_ids[] = $material->tests[0]->modul_id;
      $post_test_modul_ids[] = $material->tests[1]->modul_id;
    }

    $exam_type = $request->get('type') ?? 'post-test';

    $used_modul_ids = $exam_type == 'post-test' ? $post_test_modul_ids : $pre_test_modul_ids;

    $scores = $exam_type == 'post-test'
      ? $this->exam->getPostTestResult($student_ids, $used_modul_ids)
      : $this->exam->getPreTestResult($student_ids, $used_modul_ids);

    foreach ($members as $member) {

      if (property_exists($scores, $member->smartbtw_id)) {
        $student_id = $member->smartbtw_id;

        foreach ($used_modul_ids as $modul_id) {

          if (property_exists($scores->$student_id, $modul_id)) {
            $member->scores[] = $scores->$student_id->$modul_id->total_value;
            $member->repeat[] = property_exists($scores->$student_id->$modul_id, 'repeat')
              ? "Pengerjaan ke: " . $scores->$student_id->$modul_id->repeat
              : "Pengerjaan ke: 1";
          } else {
            $member->scores[] = "-";
            $member->repeat[] = "Belum Mengerjakan";
          }
        }
      } else {
        foreach ($used_modul_ids as $modul_id) {
          $member->scores[] = "-";
          $member->repeat[] = "Belum Mengerjakan";
        }
      }
    }

    // dd($used_modul_ids, $scores, $members);

    $breadcrumbs = [
      ['name' => 'Kelas', 'link' => "/pembelajaran"],
      ['name' => "Nilai Materi Siswa Kelas " . $class->title]
    ];

    return view(
      '/pages/learning/class/member-score',
      compact('breadcrumbs', 'class', 'materials', 'used_modul_ids', 'members')
    );
  }

  public function scoresDD(Request $request, $classroom_id)
  {
    $class = $this->classroom->getSingle($classroom_id);

    $student_ids = [];
    $members = $this->classMember->getByClassroomId(classroom_id: $classroom_id);
    $schedule = $this->schedule->getByClassroomId($classroom_id);

    foreach ($members as $member) {
      $student_ids[] = $member->smartbtw_id;
      $member->scores = [];
    }

    // Filter schedule data based on program query params (use 'skd' as default if there isn't any)
    $program = $request->get('program') ?? 'skd';
    $schedule = $schedule->filter(function ($value, $key) use ($program) {
      return $value->program == $program;
    });

    dump('$schedule');
    dump($schedule);

    // Get material titles (for table header)
    $schedule_material_ids = $schedule->pluck('material_id')->toArray();
    $materials = $this->studyMaterial->getByIds($schedule_material_ids);

    dump('$schedule_material_ids');
    dump($schedule_material_ids);

    dump('$materials');
    dump($materials);


    $pre_test_modul_ids = [];
    $post_test_modul_ids = [];

    foreach ($materials as $material) {
      $pre_test_modul_ids[] = $material->tests[0]->modul_id;
      $post_test_modul_ids[] = $material->tests[1]->modul_id;
    }

    $exam_type = $request->get('type') ?? 'post-test';

    $used_modul_ids = $exam_type == 'post-test' ? $post_test_modul_ids : $pre_test_modul_ids;

    dump('$pre_test_modul_ids');
    dump($pre_test_modul_ids);

    dump('$post_test_modul_ids');
    dump($post_test_modul_ids);

    $scores = $exam_type == 'post-test'
      ? $this->exam->getPostTestResult($student_ids, $used_modul_ids)
      : $this->exam->getPreTestResult($student_ids, $used_modul_ids);

    foreach ($members as $member) {

      if (property_exists($scores, $member->smartbtw_id)) {
        $student_id = $member->smartbtw_id;

        foreach ($used_modul_ids as $modul_id) {

          if (property_exists($scores->$student_id, $modul_id)) {
            $member->scores[] = $scores->$student_id->$modul_id->total_value;
            $member->repeat[] = property_exists($scores->$student_id->$modul_id, 'repeat')
              ? "Pengerjaan ke: " . $scores->$student_id->$modul_id->repeat
              : "Pengerjaan ke: 1";
          } else {
            $member->scores[] = "-";
            $member->repeat[] = "Belum Mengerjakan";
          }
        }
      } else {
        foreach ($used_modul_ids as $modul_id) {
          $member->scores[] = "-";
          $member->repeat[] = "Belum Mengerjakan";
        }
      }
    }

    dd($used_modul_ids, $scores, $members);

    $breadcrumbs = [
      ['name' => 'Kelas', 'link' => "/pembelajaran"],
      ['name' => "Nilai Materi Siswa Kelas " . $class->title]
    ];

    return view(
      '/pages/learning/class/member-score',
      compact('breadcrumbs', 'class', 'materials', 'used_modul_ids', 'members')
    );
  }

  public function store(Request $request)
  {
    $request->validate([
      'smartbtw_id' => 'required',
      'classroom_id' => 'required'
    ]);

    $classroom = $this->classroom->getSingle($request->get('classroom_id'));
    $isOnlineClassroom = property_exists($classroom, "is_online") && $classroom?->is_online;

    $response = $this->classMember->addStudentToClass(
      smartbtw_id: $request->get('smartbtw_id'),
      classroom_id: $request->get('classroom_id')
    );

    if ($response->success == true) {

      $classMembers = collect($this->classMember->getByClassroomId($request->classroom_id));
      $addedStudent = $classMembers->where("smartbtw_id", $request->smartbtw_id)->first();
      if (!$addedStudent) {
        Log::error("Could not find added student with smartbtw_id: " . $request->smartbtw_id, ["data" => $addedStudent]);
        $request->session()->flash('flash-message', [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Proses gagal, silakan coba lagi nanti'
        ]);
        return redirect('/siswa');
      }

      // Send added class member to message broker
      $addedClassMemberBrokerPayload = [
        "version" => 1,
        "data" => [
          "smartbtw_id" => $addedStudent->smartbtw_id,
          "classroom_id" => $request->get('classroom_id')
        ]
      ];
      RabbitMq::send("class-member.created", json_encode($addedClassMemberBrokerPayload));

      if (!$isOnlineClassroom) {
        $updateStudentBranchCodeResponse = $this->internalService->updateStudentBranchCode($request->get('smartbtw_id'), $classroom->branch_code);
        if (!$updateStudentBranchCodeResponse->successful()) {
          Log::error("Fail on updating student branch code", [
            "requestBody" => ["smartbtw_id" => $request->get('smartbtw_id'), 'branch_code' => $classroom->branch_code],
            "responseBody" => json_decode($updateStudentBranchCodeResponse->body()),
            "responseStatus" => $updateStudentBranchCodeResponse->status()
          ]);
        }
        $request->session()->flash('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Siswa berhasil ditambah ke kelas'
        ]);
        return redirect('/siswa');
      }

      // Send participant created event to added student
      $registrantCreatedEventPayload = [
        "version" => 1,
        "data" => [
          "classroom_id" => $request->get('classroom_id'),
          "smartbtw_id" => $addedStudent->smartbtw_id,
          "name" => $addedStudent->name,
          "email" => $addedStudent->email,
          "zoom_email" => $addedStudent->email,
          "role" => "PARTICIPANT",
          "status" => "APPROVED"
        ]
      ];
      CreateClassParticipant::dispatch(json_encode($registrantCreatedEventPayload))->delay(Carbon::now()->addSeconds(3));
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Siswa berhasil ditambah ke kelas'
      ]);
    } else {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => $response->messages[0]
      ]);
    }

    return redirect('/siswa');
  }

  public function edit($classroom_id, $member_id)
  {
    // $is_mentor = in_array("mentor", auth()->user()->roles);
    // if($is_mentor) {
    //   return redirect()->back();
    // }

    $class = $this->classroom->getSingle($classroom_id);
    $members = $this->classMember->getByClassroomId(classroom_id: $classroom_id);
    $member = array_values(array_filter($members, function ($value) use ($member_id) {
      return $value->smartbtw_id == $member_id;
    }));

    $member = $member[0];
    $is_user_pusat = auth()->user()->branch_code == null || auth()->user()->branch_code == "PT0000";
    $classes = $is_user_pusat ? $this->classroom->getAll() : $this->classroom->getAll(['branch_code' => auth()->user()->branch_code]);

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => $class->title, 'link' => "/pembelajaran/kelas/" . $class->_id . "/members"],
      ['name' => "Ubah Kelas Siswa"]
    ];
    return view("/pages/learning/class/member-edit", compact('classroom_id', 'member', 'classes', 'breadcrumbs'));
  }

  public function editZoomEmail($classroom_id, $member_id)
  {
    $class = $this->classroom->getSingle($classroom_id);
    $isOnlineClass = property_exists($class, 'is_online') && $class?->is_online;
    $zoomParticipants = [];
    $zoomParticipant = null;

    $members = $this->classMember->getByClassroomId(classroom_id: $classroom_id);
    $member = array_values(array_filter($members, function ($value) use ($member_id) {
      return $value->smartbtw_id == $member_id;
    }));
    $member = $member[0];

    if ($isOnlineClass) {
      $zoomParticipantsResponse = $this->classParticipant->getByClassroomID($classroom_id);
      if ($zoomParticipantsResponse->successful()) $zoomParticipants = json_decode($zoomParticipantsResponse->body())?->data ?? [];
      if (count($zoomParticipants) > 0) $zoomParticipant = collect($zoomParticipants)->where("smartbtw_id", $member_id)->first();
    }

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => $class->title, 'link' => "/pembelajaran/kelas/" . $class->_id . "/members"],
      ['name' => "Ubah Email Zoom Meeting Siswa"]
    ];
    return view("/pages/learning/class/edit-member-zoom-email", compact('classroom_id', 'member', 'zoomParticipant', 'breadcrumbs'));
  }

  public function addMembersToClassroomForm($classroom_id)
  {
    $accessControl = UserRole::getAllowed('roles.learning_classroom');
    $isAuthorizedUser = count(array_intersect(["*", "add_class_members_to_classroom"], $accessControl)) > 0;
    if (!$isAuthorizedUser) {
      request()->session()->flash('flash-message', [
        'title' => 'Peringatan!',
        'type' => 'warning',
        'message' => 'Anda tidak dapat mengakses halaman ini'
      ]);
      return redirect("/pembelajaran");
    }

    $selectedClassroom = $this->classroom->getSingle($classroom_id);
    $ongoingClassrooms = $this->classroom->getAll(["status" => "ONGOING"]);

    if ($selectedClassroom->count_member == 0) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Kelas belum memiliki anggota'
      ]);
      return redirect("/pembelajaran/kelas");
    }

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => "Tambah Anggota Kelas " . $selectedClassroom->title . " Ke Kelas Lain"]
    ];
    return view("/pages/learning/class/add-members-to-classroom", compact('classroom_id', 'breadcrumbs', 'selectedClassroom', 'ongoingClassrooms'));
  }

  public function addMembersToClassroom(Request $request, $classroom_id)
  {
    $oldClassroomMembers = collect($this->classMember->getByClassroomId($classroom_id));
    $newClassroomMembers = collect($this->classMember->getByClassroomId($request->classroom_id));

    // Check if there is any member in old classroom that can be added to new / destination classroom
    // by checking whether there are some old class member array of smartbtw_ids not present in new / destination classroom array or not
    $oldClassroomMemberIds = $oldClassroomMembers->pluck("smartbtw_id")->values();
    $newClassroomMemberIds = $newClassroomMembers->pluck("smartbtw_id")->values();
    $whiteListedMemberIds = $oldClassroomMemberIds->diff($newClassroomMemberIds)->values();
    if ($whiteListedMemberIds->count() === 0) {
      request()->session()->flash('flash-message', [
        'title' => 'Informasi!',
        'type' => 'info',
        'message' => 'Semua anggota kelas sudah terdaftar di kelas tujuan'
      ]);
      return redirect("/pembelajaran");
    }

    $membersToBeAdded = $oldClassroomMembers->filter(fn ($item, $key) => $whiteListedMemberIds->contains($item->smartbtw_id))->values();
    $oldClassroom = $this->classroom->getSingle($classroom_id);
    $newClassroom = $this->classroom->getSingle($request->classroom_id);
    $isOnlineClass = property_exists($newClassroom, 'is_online') && $newClassroom?->is_online;

    foreach ($membersToBeAdded as $index => $member) {

      $response = $this->classMember->addStudentToClass(
        smartbtw_id: $member->smartbtw_id,
        classroom_id: $request->classroom_id,
      );
      if (!$response->data) {
        Log::error(
          "Fail to add student " . $member->name . " (" . $member->email . ") with smartbtw_id: " . $member->smartbtw_id . " from " . $oldClassroom->title . " to " . $newClassroom->title,
          ["from" => $oldClassroom, "to" => $newClassroom, "response" => $response]
        );
        continue;
      }

      // Send added class member to message broker
      $addedClassMemberBrokerPayload = [
        "version" => 1,
        "data" => [
          "smartbtw_id" => $member->smartbtw_id,
          "classroom_id" => $request->classroom_id
        ]
      ];
      RabbitMq::send("class-member.created", json_encode($addedClassMemberBrokerPayload));

      if ($isOnlineClass) {
        // Send participant created event to added student
        $registrantCreatedEventPayload = [
          "version" => 1,
          "data" => [
            "classroom_id" => $request->classroom_id,
            "smartbtw_id" => $member->smartbtw_id,
            "name" => $member->name,
            "email" => $member->email,
            "zoom_email" => $member->email,
            "role" => "PARTICIPANT",
            "status" => "APPROVED"
          ]
        ];
        $delayIntervalInSeconds = ($index + 1) * 5;
        CreateClassParticipant::dispatch(json_encode($registrantCreatedEventPayload))->delay(Carbon::now()->addSeconds($delayIntervalInSeconds));
      }
    }

    request()->session()->flash('flash-message', [
      'title' => 'Berhasil!',
      'type' => 'success',
      'message' => 'Anggota kelas berhasil ditambah ke kelas tujuan'
    ]);
    return redirect("/pembelajaran");
  }

  public function progress(Request $request)
  {
    if (UserRole::isAdmin()) return $this->progressCentralAdmin($request);
    return $this->progressBranchUsers($request);
  }

  private function progressCentralAdmin(Request $request)
  {
    $auth_user_roles = auth()->user()->roles;
    $auth_user_id = auth()->user()->id;
    $auth_user_branch_code = auth()->user()->branch_code;
    $breadcrumbs = [];

    // If class is not selected, just redirect to performa page
    $is_class_selected = $request->has('classroom_id') && $request->get('classroom_id') !== null;
    $is_branch_code_selected = $request->has('branch_code') && $request->get('branch_code') !== null;
    if (!$is_class_selected && !$is_branch_code_selected) return view('/pages/learning/class/performa-central/member-progress', compact('breadcrumbs', 'auth_user_roles', 'auth_user_id'));

    $classroom_id = $request->get('classroom_id');
    $program = strtolower($request->get('program') ?? 'skd');
    $exam_type = $request->get('exam_type') ?? null;
    if ($exam_type === "package-453" || $exam_type === "package-546") $program = "tps";

    if ($is_class_selected) {
      $members = collect($this->classMember->getByClassroomId($classroom_id))->whereNull('deleted_at')->toArray();
      $student_ids = array_values(array_unique(array_map(function ($item) {
        return $item->smartbtw_id;
      }, $members)));
      $module_summary_cache_key = "performa_" . $classroom_id . "_" . $exam_type;
    }

    if ($is_branch_code_selected) {
      $branch_code = $request->get('branch_code');
      $classrooms = collect($this->classMember->getByBranchCodes($branch_code))->filter(fn ($classroom) => count($classroom->class_members) > 0)->values();
      $student_ids = $classrooms->pluck('class_members')->flatten()->pluck('smartbtw_id')->unique()->sort()->values()->toArray();
      $sluggified_branch_codes = Str::slug(implode(" ", $branch_code), '_');
      $module_summary_cache_key = "performa_" . $sluggified_branch_codes . "_" . $exam_type;
    }

    $exam_type_breadcrumb_label = $this->getBreadcrumbLabel($exam_type);
    $score_keys = $this->getScoreKeys($program);

    $is_getting_summary_flag_cache_key = $module_summary_cache_key . "-is_setting_cache";

    $module_summary = Redis::get($module_summary_cache_key);
    $is_not_getting_summary = Redis::get($is_getting_summary_flag_cache_key) == null;

    if (is_null($module_summary)) Redis::set($module_summary_cache_key, 0); // Set module summary cache value to 0 (falsy value)
    $is_module_summary_empty = (bool)$module_summary === false;

    // Generate module summary and save it to cache if it's empty
    if ($is_module_summary_empty) {
      // Set flag to prevent module summary being generated multiple times
      if ($is_not_getting_summary) {
        $payload = [
          'version' => 1,
          'data' => [
            "generated_at" => Carbon::now()->format('Y-m-d H:i:s') . ' WIB',
            'cache_name' => $module_summary_cache_key,
            'program' => $program,
            'exam_type' => $exam_type,
            'with_report' => true,
            'smartbtw_ids' => $student_ids
          ]
        ];
        $topic = $program === "tps" ? "module-summary.generate-irt" : "module-summary.generate";
        Redis::set($is_getting_summary_flag_cache_key, 1); // Set flag to indicate that we are currently getting module summary
        RabbitMq::send($topic, json_encode($payload)); // Get module summary from exam result service via message broker
      }
      $view_data = compact('breadcrumbs', 'classroom_id', 'module_summary_cache_key', 'module_summary', 'auth_user_roles', 'auth_user_id', 'program');
      return view('/pages/learning/class/performa-central/member-progress', $view_data);
    }

    Redis::delete($is_getting_summary_flag_cache_key); // Delete flag to indicate that we are not getting module summary or module summary is already being generated
    $module_summary = json_decode($module_summary);
    $results = collect($module_summary)->toArray();
    $view_data = compact('breadcrumbs', 'results', 'score_keys', 'classroom_id', 'module_summary_cache_key', 'module_summary', 'auth_user_roles', 'auth_user_id', 'program');
    return view('/pages/learning/class/performa-central/member-progress', $view_data);
  }

  private function progressBranchUsers(Request $request)
  {
    $auth_user_roles = auth()->user()->roles;
    $auth_user_id = auth()->user()->id;
    $auth_user_branch_code = auth()->user()->branch_code;
    $breadcrumbs = [];

    // If class is not selected, just redirect to performa page
    $is_class_selected = $request->has('classroom_id') && $request->get('classroom_id') !== null;
    if (!$is_class_selected) return view('/pages/learning/class/performa-branch/member-progress', compact('breadcrumbs', 'auth_user_roles', 'auth_user_id'));

    $classroom_id = $request->get('classroom_id');

    // $class = $this->classroom->getSingle($classroom_id);
    // $branch = $this->branch->getBranchByCode($class->branch_code);
    // $shared_classrooms = $this->classroom->getSharedClassroomByClassroomID($classroom_id);
    // $filtered_shared_classrooms = array_values(array_filter($shared_classrooms, function ($item) use ($auth_user_id) {
    //   return $item->sso_id === $auth_user_id;
    // }, ARRAY_FILTER_USE_BOTH));

    // Check if submitted form values is valid
    // $is_classroom_shared_to_user = (bool)$filtered_shared_classrooms;
    // $is_classroom_belongs_to_user_branch = $class->branch_code === $auth_user_branch_code;
    // $is_conditions_valid = UserRole::isAdmin() || $is_classroom_shared_to_user || $is_classroom_belongs_to_user_branch;
    // if(!$is_conditions_valid) {
    //   request()->session()->flash('flash-message', [
    //     'title' => 'Error!',
    //     'type' => 'error',
    //     'message' => "Kelas ini bukan milik cabang anda"
    //   ]);
    //   return redirect()->back();
    // }

    $program = strtolower($request->get('program') ?? 'skd');
    $exam_type = $request->get('exam_type') ?? null;
    if ($exam_type === "package-546" || $exam_type === "package-453") $program = "tps";

    $members = collect($this->classMember->getByClassroomIds($classroom_id))->whereNull('deleted_at')->toArray();
    $student_ids = array_values(array_unique(array_map(function ($item) {
      return $item->smartbtw_id;
    }, $members)));

    $exam_type_breadcrumb_label = $this->getBreadcrumbLabel($exam_type);
    $score_keys = $this->getScoreKeys($program);
    $sluggified_classroom_ids = Str::slug(implode(" ", $classroom_id), '_');

    $module_summary_cache_key = "performa_" . $sluggified_classroom_ids . "_" . $exam_type;
    $is_getting_summary_flag_cache_key = $module_summary_cache_key . "-is_setting_cache";

    $module_summary = Redis::get($module_summary_cache_key);
    $is_not_getting_summary = Redis::get($is_getting_summary_flag_cache_key) == null;

    if (is_null($module_summary)) Redis::set($module_summary_cache_key, 0); // Set module summary cache value to 0 (falsy value)
    $is_module_summary_empty = (bool)$module_summary === false;

    // Generate module summary and save it to cache if it's empty
    if ($is_module_summary_empty) {
      // Set flag to prevent module summary being generated multiple times
      if ($is_not_getting_summary) {
        $payload = [
          'version' => 1,
          'data' => [
            "generated_at" => Carbon::now()->format('Y-m-d H:i:s') . ' WIB',
            'cache_name' => $module_summary_cache_key,
            'program' => $program,
            'exam_type' => $exam_type,
            'with_report' => true,
            'smartbtw_ids' => $student_ids
          ]
        ];
        $topic = $program === "tps" ? "module-summary.generate-irt" : "module-summary.generate";
        Redis::set($is_getting_summary_flag_cache_key, 1); // Set flag to indicate that we are currently getting module summary
        RabbitMq::send($topic, json_encode($payload)); // Get module summary from exam result service via message broker
      }

      $view_data = compact('breadcrumbs', 'classroom_id', 'module_summary_cache_key', 'module_summary', 'auth_user_roles', 'auth_user_id', 'program');
      return view('/pages/learning/class/performa-branch/member-progress', $view_data);
    }

    Redis::delete($is_getting_summary_flag_cache_key); // Delete flag to indicate that we are not getting module summary or module summary is already being generated
    // $breadcrumbs = [["name" => $branch->name . " - " . $class->title . " (" . $class->year . ")" . " (" . $exam_type_breadcrumb_label . ")"]];
    $module_summary = json_decode($module_summary);
    $results = collect($module_summary)->toArray();
    $view_data = compact('breadcrumbs', 'results', 'score_keys', 'classroom_id', 'module_summary_cache_key', 'module_summary', 'auth_user_roles', 'auth_user_id', 'program');
    return view('/pages/learning/class/performa-branch/member-progress', $view_data);
  }

  public function progressTryout(Request $request)
  {
    if (UserRole::isAdmin() && $request->classroom_id == 'all-class') return $this->progressTryoutGetAllClass($request);
    return $this->progressTryoutBasic($request);
  }

  private function progressTryoutGetAllClass(Request $request)
  {
    /*
      This function is to get progress Tryout all class (specific with classroom tags 'intensif').
      Only central admin can use this function.
    */
    $auth_user_roles = auth()->user()->roles;
    $auth_user_id = auth()->user()->id;
    $isAdmin = UserRole::isAdmin();

    // check if the request have key classroom_id and value classroom_id is 'all-class'
    if ($request->has('classroom_id') && $request->get('classroom_id') !== null && $request->classroom_id == "all-class") {

      $currentYear = Carbon::now()->year;
      $branches = [];
      $codeCategory = env('APP_ENV') == 'dev' ? 37 : 1;
      $program = "skd";

      $taskids_response = $this->tryoutCode->getTaskIdsOnly($codeCategory);
      $taskids_response_group = $this->tryoutCode->getTaskIdsWithGroup($codeCategory);
      $taskids = json_decode($taskids_response->body())->data;
      $taskids_group = collect(json_decode($taskids_response_group->body())->data) ?? [];
      $score_keys = ["TWK", "TIU", "TKP"];
      $breadcrumbs = [];

      $getCodeCategoryTaskIdsResponse = $this->tryoutCode->getTaskIdsOnly($codeCategory);
      $codeCategoryTaskIds = collect(json_decode($getCodeCategoryTaskIdsResponse->body())->data);
      if ($codeCategoryTaskIds->count() === 0) {
        return 0;
      }

      $query = ['status' => 'ONGOING', 'year' => $currentYear, 'tags' => ["Intensif", "intensif", "INTENSIF"]];
      $classrooms = collect($this->classroom->getAll($query));
      if ($classrooms->count() === 0) {
        return 0;
      }

      $cache_name = "performa_all_" . $codeCategory . "_" . $currentYear;
      $set_summary_cache_name = $cache_name . "-is_setting_cache";

      $cache_value = Redis::get($cache_name);
      $is_setting_cache = Redis::get($set_summary_cache_name) == null;
      if (is_null($cache_value)) {
        try {
          foreach ($classrooms as $classroom) {
            if (!isset($branches[$classroom->branch_code])) {
              $branch = $this->branch->getBranchByCode($classroom->branch_code);
              $branches[$classroom->branch_code] = $branch;
            }
            $classMembers = collect($this->classMember->getByClassroomId($classroom->_id));
            if ($classMembers->count() === 0) {
              continue;
            }
            $studentIds = $classMembers->pluck('smartbtw_id')->toArray();
            ProgressTryoutAllClass::dispatch($classroom, $branches, $classMembers, $program, $codeCategoryTaskIds, $cache_name);
          }
        } catch (\Exception $e) {
          Log::error($e->getMessage());
        }

        $cacheModuleSummary = Redis::getList($cache_name . "_temp");
        $decodedCacheModuleSummary = array_map(fn ($item) => json_decode($item), $cacheModuleSummary);
        $modifiedModuleSummary = Arr::add(['generated_at' => Carbon::now()->format('Y-m-d H:i:s') . ' WIB'], 'data', $decodedCacheModuleSummary);
        Redis::set($cache_name, json_encode($modifiedModuleSummary));
        Redis::delete(["appended-student-ids", $cache_name . "_temp"]);
        return view(
          '/pages/learning/class/member-progress-tryout',
          compact('breadcrumbs', 'cache_name', 'cache_value', 'score_keys', 'auth_user_roles', 'auth_user_id', 'isAdmin')
        );
      }

      $cacheModuleSummary = Redis::getList($cache_name . "_temp");
      $decodedCacheModuleSummary = array_map(fn ($item) => json_decode($item), $cacheModuleSummary);
      $modifiedModuleSummary = Arr::add(['generated_at' => Carbon::now()->format('Y-m-d H:i:s') . ' WIB'], 'data', $decodedCacheModuleSummary);
      Redis::set($cache_name, json_encode($modifiedModuleSummary));

      $results = collect(json_decode($cache_value))->toArray();
      $results['class_year'] = Carbon::now();
      $results = ReportModuleSummary::modifySummaryData($results, $taskids_group, $classMembers = []);
      $breadcrumbs = [["name" => "Semua Cabang" . " - " . "Semua Kelas Intensif" . " (" . $currentYear . ")" . " (" . $codeCategory . ")"]];
      $view_data = compact('breadcrumbs', 'cache_name', 'cache_value', 'results', 'score_keys', 'auth_user_roles', 'auth_user_id', 'isAdmin');

      return view(
        '/pages/learning/class/member-progress-tryout',
        $view_data
      );
    } else {
      $breadcrumbs = [];
      return view(
        '/pages/learning/class/member-progress-tryout',
        compact('breadcrumbs', 'auth_user_roles', 'auth_user_id', 'isAdmin')
      );
    }
  }

  private function progressTryoutBasic(Request $request)
  {
    /*
      This function is to get progress Tryout each class.
      All users role can use this function.
    */
    $auth_user_roles = auth()->user()->roles;
    $auth_user_id = auth()->user()->id;

    $isAdmin = UserRole::isAdmin();

    // Check whether the request have key classroom_id, and have classroom_id value
    if ($request->has('classroom_id') && $request->get('classroom_id') !== null) {
      $classroom_id = $request->get('classroom_id');
      $auth_user_branch_code = auth()->user()->branch_code;

      $class = $this->classroom->getSingle($classroom_id);
      $class_year = $class->year;
      $branch = $this->branch->getBranchByCode($class->branch_code);

      $sharedClassrooms = $this->classroom->getSharedClassroomByClassroomID($request->get('classroom_id'));
      $filteredSharedClassroom = array_values(array_filter($sharedClassrooms, function ($item) use ($auth_user_id) {
        return $item->sso_id === $auth_user_id;
      }, ARRAY_FILTER_USE_BOTH));
      $is_classroom_shared_to_user = (bool)$filteredSharedClassroom;

      // Check if user have access to the clasroom, or branch class are the same as user branch, or the user branch is central branch or null
      if ($is_classroom_shared_to_user || $class->branch_code === $auth_user_branch_code  || ($auth_user_branch_code === "PT0000" || $auth_user_branch_code === null)) {

        $members = collect($this->classMember->getByClassroomId(classroom_id: $classroom_id))->whereNull('deleted_at')->toArray();
        $student_ids = [];

        // get student id from member classroom
        foreach ($members as $member) {
          $student_ids[] = $member->smartbtw_id;
        }

        $program = $request->get('program') ?? 'skd';

        $code_category = $request->get('code_category') ?? null;
        $taskids = [];
        $score_keys = ["TWK", "TIU", "TKP"];
        $breadcrumbs = [];

        $taskids_response = $this->tryoutCode->getTaskIdsOnly($code_category);
        $taskids_response_group = $this->tryoutCode->getTaskIdsWithGroup($code_category);
        $taskids = json_decode($taskids_response->body())->data;
        $taskids_group = collect(json_decode($taskids_response_group->body())->data) ?? [];

        // Define Redis Client
        $client = new \Predis\Client([
          'scheme' => 'tcp',
          'host' => env('REDIS_HOST'),
          'port' => env('REDIS_PORT'),
          'password' => env('REDIS_PASSWORD'),
        ]);

        $cache_name = "performa_" . $classroom_id . "_" . $code_category;
        $set_summary_cache_name = $cache_name . "-is_setting_cache";

        $cache_value = $client->get($cache_name);
        $is_setting_cache = $client->get($set_summary_cache_name) == null;

        if (!is_null($cache_value)) {
          $isGeneratingResult = (bool)$cache_value === false;

          if ($isGeneratingResult) {
            if ($is_setting_cache) {
              $payload = json_encode([
                'version' => 1,
                'data' => [
                  "generated_at" => Carbon::now()->format('Y-m-d H:i:s') . ' WIB',
                  'program' => $program,
                  'smartbtw_ids' => $student_ids,
                  'task_ids' => $taskids,
                  'cache_name' => $cache_name,
                  'with_report' => true,
                ]
              ]);
              RabbitMq::send("code-tryout-module-summary.generate", $payload);
              $client->set($cache_name . "-is_setting_cache", 1);
            } else {
              $client->del($cache_name . "-is_setting_cache");
            }
            $view_data = compact('breadcrumbs', 'classroom_id', 'cache_name', 'cache_value', 'auth_user_roles', 'auth_user_id', 'isAdmin');
          } else {
            $decoded_cache_value = json_decode($cache_value);
            $results = collect($decoded_cache_value)->toArray();
            $results['class_year'] = $class_year;
            $results = ReportModuleSummary::modifySummaryData($results, $taskids_group, $members);
            $view_data = compact('breadcrumbs', 'results', 'score_keys', 'classroom_id', 'cache_name', 'cache_value', 'auth_user_roles', 'auth_user_id', 'isAdmin');
            $client->del($cache_name . "-is_setting_cache");
          }
          $breadcrumbs = [["name" => $branch->name . " - " . $class->title . " (" . $class->year . ")" . " (" . $code_category . ")"]];
        } else {
          Cache::put($cache_name, 0);
          $view_data = compact('breadcrumbs', 'classroom_id', 'cache_name', 'cache_value', 'auth_user_roles', 'auth_user_id', 'isAdmin');
        }

        return view(
          '/pages/learning/class/member-progress-tryout',
          $view_data
        );
      } else {
        request()->session()->flash('flash-message', [
          'title' => 'Error!',
          'type' => 'error',
          'message' => "Kelas ini bukan milik cabang anda"
        ]);
        return redirect()->back();
      }
    } else {
      $breadcrumbs = [];
      return view(
        '/pages/learning/class/member-progress-tryout',
        compact('breadcrumbs', 'auth_user_roles', 'auth_user_id', 'isAdmin')
      );
    }
  }

  public function cacheProgress(Request $request)
  {
    $classroom_id = $request->get('classroom_id');
    $exam_type = $request->get('exam_type');
    $cache_name = "performa_" . $classroom_id . "_" . $exam_type;
    $set_summary_cache_name = $cache_name . "-is_setting_cache";
    $client = new \Predis\Client([
      'scheme' => 'tcp',
      'host' => env('REDIS_HOST'),
      'port' => env('REDIS_PORT'),
      'password' => env('REDIS_PASSWORD'),
    ]);
    $summary_cache = json_decode($client->get($cache_name));
    $is_summary_cache_has_been_set = $client->get($set_summary_cache_name);
    dd($summary_cache, $is_summary_cache_has_been_set);
  }

  public function refreshProgress(Request $request)
  {
    $classroom_id = $request->get('classroom_id');
    $branch_code = $request->get('branch_code');
    $exam_type = $request->get('exam_type');

    $cache_name = null;
    $set_summary_cache_name = null;
    $url = route('performa.class-member.index', $request->all());

    if ($classroom_id && is_array($classroom_id)) {
      $sluggified_classroom_ids = Str::slug(implode(" ", $classroom_id), '_');
      $cache_name = "performa_" . $sluggified_classroom_ids . "_" . $exam_type;
      $classroom_id_query_string = "?classroom_id%5B%5D=$classroom_id[0]";

      if (count($classroom_id) > 1) {
        foreach ($classroom_id as $key => $cid) {
          if ($key === 0) $classroom_id_query_string = "?classroom_id%5B%5D=$classroom_id[0]";
          else $classroom_id_query_string = $classroom_id_query_string . "&classroom_id%5B%5D=$cid";
        }
      }

      $exam_type_query_string = "&exam_type=$exam_type";
      $url = route('performa.class-member.index') . $classroom_id_query_string . $exam_type_query_string;
    }

    if ($classroom_id && is_string($classroom_id)) {
      $cache_name = "performa_" . $classroom_id . "_" . $exam_type;
      $url = route('performa.class-member.index', $request->all());
    }

    if ($branch_code && is_array($branch_code)) {
      $sluggified_branch_code = Str::slug(implode(" ", $branch_code), '_');
      $cache_name = "performa_" . $sluggified_branch_code . "_" . $exam_type;
      $branch_code_query_string = "?branch_code%5B%5D=$branch_code[0]";

      if (count($branch_code) > 1) {
        foreach ($branch_code as $key => $code) {
          if ($key === 0) $branch_code_query_string = "?branch_code%5B%5D=$branch_code[0]";
          else $branch_code_query_string = $branch_code_query_string . "&branch_code%5B%5D=$code";
        }
      }
      $exam_type_query_string = "&exam_type=$exam_type";
      $url = route('performa.class-member.index') . $branch_code_query_string . $exam_type_query_string;
    }

    if ($cache_name) {
      $set_summary_cache_name = $cache_name . "-is_setting_cache";
      Redis::delete([$cache_name, $set_summary_cache_name]);
    }

    return redirect($url);
  }

  public function refreshProgressTryout(Request $request)
  {
    $classroom_id = $request->get('classroom_id');
    $code_category = $request->get('code_category');
    $cache_name = "performa_" . $classroom_id . "_" . $code_category;
    $set_summary_cache_name = $cache_name . "-is_setting_cache";

    $client = new \Predis\Client([
      'scheme' => 'tcp',
      'host' => env('REDIS_HOST'),
      'port' => env('REDIS_PORT'),
      'password' => env('REDIS_PASSWORD'),
    ]);
    $client->del([$cache_name, $set_summary_cache_name]);

    return redirect()->route('performa.class-member.index-tryout', ['classroom_id' => $classroom_id, 'code_category' => $code_category]);
  }

  public function downloadReport(Request $request, $studentId)
  {
    $auth_user_branch_code = auth()->user()->branch_code;
    $auth_user_id = auth()->user()->id;

    // $class = $this->classroom->getSingle($classId);
    // $sharedClassrooms = $this->classroom->getSharedClassroomByClassroomID($classId);
    // $filteredSharedClassroom = array_values(array_filter($sharedClassrooms, function ($item) use ($auth_user_id) {
    //   return $item->sso_id === $auth_user_id;
    // }, ARRAY_FILTER_USE_BOTH));
    // $is_classroom_shared_to_user = (bool)$filteredSharedClassroom;

    $exam_type = $request->get('exam_type') ?? null;
    return $exam_type === "package-546" || $exam_type === "package-453"
      ? $this->downloadStudentIRTReport((int)$studentId, $exam_type)
      : $this->internalService->downloadStudentReport((int)$studentId, $exam_type);

    // if ($is_classroom_shared_to_user || $class->branch_code === $auth_user_branch_code || ($auth_user_branch_code === "PT0000" || $auth_user_branch_code === null)) {
    //   $exam_type = $request->get('exam_type') ?? null;
    //   return $this->internalService->downloadStudentReport((int)$studentId, $exam_type);
    // } else {
    //   request()->session()->flash('flash-message', [
    //     'title' => 'Error!',
    //     'type' => 'error',
    //     'message' => "Kelas ini bukan milik cabang anda"
    //   ]);
    //   return redirect()->back();
    // }
  }

  public function update(Request $request, $classId, $memberId)
  {
    $studentProfileResponse = $this->internalService->getStudentProfile($memberId);
    $studentProfileBody = json_decode($studentProfileResponse->body())?->data ?? null;
    if (!$studentProfileBody) {
      Log::error(
        'Could not move student from one class to another - student profile data is not found',
        ["student_id" => $memberId, "current_classroom_id" => $classId, "destination_classroom_id => $request->classroom_id", "user_sso_id" => auth()->user()->id]
      );
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => "Terjadi kesalahan silakan coba lagi nanti"
      ]);
      return redirect(route('kelas.member.index', $classId));
    }

    $currentClassroom = $this->classroom->getSingle($classId);
    if (!$currentClassroom) {
      Log::error('Could not move student from one class to another - $currentClassroom data is not found', ["student_id" => $memberId, "current_classroom_id" => $classId, "destination_classroom_id => $request->classroom_id", "user_sso_id" => auth()->user()->id]);
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => "Terjadi kesalahan silakan coba lagi nanti"
      ]);
      return redirect(route('kelas.member.index', $classId));
    }

    $destinationClassroom = $this->classroom->getSingle($request->classroom_id);
    if (!$destinationClassroom) {
      Log::error('Could not move student from one class to another - $destinationClassroom data is not found', ["student_id" => $memberId, "current_classroom_id" => $classId, "destination_classroom_id => $request->classroom_id", "user_sso_id" => auth()->user()->id]);
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => "Terjadi kesalahan silakan coba lagi nanti"
      ]);
      return redirect(route('kelas.member.index', $classId));
    }
    $isCurrentClassroomIsAnOnlineClassroom = property_exists($currentClassroom, "is_online") && $currentClassroom?->is_online;
    $isDestinationClassroomIsAnOnlineClassroom = property_exists($destinationClassroom, "is_online") && $destinationClassroom?->is_online;

    if ($isCurrentClassroomIsAnOnlineClassroom) {
      $deletedClassMemberPayload = [
        "version" => 1,
        "data" => [
          [
            "smartbtw_id" => (int)$memberId,
            "classroom_id" => $classId,
          ]
        ]
      ];
      RabbitMq::send("classparticipant.delete", json_encode($deletedClassMemberPayload));
    }

    $deleteClassMember = $this->classMember->remove($classId, (int)$memberId);
    if (!$deleteClassMember->success) {
      Log::error('Could not move student from one class to another - Fail to delete student from class on learning service', ["student_id" => $memberId, "current_classroom_id" => $classId, "destination_classroom_id => $request->classroom_id", "user_sso_id" => auth()->user()->id, 'response' => $deleteClassMember]);
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => "Terjadi kesalahan silakan coba lagi nanti"
      ]);
      return redirect(route('kelas.member.index', $classId));
    }

    $createClassMember = $this->classMember->addStudentToClass((int)$memberId, $request->classroom_id);
    if ($createClassMember->success == true) {
      // Update student branch code to destination classroom's branch code
      // When destination classroom is an offline class
      if (!$isDestinationClassroomIsAnOnlineClassroom) {
        $updateStudentBranchCodeResponse = $this->internalService->updateStudentBranchCode($memberId, $destinationClassroom->branch_code);
        if (!$updateStudentBranchCodeResponse->successful()) {
          Log::error("Fail on updating student branch code", [
            "payloadInfo" => ["student_id" => $memberId, "current_classroom_id" => $classId, "destination_classroom_id => $request->classroom_id", "user_sso_id" => auth()->user()->id],
            "requestBody" => ["smartbtw_id" => $memberId, 'branch_code' => $destinationClassroom->branch_code],
            "responseBody" => json_decode($updateStudentBranchCodeResponse->body()),
            "responseStatus" => $updateStudentBranchCodeResponse->status()
          ]);
        }
      } else {
        $addParticipantPayload = [
          "version" => 1,
          "data" => [
            "classroom_id" => $request->classroom_id,
            "smartbtw_id" => $studentProfileBody->id,
            "name" => $studentProfileBody->nama_lengkap,
            "email" => $studentProfileBody->email,
            "zoom_email" => $studentProfileBody->email,
            "role" => "PARTICIPANT",
            "status" => "APPROVED"
          ]
        ];
        RabbitMq::send("onlineclass-participant.created", json_encode($addParticipantPayload));
      }

      // Send class-member.updated topic to message broker
      $updatedClassMemberPayload = [
        "version" => 1,
        "data" => [
          "smartbtw_id" => (int)$memberId,
          "classroom_id_before" => $classId,
          "classroom_id_after" => $request->classroom_id
        ]
      ];
      RabbitMq::send("class-member.updated", json_encode($updatedClassMemberPayload));
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data berhasil diupdate'
      ]);
    } else {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => "Terjadi kesalahan silakan coba lagi nanti"
      ]);
    }
    return redirect(route('kelas.member.index', $classId));
  }

  public function updateZoomEmail(Request $request, $classId, $memberId)
  {
    $class = $this->classroom->getSingle($classId);
    $members = $this->classMember->getByClassroomId(classroom_id: $classId);
    $member = array_values(array_filter($members, function ($value) use ($memberId) {
      return $value->smartbtw_id == $memberId;
    }));
    $member = $member[0];
    $eventPayload = [
      "version" => 1,
      "data" => [
        "smartbtw_id" => $member->smartbtw_id,
        "zoom_email" => $request->zoom_email
      ]
    ];
    RabbitMq::send('classparticipant-email.updated', json_encode($eventPayload));
    $request->session()->flash('flash-message', [
      'title' => 'Informasi!',
      'type' => 'info',
      'message' => 'Proses update email sedang berlangsung'
    ]);

    // if ($response->successful()) {
    //   $request->session()->flash('flash-message', [
    //     'title' => 'Berhasil!',
    //     'type' => 'success',
    //     'message' => 'Data berhasil diupdate'
    //   ]);
    // } else {
    //   $request->session()->flash('flash-message', [
    //     'title' => 'Error!',
    //     'type' => 'error',
    //     'message' => $response->data->messages
    //   ]);
    // }
    return redirect(route('kelas.member.index', $classId));
  }

  public function deleteMember(Request $request, $classId, $memberId)
  {
    $currentClassroom = $this->classroom->getSingle($classId);
    if (!$currentClassroom) {
      Log::error('Could not remove class member from a classroom - $currentClassroom data is not found', ["student_id" => $memberId, "classroom_id" => $classId, "user_sso_id" => auth()->user()->id]);
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => "Terjadi kesalahan silakan coba lagi nanti"
      ]);
      return redirect()->back();
    }

    $isOnlineClassroom = property_exists($currentClassroom, "is_online") && $currentClassroom?->is_online;
    $response = $this->classMember->remove($classId, $memberId);
    if ($response->success == true) {
      // Send class-member.deleted topic to message broker
      $deletedClassMemberPayload = [
        "version" => 1,
        "data" => [
          "smartbtw_id" => (int)$memberId,
          "classroom_id" => $classId,
        ]
      ];
      RabbitMq::send("class-member.deleted", json_encode($deletedClassMemberPayload));
      if ($isOnlineClassroom) {
        $deletedClassMemberPayload = [
          "version" => 1,
          "data" => [
            [
              "smartbtw_id" => (int)$memberId,
              "classroom_id" => $classId,
            ]
          ]
        ];
        RabbitMq::send("classparticipant.delete", json_encode($deletedClassMemberPayload));
      }
      $request->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Siswa berhasil dihapus dari kelas'
      ]);
    } else {
      $request->session()->flash('flash-message', [
        'title' => 'Error!',
        'type' => 'error',
        'message' => $response->messages[0]
      ]);
    }
    return redirect()->back();
  }

  public function getAuthenticatedUserBranchCode()
  {
    $branch_code = auth()->user()->branch_code;
    $auth_user_roles = auth()->user()->roles;

    $is_user_pusat = !$branch_code || $branch_code == "PT0000";

    $is_mentor = in_array("mentor", $auth_user_roles) && count($auth_user_roles) == 1;
    $is_kepala_cabang = in_array("kepala_cabang", $auth_user_roles) && count($auth_user_roles) == 1;
    $is_admin_cabang = in_array("admin_cabang", $auth_user_roles) && count($auth_user_roles) == 1;

    if (!$is_user_pusat) {
      if ($is_kepala_cabang || $is_admin_cabang) $branches = $this->branch->getMultipleBranches($branch_code);
      else $branches = $this->branch->getBranchByCode($branch_code);
    } else {
      if (!$is_mentor) $branches = $this->branch->getBranchs();
      else {
        $branches = [];
        $mentorSchedules = collect($this->schedule->getByRoles());
        $branch_codes = ($mentorSchedules->unique('branch_code')->pluck('branch_code')->sort()->toArray());
        foreach ($branch_codes as $code) {
          $branches[] = $this->branch->getBranchByCode($code);
        }
      }
    }
    return $branches;
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
      case "tps":
        return ["Potensi Kognitif", "Penalaran Matematika", "Literasi Bahasa Indonesia", "Literasi Bahasa Inggris"];
        break;
      default:
        return [];
        break;
    }
  }

  private function downloadStudentIRTReport($studentId, $examType)
  {
    $program = "tps";
    $studentResult = $this->result->getIRTSummary([$studentId], $program, $examType);
    if (($studentResult && $studentResult[0]->done > 0)) {
      $startDate = Carbon::now()->subWeek()->format('Y-m-d');
      $endDate = Carbon::now()->format('Y-m-d');
      $payload = [
        'user' => $studentResult[0]->student,
        'report' => $studentResult[0],
        'program' => $program,
        'program_title' => implode(' ', explode('-', $program)),
        'start_date' => $startDate,
        'end_date' => $endDate,
        'is_last_week_report' => false
      ];

      $html = view("pages.student-result.print-irt-tryout-report", $payload);
      $pdf  = SnappyPdf::loadHTML($html)
        ->setPaper('a4')
        ->setOrientation('landscape')
        ->setOption('margin-top', 0)
        ->setOption('margin-left', 0)
        ->setOption('margin-right', 0)
        ->setOption('margin-bottom', 0);
      return $pdf->stream("irt_report_" . "$studentId" . ".pdf");
    }
  }
}

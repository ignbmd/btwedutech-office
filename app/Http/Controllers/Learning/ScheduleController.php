<?php

namespace App\Http\Controllers\Learning;

use App\Helpers\Breadcrumb;
use App\Helpers\RabbitMq;
use App\Helpers\UserRole;
use App\Helpers\Zoom;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Jobs\SendScheduleUpdateNotification;
use App\Services\ApiGatewayService\Internal;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\Schedule;
use App\Services\LearningService\Teacher;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\OnlineClassMeeting;
use App\Services\StudyMaterialService\Material;
use App\Services\ZoomAPIService\User;
use App\Services\ZoomAPIService\Meeting;
use App\Services\SSOService\SSO;
use App\Services\OnlineClassService\OnlineSchedule;
use App\Services\ExamService\StudyMaterial;
use App\Services\ExamCPNSService\StudyMaterial as CPNSStudyMaterial;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{

  private ClassRoom $classService;
  private ClassMember $classMemberService;
  private Schedule $scheduleService;
  private Teacher $teacherService;
  private Material $materialService;
  private OnlineClassMeeting $onlineClassMeetingService;
  private Internal $internalService;
  private Branch $branchService;
  private User $zoomUserService;
  private Meeting $zoomMeetingService;
  private SSO $ssoService;
  private OnlineSchedule $onlineScheduleService;
  private StudyMaterial $studyMaterialService;
  private CPNSStudyMaterial $cpnsStudyMaterialService;

  public function __construct(
    ClassRoom $classService,
    ClassMember $classMemberService,
    Schedule $scheduleService,
    Teacher $teacherService,
    Material $materialService,
    OnlineClassMeeting $onlineClassMeetingService,
    Internal $internalService,
    Branch $branchService,
    User $zoomUserService,
    Meeting $zoomMeetingService,
    SSO $ssoService,
    OnlineSchedule $onlineScheduleService,
    StudyMaterial $studyMaterialService,
    CPNSStudyMaterial $cpnsStudyMaterialService
  ) {
    $this->classService = $classService;
    $this->classMemberService = $classMemberService;
    $this->scheduleService = $scheduleService;
    $this->teacherService = $teacherService;
    $this->materialService = $materialService;
    $this->onlineClassMeetingService = $onlineClassMeetingService;
    $this->internalService = $internalService;
    $this->branchService = $branchService;
    $this->zoomUserService = $zoomUserService;
    $this->zoomMeetingService = $zoomMeetingService;
    $this->ssoService = $ssoService;
    $this->onlineScheduleService = $onlineScheduleService;
    $this->studyMaterialService = $studyMaterialService;
    $this->cpnsStudyMaterialService = $cpnsStudyMaterialService;
    Breadcrumb::setFirstBreadcrumb('Pembelajaran', 'pembelajaran');
  }

  public function showSchedule(Request $request, $classId)
  {
    $user = collect(Auth::user())->first();
    $allowed = UserRole::getAllowed('roles.learning_schedule');
    $classSummary = $this->classService->getSingleSummary($classId);
    $class = $this->classService->getSingle($classId);
    $isOnlineClass = property_exists($class, "is_online") && $class->is_online ? 1 : 0;
    $branch = $this->branchService->getBranchByCode($class->branch_code ?? '');
    $classTitle = $class?->title ?? '';
    $branchName = $branch->name ?? '';
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      ['name' => "Jadwal {$classTitle} cabang {$branchName}"],
    ];
    return view('/pages/learning/schedule/index', compact('breadcrumbs', 'classSummary', 'allowed', 'user', 'isOnlineClass'));
  }

  public function showAddSchedule(Request $request, string $classId)
  {
    $user = collect(Auth::user())->first();
    $class = $this->classService->getSingle($classId);
    $branch = $this->branchService->getBranchByCode($class->branch_code);
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      [
        'name' => "Jadwal {$class->title} cabang {$branch->name}",
        'link' => "/pembelajaran/jadwal/$classId"
      ],
      ['name' => 'Tambah Jadwal']
    ];
    return view('/pages/learning/schedule/add', compact('breadcrumbs', 'classId', 'class', 'user'));
  }

  public function showEditSchedule(Request $request, string $scheduleId)
  {
    $user = collect(Auth::user())->first();
    $schedule = $this->scheduleService->getSingle($scheduleId);
    $class = $this->classService->getSingle($schedule->classroom_id);
    $isOnlineClass = property_exists($class, "is_online") && $class->is_online;
    $isP3KClass = in_array("pppk", $class->tags) || in_array("PPPK", $class->tags);
    $isCPNSClass = in_array("cpns", $class->tags);
    $teachers = $this->teacherService->getAll(['branch_code' => Auth::user()?->branch_code, 'roles' => ['mentor']]);
    $materials = $isCPNSClass ? $this->cpnsStudyMaterialService->index() : ($isP3KClass ? $this->materialService->getAll() : $this->studyMaterialService->index());
    $materials = collect($materials)->reject(fn ($value) => property_exists($value, "deleted_at") && $value->deleted_at)->values()->toArray();
    $programs = $isCPNSClass
      ? [(object)["id" => "cpns", "text" => "SKD-CPNS"], (object)["id" => "cpns-skb", "text" => "SKB-CPNS"]]
      : $this->internalService->getPrograms();
    $branch = $this->branchService->getBranchByCode($class->branch_code);
    $topics = ['TPS', 'TKA'];
    $zoomUsers = [];
    $onlineClassMeeting = null;
    if ($isOnlineClass) {
      $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByClassScheduleID($scheduleId);
      $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? null;
      if (!$onlineClassMeeting) {
        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Terjadi Kesalahan!',
            'type' => 'error',
            'message' => 'Data jadwal kelas online tidak ditemukan'
          ]
        );
        return redirect("/pembelajaran/jadwal/$schedule->classroom_id");
      }

      $zoomMeetingResponse = $this->zoomMeetingService->getMeetingById($onlineClassMeeting->zoom_meeting_id);
      $zoomMeeting = json_decode($zoomMeetingResponse->body());

      if ($zoomMeetingResponse->successful() && $zoomMeeting->status === "started") {
        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Peringatan!',
            'type' => 'warning',
            'message' => 'Meeting sedang berlangsung, tidak dapat edit data jadwal'
          ]
        );
        return redirect("/pembelajaran/jadwal/$schedule->classroom_id");
      }

      $zoomUsersResponse = $this->zoomUserService->getUsers([]);
      $zoomUsers = json_decode($zoomUsersResponse->body());
    }

    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      [
        'name' => "Jadwal {$class->title} cabang {$branch->name}",
        'link' => "/pembelajaran/jadwal/$class->_id"
      ],
      ['name' => 'Edit Jadwal']
    ];

    $scheduleQuestionCategories = [];
    $scheduleSubQuestionCategories = [];
    $scheduleSessions = [
      [
        "label" => "1",
        "value" => "1"
      ],
      [
        "label" => "2",
        "value" => "2"
      ],
      [
        "label" => "3",
        "value" => "3"
      ],
      [
        "label" => "4",
        "value" => "4"
      ],
      [
        "label" => "5",
        "value" => "5"
      ],
      [
        "label" => "6",
        "value" => "6"
      ],
      [
        "label" => "7",
        "value" => "7"
      ],
      [
        "label" => "8",
        "value" => "8"
      ],
      [
        "label" => "9",
        "value" => "9"
      ],
      [
        "label" => "10",
        "value" => "10"
      ],
      [
        "label" => "11",
        "value" => "11"
      ],
      [
        "label" => "12",
        "value" => "12"
      ],
      [
        "label" => "13",
        "value" => "13"
      ],
      [
        "label" => "14",
        "value" => "14"
      ],
      [
        "label" => "15",
        "value" => "15"
      ],
      [
        "label" => "16",
        "value" => "16"
      ],
      [
        "label" => "17",
        "value" => "17"
      ],
      [
        "label" => "18",
        "value" => "18"
      ],
      [
        "label" => "19",
        "value" => "19"
      ],
      [
        "label" => "20",
        "value" => "20"
      ],
      [
        "label" => "21",
        "value" => "21"
      ],
      [
        "label" => "21",
        "value" => "21"
      ],
      [
        "label" => "22",
        "value" => "22"
      ],
      [
        "label" => "23",
        "value" => "23"
      ],
      [
        "label" => "24",
        "value" => "24"
      ],
    ];
    $explodedScheduleSession = explode(":", collect($schedule->topics)
      ->filter(fn ($item) => strpos($item, 'PERTEMUAN_SUB_KATEGORI:') !== false)
      ->values()
      ->first()) ?? [];
    $scheduleSession = count($explodedScheduleSession) > 0
      ? $explodedScheduleSession[count($explodedScheduleSession) - 1]
      : null;

    $scheduleQuestionCategory = null;
    $scheduleSubQuestionCategory = null;

    if ($schedule->program === "skd" || $schedule->program === "cpns") {
      $scheduleQuestionCategories = [
        [
          "label" => "TWK",
          "value" => "TWK"
        ],
        [
          "label" => "TIU",
          "value" => "TIU"
        ],
        [
          "label" => "TKP",
          "value" => "TKP"
        ],
      ];
      $explodedScheduleQuestionCategory = explode(":", collect($schedule->topics)
        ->filter(fn ($item) => strpos($item, 'KATEGORI:') !== false)
        ->values()
        ->first()) ?? [];
      $scheduleQuestionCategory = count($explodedScheduleQuestionCategory) > 0
        ? $explodedScheduleQuestionCategory[count($explodedScheduleQuestionCategory) - 1]
        : null;

      $scheduleSubQuestionCategories = [
        [
          "label" => "Nasionalisme",
          "value" => "NASIONALISME"
        ],
        [
          "label" => "Integritas",
          "value" => "INTEGRITAS"
        ],
        [
          "label" => "Bela Negara",
          "value" => "BELA_NEGARA"
        ],
        [
          "label" => "Pilar Negara",
          "value" => "PILAR_NEGARA"
        ],
        [
          "label" => "Bahasa Indonesia",
          "value" => "BAHASA_INDONESIA"
        ],
        [
          "label" => "Verbal Analogi",
          "value" => "VERBAL_ANALOGI"
        ],
        [
          "label" => "Verbal Silogisme",
          "value" => "VERBAL_SILOGISME"
        ],
        [
          "label" => "Verbal Analitis",
          "value" => "VERBAL_ANALITIS"
        ],
        [
          "label" => "Numerik Berhitung",
          "value" => "NUMERIK_BERHITUNG"
        ],
        [
          "label" => "Numerik Deret",
          "value" => "NUMERIK_DERET"
        ],
        [
          "label" => "Numerik Perbandingan",
          "value" => "NUMERIK_PERBANDINGAN"
        ],
        [
          "label" => "Numerik Soal Cerita",
          "value" => "NUMERIK_SOAL_CERITA"
        ],
        [
          "label" => "Figural Analogi",
          "value" => "FIGURAL_ANALOGI"
        ],
        [
          "label" => "Figural Serial",
          "value" => "FIGURAL_SERIAL"
        ],
        [
          "label" => "Figural Ketidaksamaan",
          "value" => "FIGURAL_KETIDAKSAMAAN"
        ],
        [
          "label" => "Pelayanan Publik",
          "value" => "PELAYANAN_PUBLIK"
        ],
        [
          "label" => "Jejaring Kerja",
          "value" => "JEJARING_KERJA"
        ],
        [
          "label" => "Sosial Budaya",
          "value" => "SOSIAL_BUDAYA"
        ],
        [
          "label" => "Profesionalisme",
          "value" => "PROFESIONALISME"
        ],
        [
          "label" => "TIK",
          "value" => "TIK"
        ],
        [
          "label" => "Anti Radikalisme",
          "value" => "ANTI_RADIKALISME"
        ],
      ];
      $explodedScheduleSubQuestionCategory = explode(":", collect($schedule->topics)
        ->filter(fn ($item) => strpos($item, 'SUB_KATEGORI:') !== false)
        ->values()
        ->first()) ?? [];
      $scheduleSubQuestionCategory = count($explodedScheduleSubQuestionCategory) > 0
        ? $explodedScheduleSubQuestionCategory[count($explodedScheduleSubQuestionCategory) - 1]
        : null;
    }
    $schedule->topics = collect($schedule->topics)->filter(function ($item) {
      return !preg_match('/^(KATEGORI:|SUB_KATEGORI:|PERTEMUAN_SUB_KATEGORI:|cpns)/i', $item);
    })->values()->toArray();
    return view(
      '/pages/learning/schedule/edit',
      compact(
        'breadcrumbs',
        'schedule',
        'teachers',
        'materials',
        'programs',
        'class',
        'topics',
        'user',
        'isOnlineClass',
        'isP3KClass',
        'onlineClassMeeting',
        'scheduleSessions',
        'scheduleQuestionCategories',
        'scheduleSubQuestionCategories',
        'scheduleSession',
        'scheduleQuestionCategory',
        'scheduleSubQuestionCategory'
      )
    );
  }

  public function updateSchedule(Request $request, $scheduleId)
  {
    $request->validate([
      "title" => 'required',
      "start_date" => 'required',
      "end_date" => 'required',
      "teacher_id" => 'required',
      "classroom_id" => 'required',
      "topics" => 'nullable',
      'material_id' => 'nullable',
      'program' => 'nullable',
    ]);

    $scheduleTags = [];
    $data = $request->all();

    $topicTags = array_filter(
      $data['topics'] ?? [],
      fn ($item) =>
      !preg_match('/^(KATEGORI:|SUB_KATEGORI:|PERTEMUAN_SUB_KATEGORI:)/i', $item)
    );

    if (array_key_exists('question_category', $data) && isset($data['question_category'])) {
      array_push($scheduleTags, 'KATEGORI:' . $data['question_category']);
    }

    if (array_key_exists('sub_question_category', $data) && isset($data['sub_question_category'])) {
      array_push($scheduleTags, 'SUB_KATEGORI:' . $data['sub_question_category']);
    }

    if (array_key_exists('session', $data) && isset($data['session'])) {
      array_push($scheduleTags, 'PERTEMUAN_SUB_KATEGORI:' . $data['session']);
    }

    $mentor = null;
    $classroom = $this->classService->getSingle($request->classroom_id);
    $isOnlineClass = property_exists($classroom, "is_online") && $classroom->is_online;
    $isBTWEdutechClass = in_array("btwedutech", $classroom->tags);
    $isCPNSClass = in_array("cpns", $classroom->tags);
    $isP3KClass = in_array("pppk", $classroom->tags) || in_array("PPPK", $classroom->tags);

    if ($isCPNSClass) array_push($topicTags, "cpns");

    $payload = array_merge(
      $request->all(),
      [
        'start_date' => $this->getTime($request->get('start_date')),
        'end_date' => $this->getTime($request->get('end_date')),
        'is_pre_test' => $request->get('is_pre_test') == 'on',
        'is_post_test' => $request->get('is_post_test') == 'on',
        'topics' => array_unique(array_merge($scheduleTags, $topicTags)),
      ]
    );

    $programTitle = [
      "skd" => "Seleksi Kompetensi Dasar (SKD)",
      "skb" => "Seleksi Kompetensi Bidang (SKB)",
      "tps" => "Tes Potensi Skolastik (TPS)",
      "pppk" => "Pegawai Pemerintah dengan Perjanjian Kerja (PPPK)",
      "utbk" => "Ujian Tulis Berbasis Komputer (UTBK)",
      "cpns" => "Seleksi Kompetensi Dasar (SKD)",
      "cpns-skb" => "Seleksi Kompetensi Bidang (SKB)"
    ];

    if ($isOnlineClass) {
      $materials = collect(
        $isCPNSClass
          ? $this->cpnsStudyMaterialService->index()
          : ($isP3KClass
            ? $this->materialService->getAll()
            : $this->studyMaterialService->index() ?? []
          )
      )
        ->reject(fn ($value) => property_exists($value, "deleted_at") && $value->deleted_at);
      $oldSchedule = $this->scheduleService->getSingle($scheduleId);
      $oldScheduleStartDate = Carbon::parse($this->getTime($oldSchedule->start_date))->locale("id")->translatedFormat("l, d F Y • H.i") . " WIB";
      $oldMaterial = $isP3KClass
        ? $materials->where('_id', $oldSchedule->material_id)->first()
        : $materials->where('id', $oldSchedule->material_id)->first();

      $oldMentor = $this->ssoService->getUser($oldSchedule->teacher_id);
      $newScheduleStartDate = Carbon::parse($payload["start_date"])->locale("id")->translatedFormat("l, d F Y • H.i") . " WIB";
      $newMaterial = $isP3KClass
        ? $materials->where('_id', $payload["material_id"])->first()
        : $materials->where('id', $payload["material_id"])->first();
      $newMentor = $this->ssoService->getUser($payload["teacher_id"]);
      $notificationPayload = [
        "class" => $classroom->title,
        "class_id" => $payload["classroom_id"],
        "old_schedule" => $oldScheduleStartDate,
        "new_schedule" => $newScheduleStartDate,
        "old_material" => $oldMaterial->title,
        "new_material" => $newMaterial->title,
        "old_program" => $programTitle[$oldSchedule->program] ?? $oldSchedule->program,
        "new_program" => $programTitle[$payload["program"]] ?? $payload["program"],
        "old_mentor_photo" => $oldMentor?->users?->profile_image ?? "-",
        "new_mentor_photo" => $newMentor?->users?->profile_image ?? "-",
        "old_mentor_name" => $oldMentor?->users?->name ?? "-",
        "new_mentor_name" => $newMentor?->users?->name ?? "-",
      ];
    }

    $response = $this->scheduleService->update(
      $scheduleId,
      $payload
    );
    $data = json_decode($response->body());
    if ($response->successful()) {
      if ($isOnlineClass) {
        $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByClassScheduleID($scheduleId);
        $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? null;
        $zoomMeetingPayload = Zoom::generateMeetingBasePayload();
        $zoomMeetingPayload["topic"] = $payload["title"];
        $zoomMeetingPayload["agenda"] = $payload["title"];
        $startDate = Carbon::parse($payload["start_date"]);
        $endDate = Carbon::parse($payload["end_date"]);

        $duration = $startDate->diffInMinutes($endDate);
        $meetingPayload["start_time"] = $startDate->format("Y-m-d\TH:i:s\Z");
        $zoomMeetingPayload["duration"] = $duration;
        $this->zoomMeetingService->update($onlineClassMeeting->zoom_meeting_id, $zoomMeetingPayload);

        $onlineClassMeetingPayload = [
          "classroom_id" => $payload["classroom_id"],
          "class_schedule_id" => $scheduleId,
          "topic" => $payload["title"],
          "duration" => $duration,
          "zoom_meeting_timezone" => "Asia/Jakarta"
        ];
        $this->onlineClassMeetingService->updatePartialByClassScheduleID($scheduleId, $onlineClassMeetingPayload);

        $onlineSchedulePayload = [
          "classroom_id" => $payload["classroom_id"],
          "class_schedule_id" => $scheduleId,
          "topic" => $payload["topics"],
          "title" => $payload["title"],
          "duration" => $duration,
          "zoom_meeting_status" => $payload["zoom_meeting_status"],
          "zoom_meeting_id" => $onlineClassMeeting->zoom_meeting_id,
          "zoom_meeting_password" => $onlineClassMeeting->zoom_meeting_password,
          "zoom_host_id" => $onlineClassMeeting->zoom_host_id,
          "zoom_host_email" => $onlineClassMeeting->zoom_host_email,
          "zoom_join_url" => $onlineClassMeeting->zoom_join_url,
          "zoom_meeting_timezone" => "Asia/Jakarta",
          "material_id" => $payload["material_id"],
          "mentor_sso_id" => $payload["teacher_id"],
          "start_date" => $startDate,
          "end_date" => $endDate,
          "mentor_name" => $newMentor?->users?->name ?? "-",
          "mentor_picture" => $newMentor?->users?->profile_image ?? "-",
          "program" => $payload["program"]
        ];
        $this->onlineScheduleService->update($scheduleId, $onlineSchedulePayload);

        $classMembers = collect($this->classMemberService->getByClassroomId($classroom->_id));
        if (count($classMembers) > 0) {
          SendScheduleUpdateNotification::dispatch($classMembers, $notificationPayload);
        }
      }

      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Update jadwal berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Update jadwal gagal. coba lagi nanti'
        ]
      );
    }

    if (!$data->success) {
      redirect()
        ->back()
        ->withErrors(['update' => 'Failed to update']);
    }

    return redirect("/pembelajaran/jadwal/{$data->data->classroom_id}")
      ->with('message', 'Update succeed');
  }

  public function showMeetingRegistrant(Request $request, $scheduleId)
  {
    // Get online class meeting data
    $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByClassScheduleID($scheduleId);
    $onlineClassMeetingBody = json_decode($onlineClassMeetingResponse->body())?->data ?? null;
    if (!$onlineClassMeetingBody) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data meeting kelas online tidak ditemukan'
        ]
      );
      return redirect()->back();
    }
    // Get classroom data from online class meeting's classroom_id
    // Make sure classroom type is online_class
    $classroom = $this->classService->getSingle($onlineClassMeetingBody->classroom_id);

    if (!$classroom) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data kelas tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    if (!$classroom->is_online) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Kelas ini bukan merupakan kelas online'
        ]
      );
      return redirect()->back();
    }

    $schedule = $this->scheduleService->getSingle($scheduleId);
    if (!$schedule) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data jadwal tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    // Get meeting data from zoom API
    // Make sure meeting data still exist
    $meetingResponse = $this->zoomMeetingService->getMeetingById($onlineClassMeetingBody->zoom_meeting_id);
    if (!$meetingResponse->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data meeting tidak ditemukan'
        ]
      );
      return redirect()->back();
    }
    $meetingBody = json_decode($meetingResponse->body());

    $classMembers = collect($this->classMemberService->getByClassroomId($classroom->_id));
    if (count($classMembers) > 0) $classMembers = $classMembers->mapWithKeys(fn ($item, $key) => [$item->email => $item]);

    $meetingRegistrants = collect([]);
    $meetingRegistrantsStatus = $request->has('status') ? $request->get('status') : "pending";

    // Get meeting registrants for the meeting
    $meetingRegistrantResponse = $this->zoomMeetingService->getMeetingRegistrants($meetingBody->id, ["page_size" => 300, "status" => $meetingRegistrantsStatus]);
    $meetingRegistrantBody = json_decode($meetingRegistrantResponse->body());
    $meetingRegistrantStatus = $meetingRegistrantResponse->status();

    if (!$meetingRegistrantResponse->successful()) {
      Log::error("Failed on getting meeting registrants data", ["response" => $meetingRegistrantBody, "status" => $meetingRegistrantsStatus]);
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Proses gagal, silakan coba lagi nanti'
        ]
      );
      return redirect()->back();
    }
    $meetingRegistrants->push($meetingRegistrantBody->registrants);

    while ($meetingRegistrantBody->next_page_token) {
      $meetingRegistrantResponse = $this->zoomMeetingService->getMeetingRegistrants($meetingBody->id, ["page_size" => 300, "status" => $meetingRegistrantsStatus, "next_page_token" => $meetingRegistrantBody->next_page_token]);
      $meetingRegistrantBody = json_decode($meetingRegistrantResponse->body());
      $meetingRegistrantStatus = $meetingRegistrantResponse->status();

      if (!$meetingRegistrantResponse->successful()) {
        Log::error("Failed on getting meeting registrants data", ["response" => $meetingRegistrantBody, "status" => $meetingRegistrantsStatus]);
        $request->session()->flash(
          'flash-message',
          [
            'title' => 'Terjadi kesalahan!',
            'type' => 'error',
            'message' => 'Proses gagal, silakan coba lagi nanti'
          ]
        );
        return redirect()->back();
      }
      $meetingRegistrantBody = json_decode($meetingRegistrantResponse->body());
      if (!$meetingRegistrantBody->registrants) continue;
      $meetingRegistrants->push($meetingRegistrantBody->registrants);
    }

    $meetingRegistrants = $meetingRegistrants->collapse();
    $breadcrumbs = [
      ["name" => "Pembelajaran", "link" => "/pembelajaran"],
      ["name" => "Jadwal " . $classroom->title, "link" => "/pembelajaran/jadwal/$classroom->_id"],
      ["name" => "Meeting Registrant " . $schedule->title, "link" => null]
    ];
    return view('/pages/learning/schedule/index-meeting-registrants', compact('breadcrumbs', 'meetingRegistrants', 'meetingRegistrantsStatus', 'classMembers', 'scheduleId', 'meetingBody'));
  }

  public function showAddClassMemberMeetingRegistrant(Request $request, $scheduleId)
  {
    // Get schedule data
    $schedule = $this->scheduleService->getSingle($scheduleId);
    if (!$schedule) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data jadwal tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    // Get class member by schedule's classroom id
    $classMembers = $this->classMemberService->getByClassroomId($schedule->classroom_id);

    // Get schedule's online class meeting
    $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByClassScheduleID($scheduleId);
    $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? null;
    if (!$onlineClassMeeting) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data meeting kelas online tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    $classroom = $this->classService->getSingle($onlineClassMeeting->classroom_id);
    if (!$classroom) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data kelas tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    if (!$classroom->is_online) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Kelas ini bukan merupakan kelas online'
        ]
      );
      return redirect()->back();
    }

    $breadcrumbs = [
      ["name" => "Pembelajaran", "link" => "/pembelajaran"],
      ["name" => "Jadwal " . $classroom->title, "link" => "/pembelajaran/jadwal/$classroom->_id"],
      ["name" => "Meeting Registrant " . $schedule->title, "link" => "/pembelajaran/jadwal/$schedule->_id/meeting-registrant"],
      ["name" => "Tambah Registrant (Anggota Kelas)", "link" => null]
    ];
    return view('/pages/learning/schedule/create-member-registrant', compact('breadcrumbs', 'scheduleId', 'schedule', 'classMembers', 'onlineClassMeeting'));
  }

  public function showAddNonClassMemberMeetingRegistrant(Request $request, $scheduleId)
  {
    // Get schedule data
    $schedule = $this->scheduleService->getSingle($scheduleId);
    if (!$schedule) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data jadwal tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    // Get schedule's online class meeting
    $onlineClassMeetingResponse = $this->onlineClassMeetingService->getByClassScheduleID($scheduleId);
    $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? null;
    if (!$onlineClassMeeting) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data meeting kelas online tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    $classroom = $this->classService->getSingle($onlineClassMeeting->classroom_id);
    if (!$classroom) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Data kelas tidak ditemukan'
        ]
      );
      return redirect()->back();
    }

    if (!$classroom->is_online) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Terjadi kesalahan!',
          'type' => 'error',
          'message' => 'Kelas ini bukan merupakan kelas online'
        ]
      );
      return redirect()->back();
    }

    $breadcrumbs = [
      ["name" => "Pembelajaran", "link" => "/pembelajaran"],
      ["name" => "Jadwal " . $classroom->title, "link" => "/pembelajaran/jadwal/$classroom->_id"],
      ["name" => "Meeting Registrant " . $schedule->title, "link" => "/pembelajaran/jadwal/$schedule->_id/meeting-registrant"],
      ["name" => "Tambah Registrant (Non Anggota Kelas)", "link" => null]
    ];
    return view('/pages/learning/schedule/create-nonmember-registrant', compact('breadcrumbs', 'scheduleId', 'schedule', 'onlineClassMeeting'));
  }

  public function createClassMemberMeetingRegistrant(Request $request, $scheduleId)
  {
    $validator = Validator::make($request->all(), [
      "class_member" => 'required|array',
    ], [
      'class_member.required' => 'Harus diisi',
      'class_member.array' => 'Input tidak valid',
    ]);
    if ($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();
    $registrants = collect($request->get('class_member'))->map(function ($item, $key) use ($request) {
      $decodedValue = json_decode($item);
      return [
        "smartbtw_id" => $decodedValue->smartbtw_id,
        "name" => $decodedValue->name,
        "email" => $decodedValue->email,
        "zoom_email" => $decodedValue->email,
        "role" => strtoupper("PARTICIPANT"),
        "status" => "APPROVED"
      ];
    })->values()->toArray();
    $payload = [
      "version" => 1,
      "data" => [
        "schedule_id" => $scheduleId,
        "participants" => $registrants
      ]
    ];
    RabbitMq::send("onlineclass-schedule.add-participant", json_encode($payload));
    $request->session()->flash(
      'flash-message',
      [
        'title' => 'Informasi',
        'type' => 'info',
        'message' => 'Proses penambahan registrant sedang berlangsung'
      ]
    );
    return redirect("/pembelajaran/jadwal/{$scheduleId}/meeting-registrant");
  }

  public function createNonClassMemberMeetingRegistrant(Request $request, $scheduleId)
  {
    $validator = Validator::make($request->all(), [
      "first_name" => 'required',
      "last_name" => 'required',
      "email" => 'required',
      "role" => 'required',
    ], [
      'first_name.required' => 'Harus diisi',
      'last_name.required' => 'Harus diisi',
      'email.required' => 'Harus diisi',
      'role.required' => 'Harus diisi',
    ]);
    if ($validator->fails()) return redirect()->back()->withErrors($validator)->withInput();
    $payload = [
      "version" => 1,
      "data" => [
        "schedule_id" => $scheduleId,
        "participants" => [
          [
            "smartbtw_id" => null,
            "name" => $request->get('first_name') . " " . $request->get('last_name'),
            "email" => $request->get('email'),
            "zoom_email" => $request->get('email'),
            "role" => strtoupper($request->get('role')),
            "status" => "APPROVED"
          ]
        ]
      ]
    ];
    RabbitMq::send("onlineclass-schedule.add-participant", json_encode($payload));
    $request->session()->flash(
      'flash-message',
      [
        'title' => 'Informasi',
        'type' => 'info',
        'message' => 'Proses penambahan registrant sedang berlangsung'
      ]
    );
    return redirect("/pembelajaran/jadwal/{$scheduleId}/meeting-registrant");
  }

  public function approveMeetingRegistrantRegistration(Request $request, $scheduleId)
  {
    if (
      $request->has('first_name') &&
      $request->has('last_name') &&
      $request->first_name &&
      $request->last_name
    ) {
      $payload = [
        "schedule_id" => $scheduleId,
        "participants" => [
          [
            "name" => $request->get('first_name') . " " . $request->get('last_name'),
            "email" => $request->get('email'),
            "zoom_email" => $request->get('email'),
            "role" => "PARTICIPANT",
            "zoom_meeting_id" => +$request->get('meeting_id'),
            "registrant_id" => $request->get('registrant_id'),
            "status" => "approve"
          ]
        ]
      ];
      $this->onlineScheduleService->updateRegistrantStatus($payload);
    } else {
      $payload = [
        "version" => 1,
        "data" => [
          "schedule_id" => $scheduleId,
          "participants" => [
            [
              "email" => $request->email,
              "status" => "approve"
            ]
          ]
        ]
      ];
      Rabbitmq::send("onlineclass-participant.update-status", json_encode($payload));
    }
    $request->session()->flash(
      'flash-message',
      [
        'title' => 'Informasi',
        'type' => 'info',
        'message' => 'Update status participant sedang di proses'
      ]
    );
    return redirect("/pembelajaran/jadwal/{$scheduleId}/meeting-registrant");
  }

  public function denyMeetingRegistrantRegistration(Request $request, $scheduleId)
  {
    if (
      $request->has('first_name') &&
      $request->has('last_name') &&
      $request->first_name &&
      $request->last_name
    ) {
      $payload = [
        "schedule_id" => $scheduleId,
        "participants" => [
          [
            "name" => $request->get('first_name') . " " . $request->get('last_name'),
            "email" => $request->get('email'),
            "zoom_email" => $request->get('email'),
            "role" => "PARTICIPANT",
            "zoom_meeting_id" => +$request->get('meeting_id'),
            "registrant_id" => $request->get('registrant_id'),
            "status" => "deny"
          ]
        ]
      ];
      $this->onlineScheduleService->updateRegistrantStatus($payload);
    } else {
      $payload = [
        "version" => 1,
        "data" => [
          "schedule_id" => $scheduleId,
          "participants" => [
            [
              "email" => $request->email,
              "status" => "deny"
            ]
          ]
        ]
      ];
      Rabbitmq::send("onlineclass-participant.update-status", json_encode($payload));
    }
    $request->session()->flash(
      'flash-message',
      [
        'title' => 'Informasi',
        'type' => 'info',
        'message' => 'Update status participant sedang di proses'
      ]
    );
    return redirect("/pembelajaran/jadwal/{$scheduleId}/meeting-registrant");
  }

  public function cancelMeetingRegistrantRegistration(Request $request, $scheduleId)
  {
    $payload = [
      "version" => 1,
      "data" => [
        "schedule_id" => $scheduleId,
        "participants" => [
          [
            "email" => $request->email,
            "status" => "cancel"
          ]
        ]
      ]
    ];
    Rabbitmq::send("onlineclass-participant.update-status", json_encode($payload));
    $request->session()->flash(
      'flash-message',
      [
        'title' => 'Informasi',
        'type' => 'info',
        'message' => 'Update status participant sedang di proses'
      ]
    );
    return redirect("/pembelajaran/jadwal/{$scheduleId}/meeting-registrant");
  }

  private function getTime($time)
  {
    return (new Carbon($time))
      ->setTimezone(config('app.timezone'))
      ->format('Y-m-d H:i:s');
  }
}

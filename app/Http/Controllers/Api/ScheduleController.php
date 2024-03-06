<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LearningService\Schedule;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\OnlineClassMeeting;
use App\Services\ZoomAPIService\Meeting;
use App\Services\SSOService\SSO;
use App\Services\OnlineClassService\OnlineSchedule;
use App\Services\OnlineClassService\ClassParticipant;

use App\Helpers\RabbitMq;
use App\Jobs\CreateClassParticipant;
use App\Jobs\RegisterAdditionalMembers;
use App\Jobs\RegisterClassMembers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{

  private Schedule $service;
  private Classroom $learningClassroomService;
  private Classmember $learningClassMemberService;
  private Meeting $zoomMeetingService;
  private OnlineClassMeeting $learningOnlineClassMeetingService;
  private SSO $ssoService;
  private OnlineSchedule $onlineScheduleService;
  private ClassParticipant $classParticipantService;

  public function __construct(
    Schedule $scheduleService,
    Classroom $learningClassroomService,
    Classmember $learningClassMemberService,
    Meeting $zoomMeetingService,
    OnlineClassMeeting $learningOnlineClassMeetingService,
    SSO $ssoService,
    OnlineSchedule $onlineScheduleService,
    ClassParticipant $classParticipantService
  ) {
    $this->service = $scheduleService;
    $this->learningClassroomService = $learningClassroomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->zoomMeetingService = $zoomMeetingService;
    $this->learningOnlineClassMeetingService = $learningOnlineClassMeetingService;
    $this->ssoService = $ssoService;
    $this->onlineScheduleService = $onlineScheduleService;
    $this->classParticipantService = $classParticipantService;
  }

  public function getAll(Request $request)
  {
    $this->validate($request, [
      'classroom_id' => 'required',
    ]);

    $query = [
      'classroom_id' => $request->get('classroom_id'),
      'branch_code' => Auth::user()?->branch_code
    ];
    $data = $this->service->getByRoles($query);
    return response()->json(['data' => $data]);
  }

  public function getCalendar(Request $request)
  {
    $this->validate($request, [
      'classroom_id' => 'required',
    ]);
    $query = [
      'classroom_id' => $request->get('classroom_id'),
      'branch_code' => Auth::user()?->branch_code,
    ];
    $data = $this->service->getCalendarByRoles($query);
    return response()->json($data);
  }

  public function getWithStudent(Request $request, string $scheduleId)
  {
    $data = $this->service->getScheduleWithStudent($scheduleId);
    return response()->json($data);
  }

  public function createMany(Request $request)
  {
    $this->validate($request, [
      'schedules' => 'required',
      'schedules.*.title' => 'required',
      'schedules.*.classroom_id' => 'required',
      'schedules.*.teacher_id' => 'required',
      'schedules.*.start_date' => 'required',
      'schedules.*.end_date' => 'required|after:start_date',
      'schedules.*.topics' => 'nullable',
    ]);
    $schedules = $request->get('schedules');

    $authenticationException = [];
    $registrantPayload = [];
    $meetingPayload = [];
    $mentor = null;

    $classroom = $this->learningClassroomService->getSingle($schedules[0]["classroom_id"]);
    $isOnlineClassroom = property_exists($classroom, "is_online") && $classroom?->is_online;

    if ($isOnlineClassroom) $mentor = $this->ssoService->getUser($schedules[0]["teacher_id"]);
    $classMember = $this->learningClassMemberService->getByClassroomId($classroom->_id);

    $classParticipantsResponse = $this->classParticipantService->getByClassroomID($classroom->_id);
    $classParticipants = json_decode($classParticipantsResponse->body())?->data ?? [];

    $startDate = Carbon::parse($schedules[0]["start_date"]);
    $endDate = Carbon::parse($schedules[0]["end_date"]);
    $duration = $startDate->diffInMinutes($endDate);

    $response = $this->service->createMany($request->get('schedules'));
    $data = json_decode($response->body());

    if ($response->successful()) {

      if ($isOnlineClassroom) {

        // Create zoom meeting for each schedule
        foreach ($data?->data as $index => $schedule) {
          $meetingPayload = $this->generateZoomMeetingBasePayload();
          $meetingPayload["topic"] = $schedule->title;
          $meetingPayload["agenda"] = $schedule->title;

          $startDate = Carbon::parse($schedule?->start_date);
          $endDate = Carbon::parse($schedule?->end_date);
          $duration = $startDate->diffInMinutes($endDate);
          $meetingPayload["start_time"] = $startDate->format("Y-m-d\TH:i:s\Z");
          $meetingPayload["duration"] = $duration;
          if ($schedules[$index]["is_require_passcode"] && $schedules[$index]["zoom_passcode"]) $meetingPayload["password"] = $schedules[$index]["zoom_passcode"];

          if ($schedules[$index]["create_new_zoom_meeting"]) {
            $zoomResponse = $this->zoomMeetingService->create($schedules[$index]["zoom_host_id"], $meetingPayload);
            $zoomBody = json_decode($zoomResponse->body());
            $zoomStatus = $zoomResponse->status();

            if (!$zoomResponse->successful()) {
              Log::error("Error on creating zoom meeting", ["body" => $zoomBody, "status" => $zoomStatus]);
              return response()->json($zoomBody, $zoomStatus);
            }

            $onlineClassMeetingPayload = [
              "classroom_id" => $schedule->classroom_id,
              "class_schedule_id" => $schedule->_id,
              "topic" => $schedule->title,
              "duration" => $duration,
              "zoom_host_id" => $zoomBody->host_id,
              "zoom_host_email" => $zoomBody->host_email,
              "zoom_meeting_id" => $zoomBody->id,
              "zoom_join_url" => $zoomBody->join_url,
              "zoom_meeting_timezone" => "Asia/Jakarta",
              "zoom_meeting_password" => $schedules[$index]["zoom_passcode"] ?? null
            ];

            $onlineSchedulePayload = [
              "classroom_id" => $schedule->classroom_id,
              "class_schedule_id" => $schedule->_id,
              "topic" => $schedules[0]["topics"],
              "title" => $schedules[0]["title"],
              "duration" => $duration,
              "zoom_meeting_status" => "WAITING",
              "zoom_meeting_id" => $zoomBody->id,
              "zoom_meeting_password" => $schedules[0]["is_require_passcode"] ? $schedules[0]["zoom_passcode"] : null,
              "zoom_host_id" => $zoomBody->host_id,
              "zoom_host_email" => $zoomBody->host_email,
              "zoom_join_url" => $zoomBody->join_url,
              "zoom_meeting_timezone" => "Asia/Jakarta",
              "start_date" => $startDate,
              "end_date" => $endDate,
              "material_id" => $schedules[0]["material_id"],
              "mentor_sso_id" => $schedules[0]["teacher_id"],
              "mentor_name" => $mentor?->users?->name ?? "-",
              "mentor_picture" => $mentor?->users?->profile_image ?? "-",
              "program" => $schedules[0]["program"]
            ];
          } else {

            $onlineClassMeetingPayload = [
              "classroom_id" => $schedule->classroom_id,
              "class_schedule_id" => $schedule->_id,
              "topic" => $schedule->title,
              "duration" => $duration,
              "zoom_host_id" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_host_id"],
              "zoom_host_email" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_host_email"],
              "zoom_meeting_id" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_meeting_id"],
              "zoom_join_url" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_join_url"],
              "zoom_meeting_timezone" => "Asia/Jakarta",
              "zoom_meeting_password" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_meeting_password"] ?? null
            ];

            $onlineSchedulePayload = [
              "classroom_id" => $schedule->classroom_id,
              "class_schedule_id" => $schedule->_id,
              "topic" => $schedules[0]["topics"],
              "title" => $schedules[0]["title"],
              "duration" => $duration,
              "zoom_meeting_status" => "WAITING",
              "zoom_meeting_id" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_meeting_id"],
              "zoom_meeting_password" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_meeting_password"] ?? null,
              "zoom_host_id" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_host_id"],
              "zoom_host_email" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_host_email"],
              "zoom_join_url" => $schedules[$index]["selected_parent_schedule"]["online_class_meeting"]["zoom_join_url"],
              "zoom_meeting_timezone" => "Asia/Jakarta",
              "start_date" => $startDate,
              "end_date" => $endDate,
              "material_id" => $schedules[0]["material_id"] ?? "-",
              "mentor_sso_id" => $mentor?->users?->id ?? "-",
              "mentor_name" => $mentor?->users?->name ?? "-",
              "mentor_picture" => $mentor?->users?->profile_image ?? "-",
              "program" => $schedules[0]["program"]
            ];
          }
          $this->learningOnlineClassMeetingService->create($onlineClassMeetingPayload);
          $this->onlineScheduleService->create($onlineSchedulePayload);

          if ($isOnlineClassroom && count($classParticipants) != 0) {
            RegisterClassMembers::dispatch($classParticipants, $schedule);
          }

          // Add additional email as meeting registrant (branch moderators & mentor)
          if ($isOnlineClassroom && $schedules[$index]["create_new_zoom_meeting"]) {
            // 1st batch (1-30)
            $additionalParticipants = [
              // Start of sanur branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Front Office BTW",
                "email" => "frontofficebtw@gmail.com",
                "zoom_email" => "frontofficebtw@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Ni Kadek Tari",
                "email" => "tarike5189@gmail.com",
                "zoom_email" => "tarike5189@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Kadek Ari Pradnyani",
                "email" => "aripradnyani2504.ap@gmail.com",
                "zoom_email" => "aripradnyani2504.ap@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of sanur branch moderators
              // Start of gianyar branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Made Angga Cahyadinata",
                "email" => "anggacahya40@gmail.com",
                "zoom_email" => "anggacahya40@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Ni Putu Ekayanti Muliartini",
                "email" => "putuyanti93@gmail.com",
                "zoom_email" => "putuyanti93@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "kadek ayu puspita dewi",
                "email" => "kadekayupuspitadewi542@gmail.com",
                "zoom_email" => "kadekayupuspitadewi542@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of gianyar branch moderators
              // Start of mengwi branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Ni Made Nonik Sulistiawati",
                "email" => "madenonikk@gmail.com",
                "zoom_email" => "madenonikk@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Gusti Ayu Made Dita Dwi Cahyani",
                "email" => "ditacahyani028@gmail.com",
                "zoom_email" => "ditacahyani028@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "BTW Mengwi",
                "email" => "mengwi@btwedutech.com",
                "zoom_email" => "mengwi@btwedutech.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of mengwi branch moderators
              // Start of buleleng branch moderators
              [
                "smartbtw_id" => null,
                "name" => "BTW Singaraja",
                "email" => "singaraja@btwedutech.com",
                "zoom_email" => "singaraja@btwedutech.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Ketut Readiartha Nuansaparasmitha",
                "email" => "ketutreadiarta99@gmail.com",
                "zoom_email" => "ketutreadiarta99@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Luh Putu Oki Krisna Dewi",
                "email" => "okimybusiness@gmail.com",
                "zoom_email" => "okimybusiness@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Mega Tri Wahyuni",
                "email" => "megatriw02@gmail.com",
                "zoom_email" => "megatriw02@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of buleleng branch moderators
              // Start of lampung branch moderators
              [
                "smartbtw_id" => null,
                "name" => "BTW Lampung",
                "email" => "lampung@btwedutech.com",
                "zoom_email" => "lampung@btwedutech.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of lampung branch moderators
              // Start of magelang branch moderators
              [
                "smartbtw_id" => null,
                "name" => "BTW Magelang",
                "email" => "magelang@btwedutech.com",
                "zoom_email" => "magelang@btwedutech.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Ridwan",
                "email" => "bimbelbtwmgl@gmail.com",
                "zoom_email" => "bimbelbtwmgl@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of magelang branch moderators
              // Start of palu branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Moh. Ikra Ardiansyah",
                "email" => "mohammadikraardiansyah@gmail.com",
                "zoom_email" => "mohammadikraardiansyah@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of palu branch moderators
              // Start of tegal branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Bella",
                "email" => "ameliabellapuspita93@gmail.com",
                "zoom_email" => "ameliabellapuspita93@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of tegal branch moderators
              // Start of rembang branch moderators
              [
                "smartbtw_id" => null,
                "name" => "BTW Rembang",
                "email" => "rembang@btwedutech.com",
                "zoom_email" => "rembang@btwedutech.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Marsha Alfira Amartya Putri",
                "email" => "marshaalfira1@gmail.com",
                "zoom_email" => "marshaalfira1@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Azizatul Maghfiroh",
                "email" => "azizahaf690@gmail.com",
                "zoom_email" => "azizahaf690@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of rembang branch moderators
              // Start of semarang branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Tika",
                "email" => "btwsemarang@gmail.com",
                "zoom_email" => "btwsemarang@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of semarang branch moderators
              // Start of surakarta branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Susi",
                "email" => "susi.amandaru@gmail.com",
                "zoom_email" => "susi.amandaru@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of surakarta branch moderators
              // Start of jembrana branch moderators
              [
                "smartbtw_id" => null,
                "name" => "I Putu Wahyu Adi Kartika",
                "email" => "wahyuadikartika13@gmail.com",
                "zoom_email" => "wahyuadikartika13@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "G.A Mirah Putri Lestari",
                "email" => "mirahputrriiz@gmail.com",
                "zoom_email" => "mirahputrriiz@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of jembrana branch moderators
              // Start of karangasem branch moderators
              [
                "smartbtw_id" => null,
                "name" => "I Komang Adi Gustiana",
                "email" => "gustianaadi@gmail.com",
                "zoom_email" => "gustianaadi@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "BTW Amlapura",
                "email" => "bimbelbtwamlapura@gmail.com",
                "zoom_email" => "bimbelbtwamlapura@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "NI KOMANG NANDA DWI CAHYANI",
                "email" => "nandadwicahyani2008@gmail.com",
                "zoom_email" => "nandadwicahyani2008@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of karangasem branch moderators
              // Start of malang branch moderators
              [
                "smartbtw_id" => null,
                "name" => "Rahmad Budi Hermawan",
                "email" => "rahmadbudi1998@gmail.com",
                "zoom_email" => "rahmadbudi1998@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Kusuma Dyah Tantrie",
                "email" => "kusumatantri17@gmail.com",
                "zoom_email" => "kusumatantri17@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of malang branch moderators
            ];
            RegisterAdditionalMembers::dispatch($additionalParticipants, $schedule)->delay(Carbon::now()->addMinutes(8));

            // 2nd batch (31-60)
            $additionalParticipants = [
              [
                "smartbtw_id" => null,
                "name" => "Klara Saka",
                "email" => "bryleeleandre@gmail.com",
                "zoom_email" => "bryleeleandre@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "I Nengah Suki Arnada",
                "email" => "nengah_suki@yahoo.com",
                "zoom_email" => "nengah_suki@yahoo.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "I Putu Surya Adi Wiranata",
                "email" => "iputusuryaadiwiranata@gmail.com",
                "zoom_email" => "iputusuryaadiwiranata@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Suci Pramesty",
                "email" => "pramestysucimd@gmail.com",
                "zoom_email" => "pramestysucimd@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Ulandari Lestari",
                "email" => "ulandarilestari@gmail.com",
                "zoom_email" => "ulandarilestari@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Dewa Agung Aditya K",
                "email" => "dewadegungagung@gmail.com",
                "zoom_email" => "dewadegungagung@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Eka Pradnya",
                "email" => "says.eka@gmail.com",
                "zoom_email" => "says.eka@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Erwin Kurniawan",
                "email" => "erwinyasa1@gmail.com",
                "zoom_email" => "erwinyasa1@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "M. Wisnawa",
                "email" => "mwisnawa5@gmail.com",
                "zoom_email" => "mwisnawa5@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Indria",
                "email" => "aaindria@gmail.com",
                "zoom_email" => "aaindria@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // Start of additional lampung branch moderator
              [
                "smartbtw_id" => null,
                "name" => "Desrio",
                "email" => "desrioays@gmail.com",
                "zoom_email" => "desrioays@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "WINDA SEPTINA",
                "email" => "windaseptina999@gmail.com",
                "zoom_email" => "windaseptina999@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "TARISSYA MAHARSASTI",
                "email" => "tareesyaams@gmail.com",
                "zoom_email" => "tareesyaams@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Audry Frisca Rosa",
                "email" => "afriscarosa@gmail.com",
                "zoom_email" => "afriscarosa@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Indah Febriyani",
                "email" => "indahfebriyani32@gmail.com",
                "zoom_email" => "indahfebriyani32@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Wiwin Kurniawan",
                "email" => "wiwinkurniawan86@gmail.com",
                "zoom_email" => "wiwinkurniawan86@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Yeti Apriani",
                "email" => "yetiapriani84@gmail.com",
                "zoom_email" => "yetiapriani84@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Iwang Kuswani",
                "email" => "iwangkuswani34@gmail.com",
                "zoom_email" => "iwangkuswani34@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Diki fernandi",
                "email" => "dikifernandi0@gmail.com",
                "zoom_email" => "dikifernandi0@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Sulthan Fadhil",
                "email" => "sulthanfadhil26@gmail.com",
                "zoom_email" => "sulthanfadhil26@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of additional lampung branch moderator
              // Start of additional bekasi branch moderator
              [
                "smartbtw_id" => null,
                "name" => "WELLYNTHON AGUSTINUS BUNTPSINDO SITANGGANG",
                "email" => "agustinuz8@gmail.com",
                "zoom_email" => "agustinuz8@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "BELA OCHOTANIA",
                "email" => "ochotania12@gmail.com",
                "zoom_email" => "ochotania12@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "BTW Bekasi",
                "email" => "btwbekasi22@gmail.com",
                "zoom_email" => "btwbekasi22@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              // End of additional bekasi branch moderator
              [
                "smartbtw_id" => null,
                "name" => "Muhamad Hafiz Azdam",
                "email" => "azdamhafidz5900@gmail.com",
                "zoom_email" => "azdamhafidz5900@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Rizki Wijaya",
                "email" => "rizki@btwedutech.com",
                "zoom_email" => "rizki@btwedutech.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Mohammad Fatchulhadi",
                "email" => "m.fatchoel15@gmail.com",
                "zoom_email" => "m.fatchoel15@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "ANGELINA",
                "email" => "ragilangelinalina@gmail.com",
                "zoom_email" => "ragilangelinalina@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Faiz",
                "email" => "faizlhq98@gmail.com",
                "zoom_email" => "faizlhq98@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "I Made Adnyana",
                "email" => "adnyana71@gmail.com",
                "zoom_email" => "adnyana71@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Wiwin Suryantari",
                "email" => "wiwinsuryantari88@gmail.com",
                "zoom_email" => "wiwinsuryantari88@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
            ];
            RegisterAdditionalMembers::dispatch($additionalParticipants, $schedule)->delay(Carbon::now()->addMinutes(8)->addSeconds(15));

            // 3rd batch (61-90)
            $additionalParticipants = [
              [
                "smartbtw_id" => null,
                "name" => "Agus Saputra",
                "email" => "saputraagus160895@gmail.com",
                "zoom_email" => "saputraagus160895@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "Dewa Made Agustawan",
                "email" => "dewamadeagustawan.98@gmail.com",
                "zoom_email" => "dewamadeagustawan.98@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "I Nengah Suki Arnada",
                "email" => "nengahsuki@gmail.com",
                "zoom_email" => "nengahsuki@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "I Putu Indra Artha Diantara",
                "email" => "arthadiantara@gmail.com",
                "zoom_email" => "arthadiantara@gmail.com",
                "role" => "MENTOR",
                "status" => "APPROVED"
              ],
              [
                "smartbtw_id" => null,
                "name" => "M. Wisnawa",
                "email" => "bimwisnawa@gmail.com",
                "zoom_email" => "bimwisnawa@gmail.com",
                "role" => "MODERATOR",
                "status" => "APPROVED"
              ],
            ];
            RegisterAdditionalMembers::dispatch($additionalParticipants, $schedule)->delay(Carbon::now()->addMinutes(8)->addSeconds(30));
          }
        }
      }

      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Menambah jadwal berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          // 'message' => 'Menambah jadwal gagal. coba lagi nanti',
          'message' => json_encode($data),
        ]
      );
    }
    return response()->json($data);
  }

  public function create(Request $request)
  {
    $this->validate($request, [
      "title" => 'required',
      "start_date" => 'required',
      "end_date" => 'required',
      "teacher_id" => 'required',
      "classroom_id" => 'required',
      "topics" => 'nullable',
      'material_id' => 'required',
      'program' => 'required',
    ]);
    $response = $this->service->create($request->all());
    $data = json_decode($response->body());
    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Menambah jadwal berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Mebambah jadwal gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data);
  }

  public function update(Request $request, string $scheduleId)
  {
    $response = $this->service->update($scheduleId, $request->all());
    $data = json_decode($response->body());
    if ($response->successful()) {
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
    return response()->json($data);
  }

  public function delete(Request $request, string $scheduleId)
  {
    $onlineClassMeetingResponse = $this->learningOnlineClassMeetingService->getByClassScheduleID($scheduleId);
    $onlineClassMeetingBody = json_decode($onlineClassMeetingResponse->body()) ?? [];
    $zoomMeetingId = $onlineClassMeetingBody?->data?->zoom_meeting_id ?? null;

    if ($zoomMeetingId) {
      $this->learningOnlineClassMeetingService->deleteByClassScheduleID($scheduleId);
      RabbitMq::send("onlineclass-schedule.deleted", json_encode([
        "version" => 1,
        "data" => [
          "schedule_id" => $scheduleId
        ],
      ]));
    }

    $response = $this->service->delete($scheduleId);
    $data = json_decode($response->body());

    if ($response->successful()) {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Hapus jadwal berhasil'
        ]
      );
    } else {
      $request->session()->flash(
        'flash-message',
        [
          'title' => 'Gagal!',
          'type' => 'error',
          'message' => 'Hapus jadwal gagal. coba lagi nanti'
        ]
      );
    }
    return response()->json($data);
  }

  private function getTime($time)
  {
    return (new Carbon($time))
      ->setTimezone(config('app.timezone'))
      ->format('Y-m-d H:i:s');
  }

  private function generateZoomMeetingBasePayload()
  {
    return [
      "timezone" => "Asia/Jakarta",
      "type" => 2,
      "default_password" => false,
      "pre_schedule" => false,
      "settings" => [
        "allow_multiple_devices" => true,
        "alternative_hosts_email_notification" => true,
        "meeting_authentication" => true,
        "authentication_option" => "vrel_-MqTHqzyIvUUw10wQ",
        "authentication_name" => "Invitees Only",
        "approval_type" => 1, // Manually approve registration
        "registration_type" => 1, // Attendees must register for each meeting occurrence.
        "registrant_confirmation_email" => false,
        "registrant_email_notification" => false,
        "audio" => "both",
        "auto_recording" => "none",
        "close_registration" => false,
        "encryption_type" => "enhanced_encryption",
        "focus_mode" => true,
        "join_before_host" => false,
        "mute_upon_entry" => true,
        "participant_video" => false,
        "private_meeting" => false,
        "show_share_button" => false,
        "use_pmi" => false,
        "watermark" => false,
        "host_save_video_order" => true,
      ],
    ];
  }
}

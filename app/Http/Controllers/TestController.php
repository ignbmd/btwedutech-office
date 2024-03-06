<?php

namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Collection;
// use App\Services\LearningService\ClassRoom;
// use App\Services\LearningService\ClassMember;
// use App\Services\LearningService\Schedule;
// use App\Services\LearningService\OnlineClassMeeting;
// use App\Services\ExamService\TryoutCode;
// use App\Services\LearningService\Student;
// use App\Services\StudentResultService\ClassroomResult;
// use App\Services\ProfileService\Profile;
// use App\Services\ZoomAPIService\Meeting;
// use App\Services\OnlineClassService\OnlineSchedule;
// use App\Services\OnlineClassService\ClassParticipant;
// use App\Services\OnlineClassService\OnlineAttendance;
// use App\Services\ApiGatewayService\Internal;
use App\Services\SSOService\SSO;
// use Illuminate\Support\Str;
// use Illuminate\Support\Facades\Log;
// use Carbon\Carbon;
// use App\Helpers\RabbitMq;
// use App\Helpers\Redis;
// use App\Helpers\Bill;
// use App\Services\StudentResultService\Ranking;
// use Error;

class TestController extends Controller
{
  // private Classroom $learningClassroomService;
  // private ClassMember $learningClassMemberService;
  // private Schedule $learningScheduleService;
  // private OnlineClassMeeting $learningOcmService;
  // private TryoutCode $examTryoutCodeService;
  // private Student $learningStudentService;
  // private ClassroomResult $classroomResultService;
  // private Profile $profileService;
  // private Meeting $zoomMeetingService;
  // private OnlineSchedule $onlineScheduleService;
  // private OnlineAttendance $onlineAttendanceService;
  // private ClassParticipant $classParticipantService;
  // private Internal $apiGatewayService;

  private SSO $ssoService;

  public function __construct(
    // Classroom $learningClassroomService,
    // ClassMember $learningClassMemberService,
    // Schedule $learningScheduleService,
    // OnlineClassMeeting $learningOcmService,
    // TryoutCode $examTryoutCodeService,
    // Student $learningStudentService,
    // ClassroomResult $classroomResultService,
    // Profile $profileService,
    // Meeting $zoomMeetingService,
    // OnlineSchedule $onlineScheduleService,
    // OnlineAttendance $onlineAttendanceService,
    // ClassParticipant $classParticipantService,
    // Internal $apiGatewayService
    SSO $ssoService
  ) {
    // $this->learningClassroomService = $learningClassroomService;
    // $this->learningClassMemberService = $learningClassMemberService;
    // $this->learningOcmService = $learningOcmService;
    // $this->learningScheduleService = $learningScheduleService;
    // $this->examTryoutCodeService = $examTryoutCodeService;
    // $this->learningStudentService = $learningStudentService;
    // $this->classroomResultService = $classroomResultService;
    // $this->profileService = $profileService;
    // $this->zoomMeetingService = $zoomMeetingService;
    // $this->onlineScheduleService = $onlineScheduleService;
    // $this->onlineAttendanceService = $onlineAttendanceService;
    // $this->classParticipantService = $classParticipantService;
    // $this->apiGatewayService = $apiGatewayService;
    $this->ssoService = $ssoService;
  }

  // public function generateIntensiveClassesTryoutCodeModuleSummary()
  // {
  //   $codeCategory = env('APP_ENV') == 'dev' ? 37 : 1;
  //   $program = "skd";

  //   $getCodeCategoryTaskIdsResponse = $this->examTryoutCodeService->getTaskIdsOnly($codeCategory);
  //   $codeCategoryTaskIds = collect(json_decode($getCodeCategoryTaskIdsResponse->body())->data);
  //   if ($codeCategoryTaskIds->count() === 0) {
  //     $now = Carbon::now()->format('Y-m-d H:i:s');
  //     echo "[$now] No task ids found, make sure you have at least one code tryout that have corresponding code category. Exiting command ... \n";
  //     return;
  //   }

  //   $query = ['status' => 'ONGOING', 'year' => Carbon::now()->year, 'tags' => ["Intensif", "intensif", "INTENSIF"]];
  //   $classrooms = collect($this->learningClassroomService->getAll($query));
  //   if ($classrooms->count() === 0) {
  //     $now = Carbon::now()->format('Y-m-d H:i:s');
  //     echo "[$now] No classroom found, exiting command ... \n";
  //     return;
  //   }

  //   foreach ($classrooms as $classroom) {
  //     $moduleSummaryCacheKey = "performa_" . $classroom->_id . "_" . $codeCategory;

  //     echo "Getting $classroom->title module summary data from cache \n";
  //     echo "Getting cache value of cache key: $moduleSummaryCacheKey \n";

  //     $moduleSummary = Redis::get($moduleSummaryCacheKey);
  //     if ($moduleSummary) {
  //       echo "Cache value for key : $moduleSummaryCacheKey exists, deleting cache key... \n";
  //       Redis::delete($moduleSummaryCacheKey);
  //     }

  //     $classMembers = collect($this->learningClassMemberService->getByClassroomId($classroom->_id));
  //     if ($classMembers->count() === 0) {
  //       echo "$classroom->title doesn't have any members, skipping ... \n";
  //       continue;
  //     }

  //     echo "Setting new cache value for key: $moduleSummaryCacheKey ...\n";
  //     $studentIds = $classMembers->pluck('smartbtw_id')->toArray();
  //     $payload = json_encode([
  //       'version' => 1,
  //       'data' => [
  //         "generated_at" => Carbon::now()->format('Y-m-d H:i:s') . ' WIB',
  //         'program' => $program,
  //         'smartbtw_ids' => $studentIds,
  //         'task_ids' => $codeCategoryTaskIds,
  //         'cache_name' => $moduleSummaryCacheKey,
  //         'with_report' => true,
  //       ]
  //     ]);
  //     RabbitMq::send("code-tryout-module-summary.generate", $payload);
  //     sleep(15);
  //   }
  // }

  // public function getStudentReportSummary($program, $exam_type = null)
  // {
  // $validPrograms = ["skd", "tps_irt"];

  // if(!in_array($program, $validPrograms)) {
  //   dd("Program not valid, please type either 'skd' or 'tps_irt'");
  // }

  // $tags = ["Binsus", "BINSUS", "binsus"];
  // $classrooms = collect($this->learningClassroomService->getAll(['status' => 'ONGOING']))
  //   ->reject(fn ($data, $key) => array_intersect($data->tags, $tags))
  //   ->values()
  //   ->all();
  // foreach ($classrooms as $classroom) {
  //   $class_members = $this->learningClassMemberService->getByClassroomId($classroom->_id);
  //   if (!empty($class_members)) {
  //     $member_ids = collect($class_members)->pluck('smartbtw_id')->toArray();
  //     $members = $this->learningStudentService->getBySmartbtwIds($member_ids);

  //     foreach ($members as $member) {
  //       $profile = $this->profileService->getSingleStudent($member->smartbtw_id);

  //       if (!$profile) {
  //         $time = Carbon::now()->format('Y-m-d H:i:s');
  //         echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) data not found on profile service, skipping \n";
  //         continue;
  //       }
  //       $phone_numbers = ["082237808008"];
  //       $parent_phone = $phone_numbers[array_rand($phone_numbers)];
  //       if (!$parent_phone) {
  //         $time = Carbon::now()->format('Y-m-d H:i:s');
  //         echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) parent phone number is not found on profile service, skipping \n";
  //         continue;
  //       }

  //       $isIRT = $program == "tps_irt";
  //       $studentResult = $isIRT ? $this->classroomResultService->getIRTSummary([$member->smartbtw_id], $exam_type) : $this->classroomResultService->getSummary([$member->smartbtw_id], $program, $exam_type);
  //       $studentHasReportProperty = $studentResult ? property_exists($studentResult[0], 'report') : false;

  //       if ($studentResult && $studentHasReportProperty) {
  //         $startDate = Carbon::now()->subWeek()->format('Y-m-d');
  //         $endDate = Carbon::now()->format('Y-m-d');

  //         foreach ($studentResult[0]->report as $r) {
  //           $parsedStartDate = \Carbon\Carbon::parse($r->start)->timezone('Asia/Jakarta');
  //           $parsedEndDate = \Carbon\Carbon::parse($r->end)->timezone('Asia/Jakarta');

  //           $start = $parsedStartDate < $parsedEndDate
  //             ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . " WIB"
  //             : '-';

  //           $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . " WIB";

  //           $doneInterval = $parsedStartDate < $parsedEndDate
  //             ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE])
  //             : '-';

  //           $r->start = $start;
  //           $r->end = $end;
  //           $r->done_interval = $doneInterval;
  //         }

  //         $user = collect($member)->only(["smartbtw_id", "branch_code", "name"])->toArray();
  //         $report = collect($studentResult[0])->except(["_id", "student", "report_repeat_sum", "report_average_try"])->toArray();
  //         $report["subject"] = collect($report["subject"])->only(["average_score", "score_keys", "score_values"])->toArray();

  //         $newUser = [];

  //         foreach ($user as $student) {
  //           $newUser["smartbtw_id"] = $profile->smartbtw_id;
  //           $newUser["branch_code"] = $profile->branch_code;
  //           $newUser["name"] = $profile->branch_code ? ucfirst($profile->name) . ' (' . $profile->branch_code . ')' : ucfirst($profile->name);
  //         }

  //         foreach ($report["subject"]["score_keys"] as $key) {
  //           unset($report["subject"]["score_values"]->$key->total);
  //           unset($report["subject"]["score_values"]->$key->passed);
  //           unset($report["subject"]["score_values"]->$key->failed);
  //           unset($report["subject"]["score_values"]->$key->total_score);
  //           unset($report["subject"]["score_values"]->$key->passed_percent);
  //           unset($report["subject"]["score_values"]->$key->failed_percent);
  //         }

  //         foreach ($report["report"] as $r) {
  //           unset($r->_id);
  //           unset($r->student_id);
  //           unset($r->task_id);
  //           unset($r->score);
  //           unset($r->exam_type);
  //           unset($r->__v);
  //           unset($r->createdAt);
  //           unset($r->updatedAt);
  //         }

  //         $jam = Carbon::now()->hour;

  //         if ($jam > 6 && $jam <= 11) {
  //           $salam = "pagi";
  //         } elseif ($jam >= 12 && $jam <= 14) {
  //           $salam = "siang";
  //         } elseif ($jam >= 15 && $jam <= 18) {
  //           $salam = "sore";
  //         } else {
  //           $salam = "malam";
  //         }

  //         $data = [
  //           'program' => $program,
  //           'program_title' => $isIRT ? "TPS IRT" : implode(' ', explode('-', $program)),
  //           'start_date' => $startDate,
  //           'end_date' => $endDate,
  //           'is_last_week_report' => false,
  //           "greeting" => $salam,
  //           'send_to' => $parent_phone,
  //           'user' => $newUser,
  //           'report' => $report
  //         ];
  //         $bodyData = json_encode(['version' => 2, 'data' => $data]);
  //         $topic = $isIRT ? "sendpdf.irt-report" : "sendpdf.report";
  //         $time = Carbon::now()->format('Y-m-d H:i:s');
  //         echo "[{$time}] Sending student report message to {$user["name"]}'s ({$user["smartbtw_id"]}) parent phone number at {$parent_phone}. \n";
  //         Rabbitmq::send($topic, $bodyData);
  //         sleep(10);
  //       } else {
  //         $time = Carbon::now()->format('Y-m-d H:i:s');
  //         echo "[{$time}] {$member->name}'s ({$member->smartbtw_id}) {$program} {$exam_type} report is not found on exam result service, skipping \n";
  //         continue;
  //       }
  //     }
  //   }
  // }
  // }

  // public function sendGroupRanking($tryout_code_category_id, $tryout_code_group)
  // {
  //   try {
  //     $profileService = new Profile();
  //     $tryoutCodeExamService = new TryoutCode();

  //     $tcGroupResponse = $tryoutCodeExamService->getTaskIdsWithGroup($tryout_code_category_id);
  //     $tcGroupBody = json_decode($tcGroupResponse->body())?->data ?? [];
  //     if (!$tcGroupBody) throw new Error("Failed on getting group or tryout category doesnt have any group");

  //     $groupedTryoutCodeGroup = collect($tcGroupBody)
  //       ->groupBy("group")
  //       ->filter(fn ($value, $key) => $key && $key === $tryout_code_group)
  //       ->all();

  //     foreach ($groupedTryoutCodeGroup as $key => $group) {
  //       $keyLowerCase = Str::lower($key);
  //       $isTPS = Str::contains($keyLowerCase, ["tps", "TPS"]);
  //       $groupTaskIds = $group->map(fn ($value) => $value->task_id)->all();

  //       if ($isTPS) $ranks = $this->getTpsRanking($groupTaskIds);
  //       else $ranks = $this->getNonTpsRanking($groupTaskIds);

  //       if (!$ranks) {
  //         echo ("Couldn't get ranking data for group " . $key . " from API or the selected group doesn't have any ranking");
  //         continue;
  //       }

  //       $mappedRanking = collect($ranks)
  //         ->map(function ($value) {
  //           $parsedStartDate = \Carbon\Carbon::parse($value->start)->timezone('Asia/Jakarta');
  //           $parsedEndDate = \Carbon\Carbon::parse($value->end)->timezone('Asia/Jakarta');
  //           $start = $parsedStartDate < $parsedEndDate ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . ' WIB' : '-';
  //           $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . ' WIB';
  //           $duration = $parsedStartDate < $parsedEndDate ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE]) : '-';

  //           $value->id = $value->smartbtw_id;
  //           $value->name = $value->student_name;
  //           $value->location = "Offline";
  //           $value->pos = $value->position;
  //           $value->start = $start;
  //           $value->end = $end;
  //           $value->duration = $duration;
  //           if ($value->program === "skd") $value->score_keys = ["TWK", "TIU", "TKP"];

  //           $value->score = array_map(function ($val) use ($value) {
  //             $newScore = [];
  //             $newScore["category"] = $val;
  //             $newScore["score"] = $value->score_values->$val->score;
  //             $newScore["passing_grade"] = $value->score_values->$val->passing_grade;
  //             return (object)$newScore;
  //           }, $value->score_keys);

  //           unset($value->_id);
  //           unset($value->createdAt);
  //           unset($value->updatedAt);
  //           unset($value->position);
  //           unset($value->exam_type);
  //           unset($value->is_user_result);
  //           unset($value->student_id);
  //           unset($value->student_name);
  //           unset($value->student_email);
  //           unset($value->status_text);
  //           unset($value->task_id);
  //           unset($value->score_keys);
  //           unset($value->score_values);
  //           unset($value->smartbtw_id);
  //           return $value;
  //         });
  //       $studentIds = $mappedRanking->map(fn ($value) => $value->id)->all();
  //       $students = [];
  //       foreach ($studentIds as $studentId) {
  //         $response = $profileService->getStudentByIds(["smartbtw_id" => $studentId, "fields" => "name,email,smartbtw_id,branchs,parent_datas"]);
  //         $body = json_decode($response->body());
  //         if (!$response->successful()) continue;

  //         $student = $body?->success ? $body?->data[0] : [];
  //         if (!$student) continue;

  //         $students[$student->smartbtw_id] = $student;
  //       }

  //       $students = collect($students);
  //       $mappedRanking = $mappedRanking->map(function ($value) use ($students) {
  //         $value->branch_name = $students[$value?->id]?->branchs?->branch_name ?? "-";
  //         $value->branch_code = $students[$value?->id]?->branchs?->branch_code ?? "-";
  //         return $value;
  //       })
  //         ->values()
  //         ->all();

  //       $contacts = $students->map(function ($value) {
  //         $contact = [];
  //         $contact['name'] = $value?->name ?? null;
  //         $contact['send_to'] = "082237808008" ?? null;
  //         $contact['greeting'] = $this->getGreetingTime();
  //         return (object)$contact;
  //       })->whereNotNull("send_to")->values()->all();

  //       if (!$contacts) {
  //         echo ("Couldn't fetch students profile data from service profile");
  //         continue;
  //       }

  //       $title = explode("|", $mappedRanking[0]->title);
  //       $title = str_replace("#", "", $title[0]);

  //       $brokerPayload = [
  //         "version" => 1,
  //         "data" => [
  //           "title" => $title,
  //           "date" => Carbon::now()->timezone("Asia/Jakarta")->locale("id")->translatedFormat("d F Y"),
  //           "contacts" => $contacts,
  //           "data" => $mappedRanking
  //         ]
  //       ];
  //       $topic = $isTPS ? "sendpdf.ranking-tps" : "sendpdf.ranking";
  //       RabbitMq::send($topic, json_encode($brokerPayload));
  //     }
  //   } catch (\Exception $e) {
  //     dd($e->getMessage());
  //   }
  // }

  // public function importClassParticipants($classroomId)
  // {
  //   $classroom = $this->learningClassroomService->getSingle($classroomId);
  //   if (!$classroom) return "Classroom data not found";

  //   $isOnlineClassroom = property_exists($classroom, "is_online") && $classroom?->is_online;
  //   if (!$isOnlineClassroom) return "The specified class is not an online class";

  //   $classMembers = $this->learningClassMemberService->getByClassroomId($classroomId);
  //   $mappedClassMembers = collect($classMembers)->map(function ($item, $key) use ($classroomId) {
  //     return [
  //       "classroom_id" => $classroomId,
  //       "smartbtw_id" => $item->smartbtw_id,
  //       "name" => $item->name,
  //       "email" => $item->email,
  //       "zoom_email" => $item->email,
  //       "created_at" => Carbon::parse($item->created_at),
  //       "updated_at" => Carbon::parse($item->updated_at)
  //     ];
  //   });
  //   $brokerPayload = [
  //     "version" => 1,
  //     "data" => $mappedClassMembers
  //   ];
  //   return response()->json($brokerPayload);
  // }

  // public function importSchedules($classroomId)
  // {
  //   $classroom = $this->learningClassroomService->getSingle($classroomId);
  //   if (!$classroom) return "Classroom data not found";

  //   $isOnlineClassroom = property_exists($classroom, "is_online") && $classroom?->is_online;
  //   if (!$isOnlineClassroom) return "The specified class is not an online class";

  //   $classSchedules = $this->learningScheduleService->getAll(["classroom_id" => $classroomId]);
  //   $mappedSchedules = collect($classSchedules)->sortByDesc("created_at")->map(function ($item, $key) use ($classroom) {
  //     return [
  //       "classroom_id" => $classroom->_id,
  //       "class_schedule_id" => $item->_id,
  //       "topic" => $item->topics,
  //       "title" => $item->title,
  //       "duration" => $item->online_class_meeting->duration,
  //       "zoom_meeting_status" => $item->online_class_meeting->zoom_meeting_status,
  //       "zoom_meeting_password" => null,
  //       "zoom_meeting_id" => $item->online_class_meeting->zoom_meeting_id,
  //       "zoom_host_id" => $item->online_class_meeting->zoom_host_id,
  //       "zoom_host_email" => $item->online_class_meeting->zoom_host_email,
  //       "zoom_join_url" => $item->online_class_meeting->zoom_join_url,
  //       "zoom_meeting_timezone" => "Asia/Jakarta",
  //       "start_date" => Carbon::parse($item->start_date),
  //       "end_date" => Carbon::parse($item->end_date),
  //       "material_id" => "",
  //       "mentor_sso_id" => $item->teacher_id,
  //       "mentor_name" => $item->teacher_name,
  //       "mentor_picture" => "",
  //       "program" => "pppk",
  //       "created_at" => Carbon::parse($item->created_at),
  //       "updated_at" => Carbon::parse($item->updated_at)
  //     ];
  //   })->values()->toArray();
  //   $brokerPayload = [
  //     "version" => 1,
  //     "data" => $mappedSchedules
  //   ];
  //   return response()->json($brokerPayload, 200);
  // }

  // public function importScheduleParticipants($scheduleId)
  // {
  //   $schedule = $this->learningScheduleService->getSingle($scheduleId);
  //   if (!$schedule) return "Schedule is not found";

  //   $classroom = $this->learningClassroomService->getSingle($schedule->classroom_id);
  //   if (!$classroom) return "Classroom data not found";

  //   $isOnlineClassroom = property_exists($classroom, "is_online") && $classroom?->is_online;
  //   if (!$isOnlineClassroom) return "The specified class is not an online class";

  //   $ocmResponse = $this->learningOcmService->getByClassScheduleID($scheduleId);
  //   $ocmBody = json_decode($ocmResponse->body())?->data ?? null;
  //   if (!$ocmBody) return "There is no online meeting class for this schedule";

  //   $registrants = collect([]);
  //   $meetingRegistrantsResponse = $this->zoomMeetingService->getMeetingRegistrants($ocmBody->zoom_meeting_id, ['page_size' => 300]);
  //   $meetingRegistrantsBody = json_decode($meetingRegistrantsResponse->body());
  //   $registrants->push($meetingRegistrantsBody->registrants);

  //   while ($meetingRegistrantsBody->next_page_token) {
  //     $meetingRegistrantsResponse = $this->zoomMeetingService->getMeetingRegistrants($ocmBody->zoom_meeting_id, ['page_size' => 300, 'next_page_token' => $meetingRegistrantsBody->next_page_token]);
  //     $meetingRegistrantsBody = json_decode($meetingRegistrantsResponse->body());
  //     if (!$meetingRegistrantsBody->registrants) continue;
  //     $registrants->push($meetingRegistrantsBody->registrants);
  //   }
  //   $registrants = $registrants->collapse()->mapWithKeys(fn ($item, $key) => [$item->email => $item]);

  //   $classMembers = $this->learningClassMemberService->getByClassroomId($classroom->_id);
  //   $mappedClassMembers = collect($classMembers)->map(function ($item, $key) use ($scheduleId, $ocmBody, $registrants) {
  //     return [
  //       "class_schedule_id" => $scheduleId,
  //       "smartbtw_id" => $item->smartbtw_id,
  //       "name" => $item->name,
  //       "email" => $item->email,
  //       "zoom_email" => $item->email,
  //       "role" => "PARTICIPANT",
  //       "status" => "APPROVED",
  //       "registrant_id" => isset($registrants[$item->email]->id) ? $registrants[$item->email]->id : null,
  //       "zoom_meeting_id" => $ocmBody->zoom_meeting_id,
  //       "created_at" => "2023-01-11T04:11:53.586+00:00",
  //       "updated_at" => "2023-01-11T04:11:53.586+00:00"
  //     ];
  //   })->filter(fn ($value, $key) => $value["registrant_id"] !== null)->values()->toArray();
  //   $brokerPayload = [
  //     "version" => 1,
  //     "data" => $mappedClassMembers
  //   ];
  //   return response()->json($brokerPayload);
  // }

  // public function createStudentPresenceFromParticipants(Request $request, $scheduleId)
  // {
  //   // $onlineClassMeetingResponse = $this->learningOcmService->getByClassScheduleID($scheduleId);
  //   // $onlineClassMeeting = json_decode($onlineClassMeetingResponse->body())?->data ?? [];
  //   // if(!$onlineClassMeeting) {
  //   //   Log::warning(
  //   //     "[ZoomWebhook][meeting.ended] Could not update online class meeting status to ENDED",
  //   //     ['message' => "Online Class Meeting data with Class Schedule ID: " . $scheduleId . " is not found on learning service"]
  //   //   );
  //   //   return response()->json(
  //   //     [
  //   //       "success" => false,
  //   //       "message" => "[ZoomWebhook][meeting.ended] could not update online class meeting status to ENDED - Online Class Meeting data with Class Schedule ID: " . $scheduleId . " is not found on learning service"
  //   //     ],
  //   //     404
  //   //   );
  //   // }

  //   $onlineSchedulesResponse = $this->onlineScheduleService->getByScheduleID($scheduleId);
  //   $onlineSchedule = json_decode($onlineSchedulesResponse->body())?->data ?? [];

  //   if (!$onlineSchedule) {
  //     Log::warning(
  //       "[ZoomWebhook][meeting.ended] Could not update online schedule status to ENDED",
  //       ['message' => "Online schedule data with Class Schedule ID: " . $scheduleId . " is not found on online class service"]
  //     );
  //     return response()->json(
  //       [
  //         "success" => false,
  //         "message" => "[ZoomWebhook][meeting.ended] Could not update online schedule status to ENDED - Online Schedule data with Class Schedule ID: " . $scheduleId . " is not found on online class service"
  //       ],
  //       404
  //     );
  //   }
  //   $classParticipantsResponse = $this->classParticipantService->getByClassroomID($onlineSchedule?->classroom_id);
  //   $classParticipants = json_decode($classParticipantsResponse->body())?->data ?? [];
  //   $participantProfiles = collect([]);

  //   if (count($classParticipants) === 0) {
  //     Log::warning("[ZoomWebhook][meeting.ended] There is no class participants for classroom ID" . $onlineSchedule?->classroom_id . ", create student presence data process is skipped");
  //     return response()->json(['success' => true, 'message' => 'Meeting has been ended'], 200);
  //   }
  //   if ($request->has('include_participant_branch') && $request->get('include_participant_branch') === "true") {
  //     $participantIds = collect($classParticipants)->pluck('smartbtw_id')->chunk(50)->all();
  //     foreach ($participantIds as $pIds) {
  //       $response = $this->profileService->getStudentByIds(["smartbtw_id" => $pIds->toArray(), "fields" => "name,email,smartbtw_id,branchs,parent_datas,school_origin"]);
  //       $body = json_decode($response->body());
  //       if (!$response->successful()) continue;

  //       $student = $body?->success ? $body?->data : [];
  //       if (!$student) continue;
  //       $participantProfiles->push($student);
  //     }
  //     $participantProfiles = $participantProfiles->collapse()->unique("smartbtw_id")->mapWithKeys(function ($item, $key) {
  //       return [$item->smartbtw_id => $item];
  //     });
  //   }

  //   // $onlineAttendanceResponse = $this->onlineAttendanceService->getScheduleAttendance($onlineSchedule?->class_schedule_id);
  //   // $onlineAttendees = json_decode($onlineAttendanceResponse->body())?->data ?? [];
  //   // $isSomeAttendeesHaveBeenRecorded = collect($onlineAttendees)->some(fn($value, $key) => $value->is_attend_available !== false);
  //   // if($isSomeAttendeesHaveBeenRecorded) {
  //   //   Log::warning("[ZoomWebhook][meeting.ended] Student Presence / Ateendees data for schedule ID: " . $onlineSchedule->class_schedule_id . " already exists, create student presence data process is skipped");
  //   //   if($currentOnlineScheduleCount !== $onlineSchedulesCount) continue;
  //   //   return response()->json(['success' => true, 'message' => 'Meeting has been ended'], 200);
  //   // }

  //   $meetingResponse = $this->zoomMeetingService->getMeetingById($onlineSchedule->zoom_meeting_id);
  //   $meetingBody = json_decode($meetingResponse->body());
  //   $meetingStatus = $meetingResponse->status();
  //   if ($meetingStatus !== 200) {
  //     Log::error(
  //       "[ZoomWebhook][meeting.ended] could not get meeting data from zoom API - Response returned with non 2xx status code",
  //       ["response" => $meetingBody, "status" => $meetingStatus]
  //     );
  //     return response()->json($meetingBody, $meetingStatus);
  //   }

  //   $participants = collect([]);
  //   $meetingParticipantsResponse = $this->zoomMeetingService->getPastMeetingParticipants($onlineSchedule->zoom_meeting_id, ['page_size' => 300]);
  //   $meetingParticipantsBody = json_decode($meetingParticipantsResponse->body());
  //   $meetingParticipantsStatus = $meetingParticipantsResponse->status();
  //   if ($meetingParticipantsStatus !== 200) {
  //     Log::error("[ZoomWebhook][meeting.ended] could not get meeting participants data from zoom API - Response returned with non 2xx status code", ["response" => $meetingParticipantsBody, "status" => $meetingParticipantsStatus]);
  //     return response()->json($meetingParticipantsBody, $meetingParticipantsStatus);
  //   }
  //   $participants->push($meetingParticipantsBody->participants);
  //   while ($meetingParticipantsBody->next_page_token) {
  //     $meetingParticipantsResponse = $this->zoomMeetingService->getPastMeetingParticipants($onlineSchedule->zoom_meeting_id, ['page_size' => 300, 'next_page_token' => $meetingParticipantsBody->next_page_token]);
  //     $meetingParticipantsBody = json_decode($meetingParticipantsResponse->body());
  //     $meetingParticipantsStatus = $meetingParticipantsResponse->status();
  //     if ($meetingParticipantsStatus !== 200) {
  //       Log::error("[ZoomWebhook][meeting.ended] could not get meeting participants data from zoom API - Response returned with non 2xx status code", ["response" => $meetingParticipantsBody, "status" => $meetingParticipantsStatus]);
  //       return response()->json($meetingParticipantsBody, $meetingParticipantsStatus);
  //     }
  //     if (!$meetingParticipantsBody->participants) continue;
  //     $participants->push($meetingParticipantsBody->participants);
  //   }
  //   $participants = $participants->collapse()->toArray();
  //   $participants = array_reduce($participants, function ($carry, $item) {
  //     if (!isset($carry[$item->user_email])) {
  //       $carry[$item->user_email] = ['name' => $item->name, 'user_email' => $item->user_email, 'duration' => $item->duration];
  //     } else {
  //       $carry[$item->user_email]['duration'] += $item->duration;
  //     }
  //     return $carry;
  //   });
  //   $maxMeetingDurationInMinutes = 90;
  //   $participants = collect($participants)->map(function ($item, $key) use ($maxMeetingDurationInMinutes) {
  //     $item["duration_in_minutes"] = intval(ceil($item["duration"] / 60));
  //     $item["duration_percentages"] = intval(ceil(($item["duration_in_minutes"] / $maxMeetingDurationInMinutes) * 100));
  //     return $item;
  //   })->values()->toArray();
  //   $presenceLog = collect($classParticipants)
  //     ->map(function ($item, $key) use ($participants, $onlineSchedule, $request, $participantProfiles) {
  //       $participantEmail = array_column($participants, "user_email");
  //       $meetingParticipantArrayIndex = array_search(strtolower($item->email), $participantEmail);
  //       $participant = $meetingParticipantArrayIndex === false ? null : $participants[$meetingParticipantArrayIndex];

  //       $logs = [];
  //       if ($request->has('include_participant_branch') && $request->get('include_participant_branch') === "true") {
  //         $logs["name"] = $item->name;
  //         $logs["email"] = strtolower($item->email);
  //         $logs["cabang"] = $participantProfiles[$item->smartbtw_id]?->branchs?->branch_name ?? "-";
  //         $logs["durasi_menit"] = $participant ? $participant["duration_in_minutes"] : 0;
  //         if ($participant) {
  //           $logs["persentase_kehadiran"] = $participant["duration_percentages"] > 100 ? 100 : $participant["duration_percentages"];
  //         } else {
  //           $logs["persentase_kehadiran"] = 0;
  //         }
  //         if (!$participant) $logs["status"] = "Tidak Hadir";
  //         else $logs["status"] = $participant["duration_percentages"] >= 60 ? "Hadir" : "Tidak Hadir";
  //       } else {
  //         $logs["class_schedule_id"] = $onlineSchedule->class_schedule_id;
  //         $logs["smartbtw_id"] = $item->smartbtw_id;
  //         $logs["meeting_id"] = (int)$onlineSchedule->zoom_meeting_id;
  //         $logs["name"] = $item->name;
  //         $logs["comment"] = "GENERATED BY SYSTEM";
  //         $logs["updated_by"] = "SYSTEM";
  //         $logs["user_email"] = strtolower($item->email);
  //         $logs["duration"] = $participant ? $participant["duration"] : 0;
  //         $logs["duration_in_minutes"] = $participant ? $participant["duration_in_minutes"] : 0;
  //         if ($participant) {
  //           $logs["duration_percentages"] = $participant["duration_percentages"] > 100 ? 100 : $participant["duration_percentages"];
  //         } else {
  //           $logs["duration_percentages"] = 0;
  //         }
  //         if (!$participant) $logs["presence"] = "NOT_ATTEND";
  //         else $logs["presence"] = $participant["duration_percentages"] >= 60 ? "ATTEND" : "NOT_ATTEND";
  //         $logs["created_at"] = "2023-06-07T10:35:42.092+00:00";
  //         $logs["updated_at"] = "2023-06-07T10:35:42.092+00:00";
  //       }
  //       return $logs;
  //     })->values()->toArray();

  //   if ($request->has('include_participant_branch') && $request->get('include_participant_branch') === "true") {
  //     return response()->json($presenceLog);
  //   }

  //   return response()->json([
  //     "version" => 1,
  //     // "studentTotal" => collect($presenceLog)->count(),
  //     // "attendTotal" => collect($presenceLog)->where('presence', 'ATTEND')->count(),
  //     // "notAttendTotal" => collect($presenceLog)->where('presence', 'NOT_ATTEND')->count(),
  //     "data" => $presenceLog
  //   ]);
  //   // ProcessStudentPresence::dispatch(["online_schedule" => $onlineSchedule, "class_participants" => $classParticipants])->delay(Carbon::now()->addMinutes(3));
  //   // sleep(3);
  // }

  // public function updateClassMembersSmartbtwID($classroomId)
  // {
  //   // Get selected class members
  //   $classMembers = $this->learningClassMemberService->getByClassroomId($classroomId);
  //   if (count($classMembers) === 0) {
  //     return 'Kelas ini tidak memiliki anggota';
  //   }

  //   $chunkOldIds = collect($classMembers)->pluck('smartbtw_id')->chunk(100);
  //   $batchTotal = count($chunkOldIds);
  //   foreach ($chunkOldIds as $index => $oldIds) {
  //     $currentBatch = $index + 1;
  //     dump("Current batch: " . $currentBatch . " of " . $batchTotal);
  //     $classMembersWithNewIds = $this->apiGatewayService->getStudentsNewIds($oldIds);
  //     if (count($classMembersWithNewIds) === 0) {
  //       return 'Tidak ada akun smartbtw_id siswa yang bisa ditukar';
  //     }
  //     $classMembersWithNewIds = collect($classMembersWithNewIds)->map(function ($value, $key) {
  //       $mappedArr = [];
  //       $mappedArr["smartbtw_id"] = $value->smartbtw_id;
  //       $mappedArr["btwedutech_id"] = $value->btwedutech_id;
  //       return $mappedArr;
  //     })->values()->toArray();
  //     $brokerPayload = [
  //       "version" => 1,
  //       "data" => [
  //         "classroom_id" => $classroomId,
  //         "class_members" => $classMembersWithNewIds
  //       ]
  //     ];
  //     RabbitMq::send('users.smartbtwid.updated', json_encode($brokerPayload));
  //     sleep(60);
  //   }
  //   dd("Done");
  //   return response()->json(['success' => true, 'message' => 'All data successfully updated']);
  // }

  // public function updateMultipleStudentSmartBTWID(Request $request)
  // {
  //   $classroom_id = $request->classroom_id;
  //   $smartbtw_ids = $request->smartbtw_ids;
  //   $btwedutech_ids = $request->btwedutech_ids;

  //   $class_members_payload = collect($smartbtw_ids)->map(function ($item, $key) use ($btwedutech_ids) {
  //     $newItem = [];
  //     $newItem["smartbtw_id"] = $item;
  //     $newItem["btwedutech_id"] = $btwedutech_ids[$key];
  //     return $newItem;
  //   });
  //   $chunk_class_members_payload = collect($class_members_payload)->chunk(100);
  //   $batch_total = count($chunk_class_members_payload);
  //   foreach ($chunk_class_members_payload as $index => $payload) {
  //     $current_batch = $index + 1;
  //     Log::info("Current batch: " . $current_batch . " of " . $batch_total);
  //     $brokerPayload = [
  //       "version" => 1,
  //       "data" => [
  //         "classroom_id" => $classroom_id,
  //         "class_members" => $payload->values()->toArray()
  //       ]
  //     ];
  //     RabbitMq::send('users.smartbtwid.updated', json_encode($brokerPayload));
  //     sleep(60);
  //   }
  //   return response()->json(['success' => true, 'message' => 'All data successfully updated']);
  // }

  // public function updateStudentBranchCode(Request $request)
  // {
  //   $idsCount = count($request->btwedutech_ids);
  //   Log::info($idsCount . " students branch code data will be updated to " . $request->branch_code);
  //   foreach ($request->btwedutech_ids as $index => $id) {
  //     $currentCount = $index + 1;
  //     $response = $this->apiGatewayService->updateStudentBranchCode($id, $request->branch_code);
  //     $body = json_decode($response->body());
  //     $status = $response->status();
  //     if (!$response->successful()) {
  //       Log::error($currentCount . "/" . $idsCount . ". Error when trying to update student with btwedutech_id " . $id . " branch code to " . $request->branch_code, ["body" => $body, "status" => $status]);
  //       continue;
  //     }
  //     Log::info($currentCount . "/" . $idsCount . ". Student with btwedutech_id " . $id . " branch code has been updated to " . $request->branch_code);
  //     sleep(3);
  //   }
  //   return response()->json(['success' => true, 'message' => 'All process has been done'], 200);
  // }

  // public function getAllBranchesUnpaidPastDueDateBills()
  // {
  //   return Bill::getAllBranchesUnpaidPastDueDateBills();
  // }

  // private function getGreetingTime()
  // {
  //   $hour = Carbon::now()->format('H');
  //   if ($hour < 12) {
  //     return 'pagi';
  //   }
  //   if ($hour < 15) {
  //     return 'siang';
  //   }
  //   if ($hour < 18) {
  //     return 'sore';
  //   }
  //   return 'malam';
  // }

  // private function getTpsRanking($taskIds)
  // {
  //   $rankingExamResultService = new Ranking();

  //   $ranks = [];
  //   $page = 1;
  //   $limitPage = 500;
  //   $tpsTaskIds = implode(",", $taskIds);

  //   $groupRankingResponse = $rankingExamResultService->getIRTRankingByTaskIds(["task_id" => $tpsTaskIds, "page" => $page, "limit_page" => $limitPage]);
  //   $groupRankingBody = json_decode($groupRankingResponse->body())?->data;
  //   array_push($ranks, $groupRankingBody->ranks);

  //   if ($groupRankingBody->info->total_pages > 1) {
  //     for ($i = $page + 1; $i <= $groupRankingBody->info->total_pages; $i++) {
  //       $groupRankingResponse = $rankingExamResultService->getIRTRankingByTaskIds(["task_id" => $tpsTaskIds, "page" => $i, "limit_page" => $limitPage]);
  //       $groupRankingBody = json_decode($groupRankingResponse->body())?->data;
  //       array_push($ranks, $groupRankingBody->ranks);
  //     }
  //   }
  //   $ranks = collect($ranks)->collapse();
  //   return $ranks;
  // }

  // private function getNonTpsRanking($taskIds)
  // {
  //   $rankingExamResultService = new Ranking();
  //   $groupRankingResponse = $rankingExamResultService->getRankingByTaskIds($taskIds);
  //   $groupRankingBody = json_decode($groupRankingResponse->body())?->data?->ranks ?? [];
  //   return $groupRankingBody;
  // }

  public function generateAuthPresignedURL()
  {
    // Get Edutech Office Application Data From SSO Service
    $applications = $this->ssoService->getApplication();
    if (count($applications?->data ?? []) == 0) {
      abort(404, "Application Not Found");
    }

    $officeHost = "https://office-v2.btwazure.com";
    $officeApplication = collect($applications?->data)
      ->filter(fn ($item) => $item->application_url == $officeHost)
      ->first();

    if (is_null($officeApplication)) {
      abort(404, "Application Not Found");
    }

    // Construct sign token
    $sign = $officeApplication->id . $officeApplication->application_name . "PRIVATE" . env("PRESIGNED_URL_STRING_TOKEN");
    $hashedSign = hash("sha256", $sign);

    $tokenPayload = [
      "app_id" => $officeApplication->id,
      "app_name" => $officeApplication->application_name,
      "app_url" => $officeApplication->application_url,
      "app_access_token" => $officeApplication->access_token,
      "app_type" => "PRIVATE",
      "sign" => $hashedSign
    ];

    dd($tokenPayload);

    $encodedTokenPayload = base64_encode(json_encode($tokenPayload));
    $presignedURL = "https://account.btwedutech.com/login?payload=$encodedTokenPayload";
    dd($sign, $hashedSign, $tokenPayload, $encodedTokenPayload, $presignedURL);
  }
}

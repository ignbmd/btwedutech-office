<?php

namespace App\Http\Controllers\Learning;

use Carbon\Carbon;
use App\Helpers\UserRole;
use App\Helpers\Breadcrumb;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\LearningService\Schedule;
use App\Services\LearningService\ClassRoom;
use App\Services\OnlineClassService\OnlineAttendance;
use App\Services\ProfileService\Profile;
use Illuminate\Support\Facades\Log;
use Rap2hpoutre\FastExcel\FastExcel;

class PresenceController extends Controller
{
  private ClassRoom $classroomService;
  private Schedule $scheduleService;
  private OnlineAttendance $onlineAttendanceService;
  private Profile $profileService;

  public function __construct(ClassRoom $classroomService, Schedule $scheduleService, OnlineAttendance $onlineAttendanceService, Profile $profileService)
  {
    $this->classroomService = $classroomService;
    $this->scheduleService = $scheduleService;
    $this->onlineAttendanceService = $onlineAttendanceService;
    $this->profileService = $profileService;
    Breadcrumb::setFirstBreadcrumb('Pembelajaran', 'pembelajaran');
  }

  public function showPresence(Request $request, $scheduleId)
  {
    $schedule = $this->scheduleService->getSingle($scheduleId);
    $classId = $schedule->classroom_id;
    $class = $this->classroomService->getSingle($classId);
    $isOnlineClass = property_exists($class, 'is_online') && $class?->is_online ? 1 : 0;

    $todayDate = Carbon::now()->timezone('Asia/Jakarta')->startOfDay();
    $scheduleEndDate = Carbon::parse($schedule->end_date)->timezone('Asia/Jakarta')->startOfDay();

    $allowed = UserRole::getAllowed('roles.learning_presence');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      [
        'link' => "pembelajaran/jadwal/{$classId}",
        'name' => "Jadwal {$class?->title}"
      ],
      ['name' => "Presensi Siswa"]
    ];
    return view(
      '/pages/learning/presence/index',
      compact('breadcrumbs', 'allowed', 'class', 'schedule', 'classId', 'scheduleId', 'isOnlineClass')
    );
  }

  public function downloadPresences(Request $request, $scheduleId)
  {
      try {
          $schedule = $this->scheduleService->getSingle($scheduleId);
          $classId = $schedule->classroom_id;
          $class = $this->classroomService->getSingle($classId);
          $onlineClass = $this->onlineAttendanceService->getScheduleAttendance($scheduleId);
          $onlineClassBody = json_decode($onlineClass->body())->data;
          $emailsStudent = collect($onlineClassBody)->pluck('email')->toArray();
          $emailCollection = collect($emailsStudent);
          $emailChunks = $emailCollection->chunk(100);
      
          $emailsArray = [];

          foreach ($emailChunks as $chunk) {
              $emailsImplode = implode(',', $chunk->toArray());
              $emailsClassResponse = $this->profileService->getStudentsByEmail($emailsImplode); 
              $emailsClassBody = json_decode($emailsClassResponse->body())->data;
              $emailsClassStatus = $emailsClassResponse->status();
              
              if (!$emailsClassResponse->successful()){
                  Log::error('Error when getting student class code by email',['body' => $emailsClassBody, 'status' => $emailsClassStatus]);
                  $request->session()->flash('flash-massage',[
                      'title' => 'Gagal!',
                      'type'=> 'error',
                      'massage' => 'Terjadi Kesalahan dan Coba lagi nanti !',
                  ]);
                  return redirect()->back();
              }
              
              $emailsArray = array_merge($emailsArray, $emailsClassBody);
          }
          $emailsCollect = collect($emailsArray)->groupBy('email')->toArray();
          $tableName = 'Presensi '. $class->title . ' - '. $schedule->title .'.xlsx';
          $isPresenceEmpty = collect($onlineClassBody)->every(function ($item) {
            return $item->is_attend_available === false;
          });
          // dd($isPresenceEmpty);
          if ($isPresenceEmpty) {
            $request->session()->flash('flash-message', [
                'title' => 'Gagal!',
                'type' => 'error',
                'message' => 'Presensi ini tidak tersedia!'
            ]);
            return redirect()->back();
          } else {
            $onlineClassBodyCollect = collect($onlineClassBody)->map(function ($item) use ($emailsCollect){
              return [
                  'Nama' => $item->name,
                  'Email' => $item->zoom_email,
                  'Cabang' => $emailsCollect[$item->zoom_email][0]->branch_name ?? "-",
                  'Kehadiran' => $item->presence == 'ATTEND'? 'Hadir' : 'Tidak Hadir' ,
                  'Keterangan' => !$item->is_attend_available ? "Baru bergabung" : ($item->presence == 'ATTEND'? $item->comment :  $item->comment),
                  'Durasi Kehadiran (Menit)' => $item->duration_in_minutes ?? "0",
                  'Persentase Kehadiran' => $item->duration_percentages ?? "0"
              ];
            });
            return (new FastExcel($onlineClassBodyCollect))->download($tableName);
          }
      } catch(\Exception $e) {
        dd($e->getMessage());
      }

  }

}

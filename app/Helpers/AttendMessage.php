<?php

namespace App\Helpers;

use App\Services\LearningService\Schedule;
use App\Types\Message;
use App\Types\StudentAttend;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Services\ProfileService\Profile;
use App\Services\LearningService\ClassRoom;
use App\Services\SSOService\SSO;

class AttendMessage extends RabbitMq
{
  private Collection $students;

  public function __construct(Collection $students)
  {
    $this->students = $students;
  }

  public function sendMessage()
  {
    $this->students->each(function (StudentAttend $student) {
      // $msg = $this->getWhatsAppMessage($student);
      $this->sendParentWhatsApp($student);
    });
  }

  private function sendParentWhatsApp(StudentAttend $student)
  {
    $hasBinsusInComment = strpos(strtolower($student->comment), strtolower('binsus')) !== false;
    $hasBerhentiInComment = strpos(strtolower($student->comment), strtolower('berhenti')) !== false;
    if ($hasBinsusInComment || $hasBerhentiInComment) return;

    $profileService = new Profile;
    $learningScheduleService = new Schedule;
    $learningClassroomService = new ClassRoom;
    $ssoService = new SSO;

    $profile = $profileService->getSingleStudent($student?->smartbtwID);
    $schedule = $learningScheduleService->getSingle($student?->classScheduleID);
    $classroom = $learningClassroomService->getSingle($schedule?->classroom_id);
    $teacher = $ssoService->getUser($student->createdByID)?->users;

    $scheduleStartDate = Carbon::parse($schedule->start_date)->timezone('Asia/Jakarta')->startOfDay()->locale('id_ID')->isoFormat('dddd, Do MMMM YYYY');

    $parentPhone = $profile && property_exists($profile, "parent_datas") ? $profile?->parent_datas?->parent_number : null;
    $student_branch_code = $profile?->branch_code ?? null;
    $name = $student_branch_code ? ucfirst($profile->name) . ' (' . $profile->branch_code . ')' : ucfirst($profile->name);

    if ($parentPhone && $schedule && $classroom && $teacher) {
      $payload = json_encode([
        "version" => 2,
        "data" => [
          "to" => $parentPhone,
          "name" => $name,
          "greeting" => $this->getGreetingTime(),
          "class" => $classroom?->title,
          "lecture" => $schedule?->title,
          "created_by" => $teacher?->name,
          "date" => $scheduleStartDate
        ]
      ]);

      if (!$student->isAttend() && !env("SEND_NOT_ATTEND_MESSAGE")) return;
      $topic = $student->isAttend() ? "message-gateway.whatsapp.presence-attend" : "message-gateway.whatsapp.presence-not-attend";
      self::send($topic, $payload);
    }
  }

  private function getWhatsAppMessage(StudentAttend $attend): Message
  {
    $msg = new Message();
    $msg->phoneNumber = $attend->parentPhone;
    $msg->title = 'Kehadiran';
    $msg->body = $this->getMessage($attend);
    $msg->type = 'REG';
    $msg->dateSend = Carbon::now()->toISOString();
    return $msg;
  }

  private function getMessage(StudentAttend $attend)
  {
    $date = Carbon::parse($attend->dateSend ?? Carbon::now())->format('d/m/Y');
    return "Selamat {$this->getGreetingTime()} Bapak/Ibu orang tua siswa *{$attend->name}*. Kami Informasikan bahwa {$attend->name} {$this->getStatus($attend->status)} mengikuti pembelajaran hari ini tanggal {$date}.
Mohon kerjasama Bapak/Ibu untuk bersama-sama memantau kehadiran putra/putrinya.

Pesan ini dikirim secara otomatis, mohon untuk tidak membalas pesan ini.
Untuk mengetahui informasi lebih lanjut, konfirmasi pembayaran, pertanyaan ataupun aduan silahkan menghubungi cabang terdekat kami atau ke Customer Service kami Whatsapp 082260008545. Terimakasih.";
  }

  private function getStatus($status)
  {
    if ($status == 'ATTEND') {
      return 'sudah datang untuk';
    }
    return '*TIDAK HADIR*';
  }

  private function getGreetingTime()
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
}

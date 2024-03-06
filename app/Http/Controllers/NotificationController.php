<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Services\BranchService\Branch;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Student;
use App\Services\StudentResultService\ClassroomResult;
use App\Services\ProfileService\Profile;
use Illuminate\Support\Facades\Storage;
use App\Helpers\RabbitMq;

class NotificationController extends Controller
{
  private Branch $branchService;
  private ClassroomResult $classroomResultService;
  private Classroom $learningClassroomService;
  private ClassMember $learningClassMemberService;
  private Student $learningStudentService;
  private Profile $profileService;

  public function __construct(
    Branch $branchService,
    Classroom $learningClassroomService,
    ClassMember $learningClassMemberService,
    Student $learningStudentService,
    ClassroomResult $classroomResultService,
    Profile $profileService
  )
  {
    Breadcrumb::setFirstBreadcrumb('Kirim Raport Siswa', 'notifikasi');

    $this->branchService = $branchService;
    $this->learningClassroomService = $learningClassroomService;
    $this->learningClassMemberService = $learningClassMemberService;
    $this->learningStudentService = $learningStudentService;
    $this->classroomResultService = $classroomResultService;
    $this->profileService = $profileService;
  }

  public function formSendTryoutReport()
  {
    $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];

    $auth_user = auth()->user();
    $is_central_user = $this->isCentralUser($auth_user);

    return view('/pages/notification/send-tryout-report', compact('breadcrumbs', 'auth_user', 'is_central_user'));
  }

  public function sendTryoutReport(Request $request)
  {
    $class_members = $this->learningClassMemberService->getByClassroomId($request->classroom_id);
    if(!empty($class_members)) {
      $member_ids = collect($class_members)->pluck('smartbtw_id')->toArray();
      $members = $this->learningStudentService->getBySmartbtwIds($member_ids);
      foreach($members as $member) {
        $profile = $this->profileService->getSingleStudent($member->smartbtw_id);
        if(!$profile) {
          Log::warning('Profile not found for student with smartbtw_id: ' . $member->smartbtw_id . ' or server error when getting data from profile service');
          return redirect(route('notifikasi.form-send-tryout-report'))->with('flash-message', [
            'title' => 'Terjadi kesalahan!',
            'type' => 'error',
            'message' => 'Silakan coba lagi nanti'
          ]);
        }

        $parentPhone = $profile && property_exists($profile, "parent_datas") ? $profile?->parent_datas?->parent_number : $profile?->parent_number;
        if(!$parentPhone) {
          Log::warning('Parent phone number not found for student with smartbtw_id: ' . $member->smartbtw_id . ' or server error when getting data from profile service');
          return redirect(route('notifikasi.form-send-tryout-report'))->with('flash-message', [
            'title' => 'Terjadi kesalahan!',
            'type' => 'error',
            'message' => 'Silakan coba lagi nanti'
          ]);
        }

        $studentResult = $this->classroomResultService->getSummary([$member->smartbtw_id], 'skd', null);
        $name = $profile->branch_code ? ucfirst($profile->name) . ' (' . $profile->branch_code . ')' : ucfirst($profile->name);

        if(($studentResult && $studentResult[0]->done > 0)) {
          $startDate = Carbon::now()->subWeek()->format('Y-m-d');
          $endDate = Carbon::now()->format('Y-m-d');
          $program = 'skd';
          $payload = [
            'user' => $member,
            'report' => $studentResult[0],
            'program' => $program,
            'program_title' => implode(' ', explode('-', $program)),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'is_last_week_report' => true
          ];

          $html = view('pages.student-result.print-tryout-report', $payload);
          $pdf  = SnappyPdf::loadHTML($html)
          ->setPaper('a4')
          ->setOption('margin-top', 0)
          ->setOption('margin-left', 0)
          ->setOption('margin-right', 0)
          ->setOption('margin-bottom', 0);

          $jam = Carbon::now()->hour;

          if($jam > 6 && $jam <= 11){
              $salam = "pagi";
          } elseif($jam >= 12 && $jam <= 14){
              $salam = "siang";
          } elseif($jam >= 15 && $jam <= 18){
              $salam = "sore";
          } else{
              $salam = "malam";
          }
          $formattedUserName = preg_replace('/[^A-Za-z0-9\-]/', '', $member->name);
          $removeEndSpaceName = preg_replace('/\s\Z/', '', $member->name);

          $postfix = date('YmdHis');
          $fileName = "report_7_hari_{$formattedUserName}_{$postfix}.pdf";
          $uploadPath = "/uploads/office/tryout-report/$fileName";
          $fileUrl = env('AWS_URL') . $uploadPath;
          Storage::disk('s3')->put($uploadPath, $pdf->output());

          RabbitMq::send('message-gateway.whatsapp.report-parent', json_encode([
            'version' => 1,
            'data' => [
              "to" => $parentPhone,
              "name" => $name,
              "greeting" => $salam,
              "file_name" => $fileName,
              "file_url" => $fileUrl
            ]
          ]));
        }
      }

      return redirect(route('notifikasi.form-send-tryout-report'))->with('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Data Raport berhasil dikirim'
      ]);
    }

    return redirect(route('notifikasi.form-send-tryout-report'))->with('flash-message', [
      'title' => 'Error!',
      'type' => 'error',
      'message' => 'Kelas ini tidak memiliki siswa'
    ]);

  }

  private function isCentralUser($user)
  {
    return $user->branch_code === "PT0000" || $user->branch_code === null;
  }

}

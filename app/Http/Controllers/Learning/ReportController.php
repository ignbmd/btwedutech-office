<?php

namespace App\Http\Controllers\Learning;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\Report;
use App\Services\LearningService\Schedule;
use App\Services\SSOService\SSO;

class ReportController extends Controller
{
  private Report $reportService;
  private Schedule $scheduleService;
  private ClassRoom $classService;
  private SSO $ssoService;

  public function __construct(
    Report $reportService,
    Schedule $scheduleService,
    ClassRoom $classService,
    SSO $ssoService
  ) {
    $this->reportService = $reportService;
    $this->scheduleService = $scheduleService;
    $this->classService = $classService;
    $this->ssoService = $ssoService;
    Breadcrumb::setFirstBreadcrumb('Pembelajaran', 'pembelajaran');
  }

  public function showReport(Request $request, $scheduleId)
  {
    $reports = $this->reportService->getBySchedule($scheduleId);
    $schedule = $this->scheduleService->getSingle($scheduleId);
    $class = $this->classService->getSingle($schedule->classroom_id);
    $userIds = collect($reports)->map(fn ($r) => $r->teacher_id)->toArray();
    $users = $this->ssoService->getUserByIds($userIds);
    $allowed = UserRole::getAllowed('roles.learning_report');
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      [
        'link' => "pembelajaran/jadwal/$schedule->classroom_id",
        'name' => "Jadwal Kelas $class?->title"
      ],
      ['name' => "Laporan Mengajar"]
    ];
    return view(
      '/pages/learning/report/index',
      compact('breadcrumbs', 'reports', 'allowed', 'users')
    );
  }

  public function showAddReport(Request $request, $scheduleId)
  {
    $schedule = $this->scheduleService->getSingle($scheduleId);
    $class = $this->classService->getSingle($schedule->classroom_id);
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      [
        'link' => "pembelajaran/jadwal/$class?->_id",
        'name' => "Jadwal Kelas $class?->title"
      ],
      [
        'link' => "pembelajaran/laporan/$scheduleId",
        'name' => "Laporan Jadwal $schedule?->title"
      ],
      ['name' => "Buat Laporan Mengajar"]
    ];
    return view(
      '/pages/learning/report/add',
      compact('breadcrumbs', 'class', 'scheduleId')
    );
  }

  public function showEditReport(Request $request, $scheduleId, $reportId)
  {
    $schedule = $this->scheduleService->getSingle($scheduleId);
    $class = $this->classService->getSingle($schedule?->classroom_id);
    $classroomId = $schedule->classroom_id ?? '';
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      [
        'link' => "pembelajaran/jadwal/$classroomId",
        'name' => "Jadwal Kelas $class?->title"
      ],
      [
        'link' => "pembelajaran/laporan/$scheduleId",
        'name' => "Laporan Jadwal $schedule?->title"
      ],
      ['name' => "Edit Laporan Mengajar"]
    ];
    return view(
      '/pages/learning/report/edit',
      compact('breadcrumbs', 'class', 'schedule', 'reportId')
    );
  }

  public function showPresence(Request $request, $scheduleId)
  {
    $schedule = $this->scheduleService->getSingle($scheduleId);
    $class = $this->classService->getSingle($schedule->classroom_id);
    $breadcrumbs = [
      Breadcrumb::getFirstPageBreadcrumb(true),
      [
        'link' => "pembelajaran/jadwal/{$class?->_id}",
        'name' => "Jadwal {$class?->title}"
      ],
      ['name' => "Presensi Siswa"]
    ];
    return view(
      '/pages/learning/presence/index',
      compact('breadcrumbs', 'class', 'schedule')
    );
  }
}

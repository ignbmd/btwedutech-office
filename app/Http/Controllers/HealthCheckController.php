<?php

namespace App\Http\Controllers;

use App\Helpers\Breadcrumb;
use App\Helpers\UserRole;
use App\Services\BranchService\Branch;
use App\Services\LearningService\Student;
use App\Services\MedicalCheckupService\MedicalCheckup;
use Barryvdh\Snappy\Facades\SnappyPdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HealthCheckController extends Controller
{
    private MedicalCheckup $mcuService;
    private Branch $branchService;
    private Student $studentService;

    public function __construct(MedicalCheckup $serviceMcu, Branch $serviceBranch, Student $serviceStudent)
    {
      $this->mcuService = $serviceMcu;
      $this->branchService = $serviceBranch;
      $this->studentService = $serviceStudent;
      Breadcrumb::setFirstBreadcrumb('Stakes', '/kesehatan/stakes');
    }

    public function indexStakes() {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
      return view('/pages/health-check/index-stakes', compact('breadcrumbs'));
    }

    public function recordHistory() {
      $breadcrumbs = [['name' => 'Semua Riwayat Pemeriksaan']];
      return view('/pages/health-check/record-history', compact('breadcrumbs'));
    }

    public function showMedicalCheckupSummary(Request $request, $historyId, $studentId = null)
    {
      if($studentId) {
        $breadcrumbs = [['name' => 'Riwayat', 'link' => '/siswa/riwayat-pemeriksaan-kesehatan/'.$studentId], ['name' => 'Hasil Pemeriksaan Kesehatan']];
      } else {
        $breadcrumbs = [['name' => 'Riwayat', 'link' => '/kesehatan/riwayat-pemeriksaan'], ['name' => 'Hasil Pemeriksaan Kesehatan']];
      }
      $branchCode = Auth::user()->branch_code;
      $allowed = UserRole::getAllowed('roles.medical_checkup');
      return view('/pages/health-check/medical-checkup-summary', compact('breadcrumbs', 'allowed', 'historyId', 'branchCode'));
    }

    public function checkForm()
    {
      $user = Auth::user();
      $branchCode = $user->branch_code;
      $allowed = UserRole::getAllowed('roles.medical_checkup');
      $breadcrumbs = [['name' => 'Cheklist Kesehatan']];
      return view('/pages/health-check/check-form', compact('breadcrumbs', 'branchCode', 'allowed'));
    }

    public function createStakes()
    {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Input Data Stakes']];
      return view('/pages/health-check/create-stakes', compact('breadcrumbs'));
    }

    public function editStakes()
    {
      $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Data Stakes']];
      return view('/pages/health-check/edit-stakes', compact('breadcrumbs'));
    }

    public function printSummary(string $historyId) {
      $response = $this->mcuService->getRecordSummary($historyId);
      $summary = json_decode($response->body());
      $summarySort = json_decode($response->body());

      usort($summarySort->data->summary, function($a, $b) {
          return $a->value < $b->value ? 1 : -1;
      });

      $highestStakes = $summarySort->data->summary[0]?->value ?? null;

      $userBranchCode = $summary->data?->branch_code;
      $responseBodyBranch = $this->branchService->getBranchByCode($userBranchCode);
      $branchName = $responseBodyBranch?->name ?? '-';

      $classrooms = $this->studentService->getBySmartbtwIds([$summary->data?->smartbtw_id]);
      $studentClassrooms = $classrooms[0]->classroom_names ?? [];

      $payload = [
        'summary' => $summary,
        'branchName' => $branchName,
        'classrooms' => $studentClassrooms,
        'highestStakes' => $highestStakes,
      ];

      $view = view('/pages/health-check/print-summary', $payload);
      $pdf = SnappyPdf::loadHTML($view)
      ->setPaper('a4')
      ->setOption('margin-top', 0)
      ->setOption('margin-left', 0)
      ->setOption('margin-right', 0)
      ->setOption('margin-bottom', 0);

      return $pdf->stream('hasil-pemeriksaan-kesehatan-'. now() .'.pdf');
    }
}

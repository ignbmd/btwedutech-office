<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LearningService\ClassMember;
use App\Services\LearningService\Schedule;
use App\Services\StudyMaterialService\Material;
use App\Services\ExaminationService\ExamResult;

use Illuminate\Http\Request;

class ClassMemberController extends Controller
{
  private ClassMember $classMember;
  private Schedule $schedule;
  private Material $studyMaterial;
  private ExamResult $exam;

  public function __construct(
    ClassMember $classMember,
    Schedule $schedule,
    Material $studyMaterial,
    ExamResult $exam
  ) {
    $this->classMember = $classMember;
    $this->schedule = $schedule;
    $this->studyMaterial = $studyMaterial;
    $this->exam = $exam;
  }
}

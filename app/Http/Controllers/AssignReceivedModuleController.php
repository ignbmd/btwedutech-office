<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LearningService\ClassMember;
use App\Jobs\AssignReceivedModule;
use Illuminate\Support\Facades\Http;

class AssignReceivedModuleController extends Controller
{
    private ClassMember $classmember;

    public function __construct(ClassMember $classmember)
    {
      $this->classmember = $classmember;
    }

    public function assignPerClass(string $classroomId)
    {
      try {
        $classMembers = $this->getClassMember($classroomId);
        if(!empty($classMembers)) AssignReceivedModule::dispatch($classMembers);
        else {
          return redirect('/pembelajaran')
          ->with('flash-message', [
            'title' => 'Terjadi Kesalahan!',
            'type' => 'error',
            'message' => 'Anggota kelas kosong'
          ]);
        }
        return redirect('/pembelajaran')
        ->with('flash-message', [
          'title' => 'Berhasil!',
          'type' => 'success',
          'message' => 'Proses Assign Modul Diterima Berhasil'
        ]);
      } catch(\Throwable $th) {
        return redirect('/pembelajaran')
        ->with('flash-message', [
          'title' => 'Terjadi Kesalahan!',
          'type' => 'error',
          'message' => $th->getMessage()
        ]);
      }
    }

    private function getClassMember(string $classroomId)
    {
      return $this->classmember->getByClassroomId($classroomId);
    }
}

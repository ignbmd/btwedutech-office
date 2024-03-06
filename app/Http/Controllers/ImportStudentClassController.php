<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ApiGatewayService\Internal;
use App\Services\LearningService\Student;
use App\Services\LearningService\ClassRoom;
use App\Services\LearningService\ClassMember;
use App\Services\ProductService\Product;
use Rap2hpoutre\FastExcel\FastExcel;
use App\Helpers\RabbitMq;
use Carbon\Carbon;

class ImportStudentClassController extends Controller
{
  private Internal $internal;
  private Student $student;
  private Classroom $classroom;
  private ClassMember $classMember;
  private Product $product;

  public function __construct(Internal $internal, Student $student, Classroom $classroom, ClassMember $classMember, Product $product)
  {
    $this->internal = $internal;
    $this->student = $student;
    $this->classroom = $classroom;
    $this->classMember = $classMember;
    $this->product = $product;
  }

  public function importForm()
  {
    $is_user_pusat = auth()->user()->branch_code == null || auth()->user()->branch_code == "PT0000";
    $query = !$is_user_pusat ? ['branch_code' => auth()->user()->branch_code, 'status' => 'ONGOING'] : ['status' => 'ONGOING'];
    $classrooms = $this->classroom->getAll($query);
    return view('pages/import/import-class-to-student', compact('classrooms'));
  }

  public function import(Request $request)
  {
    $this->validate($request, [
      'file' => 'required|mimes:xls,xlsx',
      'classroom_id' => 'required'
    ]);
    try {
      $emails = [];
      $insertedClassMembers = [];

      $collection = (new FastExcel)->import($request->file('file'));
      $classroom = $this->classroom->getSingle($request->get('classroom_id'));

      foreach($collection as $key => $value) {
        $emails[] = $value['email'];
      }

      $internalStudents = $this->internal->getStudentByEmail(['email' => $emails]);
      foreach($internalStudents as $index => $student) {
        $this->internal->updateStudentBranchCode($student->id, $classroom->branch_code);
        $upsertStudent = $this->student->createUpdateStudent([
          'smartbtw_id' => $student->id,
          'name' => $student->nama_lengkap,
          'email' => $student->email,
          'address' => $student->alamat,
          'photo' => $student->photo,
          'whatsapp_no' => $student->no_wa,
          'parent_phone' => $student->hp_ortu,
          'branch_code' => $classroom->branch_code
        ]);
        $upsertedStudent = json_decode($upsertStudent)->data;
        $this->internal->sendReceiveModule((string)$upsertedStudent->smartbtw_id);
        $classMembersToBeInserted[] = ['smartbtw_id' => $upsertedStudent->smartbtw_id, "classroom_id" => $classroom->_id];
      }
      $payload = [
        "members" => $classMembersToBeInserted
      ];
      $this->classMember->upsertMany($payload);
      request()->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Proses import berhasil'
      ]);
      return redirect('/import/add-class-to-student');
    } catch(\Throwable $th) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses import gagal'
      ]);
      return redirect('/import/add-class-to-student');
    }
  }
}

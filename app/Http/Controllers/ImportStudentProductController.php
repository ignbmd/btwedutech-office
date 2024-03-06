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
use App\Jobs\AssignReceivedModule;

class ImportStudentProductController extends Controller
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
    return view('pages/import/import-product-to-student', compact('classrooms'));
  }


  public function import(Request $request)
  {
    $this->validate($request, [
      'file' => 'required|mimes:xls,xlsx',
    ]);

    try {
      $emails = [];
      $product_codes = [];
      $branch_codes = [];

      $collection = (new FastExcel)->import($request->file('file'));
      foreach($collection as $key => $value) {
        $emails[] = $value['email'];
        $product = $this->product->getProductByProductAndBranchCode($value['kode_produk'], $value['kode_cabang']);
        if(!$product) {
          request()->session()->flash('flash-message', [
            'title' => 'Terjadi Kesalahan!',
            'type' => 'error',
            'message' => 'Kode Produk Tidak Ditemukan'
          ]);
          return redirect('/import/add-product-to-student');
        }
        $product_codes[] = $value['kode_produk'];
        $branch_codes[] = $value['kode_cabang'];
      }
      $internalStudents = $this->internal->getStudentByEmail(['email' => $emails]);

      foreach($internalStudents as $index => $student) {
        $upsertStudent = $this->student->createUpdateStudent([
          'smartbtw_id' => $student->id,
          'name' => $student->nama_lengkap,
          'email' => $student->email,
          'address' => $student->alamat,
          'photo' => $student->photo,
          'whatsapp_no' => $student->no_wa,
          'parent_phone' => $student->hp_ortu,
        ]);
        $upsertedStudent = json_decode($upsertStudent)->data;

        $payload = [
          "version" => 1,
          "data" => [
            "product_code" => $product_codes[$index],
            "branch_code" => $branch_codes[$index],
            "smartbtw_id" => $upsertedStudent->smartbtw_id,
            "name" => $upsertedStudent->name,
            "email" => $upsertedStudent->email,
            "phone" => $upsertedStudent->whatsapp_no,
            "status" => true,
            "date_activated" => Carbon::now(),
          ]
        ];
        $data = json_encode($payload);
        RabbitMq::send('product.activation', $data);
        $this->internal->sendReceiveModule((string)$upsertedStudent->smartbtw_id);
      }
      request()->session()->flash('flash-message', [
        'title' => 'Berhasil!',
        'type' => 'success',
        'message' => 'Proses import berhasil'
      ]);
      return redirect('/import/add-product-to-student');
    } catch(\Throwable $th) {
      request()->session()->flash('flash-message', [
        'title' => 'Terjadi Kesalahan!',
        'type' => 'error',
        'message' => 'Proses import gagal'
      ]);
      return redirect('/import/add-product-to-student');
    }
  }
}

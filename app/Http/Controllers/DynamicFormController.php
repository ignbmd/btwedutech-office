<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Helpers\Breadcrumb;
use App\Services\DynamicFormService\DynamicForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Rap2hpoutre\FastExcel\FastExcel;

class DynamicFormController extends Controller
{
    private DynamicForm $service;

    public function __construct(DynamicForm $service) {
        $this->service = $service;
        Breadcrumb::setFirstBreadcrumb('Dynamic Survey Form', '/dynamic-form','');
    }

    public function index(Request $request){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb()];
        $dynamicFormResponse = $this->service->getAll();
        $formsData = $dynamicFormResponse?->data ?? [];
        // dd($formsData);
        return view('pages.dynamic-menu.index', compact('breadcrumbs','formsData'));
    }

    public function showDetailForms($id){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Detail Dynamic Survey Form']];
        $detailFormsResponse = $this->service->getSingleByFormId($id);
        $detail = $detailFormsResponse?->data ?? [];
        return view('pages.dynamic-menu.detail', compact('breadcrumbs','detail'));
    }


    public function showDinamicMenuCreate(){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Tambah Form Dynamic']];
        return view('pages.dynamic-menu.create', compact('breadcrumbs'));
    }

    public function storeDynamicForm(Request $request){
        try{
            $validate = Validator::make($request->all(),[
                'name' => 'required',
                'tags' => 'required'
            ],[
                'name' => 'Harus Diisi',
                'tags' => 'Harus Diisi'
            ]);

            if ($validate->fails()) {
                return redirect()->back()->withInput()->withErrors($validate->errors());
            }
            $payload = $request->except("_token");

            $response = $this->service->create($payload);
            if ($response) {
                $request->session()->flash('flash-message', [
                    'title' => 'Berhasil!',
                    'type' => 'success',
                    'message' => 'Form berhasil ditambahkan'
                ]);

                return redirect('/dynamic-form');
            } else {
                $request->session()->flash('flash-message', [
                    'title' => 'Terjadi kesalahan!',
                    'type' => 'error',
                    'message' => 'Gagal menambahkan form'
                ]);

                return redirect()->back()->withInput();
            }
        } catch (\Exception $e) {
            $request->session()->flash('flash-message', [
                'title' => 'Error!',
                'type' => 'error',
                'message' => 'Proses menambah form gagal: ' . $e->getMessage()
            ]);

            return redirect('/dynamic-form');
        }
    }
    public function showDinamicMenuEdit($id){
        $breadcrumbs = [Breadcrumb::getFirstPageBreadcrumb(true), ['name' => 'Edit Form Dynamic']];
        $dynamicFormResponse = $this->service->getSingleById($id);
        $formsData = $dynamicFormResponse?->data ?? [];
        return view('pages.dynamic-menu.edit', compact('breadcrumbs', 'formsData'));
    }

    public function updateDynamicForm(Request $request, $id){
        try{
            $validate = Validator::make($request->all(),[
                'name' => 'required',
                'tags' => 'required'
            ],[
                'name' => 'Harus Diisi',
                'tags' => 'Harus Diisi'
            ]);

            if ($validate->fails()) {
                return redirect()->back()->withInput()->withErrors($validate->errors());
            }

            $payload = $request->except("_token");
            $response = $this->service->update($payload, $id);
            if ($response) {
                $request->session()->flash('flash-message', [
                    'title' => 'Berhasil!',
                    'type' => 'success',
                    'message' => 'Form berhasil diedit'
                ]);

                return redirect('/dynamic-form');
            } else {
                $request->session()->flash('flash-message', [
                    'title' => 'Terjadi kesalahan!',
                    'type' => 'error',
                    'message' => 'Gagal mengedit form'
                ]);

                return redirect()->back()->withInput();
            }
        } catch (\Exception $e) {
            $request->session()->flash('flash-message', [
                'title' => 'Error!',
                'type' => 'error',
                'message' => 'Proses mengedit form gagal: ' . $e->getMessage()
            ]);

            return redirect('/dynamic-form');
        }
    }
    public function downloadDetailsForm(Request $request, $id){
        try{
            $detailFormsResponse = $this->service->getSingleByFormId($id);
            $detail = $detailFormsResponse?->data ?? [];
            $dynamicFormResponse = $this->service->getSingleById($id);
            $dynamicForm = $dynamicFormResponse?->data ?? [];
            $tableName = 'Detail Survey Forms '.'- '.$dynamicForm->name.'.xlsx';

            if(!$detail){
                $request->session()->flash('flash-message', [
                    'title' => 'Gagal!',
                    'type' => 'error',
                    'message' => 'Forms Belum Berisi Data'
                ]);
                return redirect()->back();
            }else{
                $detailCollect = collect($detail)->map(function($item){
                    return [
                        'Nama' => $item->name,
                        'No. WhatsApp' => $item->phone,
                        'Email' => $item->email,
                        'Akun Sosial Media (Instagram)' =>  $item->link_socialmedia,
                        'Asal Sekolah SMA/MA/SETARA' => $item->school_origin,
                        'Jurusan' => $item->major,
                        'Tahun Lulus' => $item->graduate_year,
                        'Nama PTN' => $item->ptn_target,
                        'Prodi' => $item->ptn_major_target,
                        'Tahun Diterima' => $item->ptn_year,
                        // "Kemampuan Penalaran Umum" => $item->topic_penalaran_umum,
                        // "Kemampuan Memahami Bacaan dan Menulis" => $item->topic_bacaan_dan_menulis,
                        // "Pengetahuan Kuantitatif" => $item->topic_pengetahuan_kuantitatif,
                        // "Pengetahuan dan Pemahaman Umum" => $item->topic_pemahaman_umum,
                        // "Literasi Bahasa Indonesia" => $item->topic_bahasa_indonesia,
                        // "Literasi Bahasa Inggris" => $item->topic_bahasa_inggris,
                        // "Penalaran Matematika" => $item->topic_penalaran_matematika,
                        'Nilai UTBK-SNBT' => $item->utbk_score,
                        'Screenshots Bukti Lulus UTBK' => $item->utbk_pass_screenshot,
                        'Screenshots Bukti Nilai UTBK' => $item->utbk_screenshot,
                    ];
                });
                return (new FastExcel($detailCollect))->download($tableName);
            }
        }catch(\Exception $e){
            $e->getMessage();
            return redirect('/dynamic-form');
        }
    }
}

@extends('layouts/contentLayoutMaster')

@section('title', $pageTitle)

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    .info-section {
      cursor: pointer;
    }
  </style>
@endsection

@section('content')
<div id="branch-code" class="d-none">{{ $userBranchCode }}</div>
<div id="competition" class="d-none">{{ json_encode($competitions) }}</div>
<div id="school" class="d-none">{{ json_encode($competitionSchools) }}</div>
<form>
  <div class="card">
    <h5 class="card-header">Cari Nilai BKN Siswa</h5>
    <div class="d-flex justify-content-between align-items-center mx-50 row pt-0 pb-2">
      <div class="col-md-4">
        <select id="branch_code" name="branch_code" class="form-control text-capitalize mb-md-0 mb-2 select2" required disabled>
          <option value=""> Pilih Cabang </option>
        </select>
      </div>
      <div class="col-md-4">
        <select id="classroom_id" name="classroom_id" class="form-control text-capitalize select2" required disabled>
          <option value=""> Pilih Kelas </option>
        </select>
      </div>
      <div class="col-md-4 user_status">
        <button type="submit" id="btnFilter" class="btn btn-primary waves-effect waves-float waves-light" disabled>Cari</button>
      </div>
    </div>
  </div>
</form>

<!-- Basic table -->
@if(request()->has('classroom_id') && request()->has('branch_code'))
  <section id="basic-datatable">
    <div class="row">
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">PENTING !</h4>
          <div class="alert-body">
            Pastikan jurusan yang tampil pada masing-masing siswa sama dengan jurusan yang ada pada pengumuman hasil SKD BKN.
            Untuk siswa kelas BINSUS yang tidak sama jurusan yang dipilih dengan hasil SKD BKN, mohon menginformasikan kepada Tim Internal Support.
            Untuk siswa kelas selain BINSUS yang terdapat jurusan yang perlu di update, sesuikan dengan jurusan yang dipilih sesuai hasil SKD BKN.
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive w-100">
              <table id="datatables-basic" class="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama/Email Siswa</th>
                    <th>Sekolah/Prodi</th>
                    <th>TWK</th>
                    <th>TIU</th>
                    <th>TKP</th>
                    <th>Total</th>
                    <th>Ranking</th>
                    <th>Status Pengisian Form Survey & Kelanjutan Pasca Tes SKD</th>
                    <th class="{{ !$showActionButton ? 'd-none' : '' }}">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  @forelse($studentBknScores as $index => $student)
                    <tr>
                      <td>{{ $index + 1 }}</td>
                      <td>{{ $student->name }} ({{ $student->email }})</td>
                      <td>{{ !is_null($student->bkn_score) && $student->bkn_score->ptk_school && $student->bkn_score->ptk_major ? $student->bkn_score->ptk_school ." (".$student->bkn_score->ptk_major.") " : "Belum Mengupdate/Memilih Jurusan PTK. Silahkan update" }}</td>
                      <td>{{ !is_null($student->bkn_score) ? $student->bkn_score->twk : "-" }}</td>
                      <td>{{ !is_null($student->bkn_score) ? $student->bkn_score->tiu : "-" }}</td>
                      <td>{{ !is_null($student->bkn_score) ? $student->bkn_score->tkp : "-" }}</td>
                      <td>{{ !is_null($student->bkn_score) ? $student->bkn_score->total : "-" }}</td>
                      <td>{{ !is_null($student->bkn_score) ? $student->bkn_score->bkn_rank : "-" }}</td>
                      <td class="text-capitalize">
                        <div class="d-flex flex-column" style="gap:10px">
                          <span class="badge {{ !is_null($student->bkn_score) && $student->bkn_score->survey_status ? 'badge-success' : 'badge-danger' }}">{{ !is_null($student->bkn_score) && $student->bkn_score->survey_status ? 'Mengisi' : 'Belum Mengisi' }}</span>
                          <span
                            class="badge {{ !is_null($student->bkn_score) ? ($student->bkn_score->is_continue ? 'badge-success' : 'badge-danger') : 'badge-secondary' }}"
                          >
                            {{ !is_null($student->bkn_score) ? ($student->bkn_score->is_continue ? 'Lanjut' : 'Tidak Lanjut') : "-" }}
                          </span>
                        </div>
                      </td>
                      <td class="{{ !$showActionButton ? 'd-none' : '' }}">
                        @if($showActionButton)
                          <div class="d-flex flex-column" style="gap:5px">
                            <div class="dropdown">
                              <button class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary download-dropdown-button w-100" data-toggle="dropdown">
                                <span class="download-dropdown-button-text" id="row-{{$index}}-download-text">Download</span>
                                <i data-feather="chevron-down" class="font-small-4"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-right" id="row-{{$index}}">
                                {{-- <button
                                  type="button"
                                  class="dropdown-item w-100 download-report"
                                  data-id="{{ $student->btwedutech_id }}"
                                >
                                  Download Raport (Semua Nilai)
                                </button> --}}
                                {{-- <button
                                  type="button"
                                  class="dropdown-item w-100 download-uka-challenge-report"
                                  data-id="{{ $student->btwedutech_id }}"
                                >
                                  Download Raport (Nilai UKA Challenge)
                                </button> --}}
                                <button
                                  type="button"
                                  class="dropdown-item w-100 download-resume"
                                  data-id="{{ $student->btwedutech_id }}"
                                >
                                  Download Resume Pemilihan Jurusan
                                </button>

                              </div>
                            </div>
                            <div class="dropdown">
                              <button class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary action-dropdown-button w-100" data-toggle="dropdown">
                                <span class="action-dropdown-button-text">Aksi Lainnya</span>
                                <i data-feather="chevron-down" class="font-small-4"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-right">
                                <button
                                  type="button"
                                  class="dropdown-item w-100"
                                  data-toggle="modal"
                                  data-target="#BKNScoreModal"
                                  data-id="{{ $student->btwedutech_id }}"
                                  data-name="{{ $student->name }}"
                                  data-email="{{ $student->email }}"
                                  data-twk="{{ $student->bkn_score->twk ?? 0 }}"
                                  data-tiu="{{ $student->bkn_score->tiu ?? 0 }}"
                                  data-tkp="{{ $student->bkn_score->tkp ?? 0 }}"
                                  data-total="{{ $student->bkn_score->total ?? 0 }}"
                                  data-rank="{{ $student->bkn_score->bkn_rank ?? 0 }}"
                                  data-type="{{ is_null($student->bkn_score) ? 'create' : 'edit' }}"
                                  data-is-continue="{{ is_null($student->bkn_score) ? 'null' : ($student->bkn_score->is_continue ? '1' : '0') }}"
                                  data-bkn-test-number="{{ $student->bkn_score->bkn_test_number ?? '' }}"
                                  data-ptk-school-id="{{ $student->bkn_score->ptk_school_id ?? null }}"
                                  data-ptk-major-id="{{ $student->bkn_score->ptk_major_id ?? null }}"
                                >
                                  {{ is_null($student->bkn_score) ? "Tambah Nilai BKN" :  "Edit Nilai BKN" }}
                                </button>
                                @if(is_null($student->bkn_score) || !$student->bkn_score->survey_status)
                                  <button
                                    type="button"
                                    class="dropdown-item w-100 do-survey"
                                    data-student-id="{{ $student->btwedutech_id }}"
                                    data-school-id="{{ $student->school_id }}"
                                    data-school-name="{{ $student->school_name }}"
                                    data-major-id="{{ $student->major_id }}"
                                    data-major-name="{{ $student->major_name }}"
                                    data-student-name="{{ $student->name }}"
                                    data-student-email="{{ $student->email }}"
                                    data-has-bkn-score="{{ !is_null($student->bkn_score) ? "1" : "0" }}"
                                  >
                                    Lakukan Survei
                                  </button>
                                @endif
                              </div>
                            </div>
                          </div>
                        @else
                          -
                        @endif
                      </td>
                    </tr>
                  @empty
                    <tr>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">Data Kosong</td>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">&nbsp;</td>
                      <td class="text-center">&nbsp;</td>
                    </tr>
                  @endforelse
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="modal fade" id="BKNScoreModal" tabindex="-1" role="dialog" aria-labelledby="BKNScoreModalTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="BKNScoreModalTitle"></h5>
        </div>
        <div class="modal-body">
          <form id="BKNScoreModalForm" action="{{ route('nilai-bkn.upsert') }}" method="POST">
            @csrf
            <input type="hidden" name="smartbtw_id" id="smartbtw_id" value="" required />
            <input type="hidden" name="ptk_school" id="ptk_school" value="" required />
            <input type="hidden" name="ptk_major" id="ptk_major" value="" required />
            <div class="form-group">
              <label for="bkn_test_number" class="col-form-label">Nomor Peserta <span data-toggle="tooltip" data-placement="top" title="Nomor Peserta dapat dilihat pada PDF Pengumuman SKD"><i data-feather="alert-circle" class="ml-25 info-section"></i></span> </label>
              <input type="text" class="form-control" name="bkn_test_number" id="bkn_test_number" required />
            </div>
            <div class="form-group">
              <label for="ptk_school_id" class="col-form-label">Sekolah</label>
              <select id="ptk_school_id" name="ptk_school_id" class="form-control select2" required></select>
            </div>
            <div class="form-group">
              <label for="ptk_major_id" class="col-form-label">Prodi</label>
              <select id="ptk_major_id" name="ptk_major_id" class="form-control select2" disabled required></select>
            </div>
            <hr class="mt-3 mb-2"/>
            <div class="form-group">
              <label for="twk" class="col-form-label">Nilai TWK</label>
              <input type="number" min="0" max="{{ $skdQuestionCategoriesMaximumScore["TWK"] }}" class="form-control" name="twk" id="twk" required />
            </div>
            <div class="form-group">
              <label for="tiu" class="col-form-label">Nilai TIU</label>
              <input type="number" min="0" max="{{ $skdQuestionCategoriesMaximumScore["TIU"] }}" class="form-control" name="tiu" id="tiu" required />
            </div>
            <div class="form-group">
              <label for="tkp" class="col-form-label">Nilai TKP</label>
              <input type="number" min="0" max="{{ $skdQuestionCategoriesMaximumScore["TKP"] }}" class="form-control" name="tkp" id="tkp" required />
            </div>
            <div class="form-group">
              <label for="total" class="col-form-label">Nilai Total</label>
              <input type="number" min="0" max="{{ $skdQuestionCategoriesMaximumScore["SKD"] }}" class="form-control" name="total" id="total" required readonly />
            </div>
            <div class="form-group">
              <label for="bkn-rank" class="col-form-label">Ranking</label>
              <input type="number" min="0" class="form-control" name="bkn_rank" id="bkn-rank" required />
            </div>
            <div class="form-group">
              <label for="is_continue" class="form-label">Status Kelanjutan</label>
              <div class="d-flex">
                <div class="custom-control custom-radio mr-1">
                  <input class="custom-control-input" type="radio" name="is_continue" id="continue" value="1" required>
                  <label class="custom-control-label" for="continue">Lanjut</label>
                </div>
                <div class="custom-control custom-radio">
                  <input class="custom-control-input" type="radio" name="is_continue" id="discontinue" value="0" required>
                  <label class="custom-control-label" for="discontinue">Tidak Lanjut</label>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-primary" id="btnClose" data-dismiss="modal">Tutup</button>
          <button type="button" class="btn btn-primary" id="btnSubmit">Simpan</button>
        </div>
      </div>
    </div>
  </div>

@endif
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/vfs_fonts.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/bkn-score/app.js')) }}"></script>
@endsection

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
@endsection

@section('content')
<div id="branch-code" class="d-none">{{ $userBranchCode }}</div>
<form>
  <div class="card">
    <h5 class="card-header">Cari Nilai Tryout Samapta Siswa</h5>
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
        <div class="card">
          <div class="card-body">
            <div class="w-100 table-responsive">
              <table id="datatables-basic" class="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Siswa</th>
                    <th>Jenis Kelamin</th>
                    <th>Lari</th>
                    <th>Pull Up</th>
                    <th>Push Up</th>
                    <th>Sit Up</th>
                    <th>Shuttle</th>
                    <th>Total</th>
                    <th class="{{ !$showActionButton ? 'd-none' : '' }}">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  @forelse($studentSamaptaTryoutScore as $index => $student)
                    <tr>
                      <td>{{ $index + 1 }}</td>
                      <td>{{ $student->name }}</td>
                      <td>{{ !is_null($student->samapta_score) ? ($student->samapta_score->gender ? "Laki-laki" : "Perempuan") : "-" }}</td>
                      <td>{{ !is_null($student->samapta_score) ? $student->samapta_score->run_score : "-" }}</td>
                      <td>{{ !is_null($student->samapta_score) ? $student->samapta_score->pull_up_score : "-" }}</td>
                      <td>{{ !is_null($student->samapta_score) ? $student->samapta_score->push_up_score : "-" }}</td>
                      <td>{{ !is_null($student->samapta_score) ? $student->samapta_score->sit_up_score : "-" }}</td>
                      <td>{{ !is_null($student->samapta_score) ? $student->samapta_score->shuttle_score : "-" }}</td>
                      <td>{{ !is_null($student->samapta_score) ? $student->samapta_score->total : "-" }}</td>
                      <td class="{{ !$showActionButton ? 'd-none' : '' }}">
                        @if($showActionButton)
                          <div class="d-flex">
                            <button
                              type="button"
                              class="btn {{ is_null($student->samapta_score) ? 'btn-primary' : 'btn-warning' }} w-100"
                              data-toggle="modal"
                              data-target="#samaptaTryoutScoreModal"
                              data-id="{{ $student->btwedutech_id }}"
                              data-name="{{ $student->name }}"
                              data-gender="{{ is_null($student->samapta_score) ? 'null' : ($student->samapta_score->gender ? '1' : '0') }}"
                              data-run-score="{{ $student->samapta_score->run_score ?? 0 }}"
                              data-pull-up-score="{{ $student->samapta_score->pull_up_score ?? 0 }}"
                              data-push-up-score="{{ $student->samapta_score->push_up_score ?? 0 }}"
                              data-sit-up-score="{{ $student->samapta_score->sit_up_score ?? 0 }}"
                              data-shuttle-score="{{ $student->samapta_score->shuttle_score ?? 0 }}"
                              data-total="{{ $student->samapta_score->total ?? 0 }}"
                              data-type="{{ is_null($student->samapta_score) ? 'create' : 'edit' }}"
                            >
                              {{ is_null($student->samapta_score) ? "Tambah Nilai" :  "Edit Nilai" }}
                            </button>
                            {{-- <div class="dropdown">
                              <button class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary download-dropdown-button w-100" data-toggle="dropdown">
                                <span class="download-dropdown-button-text">Download</span>
                                <i data-feather="chevron-down" class="font-small-4"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-right">
                                <button
                                  type="button"
                                  class="dropdown-item w-100 download-report"
                                  data-id="{{ $student->btwedutech_id }}"
                                >
                                  Download Raport (Semua Nilai)
                                </button>
                                <button
                                  type="button"
                                  class="dropdown-item w-100 download-uka-challenge-report"
                                  data-id="{{ $student->btwedutech_id }}"
                                >
                                  Download Raport (Nilai UKA Challenge)
                                </button>

                              </div>
                            </div> --}}
                            {{-- <div class="dropdown">
                              <button class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary action-dropdown-button w-100" data-toggle="dropdown">
                                <span class="action-dropdown-button-text">Lihat Aksi</span>
                                <i data-feather="chevron-down" class="font-small-4"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-right">
                                <button
                                  type="button"
                                  class="dropdown-item w-100"
                                  data-toggle="modal"
                                  data-target="#samaptaTryoutScoreModal"
                                  data-id="{{ $student->smartbtw_id }}"
                                  data-name="{{ $student->name }}"
                                  data-gender="{{ is_null($student->samapta_score) ? 'null' : ($student->samapta_score->gender ? '1' : '0') }}"
                                  data-run-score="{{ $student->samapta_score->run_score ?? 0 }}"
                                  data-pull-up-score="{{ $student->samapta_score->pull_up_score ?? 0 }}"
                                  data-push-up-score="{{ $student->samapta_score->push_up_score ?? 0 }}"
                                  data-sit-up-score="{{ $student->samapta_score->sit_up_score ?? 0 }}"
                                  data-shuttle-score="{{ $student->samapta_score->shuttle_score ?? 0 }}"
                                  data-total="{{ $student->samapta_score->total ?? 0 }}"
                                  data-type="{{ is_null($student->samapta_score) ? 'create' : 'edit' }}"
                                >
                                  {{ is_null($student->samapta_score) ? "Tambah Nilai" :  "Edit Nilai" }}
                                </button>
                              </div>
                            </div> --}}
                          </div>
                        @else
                          -
                        @endif
                      </td>
                    </tr>
                  @empty
                    <tr>
                      <td class="text-center" colspan="10">Data Kosong</td>
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

  <div class="modal fade" id="samaptaTryoutScoreModal" tabindex="-1" role="dialog" aria-labelledby="samaptaTryoutScoreModalTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="samaptaTryoutScoreModalTitle"></h5>
        </div>
        <div class="modal-body">
          <form id="samaptaTryoutScoreModalForm" action="{{ route('nilai-tryout-samapta.upsert') }}" method="POST">
            @csrf
            <input type="hidden" name="smartbtw_id" id="smartbtw_id" value="" required />
            <div class="form-group">
              <label for="gender" class="form-label mb-75">Jenis Kelamin</label>
              <div class="d-flex">
                <div class="custom-control custom-radio mr-1">
                  <input class="custom-control-input" type="radio" name="gender" id="male" value="1" required>
                  <label class="custom-control-label" for="male">Laki-Laki</label>
                </div>
                <div class="custom-control custom-radio">
                  <input class="custom-control-input" type="radio" name="gender" id="female" value="0" required>
                  <label class="custom-control-label" for="female">Perempuan</label>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="run_score" class="col-form-label">Lari</label>
              <input type="text" class="form-control" name="run_score" id="run_score" required />
            </div>
            <div class="form-group">
              <label for="pull_up_score" class="col-form-label">Pull Up</label>
              <input type="number" min="0" max="100" class="form-control" name="pull_up_score" id="pull_up_score" required />
            </div>
            <div class="form-group">
              <label for="push_up_score" class="col-form-label">Push Up</label>
              <input type="number" min="0" max="100" class="form-control" name="push_up_score" id="push_up_score" required />
            </div>
            <div class="form-group">
              <label for="sit_up_score" class="col-form-label">Sit Up</label>
              <input type="number" min="0" max="100" class="form-control" name="sit_up_score" id="sit_up_score" required />
            </div>
            <div class="form-group">
              <label for="shuttle_score" class="col-form-label">Shuttle</label>
              <input type="number" min="0" max="100" class="form-control" name="shuttle_score" id="shuttle_score" required />
            </div>
            <div class="form-group">
              <label for="total" class="col-form-label">Total</label>
              <input type="number" min="0" max="500" class="form-control" name="total" id="total" required />
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
<script src="{{ asset(mix('js/scripts/pages/samapta-tryout-score/app.js')) }}"></script>
@endsection

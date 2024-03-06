@extends('layouts/contentLayoutMaster')

@section('title', "Stage Kelas $type")

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/sweetalert2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    #DataTables_Table_0_length,
    #DataTables_Table_0_filter,
    #DataTables_Table_0_info,
    #DataTables_Table_0_paginate
    {
      padding-left: 1em;
      padding-right: 1em;
    }
  </style>
@endsection

@section('content')

<!-- Basic table -->
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header border-bottom p-1">
          <div class="head-label"></div>
          <div class="text-right">
            <div class="d-inline-flex">
              <form action="/stages-kelas/{{$type}}/lock-status" method="POST">
                @csrf
                @method("PUT")
                <input type="hidden" name="is_locked" value="{{ !$isStagesLocked }}" />
                @if($isStagesLocked)
                  {{-- Unlock stage button --}}
                  <button type="submit" class="btn btn-outline-primary mr-1">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-unlock"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                      </svg> Buka Kunci Stage
                    </span>
                  </button>
                @else
                  {{-- Lock stage button --}}
                  <button type="submit" class="btn btn-outline-primary mr-1">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-lock"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg> Kunci Stage
                    </span>
                  </button>
                @endif
              </form>
              @if(!$isStagesLocked)
                <a href="/stages-kelas/{{$type}}/create" class="btn btn-primary">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="feather feather-lock mr-50 font-small-4"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg> Tambah Stage Baru
                  </span>
                </a>
              @endif
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Level</th>
                <th>Stage</th>
                <th>Syarat Stage</th>
                <th>Tipe Stage</th>
                <th>Tipe Modul</th>
                <th>Tanggal & Waktu Mulai</th>
                <th>Tanggal & Waktu Selesai</th>
                <th>Paket</th>
                @if(!$isStagesLocked)
                  <th>Aksi</th>
                @endif
              </tr>
            </thead>
            <tbody>
              @forelse($stages ?? [] as $index => $data)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $data->level }}</td>
                <td>{{ $data->stage }}</td>
                <td>{{ $data->required_stage }}</td>
                <td>{{ $data->stage_type }}</td>
                <td>{{ $data->module_type }}</td>
                <td>{{ \Carbon\Carbon::parse($data->start_date)->timezone("Asia/Jakarta")->format("Y-m-d H:i") }} WIB</td>
                <td>{{ \Carbon\Carbon::parse($data->end_date)->timezone("Asia/Jakarta")->format("Y-m-d H:i") }} WIB</td>
                <td>{{ $packages[$data->package_id]->title ?? "-" }}</td>
                @if(!$isStagesLocked)
                  <td>
                    <a href="/stages-kelas/{{ $data->type }}/{{ $data->_id }}/edit" class="btn btn-warning btn-sm">Edit</a>
                  </td>
                @endif
              </tr>
              @empty
              <tr>
                <td colspan="{{ $colspanAmount }}" class="text-center">Data kosong</td>
              </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/sweetalert2.all.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection

@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script>
  $(".datatables-basic").DataTable({
    language: {
      paginate: {
        previous: "&nbsp;",
        next: "&nbsp;",
      },
    }
  });
</script>
@endsection

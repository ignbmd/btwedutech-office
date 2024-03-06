@extends('layouts/contentLayoutMaster')

@section('title', 'Sesi Wawancara')

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
        @if($canCreateSession)
        <div class="card-header border-bottom p-1">
          <div class="head-label"></div>
          <div class="text-right">
            <div class="d-inline-flex">
              <a href="/sesi-wawancara/tambah" class="btn btn-primary">
                <i data-feather="plus"></i>
                <span>Tambah Sesi Wawancara</span>
              </a>
            </div>
          </div>
        </div>
        @endif
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Sesi</th>
                <th>Periode Sesi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @forelse($sessionInterview ?? [] as $index => $data)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $data->name }}</td>
                <td>{{ $data->description }}</td>
                <td>
                  @if($showActionDropdownButton)
                    <div class="d-flex flex-column" style="gap:5px">
                      <div class="dropdown">
                        <button class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                          <span>Lihat Aksi</span>
                          <i data-feather="chevron-down" class="font-small-4"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-right">
                          <a class="dropdown-item w-100" href="/hasil-wawancara/{{ $data->_id }}/user/{{$user->id}}">
                            Lihat Nilai Wawancara
                          </a>
                          @if($canEditSession)
                            <a class="dropdown-item w-100" href="/sesi-wawancara/edit/{{ $data->_id }}">
                              Edit Sesi Wawancara
                            </a>
                          @endif
                          @if($canDeleteSession)
                            <form action="{{ route('delete-sesi-wawancara', $data->_id) }}" method="POST">
                              @csrf
                              @method("DELETE")
                              <button type="submit" class="dropdown-item w-100" onclick="return confirm('Apakah anda yakin ingin menghapus sesi wawancara ini?')">Hapus Sesi Wawancara</button>
                            </form>
                          @endif
                        </div>
                      </div>
                    </div>
                  @else
                    <a class="btn btn-primary" role="button" href="hasil-wawancara/{{ $data->_id }}/user/{{$user->id}}">
                      Lihat Nilai Wawancara
                    </a>
                  @endif
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="4" class="text-center">Data kosong</td>
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
<style>
  tr:nth-child(even) {
      background-color:  #FFFFFF; /* Warna untuk kolom genap */
  }

  tr:nth-child(odd) {
      background-color: #f6f6f6; /* Warna untuk kolom ganjil */
  }
</style>
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

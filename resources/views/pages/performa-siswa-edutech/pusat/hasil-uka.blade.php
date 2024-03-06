@extends('layouts/contentLayoutMaster')

@section('title', 'Hasil UKA Siswa - '. $studentProfile->name)

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
<section id="basic-datatable">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="table-responsive">
                    <table class="datatable-basic table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama UKA</th>
                                <th>Tanggal Pengerjaan</th>
                                <th>Total Durasi Pengerjaan</th>
                                <th>Nilai TWK</th>
                                <th>Nilai TIU</th>
                                <th>Nilai TKP</th>
                                <th>Nilai Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($result as $index => $data)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $data->exam_name }}</td>
                                    <td>{{ $data->date_formatted }} {{ $data->time_formatted }}</td>
                                    <td>{{ $data->duration_formatted }}</td>
                                    <td class="{{ $data->category->twk->is_pass ? 'text-success' : 'text-danger' }}">{{ $data->category->twk->score }}</td>
                                    <td class="{{ $data->category->tiu->is_pass ? 'text-success' : 'text-danger' }}">{{ $data->category->tiu->score }}</td>
                                    <td class="{{ $data->category->tkp->is_pass ? 'text-success' : 'text-danger' }}">{{ $data->category->tkp->score }}</td>
                                    <td class="{{ $data->status ? 'text-success' : 'text-danger' }}">{{ $data->total }}</td>
                                    <td class="{{ $data->status ? 'text-success' : 'text-danger' }}">{{ $data->status == true ? "LULUS" : "TIDAK LULUS" }}</td>
                                </tr>
                            @empty
                            <tr>
                                <td colspan="9" class="text-center">Data kosong</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>
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
  $(".datatable-basic").DataTable(
    {
      language: {
        paginate: {
          // remove previous & next text from pagination
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      }
    }
  );
</script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Surat Terima Cash')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
@endsection

@section('page-style')
<style>
  #DataTables_Table_0_length, #DataTables_Table_0_info {
    margin-left: 1em;
  }
  #DataTables_Table_0_filter, #DataTables_Table_0_paginate {
    margin-right: 1em;
  }
</style>
@endsection

@section('content')

<!-- Basic table -->
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>No. Kwitansi</th>
                <th>Nama</th>
                <th>Harga</th>
                <th>Tujuan Pembayaran</th>
                <th>Dibuat Oleh</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @php $no = 1; @endphp
              @forelse ($proofs->data ?? [] as $data)
                <tr>
                  <td>{{ $no++ }}</td>
                  <td>{{ $data->ref_number ?? "-" }}</td>
                  <td>{{ $data->name ?? "-" }}</td>
                  <td>Rp {{ number_format($data->amount, 0, ",", ".") ?? "-" }}</td>
                  <td>{{ $data->payment_for ?? "-" }}</td>
                  <td>{{ $data->created_by ?? "-" }}</td>
                  <td>{{ \Carbon\Carbon::parse($data->created_at)->locale('id')->timezone('Asia/Jakarta')->format('Y-m-d H:i:s') }} WIB</td>
                  <td>
                    <div class="d-inline-flex">
                      <a target="__blank" href="/surat-terima-cash/{{ $data->id }}/download" class="pr-1 hide-arrow text-white btn btn-sm btn-gradient-primary">
                        Download
                      </a>
                    </div>
                  </td>
                </tr>
              @empty
                <tr>
                  <td colspan="8" class="text-center">Data tidak ditemukan</td>
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
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.checkboxes.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.buttons.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
@endsection

@section('page-script')
<script>
  $(".datatables-basic").DataTable({
    dom: '<"card-header border-bottom p-1"<"head-label"><"dt-action-buttons text-right"B>><"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
    buttons: [
      {
        text:
          feather.icons["plus"].toSvg({ class: "mr-50 font-small-4" }) +
          "Tambah Surat Terima Cash",
        className: "btn btn-primary",
        init: function (api, node, config) {
          $(node).removeClass("btn-secondary");
        },
        action: function (e, dt, button, config) {
          window.location = `${window.location.origin}/surat-terima-cash/tambah`;
        },
      },
    ],
    language: {
        paginate: {
          // remove previous & next text from pagination
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      },
  });
</script>
@endsection

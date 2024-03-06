@extends('layouts/contentLayoutMaster')

@section('title', 'Pengaturan Pajak')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
<link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
<style>
  #DataTables_Table_0_length, #DataTables_Table_0_info {
    margin-left: 1em;
  }
  #DataTables_Table_0_filter, #DataTables_Table_0_paginate {
    margin-right: 1em;
  }
</style>
@endsection

@php
use App\Helpers\UserRole;
@endphp

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
              <a href="/pengaturan-pajak/tambah" class="btn btn-primary">
                <i data-feather="user-plus"></i>
                <span>Tambah</span>
              </a>
            </div>
          </div>
        </div>
        <table class="datatables-basic table">
          <caption class="d-none">Pengaturan Pajak</caption>
          <thead>
            <tr>
              <th>No</th>
              <th>Produk</th>
              <th>Produk Dikenakan Pajak</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            @forelse ($taxSettings as $index => $taxSetting)
            <tr>
              <td>{{ $index + 1 }}</td>
              <td>
                @if($products[$taxSetting->product_code] ?? null)
                  {{ $products[$taxSetting->product_code]->title }} ({{ $taxSetting->product_code }})
                @else
                  {{ $taxSetting->product_code }}
                @endif
              </td>
              <td>
                <span class="badge badge-{{ $taxSetting->is_tax_active ? "success" : "danger" }}">
                  {{ $taxSetting->is_tax_active ? "Ya" : "Tidak" }}
                </span>
              </td>
              <td>
                <a class="btn btn-warning btn-sm" href="/pengaturan-pajak/{{$taxSetting->id}}/edit">Edit</a>
              </td>
            </tr>
            @empty
              <td colspan="4" class="text-center">Data tidak ditemukan</td>
            @endforelse
          </tbody>
        </table>
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
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script>
  $(".datatables-basic").DataTable({
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


@extends('layouts/contentLayoutMaster')

@section('title', 'Tagihan Cabang')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
@endsection

@section('page-style')
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
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Cabang</th>
                <th>Jenis Cabang</th>
                <th>Jumlah Tagihan Belum Dibayar</th>
              </tr>
            </thead>
            <tbody>
              @foreach ($branches as $branch)
                <tr>
                  <td>{{ $loop->iteration }}</td>
                  <td>{{ $branch->name }}</td>
                  <td>
                    @if($branch->tag)
                      {{ $branch->tag === "FRANCHISE" ? "Franchise" : "Dikelola Pusat" }}
                    @else - @endif
                  </td>
                  <td>{{ $branch->unpaid_bill_count }}</td>
                </tr>
              @endforeach
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
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
@endsection

@section('page-script')
  <script src="{{ asset(mix('/js/scripts/bill/branch-unpaid-bill.js')) }}"></script>
@endsection

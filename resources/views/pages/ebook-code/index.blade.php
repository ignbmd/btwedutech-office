@extends('layouts/contentLayoutMaster')

@section('title', "Kode Buku")

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
<div class="card">
  <div class="card-body">
    <form>
      <div class="form-row align-items-end">
        <div class="form-group col-md-3">
          <label for="inputDate">Program</label>
          <select class="custom-select" name="program" >
            <option selected value="">Pilh Program</option>
            <option value="skd" @if(request()->has('program') && request()->get('program') == 'skd') selected @endif>SKD</option>
            <option value="skb" @if(request()->has('program') && request()->get('program') == 'skb') selected @endif>SKB</option>
            <option value="tps" @if(request()->has('program') && request()->get('program') == 'tps') selected @endif>TPS</option>
            <option value="tpa" @if(request()->has('program') && request()->get('program') == 'tpa') selected @endif>TPA</option>
            <option value="pppk" @if(request()->has('program') && request()->get('program') == 'pppk') selected @endif>PPPK</option>
            <option value="tka-saintek" @if(request()->has('program') && request()->get('program') == 'tka-saintek') selected @endif>TKA Saintek</option>
            <option value="tka-soshum" @if(request()->has('program') && request()->get('program') == 'tka-soshum') selected @endif>TKA Soshum</option>
            <option value="tka-campuran" @if(request()->has('program') && request()->get('program') == 'tka-campuran') selected @endif>TKA Campuran</option>
          </select>
        </div>
        <div class="form-group col-md-3">
          <label for="inputDate">Dari Tanggal</label>
          <input type="date" class="form-control" id="start" name="start" value="@if(request()->has('start')){{request()->get('start')}}@endif">
        </div>
        <div class="form-group col-md-3">
          <label for="inputDate">Sampai Tanggal</label>
          <input type="date" class="form-control" id="end" name="end" value="@if(request()->has('end')){{request()->get('end')}}@endif">
        </div>
        <div class="form-group col-md-3">
          <button type="submit-form" class="btn btn-primary">Filter</button>
        </div>
      </div>
    </form>
  </div>
</div>


<!-- Basic table -->
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header border-bottom p-1">
          <div class="head-label"></div>
          <div class="text-right">
            <div class="d-inline-flex">
              <a href="/kode-buku/generate" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book mr-50">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>Generate Kode Buku</span>
              </a>
              <a href="{{ route('kode-buku', ['program' => request()->program,'start'=> request()->start,'end'=> request()->end]); }}" class="btn btn-success ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Kode Buku
              </a>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Buku</th>
                <th>Program</th>
                <th>Bonus Koin BTW Edutech</th>
                <th>Bonus Modul Smart BTW</th>
                <th>Tanggal Dibuat</th>
              </tr>
            </thead>
            <tbody>
              @forelse($codes ?? [] as $index => $data)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $data->code }}</td>
                <td>{{ $data->program }}</td>
                <td>{{ $data->bonus_value }}</td>
                <td>{{ $data->bonus_value_smartbtw ?? "-" }}</td>
                <td>{{ \Carbon\Carbon::parse($data->created_at)->timezone("Asia/Jakarta")->format('Y-m-d H:i:s') . ' WIB' }}</td>
              </tr>
              @empty
              <tr>
                <td colspan="6" class="text-center">Data kosong</td>
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

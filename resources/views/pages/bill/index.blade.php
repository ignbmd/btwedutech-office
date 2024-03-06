@extends('layouts/contentLayoutMaster')

@section('title', 'Tagihan')

@section('vendor-style')
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
@endsection
@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    .close-pointer {
      cursor: pointer;
    }
  </style>
@endsection
@section('content')

<!-- Basic table -->
<section id="basic-datatable">
  <div id="allowed" class="d-none">{{json_encode($allowed)}}</div>
  <div id="user" class="d-none">{{json_encode($user)}}</div>
  <div id="paymentWebHost" class="d-none">{{ env('PAYMENT_WEB_HOST') }}</div>

  @if($userBranchTag === "FRANCHISE")
  <form id="filter-form">
    <div class="card">
      <h5 class="card-header">Filter Data</h5>
      <div class="d-flex justify-content-between align-items-center mx-50 row pt-0 pb-2" id="filter-form-container">
        {{-- <div class="col-md-4">
          <select id="branch_code" class="form-control text-capitalize mb-md-0 mb-2" required>
            <option value="" selected> Pilih Cabang </option>
          </select>
        </div>
        <div class="col-md-4">
          <select id="product_type" name="product_type" class="form-control text-capitalize mb-md-0 mb-2" required>
            <option value="" selected> Pilih Tipe Produk </option>
          </select>
        </div>
        <div class="col-md-4 user_status">
          <button type="submit" id="btnFilter" class="btn btn-primary waves-effect waves-float waves-light" disabled>Filter Data</button>
        </div> --}}
      </div>
    </div>
  </form>
  @endif

  <div class="row">
    <div class="col-12">
      <div class="card">
        <table class="datatables-basic table" id="transaction-table">
          <thead>
            <tr>
              <th></th>
              <th>No</th>
              <th>Nama</th>
              <th></th>
              <th>Email</th>
              <th>Nama Produk</th>
              <th>Tanggal Transaksi</th>
              <th>Tanggal <span style="white-space: nowrap">Jatuh Tempo</span></th>
              <th>Total Harga</th>
              <th>Sisa</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="10" class="text-center">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.buttons.min.js')) }}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/transaction/transaction-datatables.js')) }}"></script>
@endsection

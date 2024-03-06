@extends('layouts/contentLayoutMaster')

@section('title', 'Tagihan')

@section('vendor-style')
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">

@endsection
@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    .dataTables_length {
      padding-left: 1em;
    }
    .dataTables_filter {
      padding-right: 1em;
    }
    .close-pointer {
      cursor: pointer;
    }
  </style>
@endsection

@section('content')
@if(!$hasTypeQueryParam && !$hasBranchCodeQueryParam)
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

<!-- Basic table -->
<section id="basic-datatable">
  <div id="allowed" class="d-none">{{json_encode($allowed)}}</div>
  <div id="user" class="d-none">{{json_encode($user)}}</div>
  <div id="paymentWebHost" class="d-none">{{ env('PAYMENT_WEB_HOST') }}</div>
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="table-responsive">
          <table class="datatables-basic table" id="transaction-table" style="width:100%">
            <thead>
              <tr>
                <th></th>
                <th>No</th>
                <th>Nama</th>
                <th></th>
                <th>Email</th>
                <th id="product-name-header">Nama Produk</th>
                <th id="branch-code-header">Kode Cabang</th>
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
  </div>
</section>
<!--/ Basic table -->

<div class="modal fade" id="onlineTransactionModal" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Histori Transaksi #490</h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
      </div>
      <div class="modal-body">
        <table class="table">
          <tr data-dt-row="0" data-dt-column="1">
            <td>No. Transaksi:</td>
            <td>#490</td>
          </tr>
          <tr data-dt-row="0" data-dt-column="2">
            <td>Catatan:</td>
            <td>Pembayaran kedua (note edit)</td>
          </tr>
          <tr data-dt-row="0" data-dt-column="3">
            <td>Total Bayar:</td>
            <td>
              <span class="badge badge-pill badge-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg> Rp&nbsp;2.700.000
              </span>
            </td>
          </tr>
          <tr data-dt-row="0" data-dt-column="4">
            <td>Biaya:</td>
            <td>
              <span class="badge badge-pill badge-warning">
                Rp&nbsp;0
              </span>
            </td>
          </tr>
          <tr data-dt-row="0" data-dt-column="5">
            <td>Sub Total:</td>
            <td>
              <span class="badge badge-pill badge-primary">
                Rp&nbsp;2.700.000
              </span>
            </td>
          </tr>
          <tr data-dt-row="0" data-dt-column="6">
            <td>Metode Transaksi:</td>
            <td>Cash</td>
          </tr>
          <tr data-dt-row="0" data-dt-column="7">
            <td>Status:</td>
            <td>
              <span class="badge badge-glow badge-success capitalize">
                APPROVED
              </span>
            </td>
          </tr>
          <tr data-dt-row="0" data-dt-column="8">
            <td>Dibuat oleh:</td>
            <td>Dwiky Chandra Pusat</td>
          </tr>
          <tr data-dt-row="0" data-dt-column="9">
            <td>Tanggal Transaksi:</td>
            <td>22 Dec 2021 15:15:31 WIB</td>
          </tr>
          <tr data-dt-row="0" data-dt-column="10">
            <td>Bukti Pembayaran:</td>
            <td>
              <span class="badge badge-light-secondary">
                Belum Ada
              </span>
            </td>
          </tr>
          <tr data-dt-row="0" data-dt-column="11">
            <td>Actions:</td>
            <td>
              <div class="d-inline-flex">
                <a class="pr-1 dropdown-toggle hide-arrow text-white btn btn-sm btn-gradient-primary" data-toggle="dropdown">
                  Pilihan
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down font-small-4"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a href="/tagihan/kwitansi/490/pdf" class="dropdown-item" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text font-small-4 mr-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Download Kwitansi
                  </a>

                  <a href="/tagihan/kwitansi/490/print" class="dropdown-item" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text font-small-4 mr-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Print Kwitansi
                  </a>

                  <a class="dropdown-item" data-toggle="modal" data-target="#send-receipt-sidebar" data-id="490" onclick="selectTransactionId(490)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text font-small-4 mr-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Kirim Kwitansi
                  </a>

                  <a href="/admin/tagihan/detail/441/edit/490" class="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit font-small-4 mr-50"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit Transaksi
                  </a>

                  <a class="dropdown-item delete-transaction">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash font-small-4 mr-50 text-danger"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Hapus Transaksi
                  </a>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</div>
@endsection


@section('vendor-script')
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.buttons.min.js')) }}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js" integrity="sha512-AA1Bzp5Q0K1KanKKmvN/4d3IRKVlv9PYgwFPvm32nPO6QS8yH1HO7LbgB1pgiOxPtfeg5zEn2ba64MUcqJx6CA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/transaction/admin-transaction-datatables.js')) }}"></script>
@endsection

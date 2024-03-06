@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Transaksi')

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/pages/bill/detail.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  @endsection

  @section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
@endsection



@section('content')
  <span id="user" class="d-none">{{json_encode($user)}}</span>
  <span id="allowed" class="d-none">{{json_encode($allowed)}}</span>
  <span id="billId" class="d-none">{{$billId}}</span>
  <span id="transactionId" class="d-none">{{$transactionId}}</span>
  <section id="form-container">
      <!-- App Design Card -->
      <div class="card card-app-design">
          <div class="card-body">
              <div class="badge badge-light-primary">Transaksi #1234</div>
              <div class="mt-2">
                  <h6 class="mb-1">Detail transaksi per tanggal 09/09/2021:</h6>
                  <table>
                      <tbody>
                          <tr>
                              <td class="pr-1">Total tagihan:</td>
                              <td><b>Rp 10.000.000</b></td>
                          </tr>
                          <tr>
                              <td class="pr-1">Sudah dibayar:</td>
                              <td class="text-success">Rp 5.000.000</td>
                          </tr>
                          <tr>
                              <td class="pr-1">Sisa pembayaran saat ini:</td>
                              <td class="text-danger">Rp 2.000.000</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>

      <!--/ App Design Card -->
      <div class="card">
          <div class="card-body">
              <div class="row">
                  <div class="col-12 col-md-6">
                      <form action="" method="POST">
                          @csrf
                          <div class="form-group">
                              <label class="form-label" for="base-price">
                                  Nominal
                              </label>
                              <input type="text" name="base_price" class="form-control numeral-mask" id="base-price"
                                  placeholder="Inputkan nominal tagihan" value="2000000" />
                          </div>
                          <div class="form-group">
                              <label class="form-label" for="status-active">
                                  Status
                              </label>
                              <div class="d-flex">
                                  <div class="custom-control custom-radio mr-1">
                                      <input type="radio" id="status-active" name="status" class="custom-control-input"
                                          value="1" />
                                      <label class="custom-control-label" for="status-active">Cash</label>
                                  </div>
                                  <div class="custom-control custom-radio">
                                      <input type="radio" id="status-inactive" name="status" class="custom-control-input"
                                          value="0" />
                                      <label class="custom-control-label" for="status-inactive">Transfer</label>
                                  </div>
                              </div>
                          </div>
                          <div class="mt-3 text-right">
                              <button type="submit" class="btn btn-gradient-success data-submit">
                                  <i data-feather='save'></i> Buat Tagihan
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      </div>
  </section>
@endsection


@section('vendor-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
  <script src="{{ asset(mix('js/scripts/bill/edit-bill-transaction.js')) }}"></script>
@endsection

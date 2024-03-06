@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Status Tagihan')

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
  <section id="form-container">
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-12 col-md-6">
            <form id="submit-form" action="/tagihan/{{$billId}}/status" method="POST">
              @csrf
              @method("PUT")
              <div class="form-group">
                <label>No. Tagihan</label>
                <input type="text" class="form-control" value="{{ $bill->id }}" disabled />
              </div>
              <div class="form-group">
                <label>Tagihan Kepada</label>
                <input type="text" class="form-control" value="{{ $bill->bill_to }} ({{ $bill->email }})" disabled />
              </div>
              <div class="form-group">
                <label>Produk</label>
                <input type="text" class="form-control" value="{{ $bill->title }}" disabled />
              </div>
              <div class="form-group">
                <label>Nominal Tagihan</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Rp</span>
                  </div>
                  <input type="text" class="form-control price-format" value="{{ number_format($bill->final_bill) }}" disabled />
                </div>
              </div>
              <div class="form-group">
                <label>Diskon Tagihan</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Rp</span>
                  </div>
                  <input type="text" class="form-control price-format" value="{{ number_format($bill->final_discount) }}" disabled />
                </div>
              </div>
              <div class="form-group">
                <label>Sudah Dibayar</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Rp</span>
                  </div>
                  <input type="text" class="form-control price-format" value="{{ number_format($bill->paid_bill) }}" disabled />
                </div>
              </div>
              <div class="form-group">
                <label>Sisa Tagihan</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Rp</span>
                  </div>
                  <input type="text" class="form-control price-format" value="{{ number_format($bill->remain_bill) }}" disabled />
                </div>
              </div>
              <div class="form-group">
                <label>Status Tagihan</label>
                <select name="status" class="form-control" required>
                  <option value="OPEN" @if($bill->status === "OPEN") selected @endif>OPEN</option>
                  <option value="CLOSED" @if($bill->status === "CLOSED") selected @endif>CLOSED</option>
                </select>
                @error('status')<p class="text-danger">{{ $message }}</p>@enderror
              </div>
              <div class="mt-3 text-right">
                <button type="submit" class="btn btn-success" id="submit-button">
                  <i data-feather='save' class="mr-50"></i> Perbarui
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
  <script src="{{ asset(mix('vendors/js/pickers/flatpickr/flatpickr.min.js')) }}"></script>
@endsection

@section('page-script')
  <script>
    const formElement = document.getElementById("submit-form");
    const submitButtonElement = document.getElementById("submit-button");
    formElement.addEventListener("submit", function() {
      this.classList.add("block-content");
      submitButtonElement.disabled = true;
    });
  </script>
@endsection

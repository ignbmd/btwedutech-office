@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Tanggal Jatuh Tempo Tagihan')

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
            <form action="/tagihan/{{$billId}}/due-date" method="POST">
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
                <label for="due_date">Tanggal Jatuh Tempo Tagihan</label>
                <input type="text" class="form-control flatpickr" name="due_date" id="due_date" required value="{{ $bill->due_date }}"/>
              </div>
              <div class="mt-3 text-right">
                <button type="submit" class="btn btn-success data-submit">
                  <i data-feather='save' class="mr-50"></i> Simpan
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
  <script src="{{ asset(mix('js/scripts/bill/edit-due-date.js')) }}"></script>
@endsection

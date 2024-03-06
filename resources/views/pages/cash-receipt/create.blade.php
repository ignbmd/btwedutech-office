@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Surat Terima Cash')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('page-style')
<style>
  @media (min-width: 992px) {
    #button-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: right;
    }
    #create-button {
      margin-left: 1em
    }
  }
</style>
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-lg-6">
          <form method="POST" name="form" id="form" enctype="multipart/form-data" target="_blank">
            @csrf

            <div class="form-group">
              <label class="form-label" for="name">Nama</label>
              <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ isset($bill) ? $bill->bill_to : old('name') ?? "" }}" required />
              @error('name') <p class="text-danger">{{ $message }}</p> @enderror
            </div>

            <div class="form-group">
              <label class="form-label" for="amount">Nominal</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input type="text" id="amount" name="amount" class="form-control price-input @error('amount') is-invalid @enderror" value="{{ old('amount') ?? "" }}" required />
              </div>
              @error('amount') <p class="text-danger">{{ $message }}</p> @enderror
            </div>

            <div class="form-group">
              <label class="form-label" for="form-label">Tujuan Pembayaran</label>
              <input type="text" id="payment_for" name="payment_for" class="form-control @error('payment_for') is-invalid @enderror" value="{{ isset($bill) ? "Pembayaran $bill->title" : old('payment_for') ?? "" }}" required />
              @error('payment_for') <p class="text-danger">{{ $message }}</p> @enderror
            </div>

            <div id="button-container" class="mt-3 text-right">
              <button type="submit" id="preview-button" class="btn btn-outline-info">
                <i data-feather='zoom-in' class="mr-50"></i> Lihat Dokumen
              </button>
              <button type="submit" id="create-button" class="btn btn-success">
                <i data-feather='save' class="mr-50"></i> Tambah Dokumen
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
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/cleave/cleave.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/cleave/addons/cleave-phone.id.js')) }}"></script>

@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/cash-receipt/create.js')) }}"></script>
@endsection

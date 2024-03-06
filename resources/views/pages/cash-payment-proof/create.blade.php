@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Bukti Pembayaran Cash')

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
              <label class="form-label" for="phone">No. HP</label>
              <input type="number" id="phone" name="phone" class="form-control @error('phone') is-invalid @enderror" min="0" value="{{ isset($bill) ? $bill->phone : old('phone') ?? "" }}" required />
              @error('phone') <p class="text-danger">{{ $message }}</p> @enderror
            </div>

            <div class="form-group">
              <label class="form-label" for="address">Alamat (Opsional)</label>
              <input type="text" id="address" name="address" class="form-control" value="{{ isset($bill) ? $bill->address : old('address') ?? "" }}" />
            </div>

            <div class="form-group">
              <label class="form-label" for="amount">Harga</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input type="text" id="amount" name="amount" class="form-control price-input @error('amount') is-invalid @enderror" value="{{ old('amount') ?? "" }}" required />
              </div>
              @error('amount') <p class="text-danger">{{ $message }}</p> @enderror
            </div>

            <div class="form-group">
              <label class="form-label" for="form-label">Tujuan Pembayaran</label>
              <input type="text" id="payment_for" name="payment_for" class="form-control @error('payment_for') is-invalid @enderror" value="{{ isset($bill) ? "Pembayaran $bill->title" : old('payment_for') ?? "" }}" required>
              @error('payment_for') <p class="text-danger">{{ $message }}</p> @enderror
            </div>

            <div class="form-group">
              <label class="form-label" for="branch_code">Kode Cabang</label>
              <select name="branch_code" id="branch_code" class="form-control select2 @error('branch_code') is-invalid @enderror" required>
                <option value="">Pilih kode cabang</option>
                @if(is_array($branches))
                  @foreach ($branches as $branch)
                    <option
                      value="{{ $branch->code }}" {{ isset($bill) ? $bill->branch_code == $branch->code ? 'selected' : '' : (old('branch_code') == $branch->code ? 'selected' : '') }}
                    >
                      {{ $branch->name }}
                    </option>
                  @endforeach
                @else
                  <option value="{{ $branches->code }}">{{ $branches->name }}</option>
                @endif
              </select>
              @error('branch_code') <p class="text-danger">{{ $message }}</p> @enderror
            </div>

            <div id="button-container" class="mt-3 text-right">
              <button type="submit" id="preview-button" class="btn btn-outline-info">
                <i data-feather='zoom-in' class="mr-50"></i> Lihat Bukti Pembayaran
              </button>
              <button type="submit" id="create-button" class="btn btn-success">
                <i data-feather='save' class="mr-50"></i> Tambah Bukti Pembayaran
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
<script src="{{ asset(mix('js/scripts/pages/cash-proof-payment/create.js')) }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Pengaturan Pajak')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('pengaturan-pajak.update', $taxSetting->id) }}" method="POST">
            @csrf
            @method("PUT")
            <div class="form-group">
              <label class="form-label d-block" for="product_code">
                Produk
              </label>
              <select
                id="product_code"
                name="product_code"
                class="form-control select2 hide-search"
                placeholder="Pilih produk"
                required
              >
                @foreach($products as $product)
                  <option value="{{ $product->product_code }}"
                    {{ $product->product_code === $taxSetting->product_code ? "selected" : "" }}
                  >
                    {{ $product->title }} ({{ $product->product_code }})
                  </option>
                @endforeach
              </select>
              @error("product_code")
                <div class="text-error">{{$message}}</div>
              @enderror
            </div>
            <div class="form-group d-flex flex-column">
              <label class="form-label">
                Apakah produk dikenakan pajak?
              </label>
              <div class="mt-50 custom-switch custom-control custom-control-inline">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  name="is_tax_active"
                  id="is_tax_active"
                  {{ $taxSetting->is_tax_active ? "checked" : "" }}
                >
                <label class="custom-control-label is-tax-active-label" for="is_tax_active">
                  {{ $taxSetting->is_tax_active ? "Ya" : "Tidak" }}
                </label>
              </div>
              @error('is_tax_active')
                <div class="text-error">{{$message}}</div>
              @enderror
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
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script>
  $(".select2").select2({ placeholder: "Pilih produk" });
  $("#is_tax_active").on("change", function() {
    if (this.checked) $(".is-tax-active-label").text("Ya");
    else $(".is-tax-active-label").text("Tidak");
  });
</script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Atur Besaran Diskon Per Mitra')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
    <style>
    .text-error {
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.857rem;
      color: #ea5455;
    }
  </style>
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('pengaturan-diskon-per-mitra.update', $affiliateDiscountSetting->id) }}" method="POST">
            @csrf
            @method("PUT")
            <div class="form-group">
              <label class="form-label">
                Mitra
              </label>
              <select class="form-control select2" disabled>
                <option selected>{{ $affiliateData->name }} ({{ $affiliateData->email }})</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="product">
                Produk
              </label>
              <select
                class="form-control select2"
                name="product"
                aria-placeholder="Pilih produk"
                required
              >
                <option value="">Pilih produk</option>
                @foreach($products as $product)
                  <option
                    value="{{ json_encode($product) }}"
                    {{ $affiliateDiscountSetting->product_code == $product->product_code ? 'selected' : ''}}
                  >
                    {{ $product->title }} ({{ $product->product_code }}) - Rp. {{ number_format($product->sell_price) }}
                  </option>
                @endforeach
              </select>
              @error("product_code")
                <div class="text-error">{{ $message }}</div>
              @enderror
            </div>
            <div class="form-group">
              <label class="form-label" for="type">
                Tipe Diskon
              </label>
              <select
                class="form-control select2"
                name="type"
                id="type"
                aria-placeholder="Pilih tipe diskon"
                required
              >
                <option
                  value="PERCENT"
                  @if($affiliateDiscountSetting->type === "PERCENT") selected @endif
                >
                  PERCENT
                </option>
                <option
                  value="FIXED"
                  @if($affiliateDiscountSetting->type === "FIXED") selected @endif
                >
                  FIXED
                </option>
              </select>
              @error("type")
                <div class="text-error">{{ $message }}</div>
              @enderror
            </div>
            <div class="form-group">
              <div id="amount-input-container">
              </div>
              @error("amount")
                <div class="text-error">{{ $message }}</div>
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
<script src="{{ asset(mix('vendors/js/forms/cleave/cleave.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script>
  (function (window, document, $) {
    "use strict";

    const amountInputContainerElementID = "#amount-input-container";
    const amountTypeSelectElementID = "#type";
    const amountInputElementID = "#amount";

    const amountInputContainerElement = $(amountInputContainerElementID);
    const amountTypeSelectElement = $(amountTypeSelectElementID);
    let amountInputElement = $(amountInputElementID);

    let amountTypeHasChangedCount = 0;
    let affiliateDiscountSetting = @json($affiliateDiscountSetting);

    function loadAmountFormInput() {
      amountInputContainerElement.empty();
      if (amountTypeSelectElement.val() === "FIXED") {
        loadFixedAmountFormInput();
        return;
      }
      loadPercentAmountFormInput();
    }

    function loadFixedAmountFormInput() {
      const markup = generateFixedAmountInputMarkup();
      amountInputContainerElement.append(markup);
      if(!amountTypeHasChangedCount) {
        setInitialPortionAmountFormValue();
      }
      new Cleave('.fixed-input-amount', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand'
      });
    }

    function loadPercentAmountFormInput() {
      const markup = generatePercentAmountInputMarkup();
      amountInputContainerElement.append(markup);
      if(!amountTypeHasChangedCount) {
        setInitialPortionAmountFormValue();
      }
    }

    function generatePercentAmountInputMarkup() {
      return `
        <label class="form-label" for="amount">
          Nominal Porsi
        </label>
        <div class="input-group">
          <input
            type="number"
            name="amount"
            id="amount"
            min="0"
            max="100"
            class="form-control"
            placeholder="Masukan nominal porsi"
            required
          >
          <div class="input-group-append">
            <span class="input-group-text">%</span>
          </div>
        </div>
      `;
    }

    function generateFixedAmountInputMarkup() {
      return `
        <label class="form-label" for="amount">
          Nominal Porsi
        </label>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">Rp</span>
          </div>
          <input
            type="text"
            name="amount"
            id="amount"
            class="form-control fixed-input-amount"
            placeholder="Masukan nominal porsi"
            required
          >
        </div>
      `;
    }

    function setInitialPortionAmountFormValue() {
      amountInputElement = $(amountInputElementID);
      amountInputElement.val(affiliateDiscountSetting.amount);
      amountTypeHasChangedCount = amountTypeHasChangedCount + 1;
    }

    function handleSubmitForm(e) {
      e.preventDefault();

      const submitButton = $('.data-submit');
      submitButton.html(`
        ${feather.icons["save"].toSvg({
          class: "font-small-4 mr-25",
        })} Menyimpan Data
      `);
      submitButton.attr("disabled", true);
      this.classList.add('block-content');
      this.submit();
    }

    $(document).on("change", amountTypeSelectElementID, loadAmountFormInput);
    $("form").on("submit", handleSubmitForm);

    loadAmountFormInput();

  })(window, document, jQuery);

</script>
@endsection

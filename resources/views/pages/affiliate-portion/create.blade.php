@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Atur Besaran Komisi Per Mitra')

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
          <form action="{{ route('pengaturan-porsi-per-mitra.store') }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label" for="affiliate">
                Mitra
              </label>
              <select
                id="affiliate-select"
                class="form-control select2"
                name="affiliates[]"
                aria-placeholder="Pilih mitra"
                multiple="multiple"
                required
              >
                {{-- <option value="">Pilih mitra</option> --}}
                <option value="ALL" class="ALL">Pilih Semua Mitra</option>
                @foreach($affiliates as $affiliate)
                  <option
                    value="{{ json_encode($affiliate) }}"
                    {{ old('affiliate') == json_encode($affiliate) ? 'selected' : ''}}
                  >
                    {{ $affiliate->name }} ({{ $affiliate->email }})
                  </option>
                @endforeach
              </select>
              @error("affiliate")
                <div class="text-error">{{ $message }}</div>
              @enderror
            </div>
            <div class="form-group">
              <label class="form-label" for="product">
                Produk
              </label>
              <select
                id="product-select"
                class="form-control select2"
                name="products[]"
                aria-placeholder="Pilih produk"
                multiple
                required
              >
                {{-- <option value="">Pilih produk</option> --}}
                <option value="ALL">Pilih Semua Produk</option>
                @foreach($products as $product)
                  <option
                    value="{{ json_encode($product) }}"
                    {{ old('product') == json_encode($product) ? 'selected' : '' }}
                  >
                    {{ $product->title }} ({{ $product->product_code }})
                  </option>
                @endforeach
              </select>
              @error("product_code")
                <div class="text-error">{{ $message }}</div>
              @enderror
            </div>
            <div class="form-group">
              <label class="form-label" for="amount_type">
                Tipe Nominal Porsi
              </label>
              <select
                class="form-control select2"
                name="amount_type"
                id="amount_type"
                aria-placeholder="Pilih tipe nomimal porsi"
                required
              >
                <option value="PERCENT">PERCENT</option>
                <option value="FIXED">FIXED</option>
              </select>
              @error("amount_type")
                <div class="text-error">{{ $message }}</div>
              @enderror
            </div>
            <div class="form-group">
              <label class="form-label" for="type">
                Tipe Porsi
              </label>
              <select
                class="form-control select2"
                name="type"
                aria-placeholder="Pilih tipe porsi"
                required
              >
                <option value="">Pilih Tipe Porsi</option>
                <option value="UPLINE_FEE">UPLINE</option>
                <option value="NORMAL_FEE">DOWNLINE</option>
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
    const amountTypeSelectElementID = "#amount_type";
    const amountInputElementID = "#amount";
    const affiliateSelectElementID = "#affiliate-select";
    const productSelectElementID = "#product-select";

    const amountInputContainerElement = $(amountInputContainerElementID);
    const amountTypeSelectElement = $(amountTypeSelectElementID);
    const amounInputElement = $(amountTypeSelectElementID);
    const affiliateSelectElement= $(affiliateSelectElementID);
    const productSelectElement= $(productSelectElementID);

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
      new Cleave('.fixed-input-amount', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand'
      });
    }

    function loadPercentAmountFormInput() {
      const markup = generatePercentAmountInputMarkup();
      amountInputContainerElement.append(markup);
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
            min="0"
            class="form-control fixed-input-amount"
            placeholder="Masukan nominal porsi"
            required
          >
        </div>
      `;
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

    // Menambahkan Placeholder ke Field Mitra
    affiliateSelectElement.select2({
        placeholder: "Pilih Mitra",
        allowClear: true
    });

    // Menambahkan Placeholder ke Field Produk
    productSelectElement.select2({
        placeholder: "Pilih Produk",
        allowClear: true
    });

    // Tambahkan event listener untuk perubahan pemilihan
    affiliateSelectElement.on('change', function() {
      // Ambil nilai yang dipilih
      const selectedValues = affiliateSelectElement.val();
    
      // Periksa apakah "Pilih Semua Mitra" dipilih
      if (selectedValues && selectedValues.includes('ALL')) {
        // Jika "Pilih Semua Mitra" dipilih, nonaktifkan semua opsi lain
        affiliateSelectElement.find('option[value!="ALL"]').prop('disabled', true);
      } else {
        // Jika opsi lain dipilih, nonaktifkan "Pilih Semua Mitra"
        affiliateSelectElement.find('option[value="ALL"]').prop('disabled', true);
        // Aktifkan kembali opsi yang telah dipilih
        affiliateSelectElement.find('option[value!="ALL"]').prop('disabled', false);
      }
    });
    // Tambahkan event listener untuk memantau perubahan pemilihan setelah semua perubahan terjadi
    affiliateSelectElement.on('select2:unselect', function() {
      // Ambil nilai yang dipilih
      const selectedValues = affiliateSelectElement.val();

      // Jika tidak ada opsi yang dipilih, aktifkan kembali "Pilih Semua Mitra"
      if (!selectedValues || selectedValues.length === 0) {
        affiliateSelectElement.find('option[value="ALL"]').prop('disabled', false);
      }
    });

    // Tambahkan event listener untuk perubahan pemilihan
    productSelectElement.on('change', function() {
      // Ambil nilai yang dipilih
      const selectedValues = productSelectElement.val();
    
      // Periksa apakah "Pilih Semua Mitra" dipilih
      if (selectedValues && selectedValues.includes('ALL')) {
        // Jika "Pilih Semua Mitra" dipilih, nonaktifkan semua opsi lain
        productSelectElement.find('option[value!="ALL"]').prop('disabled', true);
      } else {
        // Jika opsi lain dipilih, nonaktifkan "Pilih Semua Mitra"
        productSelectElement.find('option[value="ALL"]').prop('disabled', true);
        // Aktifkan kembali opsi yang telah dipilih
        productSelectElement.find('option[value!="ALL"]').prop('disabled', false);
      }
    });
    // Tambahkan event listener untuk memantau perubahan pemilihan setelah semua perubahan terjadi
    productSelectElement.on('select2:unselect', function() {
      // Ambil nilai yang dipilih
      const selectedValues = productSelectElement.val();

      // Jika tidak ada opsi yang dipilih, aktifkan kembali "Pilih Semua Mitra"
      if (!selectedValues || selectedValues.length === 0) {
        productSelectElement.find('option[value="ALL"]').prop('disabled', false);
      }
    });
  })(window, document, jQuery);

</script>
@endsection

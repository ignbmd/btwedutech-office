@extends('layouts/contentLayoutMaster')

@section('title', 'Kirim Ranking Grup Tryout Kode')

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
          <form id="form" action="{{ route('ranking.send-group-ranking') }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label d-block" for="tryout_code_category_id">
                Kategori Tryout Kode
              </label>
              <select id="tryout_code_category_id" name="tryout_code_category_id" class="form-control hide-search @error('tryout_code_category_id') is-invalid @enderror" required>
                <option value="">Pilih Kategori Tryout Kode</option>
                @foreach($tcCategory as $category)
                  <option value="{{ $category->id }}">{{ $category->name }}</option>
                @endforeach
              </select>
              @error('tryout_code_category_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="tryout_code_group">
                Grup Tryout Kode
              </label>
              <select id="tryout_code_group" name="tryout_code_group" class="form-control hide-search @error('tryout_code_group') is-invalid @enderror" required>
              </select>
              @error('tryout_code_group') <div class="invalid-feedback">{{ $message }}</div> @enderror
            </div>

            <div class="mt-3 d-flex text-right">
              <button type="submit" class="btn btn-outline-primary" id="download-button">
                <i data-feather='file' class="mr-50"></i> Download
              </button>
              <button type="submit" class="btn btn-success ml-1" id="send-button">
                <i data-feather='send' class="mr-50"></i> Kirim
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
  (function (window, document, $) {
  "use strict";
  const form = document.getElementById("form");
  const downloadButton = document.getElementById('download-button');
  const sendButton = document.getElementById('send-button');
  let submitType = null;

  $("#tryout_code_category_id").select2({
    placeholder: "Pilih Kategori Kode Tryout",
  });

  loadEventListeners();

  // Events
  function loadEventListeners() {
    $("#tryout_code_category_id").on("change", function (e) {
      // Remove previous kabupaten / kota options
      $("#tryout_code_group").empty().trigger("change");
      populateTryoutCodeGroup(e.target.value);
    });

    downloadButton.addEventListener("click", () => {
      submitType = "download";
    });
    sendButton.addEventListener("click", () => {
      submitType = "send";
    });

    $("form").on("submit", function (e) {
      e.preventDefault();
      submitForm(this);
    });
  }
  // Functions
  function populateTryoutCodeGroup(tryout_code_category_id) {
    $.ajax({
      url: `/api/exam/tryout-code-category/${tryout_code_category_id}/groups`,
      method: "GET",
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        $("#tryout_code_group").select2({
          data: data?.data,
          placeholder: "Pilih Grup Tryout Kode",
        });
      },
    });
  };

  function submitForm(form) {
    downloadButton.disabled = true;
    sendButton.disabled = true;
    form.classList.add('block-content');
    if(submitType == "download") form.action = "/ranking/group-tryout-kode/download-pdf";
    else form.action = "/ranking/group-tryout-kode/send-pdf";
    form.submit();
  }

})(window, document, jQuery);

</script>
@endsection

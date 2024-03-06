@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Sekolah')

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
          <form action="{{ route('sekolah.store') }}" method="POST">
            @csrf

            <div class="form-group">
              <label class="form-label" for="type">
                Tipe Sekolah
              </label>
              <select name="type" class="select2 form-control" required>
                <option value="SMA">SMA/MA</option>
                <option value="SMK">SMK</option>
              </select>
              <p class="text-danger">@error('type'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="name">
                Nama Sekolah
              </label>
              <input type="text" class="form-control" name="name" id="name" value="{{ old('name') ?? '' }}" required />
              <p class="text-danger">@error('name'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="province_id">
                Provinsi
              </label>
              <select name="province_id" id="province_id" class="select2 form-control" required></select>
              <p class="text-danger">@error('province_id'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="region_id">
                Kabupaten/Kota
              </label>
              <select name="region_id" id="region_id" class="select2 form-control" required></select>
              <p class="text-danger">@error('region_id'){{ $message }}@enderror</p>
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
<script>
  (function (window, document, $) {
  "use strict";
  populateProvince();


  // Events
  $("#province_id").on("change", function () {
    // Remove previous kabupaten / kota options
    $("#region_id").empty().trigger("change");

    populateRegion();
  });

  $("form").on("submit", function (e) {
    e.preventDefault();
    submitForm(this);
  });


  // Functions
  function populateProvince() {
    const province_id = $("#province_id").val();
    $.ajax({
      url: "/api/location",
      method: "GET",
      dataType: "json",
      data: {
        type: "PROVINCE"
      },
      success: function (data, textStatus, jqXHR) {
        const provinces = data.data.map((item) => ({ id: item._id, text: item.name }));
        $("#province_id").select2({
          data: provinces
        });
        populateRegion();
      },
    });
  };

  function populateRegion() {
    const province_id = $("#province_id").val();
    $.ajax({
      url: `/api/location`,
      method: "GET",
      dataType: "json",
      data: {
        type: "REGION",
        parent_id: province_id
      },
      success: function (data, textStatus, jqXHR) {
        const regions = data.data.map((item) => ({ id: item._id, text: item.name }));
        $("#region_id").select2({
          data: regions
        });
      },
    });
  };

  function submitForm(form) {
    const submitButton = $('.data-submit');
    submitButton.html(`
      ${feather.icons["save"].toSvg({
        class: "font-small-4 mr-25",
      })} Menyimpan Data
    `);
    submitButton.attr("disabled", true);
    form.classList.add('block-content');
    form.submit();
  }

})(window, document, jQuery);

</script>
@endsection

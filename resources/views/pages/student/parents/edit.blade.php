@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Data Orang Tua Siswa')

@section('vendor-style')
{{-- vendor css files --}}
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
          <form method="POST" action="{{ route('siswa.orangtua.update', $studentId) }}">
            @csrf
            @method('PUT')
            <div class="form-group">
              <label class="form-label" for="parent_name">
                Nama Orang Tua Siswa
              </label>
              <input type="text" class="form-control" id="parent_name" name="parent_name" placeholder="Masukkan Nama Orang Tua Siswa" value="{{ old('parent_name') }}" required/>
              @error('parent_name')
                <p class="text-danger">{{ $message }}</p>
              @enderror
            </div>

            <div class="form-group">
                <label class="form-label" for="parent_number">
                  No. HP Orang Tua Siswa
                </label>
                <input type="text" class="form-control" id="parent_number" name="parent_number" placeholder="Masukkan No. HP Orang Tua Siswa" value="{{ old('parent_number') }}" required/>
                @error('parent_number')
                  <p class="text-danger">{{ $message }}</p>
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
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
<script>
  (function (window, document, $) {
  "use strict";

  // Events
  $("form").on("submit", function (e) {
    e.preventDefault();
    submitForm(this);
  });

  // Functions
  function submitForm(form) {
    const submitButton = $('.data-submit');
    submitButton.html(`
      ${feather.icons["save"].toSvg({
        class: "font-small-4 mr-25",
      })} Memperbarui Data
    `);
    submitButton.attr("disabled", true);
    form.classList.add('block-content');
    form.submit();
  }

})(window, document, jQuery);

</script>
@endsection

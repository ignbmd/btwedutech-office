@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Mentor Lama')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
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
          <form action="{{ route('mentor.store-legacy') }}" method="POST">
            @csrf

            <div class="form-group">
              <label class="form-label d-block" for="branch_code">
                Cabang
              </label>
              <select id="branch_code" name="branch_code" class="form-control" required>
                <option value="" selected>Pilih Cabang</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="branch_code">
                Mentor
              </label>
              <select id="sso_id" name="sso_id[]" class="form-control" required multiple disabled>
              </select>
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
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>

<script>
  $(function() {
    "use strict";

    $("#sso_id").select2();

    populateBranches();

    $("#branch_code").on('change', function(event) {
      if(event.target.value === "") {
        $("#sso_id").val("").trigger('change');
        $("#sso_id").attr('disabled', true);
      } else {
        $("#sso_id").attr('disabled', false);
        populateMentors();
      }
    });

    $("form").on("submit", function (e) {
      e.preventDefault();
      submitForm(this);
    });

    function populateBranches() {
      $.ajax({
        url: '/api/branch/all',
        method: 'GET',
        dataType: 'json',
        success: function(results) {
          const data = $.map(results.data, function(obj) {
            obj.id = obj.id || obj.code;
            obj.text = `${obj.code} - ${obj.name}`;

            return obj;
          });
          $("#branch_code").select2({data: data, placeholder: "Pilih Cabang"});
        }
      });
    }

    function populateMentors() {
      let currentBranchCode = $("#branch_code").val();
      console.log(currentBranchCode);
      $.ajax({
        url: '/api/mentor/excluded-legacy',
        method: 'GET',
        dataType: 'json',
        data: { branch_code: currentBranchCode },
        success: function(results) {
          const data = $.map(results, function(obj) {
            obj.id = obj.id;
            obj.text = `${obj.name} (${obj.email})`;

            return obj;
          });
          $("#sso_id").empty();
          $("#sso_id").select2({data: data, placeholder: "Pilih Mentor"});
        }
      });
    }

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

  });
</script>
@endsection

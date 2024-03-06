@extends('layouts/contentLayoutMaster')

@section('title', 'Ubah Email Zoom Meeting Siswa')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('content')
<!-- Basic table -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('kelas.member.update-zoom-email', ['classId' => $classroom_id, 'memberId' => $member->smartbtw_id])}}" method="POST">
            @csrf
            @method('PUT')
            <input type="hidden" name="classmember_id" value="{{ $member->_id }}" />
            <div class="form-group">
              <label class="form-label">
                Nama Siswa
              </label>
              <input type="text" class="form-control dt-full-name" value="{{ $member->name }}" disabled/>
            </div>

            <div class="form-group">
              <label class="form-label">
                Email Smart BTW/BTW Edutech
              </label>
              <input type="text" class="form-control dt-full-name" value="{{ $member->email }}" disabled/>
            </div>

            <div class="form-group">
              <label class="form-label">
                Email Zoom Meeting
              </label>
              <input type="email" name="zoom_email" class="form-control dt-full-name" value="{{ $zoomParticipant->zoom_email }}" required/>
            </div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='save' class="mr-50"></i> Perbarui
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script>
  $("#classroom_id").select2({});


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
      })} Menyimpan Data
    `);
    submitButton.attr("disabled", true);
    form.classList.add('block-content');
    form.submit();
  }
</script>
@endsection

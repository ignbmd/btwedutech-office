@extends('layouts/contentLayoutMaster')

@section('title', "Edit $class->title")

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="/pembelajaran/kelas/update/{{$class?->_id}}" method="POST">
            @csrf
            <x-learning.class-body-form :branches="$branches" type="edit" :utype="$userType" :data="$class" :products="$products" :errors="$errors" />
            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='save'></i> Simpan
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
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script>
  $("#branch_code").select2();
  $("#product_id").select2();
  $("#is_online").on("change", function() {
    if (this.checked) $(".is-online-label").text("Kelas Online");
    else $(".is-online-label").text("Kelas Offline");
  });
</script>
@endsection

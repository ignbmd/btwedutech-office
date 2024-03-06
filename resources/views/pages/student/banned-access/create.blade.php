@extends('layouts/contentLayoutMaster')

@section('title', "Tambah Batas Akses Siswa $studentName ($studentAppType)")

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
            <form action="/siswa/{{$smartbtw_id}}/banned-access" method="POST">
              @csrf
            <div class="form-group">
              <label class="form-label" for="disallowed_access">
                Batas Akses
              </label>
              <select id="disallowed_access" name="disallowed_access" class="form-control" required>
                <option value="">Pilih Batas Akses</option>
                <option value="ACCESS_STAGES">ACCESS_STAGES</option>
                <option value="ACCESS_CLASSROOM_SCHEDULES">ACCESS_CLASSROOM_SCHEDULES</option>
                <option value="ACCESS_ONLINE_CLASS">ACCESS_ONLINE_CLASS</option>
                <option value="ACCESS_STUDY_MATERIAL">ACCESS_STUDY_MATERIAL</option>
                <option value="ACCESS_LOGIN">ACCESS_LOGIN</option>
              </select>
              <p class="text-danger">@error('disallowed_access'){{ $message }}@enderror</p>
            </div>
            {{-- <div class="form-group">
              <label class="form-label" for="Action">
                Aksi
              </label>
              <input type="alphabet" class="form-control" id="Action" name="Action" min="1" value="{{ old('access') ?? "" }}" required/>
              <p class="text-danger">@error('Action'){{ $message }}@enderror</p>
            </div> --}}
            <div class="float-right">
              <button type="submit" class="btn btn-success">Tambah Batas Akses</button>
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

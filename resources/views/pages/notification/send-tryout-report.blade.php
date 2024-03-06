@extends('layouts/contentLayoutMaster')

@section('title', 'Kirim Raport Siswa')

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
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <div class="alert alert-info mt-1 alert-validation-msg" role="alert">
            <div class="alert-body">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info mr-50 align-middle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Raport yang akan dikirim adalah hasil latihan yang telah dikerjakan siswa selama 7 hari kebelakang</span>
            </div>
          </div>
          <input type="hidden" id="is_central_user" value="{{ $is_central_user ? "1" : "0" }}">
          <form action="{{ route('notifikasi.send-tryout-report') }}" method="POST">
            @csrf
            <div class="form-group">
              @if($is_central_user)
                <label for="branch_code">Cabang</label>
                <select name="branch_code" id="branch_code" class="form-control select2" required disabled>
                </select>
              @else
                <input type="hidden" name="branch_code" id="branch_code" value="{{ $auth_user->branch_code }}" />
              @endif
            </div>

            <div class="form-group">
              <label for="classroom_id">Kelas</label>
              <select name="classroom_id" id="classroom_id" class="form-control select2" required disabled>
              </select>
            </div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='send' class="mr-50"></i> Kirim Rapor
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
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/notifikasi/send-tryout-report.js')) }}"></script>
@endsection

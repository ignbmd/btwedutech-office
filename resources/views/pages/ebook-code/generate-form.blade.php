@extends('layouts/contentLayoutMaster')

@section('title', 'Generate Kode Buku')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/sweetalert2.min.css')) }}">
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
          <form action="{{ route('kode-buku.generate') }}" id="generate-ebook-form" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label" for="level">
                Generate Jumlah Kode Buku
              </label>
              <div class="input-group">
                <input type="number" min="1" name="code_count" class="form-control @error('code_count') is-invalid @enderror" placeholder="8" required>
                <div class="input-group-append">
                  <span class="input-group-text">Kode Buku</span>
                </div>
              </div>
              <p class="text-danger">@error('code_count'){{ $message }}@enderror</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="program">
                Program
              </label>
              <select name="program" id="program" class="form-control @error('program') is-invalid @enderror" placeholder="Pilih program" required>
              </select>
              <p class="text-danger">@error('program'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="bonus_value">
                Bonus Koin Aplikasi BTW Edutech
              </label>
              <select name="bonus_value" id="bonus_value" class="form-control @error('bonus_value') is-invalid @enderror" placeholder="Pilih bonus koin" required>
                @foreach($coinRewards as $reward)
                  <option value="{{ $reward->code_name }}">{{ $reward->code_name }}</option>
                @endforeach
              </select>
              <p class="text-danger">@error('bonus_value'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="product">
                Bonus Modul Aplikasi Smart BTW (Opsional)
              </label>
              <select id="product" name="product" class="form-control select2">
              </select>
            </div>

            <div class="mt-3 text-right">
              <button type="submit" id="submit-button" class="btn btn-success">
                <i data-feather='book' class="mr-50"></i> Generate Kode Buku
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
<script src="{{ asset(mix('vendors/js/extensions/sweetalert2.all.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/ebook-code/generate-form.js')) }}"></script>
@endsection

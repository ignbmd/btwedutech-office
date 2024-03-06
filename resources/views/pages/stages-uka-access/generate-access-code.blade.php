@extends('layouts/contentLayoutMaster')

@section('title', 'Akses UKA Stage')

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
          <form action="{{ route('akses-uka-stages.generate-kode-akses') }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label d-block" for="stage">
                UKA Stage
              </label>
              <select id="stage" name="stage" class="form-control select2 hide-search" required>
                <option value="">Pilih Stage</option>
                @foreach ($stages as $stage)
                  <option value="{{ json_encode($stage) }}">Level {{ $stage->level }} Stage {{  $stage->stage }} ({{ $stage->type }}) {{ $stage->stage_type ? " - " . $stage->stage_type : "" }}</option>
                @endforeach
              </select>
              <p class="text-danger">@error('stage'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="stage">
                Kelas
              </label>
              <select id="classroom" name="classroom" class="form-control select2 hide-search" required>
                <option value="">Pilih Kelas</option>
                @foreach ($classrooms as $classroom)
                  <option value="{{ json_encode($classroom) }}">{{ $classroom->title }} ({{ $classroom->year }})</option>
                @endforeach
              </select>
              <p class="text-danger">@error('classroom'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="session">
                Sesi UKA
              </label>
              <select id="session" name="session" class="form-control select2 hide-search" required>
                <option value="">Pilih Sesi</option>
                <option value="1">Sesi 1</option>
                <option value="2">Sesi 2</option>
                <option value="3">Sesi 3</option>
              </select>
              <p class="text-danger">@error('session'){{ $message }}@enderror</p>
            </div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='save' class="mr-50"></i> Generate Kode Akses UKA
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
<script>
  $(".select2").select2();
</script>
@endsection

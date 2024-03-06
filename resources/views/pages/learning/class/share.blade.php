@extends('layouts/contentLayoutMaster')

@section('title', "Bagikan $class->title")

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
          <form action="/pembelajaran/kelas/share/{{$class->_id}}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label d-block" for="branch_code">Cabang</label>
              <select name="branch_code" id="branch_code" class="form-control" required>
                @foreach ($branches as $branch)
                  <option value="{{ $branch->code }}">{{ $branch->name }}</option>
                @endforeach
              </select>
            </div>
            <div class="form-group">
              <label class="form-label d-block" for="sso_id">Pengguna</label>
              <select name="sso_id[]" id="sso_id" multiple="multiple"></select>
            </div>
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
<script src="{{ asset(mix('js/scripts/pages/classroom/share-classroom.js')) }}"></script>
@endsection

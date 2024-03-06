@extends('layouts/contentLayoutMaster')

@section('title', 'Import Data Kelas Siswa')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
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
          <form action="/import/add-class-to-student" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
              <label for="classroom_id">Kelas</label>
              <select name="classroom_id" id="classroom_id" class="form-control select2" required>
                <option value="">Pilih Kelas</option>
                @foreach($classrooms as $classroom)
                  <option value="{{ $classroom->_id }}">({{ $classroom->branch_code }}) - {{ $classroom->title }}</option>
                @endforeach
              </select>
            </div>
            <div class="form-group">
              <label for="file" class="form-label">Berkas</label>
              <div class="custom-file">
                <input type="file" name="file" class="custom-file-input" id="file" required />
                <label class="custom-file-label" for="file">Pilih Berkas</label>
              </div>
              <div class="mt-3 text-right">
                <a href="https://btw-cdn.com/excel_import_template/template_import_kelas_siswa.xlsx" class="btn btn-primary" target="_blank">Download Template</a>
                <button type="submit" class="btn btn-success data-submit">
                  Import Data
                </button>
              </div>
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
  $(function () {
    $('form').on('submit', function() {
      $('form').addClass('block-content');
      $('.data-submit').html(`Memproses`);
      $('.data-submit').attr("disabled", true);
    });
  })
</script>
@endsection

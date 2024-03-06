@extends('layouts/contentLayoutMaster')

@section('title', 'Nilai Materi Siswa')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<!-- Basic table -->
<form>
  <div class="card">
    <h5 class="card-header">Filter Data Nilai</h5>
    <div class="d-flex justify-content-between align-items-center mx-50 row pt-0 pb-2">
      <div class="col-md-4 user_role">
        <select id="program" name="program" class="form-control text-capitalize mb-md-0 mb-2" required>
          <option value=""> Pilih Program </option>
          <option value="skd" class="text-capitalize" {{ !request()->has('program') || request()->get('program') == 'skd' ? 'selected' : '' }} >SKD</option>
          <option value="tps" class="text-capitalize" {{  request()->get('program') == 'tps' ? 'selected' : '' }}>TPS</option>
        </select>
      </div>
      <div class="col-md-4 user_plan">
        <select id="type" name="type" class="form-control text-capitalize mb-md-0 mb-2" required>
          <option value=""> Pilih Tipe Latihan </option>
          <option value="pre-test" class="text-capitalize" {{ request()->get('type') == 'pre-test' ? 'selected' : '' }}>Pre Test</option>
          <option value="post-test" class="text-capitalize" {{ !request()->has('type') || request()->get('type') == 'post-test' ? 'selected' : '' }} >Post Test</option>
        </select>
      </div>
      <div class="col-md-4 user_status">
        <button type="submit" class="btn btn-primary waves-effect waves-float waves-light">Filter Data</button>
      </div>
    </div>
  </div>
</form>

<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                @foreach ($materials as $header)
                  <th>{{ $header->title }}</th>
                @endforeach
              </tr>
            </thead>
            <tbody>
              @forelse($members as $key => $member)
              <tr>
                <td>{{ $key + 1 }}</td>
                <td>{{ $member->name }}</td>
                <td>{{ $member->email }}</td>
                @foreach($member->scores as $key => $score)
                  <td>
                    <a href="#" data-toggle="tooltip" data-placement="top" title data-original-title="{{ $member->repeat[$key] }}">{{ $score }}</a>
                  </td>
                @endforeach
              </tr>
              @empty
              <tr>
                <td>Data kosong</td>
              </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.checkboxes.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.buttons.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jszip.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/pdfmake.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/vfs_fonts.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/buttons.html5.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/buttons.print.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/learning/classmember-datatables.js')) }}"></script>
@endsection

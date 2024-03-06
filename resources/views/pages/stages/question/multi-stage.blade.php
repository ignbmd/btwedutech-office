@extends('layouts/contentLayoutMaster')

@section('title', $page_title)

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/sweetalert2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    #DataTables_Table_0_length,
    #DataTables_Table_0_filter,
    #DataTables_Table_0_info,
    #DataTables_Table_0_paginate
    {
      padding-left: 1em;
      padding-right: 1em;
    }
  </style>
@endsection

@section('content')

<!-- Basic table -->
<section>
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-body">
          <form action="/soal-multistages" method="GET" class="d-flex align-items-center" style="gap: 10px">
            <div class="form-group flex-fill">
              <label for="program">Program</label>
              <select name="program" class="form-control select2" id="program" required>
                <option value="">Pilih Program</option>
                @foreach($valid_programs as $valid_program)
                  <option
                    value="{{ $valid_program }}"
                    @if($valid_program == $program) selected @endif
                  >
                    {{ $valid_program }}
                  </option>
                @endforeach
              </select>
            </div>
            <div class="form-group flex-fill">
              <label for="stage_type">Kelas</label>
              <select name="stage_type" class="form-control select2" id="stage_type" required>
                <option value="">Pilih Kelas</option>
                <option value="REGULER" @if($stage_type == "REGULER") selected @endif>REGULER</option>
                <option value="BINSUS" @if($stage_type == "BINSUS") selected @endif>BINSUS</option>
                <option value="INTENSIF" @if($stage_type == "INTENSIF") selected @endif>INTENSIF</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary mt-50">Filter</button>
          </form>
        </div>
      </div>
    </div>
  </div>
  @if($fetch_multi_stage_data)
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Level</th>
                <th>Stage</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @forelse($stages?->data ?? [] as $index => $data)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $data->level }}</td>
                <td>{{ $data->stage }}</td>
                <td>
                  <a href="/soal-multistages/{{ $program }}/{{$data->_id}}/soal" class="btn btn-info btn-sm">Lihat Soal Stage</a>
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="4" class="text-center">Data kosong</td>
              </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  @endif
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/sweetalert2.all.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection

@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script>
  $(".datatables-basic").DataTable({
    language: {
      paginate: {
        previous: "&nbsp;",
        next: "&nbsp;",
      },
    }
  });
</script>
@endsection

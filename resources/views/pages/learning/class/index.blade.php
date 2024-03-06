@extends('layouts/contentLayoutMaster')

@section('title', 'Kelas')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
<link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@php
use App\Helpers\UserRole;
@endphp

@section('content')
<div id="allowed" class="d-none">{{json_encode($allowed)}}</div>
<div id="is_admin" class="d-none">{{UserRole::isAdmin() ? '1' : '0'}}</div>
<div id="is_mentor" class="d-none">{{UserRole::isMentor() ? '1' : '0'}}</div>
<div id="user_branch_code" class="d-none">{{ json_encode($auth_user_branch_code) }}</div>
<div id="user_id" class="d-none">{{ $auth_user_id }}</div>

<div class="card card-statistics">
  <div class="card-body statistics-body">
    @php
      $summary = config('ui.learning.classroom.status');
    @endphp
    <div class="row mt-1">
      @foreach ($summary as $key => $value)
        @php
          $status = $summary[$key];
        @endphp
        <div class="col-md-3 col-sm-6 col-12 mb-2 mb-sm-0">
          <div class="media">
            <div class="avatar bg-light-{{$value['color']}} mr-2">
              <div class="avatar-content">
                <i data-feather="{{$status['icon']}}" class="avatar-icon"></i>
              </div>
            </div>
            <div class="media-body my-auto">
              <h4 id="COUNT_{{$key}}" class="font-weight-bolder mb-0">{{$status['count']}}</h4>
              <p class="card-text font-small-3 mb-0">Kelas {{$status['text']}}</p>
            </div>
          </div>
        </div>
      @endforeach
    </div>
  </div>
</div>
<!-- Basic table -->
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <table class="datatables-basic table">
          <thead>
            <tr>
              <th></th>
              <th>No</th>
              <th></th>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th>Jumlah Siswa</th>
              {{-- @if (UserRole::isAdmin() || UserRole::isMentor())
                <th>Cabang</th>
              @endif --}}
              <th>Cabang</th>
              <th>Kuota</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center" colspan="9">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Modal to add new record -->
  <div class="modal modal-slide-in fade" id="modals-slide-in">
    <div class="modal-dialog sidebar-sm">
      <form class="add-new-record modal-content pt-0">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">×</button>
        <div class="modal-header mb-1">
          <h5 class="modal-title" id="exampleModalLabel">Kelas Baru</h5>
        </div>
        <div class="modal-body flex-grow-1">
          <x-learning.class-body-form type="add" :branches="$branches" :products="$products" :utype="$userType" />
          <div class="mt-3">
            <button type="button" class="btn btn-primary data-submit mr-1">Simpan</button>
            <button type="reset" class="btn btn-outline-secondary" data-dismiss="modal">Batal</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
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
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/learning/class-datatables.js')) }}"></script>
<script>
  $("#branch_code").select2();
  $("#product_id").select2();
  $("#is_online").on("change", function() {
    if (this.checked) $(".is-online-label").text("Kelas Online");
    else $(".is-online-label").text("Kelas Offline");
  });
</script>
@endsection


@extends('layouts/contentLayoutMaster')

@section('title', 'Anggota Kelas')

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

<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <table class="datatables-basic table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Email</th>
              @if($isOnlineClass)
                <th>Email Zoom Siswa</th>
              @endif
              @if($show_action_button)
              <th>Aksi</th>
              @endif
            </tr>
          </thead>
          <tbody>
            @forelse($members as $key => $member)
            <tr>
              <td>{{ $key + 1 }}</td>
              <td>{{ $member->name }}</td>
              <td>{{ $member->email }}</td>
              @if($isOnlineClass)
                <td>{{ $zoomParticipants[$member?->smartbtw_id]?->zoom_email ?? "-" }}</td>
              @endif
              @if($show_action_button)
              <td>
                <div class="d-inline-flex">
                  <a class="pr-1 dropdown-toggle text-white btn btn-sm btn-gradient-primary" data-toggle="dropdown">
                    Lihat
                  </a>
                  <div class="dropdown-menu dropdown-menu-right">
                    @if($can_show_member_detail)
                      <a href="/siswa/detail/{{ $member->smartbtw_id }}" class="btn btn-flat-transparent dropdown-item w-100">Lihat Detail Siswa</a>
                    @endif
                    @if($can_edit_member)
                      <a href="/pembelajaran/kelas/{{ $member->classroom_id }}/members/{{ $member->smartbtw_id }}/edit" class="btn btn-flat-transparent dropdown-item w-100">Ubah Kelas Siswa</a>
                    @endif
                    @if($isOnlineClass && $can_edit_member_zoom_email)
                      <a href="/pembelajaran/kelas/{{ $member->classroom_id }}/members/{{ $member->smartbtw_id }}/edit-zoom-email" class="btn btn-flat-transparent dropdown-item w-100">Ubah Email Zoom Siswa</a>
                    @endif
                    @if($can_remove_member)
                      <form method="POST" action="/pembelajaran/kelas/{{ $member->classroom_id }}/members/{{ $member->smartbtw_id }}">
                        @csrf
                        @method('DELETE')
                        <button type="submit" onclick="return confirm('Apakah anda yakin ingin menghapus data siswa ini dari kelas?')" class="btn btn-flat-transparent dropdown-item w-100">Hapus Siswa Dari Kelas</button>
                      </form>
                    @endif
                  </div>
                </div>
              </td>
              @endif
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

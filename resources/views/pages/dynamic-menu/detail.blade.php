@extends('layouts/contentLayoutMaster')

@section('title', 'Dynamic Survey Form - Detail')

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
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Lengkap</th>
                <th>No. WhatsApp</th>
                <th>Email</th>
                <th>Akun Media Sosial (Instagram)</th>
                <th>Asal Sekolah SMA/MA/Setara</th>
                <th>Jurusan</th>
                <th>Tahun Lulus</th>
                <th>Nama PTN</th>
                <th>Prodi / Jurusan</th>
                <th>Tahun Diterima</th>
                {{-- <th>Kemampuan Penalaran Umum</th>
                <th>Kemampuan Memahami Bacaan dan Menulis</th>
                <th>Pengetahuan Kuantitatif</th>
                <th>Pengetahuan dan Pemahaman Umum</th>
                <th>Literasi Bahasa Indonesia</th>
                <th>Literasi Bahasa Inggris</th>
                <th>Penalaran Matematika</th> --}}
                <th>Nilai UTBK-SNBT</th>
                <th>Screenshot Bukti Lulus UTBK</th>
                <th>Screenshot Bukti Nilai UTBK</th>
              </tr>
            </thead>
            <tbody>
              @forelse($detail ?? [] as $index => $data)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $data->name }}</td>
                <td>{{ $data->phone }}</td>
                <td>{{ $data->email }}</td>
                <td>{{ $data->link_socialmedia }}</td>
                <td>{{ $data->school_origin }}</td>
                <td>{{ $data->major }}</td>
                <td>{{ $data->graduate_year }}</td>
                <td class="truncate">
                  @if(strlen($data->ptn_target) > 20)
                    {{ substr($data->ptn_target, 0, 20) }}...
                  @else
                        {{ $data->ptn_target }}
                  @endif</td>
                <td>{{ $data->ptn_major_target }}</td>
                <td>{{ $data->ptn_year }}</td>
                {{-- <td>{{ $data->topic_penalaran_umum }}</td>
                <td>{{ $data->topic_bacaan_dan_menulis }}</td>
                <td>{{ $data->topic_pengetahuan_kuantitatif }}</td>
                <td>{{ $data->topic_pemahaman_umum }}</td>
                <td>{{ $data->topic_bahasa_indonesia }}</td>
                <td>{{ $data->topic_bahasa_inggris }}</td>
                <td>{{ $data->topic_penalaran_matematika }}</td> --}}
                <td>{{ $data->utbk_score }}</td>
                <td>
                  <a class="btn btn-outline-primary {{  !$data->utbk_pass_screenshot ? "disabled" : "" }}" href="{{ $data->utbk_pass_screenshot ? $data->utbk_pass_screenshot : "#" }}" {{  $data->utbk_pass_screenshot ? "download" : "" }}>
                    {{ $data->utbk_pass_screenshot ? "Download" : "Tidak tersedia" }}
                  </a>
                </td>
                <td>
                  <a class="btn btn-outline-primary {{  !$data->utbk_screenshot ? "disabled" : "" }}" href="{{ $data->utbk_screenshot ? $data->utbk_screenshot : "#" }}" {{  $data->utbk_screenshot ? "download" : "" }}>
                    {{ $data->utbk_screenshot ? "Download" : "Tidak tersedia" }}
                  </a>
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="14" class="text-center">Data kosong</td>
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
<style>
  tr:nth-child(even) {
      background-color:  #FFFFFF; /* Warna untuk kolom genap */
  }

  tr:nth-child(odd) {
      background-color: #f6f6f6; /* Warna untuk kolom ganjil */
  }
</style>
<style>
  .truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
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

@extends('layouts/contentLayoutMaster')

@section('title', 'Hasil Wawancara')

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
        <div class="card-header border-bottom p-1">
          <div class="head-label"></div>
          <div class="text-right">
            <div class="d-inline-flex">
              <a href="/hasil-wawancara/tambah" class="btn btn-primary">
                <i data-feather="user-plus"></i>
                <span>Tambah Hasil Wawancara</span>
              </a>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>Detail</th>
                <th>No</th>
                <th width="15%">Nama Siswa</th>
                <th>Profil Dan Potensi Calon Taruna</th>
                <th>Prestasi Dan Kemampuan Bahasa Asing</th>
                <th>Hasil Wawancara</th>
                <th class="none">Bersedia Pindah Jurusan</th>
                <th class="none">Kata Penutup</th>
                <th>Pewawancara</th>
                <th>Catatan</th>
                <th class="none">Penampilan</th>
                <th class="none">Cara Duduk dan Berjabat</th>
                <th class="none">Praktek Baris Berbaris</th>
                <th class="none">Penampilan dan Sopan Santun</th>
                <th class="none">Kepercayaan Diri dan Stabilitas Emosi</th>
                <th class="none">Komunikasi</th>
                <th class="none">Pengembangan Diri</th>
                <th class="none">Integritas</th>
                <th class="none">Kerjasama</th>
                <th class="none">Mengelola Perubahan</th>
                <th class="none">Perekat Bangsa</th>
                <th class="none">Pelayanan Publik</th>
                <th class="none">Pengambilan Keputusan</th>
                <th class="none">Orientasi Hasil</th>
                <th class="none">Prestasi Akademik</th>
                <th class="none">Prestasi Non Akademik</th>
                <th class="none">Bahasa Asing</th>
                {{-- <th>Aksi</th> --}}
              </tr>
            </thead>
            <tbody>
              @forelse($resultInterview ?? [] as $index => $data)
              <tr>
                <td>&nbsp;</td>
                <td>{{ $index + 1 }}</td>
                <td>{{ $data->name }}</td>
                <td>{{ $data->profil_dan_potensi_calon_taruna }}</td>
                <td>{{ $data->prestasi_dan_kemampuan_bahasa_asing }}</td>
                <td>{{ $data->final_score }}</td>
                <td>
                  <span class="badge {{ $data->bersedia_pindah_jurusan ? 'badge-success' : 'badge-danger' }}">
                    {{ $data->bersedia_pindah_jurusan ? 'Bersedia' : 'Tidak Bersedia' }}
                  </span>
                </td>
                <td>
                  <span class="badge {{ isset($data->closing_statement) && $data->closing_statement ? 'badge-success' : 'badge-danger' }}">
                      {{ isset($data->closing_statement) ? ($data->closing_statement ? 'Iya' : 'Tidak') : 'Tidak Tersedia' }}
                  </span>
                </td>              
                <td>{{ $data->created_by->name }}</td>
                <td><strong><i>{{ $data->note ? $data->note : "-" }}</i></strong></td>
                <td>{{ $data->penampilan }}</td>
                <td>{{ $data->cara_duduk_dan_berjabat }}</td>
                <td>{{ $data->praktek_baris_berbaris }}</td>
                <td>{{ $data->penampilan_sopan_santun }}</td>
                <td>{{ $data->kepercayaan_diri_dan_stabilitas_emosi }}</td>
                <td>{{ $data->komunikasi }}</td>
                <td>{{ $data->pengembangan_diri }}</td>
                <td>{{ $data->integritas }}</td>
                <td>{{ $data->kerjasama }}</td>
                <td>{{ $data->mengelola_perubahan }}</td>
                <td>{{ $data->perekat_bangsa }}</td>
                <td>{{ $data->pelayanan_publik }}</td>
                <td>{{ $data->pengambilan_keputusan }}</td>
                <td>{{ $data->orientasi_hasil }}</td>
                <td>{{ $data->prestasi_akademik }}</td>
                <td>{{ $data->prestasi_non_akademik }}</td>
                <td>{{ $data->bahasa_asing }}</td>
                {{-- <td>
                    <div class="btn-group">
                      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                        Pilih Aksi
                      </button>
                      <div class="dropdown-menu">
                        <a class="dropdown-item w-100" href="/hasil-wawancara/edit/{{$data->_id}}">
                          <i data-feather="edit"></i>
                          Edit</a>
                      </div>
                    </div>
                </td> --}}
              </tr>
              @empty
              <tr>
                <td colspan="24" class="text-center">Data kosong</td>
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
<script>
  const dt_basic_table = $(".datatables-basic");
  if(dt_basic_table.length) {
    dt_basic_table.DataTable({
      columnDefs: [
        {
          // For Responsive
          className: "control",
          orderable: false,
          responsivePriority: 1,
          targets: 0,
          // defaultContent: "",
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              const data = row.data();
              return 'Detail Hasil Wawancara ' + data[2];
            }
          }),
          type: "column",
          renderer: $.fn.dataTable.Responsive.renderer.tableAll({
            tableClass: 'table'
          })
        }
      },
      language: {
        paginate: {
          previous: "&nbsp;",
          next: "&nbsp;",
        },
      }
    });
  }
</script>
@endsection

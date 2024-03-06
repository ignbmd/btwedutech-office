@extends('layouts/contentLayoutMaster')

@section('title', $pageTitle)

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    .info-section {
      cursor: pointer;
    }
  </style>
@endsection
@section('content')
<div id="branch-code" class="d-none">{{ $userBranchCode }}</div>
<div id="competition" class="d-none">{{ json_encode($competitions) }}</div>
<div id="school" class="d-none">{{ json_encode($competitionSchools) }}</div>
<form>
  <div class="card">
    <h5 class="card-header"></h5>
    <div class="d-flex justify-content-between align-items-center mx-50 row pt-0 pb-2">
      <div class="col-md-4">
        <select id="branch_code" name="branch_code" class="form-control text-capitalize mb-md-0 mb-2 select2" required disabled>
          <option value=""> Pilih Cabang </option>
        </select>
      </div>
      <div class="col-md-4">
        <select id="classroom_id" name="classroom_id" class="form-control text-capitalize select2" required disabled>
          <option value=""> Pilih Kelas </option>
        </select>
      </div>
      <div class="col-md-4 user_status">
        <button type="submit" id="btnFilter" class="btn btn-primary waves-effect waves-float waves-light" disabled>Cari</button>
      </div>
    </div>
  </div>
</form>
<!-- Basic table -->
@if(request()->has('classroom_id') && request()->has('branch_code'))
  <section id="basic-datatable">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header border-bottom p-1">
            <div class="head-label"></div>
            <div class="text-right">
              <div class="d-inline-flex">
                {{-- <a href="/tryout-wawancara/tambah" class="btn btn-primary">
                  <i data-feather="user-plus"></i>
                  <span>Add data</span>
                </a> --}}
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="datatables-basic table">
              <thead>
                <tr>
                  <th>No</th>
                  <th width="15%">Nama Siswa</th>
                  <th>Penampilan</th>
                  <th>Cara Duduk dan Berjabat</th>
                  <th>Praktek Baris Berbaris</th>
                  <th>Penampilan dan Sopan Santun</th>
                  <th>Kepercayaan Diri dan Stabilitas Emosi</th>
                  <th>Komunikasi</th>
                  <th>Pengembangan Diri</th>
                  <th>Integritas</th>
                  <th>Kerjasama</th>
                  <th>Mengelola Perubahan</th>
                  <th>Perekat Bangsa</th>
                  <th>Pelayanan Publik</th>
                  <th>Pengambilan Keputusan</th>
                  <th>Orientasi Hasil</th>
                  <th>Prestasi Akademik</th>
                  <th>Prestasi Non Akademik</th>
                  <th>Bahasa Asing</th>
                  <th>Nilai Akhir</th>
                </tr>
              </thead>
              <tbody>
                @forelse($interview as $index => $data)
                <tr>
                  <td>{{ $index + 1 }}</td>
                  <td>{{ $data->name }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->penampilan, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->cara_duduk_dan_berjabat, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->praktek_baris_berbaris, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->penampilan_sopan_santun, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->kepercayaan_diri_dan_stabilitas_emosi, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->komunikasi, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->pengembangan_diri, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->integritas, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->kerjasama, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->mengelola_perubahan, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->perekat_bangsa, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->pelayanan_publik, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->pengambilan_keputusan, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->orientasi_hasil, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->prestasi_akademik, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->prestasi_non_akademik, 2) : "-" }}</td>
                  <td>{{ !is_null($data->interview_score) ? number_format($data->interview_score->bahasa_asing, 2) : "-" }}</td>
                  <td>
                    @if (!is_null($data->interview_score))
                        @if ($data->interview_score->final_score === 100)
                            {{ $data->interview_score->final_score }}
                        @else
                            {{ number_format($data->interview_score->final_score, 2) }}
                        @endif
                    @else
                        -
                    @endif
                </td>
                </tr>
                @empty
                <tr>
                  <td colspan="20" class="text-center">Data kosong</td>
                </tr>
                @endforelse
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
@endif
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
  $(".datatables-basic").DataTable({
    language: {
      paginate: {
        previous: "&nbsp;",
        next: "&nbsp;",
      },
    }
  });
</script>
<script src="{{ asset(mix('js/scripts/pages/interview-tryout/app.js')) }}"></script>
@endsection

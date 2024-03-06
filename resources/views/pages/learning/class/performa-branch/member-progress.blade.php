@extends('layouts/contentLayoutMaster')

@section('title', 'Rekapitulasi Laporan Perkembangan Siswa')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

<style>
  .sorted {
    background-color: #00cfe8;
    color: #fff;
  }
</style>
@endsection

@section('content')
<div id="roles" class="d-none">{{ json_encode($auth_user_roles) }}</div>
<div id="user_id" class="d-none">{{ $auth_user_id }}</div>
<form>
  <div class="card">
    <h5 class="card-header">Filter Data</h5>
    <div class="d-flex justify-content-between align-items-center mx-50 row pt-0 pb-2">
      <div class="col-md-3">
        <select id="branch_code" class="form-control text-capitalize mb-md-0 mb-2 select2" required disabled>
          <option value=""> Pilih Cabang </option>

        </select>
      </div>
      <div class="col-md-3">
        <select id="classroom_id" name="classroom_id" class="form-control text-capitalize mb-md-0 mb-2" required disabled>
        </select>
      </div>
      <div class="col-md-3">
        <select id="exam_type" name="exam_type" class="form-control text-capitalize mb-md-0 mb-2 select2" disabled>
          <option> Pilih Jenis Latihan </option>
          <option value=""> Semua Modul </option>
          <option value="package-23" class="text-capitalize">Paket C 60 Modul</option>
          <option value="package-441" class="text-capitalize">Paket SKD 48 Modul</option>
          <option value="package-450" class="text-capitalize">Paket SKD 48 Modul | Kelas Intensif</option>
          <option value="package-452" class="text-capitalize">Latihan Modul 16 SKD</option>
          <option value="{{ env("APP_ENV") === "dev" ? "package-546" : "package-453" }}" class="text-capitalize">Latihan Modul 16 TPS </option>
          <option value="premium-tryout" class="text-capitalize">Tryout Premium</option>
          <option value="specific-tryout" class="text-capitalize">Tryout Kupon</option>
          <option value="free-tryout" class="text-capitalize">Tryout Gratis</option>
        </select>
      </div>
      <div class="col-md-3 user_status">
        <button type="submit" id="btnFilter" class="btn btn-primary waves-effect waves-float waves-light" disabled>Filter Data</button>
      </div>
    </div>
  </div>
</form>

<!-- Basic table -->
@if(request()->has('classroom_id'))
  @if(!is_null($module_summary_cache_key) && !!$module_summary)
    <section id="basic-datatable">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Laporan Dibuat Pada {{ $results['generated_at'] }}</div>
            </div>
            <div class="card-body">
              <input type="hidden" id="id_kelas" value="{{ json_encode(request()->get('classroom_id')) }}" />
              <input type="hidden" id="tipe_latihan" value="{{ request()->get('exam_type') }}" />
              @if(!$results['data'])
                <a href="{{ route('performa.class-member.refresh', request()->all()) }}" class="btn btn-outline-info waves-effect waves-float waves-light"><i data-feather="refresh-cw" class="mr-50 font-small-4"></i> Refresh Data</a>
              @endif
            </div>
            <table id="datatables-basic" class="table table-responsive">
              <thead>
                <tr>
                  <th>No</th>
                  <th id="name">Nama</th>
                  <th id="email">Email</th>
                  <th id="received-module">Modul Diterima</th>
                  <th id="done-module">Modul Dikerjakan</th>
                  <th id="done-percent">Persentase Kepatuhan</th>
                  @if($program !== "tps")
                    <th id="passed-percent">Persentase Kelulusan</th>
                  @endif
                  @foreach ($score_keys as $index => $key)
                    <th id="average-{{$index}}">Nilai Rata-Rata ({{ $key }})</th>
                  @endforeach
                  <th id="average-total">Nilai Rata-rata {{ strtoupper($program) }}</th>
                  <th id="average-try">Rata-rata mengerjakan</th>
                  <th id="repeat-total">Total Mengerjakan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                @forelse($results['data'] ?? [] as $key => $result)
                <tr>
                  <td>{{ $key + 1 }}</td>
                  <td>{{ $result->student->name }}</td>
                  <td>{{ $result->student->email ?? "-"}}</td>
                  <td>{{ $result->given }}</td>
                  <td>{{ $result->done }}</td>
                  <td>{{ $result->done_percent }}%</td>
                  @if($program !== "tps")
                    <td>{{ $result->passed_percent }}%</td>
                  @endif
                  @foreach($score_keys as $key)
                    <td>{{ $result->subject->score_values->$key->average_score }}</td>
                  @endforeach
                  <td>{{ $result->subject->average_score }}</td>
                  <td>{{ $result->report_average_try }}</td>
                  <td>
                    {{
                      property_exists($result, 'report_repeat_sum') ?
                        $result->report_repeat_sum > 0 ? $result->report_repeat_sum . ' kali' : '0'
                      : '0'
                    }}
                  </td>
                  <td>
                    <div class="d-inline-flex">
                      <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                        Pilih Aksi
                        <i data-feather='chevron-down' class="font-small-4"></i>
                      </a>
                      <div class="dropdown-menu dropdown-menu-right">
                        @if(request()->has('exam_type') && !!request()->get('exam_type'))
                          <a href="/pembelajaran/kelas/members/{{ $result->student->smartbtw_id }}/report?exam_type={{ request()->get('exam_type') }}" target="__blank" class="btn btn-flat-transparent dropdown-item w-100">
                            Download Report
                          </a>
                          <a href="/pembelajaran/grafik-performa-siswa/{{ $result->student->smartbtw_id }}/{{ request()->get('exam_type') }}" target="__blank" class="btn btn-flat-transparent dropdown-item w-100">
                            Lihat Grafik Perkembangan Siswa
                          </a>
                        @else
                          <a href="/pembelajaran/kelas/members/{{ $result->student->smartbtw_id }}/report" target="__blank" class="btn btn-flat-transparent dropdown-item w-100">
                            Download Report
                          </a>
                          <a href="/pembelajaran/grafik-performa-siswa/{{ $result->student->smartbtw_id }}" target="__blank" class="btn btn-flat-transparent dropdown-item w-100">
                            Lihat Grafik Perkembangan Siswa
                          </a>
                        @endif
                      </div>
                    </div>
                  </td>
                </tr>
                @empty
                <tr>
                  <td class="text-center" id="empty-result" colspan="12">Data Kosong</td>
                </tr>
                @endforelse
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  @else
    <meta http-equiv="refresh" content="15"/>
    <center><h3>Data sedang dipersiapkan, harap tunggu</h3>
    <div class="spinner-border"></div></center>
  @endif

@endif
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
<script src="{{ asset(mix('js/scripts/pages/class-progress/branch/app.js')) }}"></script>
@endsection

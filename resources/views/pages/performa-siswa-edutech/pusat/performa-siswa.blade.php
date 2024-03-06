@extends('layouts/contentLayoutMaster')

@section('title', 'Rekapitulasi Laporan Perkembangan Siswa BTW Edutech')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="https://cdn.datatables.net/fixedcolumns/4.2.2/css/fixedColumns.dataTables.min.css">
<link rel="stylesheet" href="https://cdn.datatables.net/fixedheader/3.3.2/css/fixedHeader.dataTables.min.css">

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

<style>
  .sorted {
    background-color: #00cfe8;
    color: #fff;
  }
  .dataTables_scrollHeadInner {
    padding-right: 0;
  }
</style>
@endsection

@section('content')
<div id="roles" class="d-none">{{ json_encode($auth_user_roles) }}</div>
<div id="user_id" class="d-none">{{ $auth_user_id }}</div>
<form id="filterForm">
  <div class="card">
    <h5 class="card-header">Filter Data</h5>
    <div class="d-flex justify-content-between align-items-center mx-50 row pt-0">
      <div class="col">
        <label>Kode Cabang</label>
        <select id="branch_code" name="branch_code[]" class="form-control text-capitalize mb-md-0 mb-2 select2" required multiple>
        </select>
      </div>
      <div class="col">
        <label>Kelas</label>
        <select id="classroom_type" name="classroom_type" class="form-control text-capitalize mb-md-0 mb-2 select2" required>
          <option value=""> Pilih Kelas </option>
          <option value="REGULER"> Reguler </option>
          <option value="INTENSIF"> Intensif </option>
          <option value="BINSUS"> Binsus </option>
          <option value="ALL"> Semua Kelas </option>
        </select>
      </div>
      <div class="col">
        <label>Tahun</label>
        <select id="classroom_year" name="classroom_year" class="form-control text-capitalize mb-md-0 mb-2 select2" required>
          <option value=""> Pilih Tahun </option>
          <option value="2023">2023</option>
        </select>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mx-50 my-50 row">
      <div class="col">
        <label>Tipe/Jenis Latihan</label>
        <select id="exam_type" name="exam_type" class="form-control text-capitalize mb-md-0 mb-2 select2" required>
          <option value=""> Pilih Jenis Latihan </option>
          <option value="ALL"> Semua Modul </option>
        </select>
      </div>
      <div class="col">
        <label>Tampilkan nilai deviasi</label>
        <select id="with_deviation" name="with_deviation" class="form-control text-capitalize mb-md-0 mb-2 select2" aria-placeholder="Ya/Tidak" required>
          <option value=""> Ya/Tidak </option>
          <option value="1"> Ya </option>
          <option value="0"> Tidak </option>
        </select>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mx-50 my-50 row">
      <div class="col py-50">
        <button type="submit" id="btnFilter" class="btn btn-primary waves-effect waves-float waves-light">Filter Data</button>
      </div>
    </div>
  </div>
</form>

<!-- Basic table -->
@if(request()->has('classroom_id') || request()->has('branch_code'))
  <section id="basic-datatable">
    <div class="row">
      <div class="col-12">
        <div class="card">
          {{-- <div class="card-header">
            <div class="card-title">Laporan Dibuat Pada {{ $result_summary['generated_at'] }}</div>
          </div> --}}
          <input type="hidden" id="kode_cabang" value="{{ json_encode(request()->get('branch_code')) }}" />
          <input type="hidden" id="tipe_kelas" value="{{ request()->get('classroom_type') }}" />
          <input type="hidden" id="tipe_latihan" value="{{ request()->get('exam_type') }}" />
          <input type="hidden" id="deviasi" value="{{ request()->get('with_deviation') }}" />
          {{-- <div class="card-body">
            @if(!$result_summary)
              <a href="{{ route('performa.class-member.refresh', request()->all()) }}" class="btn btn-outline-info waves-effect waves-float waves-light"><i data-feather="refresh-cw" class="mr-50 font-small-4"></i> Refresh Data</a>
            @endif
          </div> --}}
          <table id="datatables-basic" class="table {{ count($result_summary) == 0 ? 'table-responsive' : '' }}" width="100%">
            <thead>
              <tr>
                <th>No</th>
                <th id="student-name">Nama</th>
                <th id="student-classroom">Kelas</th>
                <th id="student-branch">Cabang</th>
                <th id="student-ptk-target">Target PTK</th>
                <th id="ptk-target-minimum-score">Nilai Minimal Target PTK</th>
                @foreach ($score_keys as $index => $key)
                  <th id="average-{{$index}}">Nilai Rata-Rata ({{ $key }})</th>
                @endforeach
                <th id="average-total">Nilai Rata-rata ({{ strtoupper($program) }})</th>
                @if($with_deviation === "1")
                  @foreach ($score_keys as $index => $key)
                    <th id="average-bkn-{{$index}}">Nilai BKN ({{$key}})</th>
                  @endforeach
                  <th id="bkn-total">Nilai BKN ({{ strtoupper($program) }})</th>
                  @foreach ($score_keys as $index => $key)
                    <th id="deviation-score-{{$index}}">Nilai Deviasi ({{$key}})</th>
                    <th id="deviation-percentage-{{$index}}">Persentase Deviasi ({{$key}})</th>
                  @endforeach
                  <th id="deviation-score-total">Nilai Deviasi (SKD)</th>
                  <th id="deviation-percentage-total">Persentase Deviasi (SKD)</th>
                @endif
                <th id="pass-chance">Peluang Kelulusan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @forelse($result_summary ?? [] as $key => $result)
              <tr>
                <td>{{ $key + 1 }}</td>
                <td>{{ $result->name }}</td>
                <td>{{ $result->class_information->class_title }}</td>
                <td>{{ $result->branch_name }}</td>
                @if (
                  (property_exists($result->student_target_ptk, "school_name") && $result->student_target_ptk->school_name)
                  && (property_exists($result->student_target_ptk, "major_name") && $result->student_target_ptk->major_name)
                )
                  <td>{{ $result->student_target_ptk->school_name }} ({{ $result->student_target_ptk->major_name }})</td>
                @else
                  <td>-</td>
                @endif
                @if (property_exists($result->student_target_ptk, "target_score") && $result->student_target_ptk->target_score)
                  <td>{{ $result->student_target_ptk->target_score }}</td>
                @else
                  <td>-</td>
                @endif
                @foreach($score_keys as $key)
                  <td>{{ $result->summary->score_values->$key->average_score }}</td>
                @endforeach
                <td>{{ $result->summary->average_score }}</td>
                @if($with_deviation === "1")
                  @foreach($score_keys as $key)
                    <td>{{ !is_null($result->bkn_score) && $result->bkn_score->bkn_attempted ? $result->bkn_score->{strtolower($key)} : "-" }}</td>
                  @endforeach
                  <td>{{ !is_null($result->bkn_score) && $result->bkn_score->bkn_attempted ? $result->bkn_score->total : "-" }}</td>
                  @foreach($score_keys as $key)
                    <td>{{ property_exists($result->summary, "deviation") && $result->summary->deviation->available ? $result->summary->deviation->{strtolower($key)}->differences : "-" }}</td>
                    <td>{{ property_exists($result->summary, "deviation") && $result->summary->deviation->available ? $result->summary->deviation->{strtolower($key)}->percentage . "%" : "-" }}</td>
                  @endforeach
                  <td>{{ property_exists($result->summary, "deviation") && $result->summary->deviation->available ? $result->summary->deviation->total->differences : "-" }}</td>
                  <td>{{ property_exists($result->summary, "deviation") && $result->summary->deviation->available ? $result->summary->deviation->total->percentage . "%" : "-" }}</td>
                @endif
                @if (
                  property_exists($result->student_target_ptk, "current_target_percent_score")
                  && (property_exists($result->student_target_ptk, "school_name") && $result->student_target_ptk->school_name)
                  && (property_exists($result->student_target_ptk, "major_name") && $result->student_target_ptk->major_name)
                )
                  <td>{{ $result->student_target_ptk->current_target_percent_score }}%</td>
                @else
                  <td>-</td>
                @endif
                <td>
                  <div class="d-inline-flex">
                    <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary" data-toggle="dropdown">
                      Pilih Aksi
                      <i data-feather='chevron-down' class="font-small-4"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                      <a href="/performa-siswa-edutech/siswa/{{ $result->smartbtw_id }}/hasil-uka" class="btn btn-flat-transparent dropdown-item w-100">
                        Lihat Hasil UKA
                      </a>
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
            <tfoot>
              <tr>
                <th></th>
                <th></th>
                <th>Rata-rata</th>
                <th></th>
                <th></th>
                <th></th>
                @foreach ($score_keys as $index => $key)
                  <th>0</th>
                @endforeach
                <th>0</th>
                @if($with_deviation === "1")
                  @foreach ($score_keys as $index => $key)
                    <th>0</th>
                  @endforeach
                  <th>0</th>
                  @foreach ($score_keys as $index => $key)
                    <th>0</th>
                    <th>0</th>
                  @endforeach
                  <th>0</th>
                  <th>0</th>
                @endif
                <th>0</th>
                <th></th>
              </tr>
            <tfoot>
          </table>
        </div>
      </div>
    </div>
  </section>

{{-- @if(!!$result_summary)
    <section id="basic-datatable">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Laporan Dibuat Pada {{ $results['generated_at'] }}</div>
            </div>
            <div class="card-body">
              <input type="hidden" id="kode_cabang" value="{{ json_encode(request()->get('branch_code')) }}" />
              <input type="hidden" id="id_kelas" value="{{ request()->get('classroom_id') }}" />
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
  @endif --}}

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
<script src="https://cdn.datatables.net/fixedheader/3.3.2/js/dataTables.fixedHeader.min.js"></script>
<script src="https://cdn.datatables.net/fixedcolumns/4.2.2/js/dataTables.fixedColumns.min.js"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/edutech-module-summary/central/app.js')) }}"></script>
@endsection

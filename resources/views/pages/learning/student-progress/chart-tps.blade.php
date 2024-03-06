@extends('layouts/contentLayoutMaster')

@section('title', "Grafik Performa Siswa")

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
  <div id="student-result" style="display: none">{{ json_encode($studentResult) }}</div>
  <div id="module-summary" style="display: none">{{ json_encode($moduleSummary) }}</div>

  @if($studentResult?->given ?? 0 > 0 && $studentResult?->done ?? 0 > 0)
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-12 col-md-12">
            <a
              class="btn btn-success"
              href="{{ $examType ? "/pembelajaran/grafik-performa-siswa/download/$studentId/$examType" : "/pembelajaran/grafik-performa-siswa/download/$studentId" }}"
              onclick="this.classList.add('disabled')">
              <i data-feather="file"></i>
              Download Grafik
            </a>
          </div>
        </div>
      </div>
    </div>
  @endif

  {{-- Potensi Kognitif Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik Potensi Kognitif</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="potensi_kognitif_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  {{-- Penalaran Matematika Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik Penalaran Matematika</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="penalaran_matematika_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  {{-- Literasi Bahasa Indonesia Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik Literasi Bahasa Indonesia</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="literasi_bahasa_indonesia_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  {{-- Literasi Bahasa Inggris Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik Literasi Bahasa Inggris</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="literasi_bahasa_inggris_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  {{-- TPS Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik TPS</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="tps_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
@endsection

@section('vendor-script')
  {{-- vendor files --}}
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
  <script src="{{ mix('js/scripts/pages/tryout-chart/utils/utils.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-chart/config/tps-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-chart/tps-progress-chart.js') }}"></script>
@endsection

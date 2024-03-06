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

  {{-- TWK Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik TWK</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="twk_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  {{-- TIU Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik TIU</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="tiu_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  {{-- TKP Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik TKP</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="tkp_score_chart" width="400" height="400"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
  {{-- SKD Chart --}}
  <div class="card">
    <div class="card-header">
      <h4 class="card-title">Grafik SKD</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-12">
          <div class="chart-container">
            <canvas id="skd_score_chart" width="400" height="400"></canvas>
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
  <script src="{{ mix('js/scripts/pages/tryout-chart/config/twk-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-chart/config/tiu-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-chart/config/tkp-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-chart/config/skd-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-chart/progress-chart.js') }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', "Grafik Performa Siswa Tryout Kode")

@section('page-style')
@endsection

@section('content')
  <div id="student-result" style="display: none">{{ json_encode($studentResult) }}</div>

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

@section('page-script')
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
  <script src="{{ mix('js/scripts/pages/tryout-code-chart/utils/utils.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-code-chart/config/twk-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-code-chart/config/tiu-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-code-chart/config/tkp-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-code-chart/config/skd-chart.js') }}"></script>
  <script src="{{ mix('js/scripts/pages/tryout-code-chart/progress-chart.js') }}"></script>
@endsection

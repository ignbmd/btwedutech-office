@extends('layouts/contentLayoutMaster')

@section('title', 'Ranking IRT')

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

<!-- Basic table -->
  <section id="basic-datatable">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
          </div>
          <div class="card-body">
            @if($data->ranks)
              <a href="{{ route('ranking.download-irt', ['taskId' => $taskId]) }}" class="btn btn-primary waves-effect waves-float waves-light mb-1"><i data-feather="file" class="mr-50 font-small-4"></i> Download Ranking</a>
              @if($tryoutSchedule && property_exists($tryoutSchedule, $tryoutCode) && property_exists($tryoutSchedule->{$tryoutCode}, 'calculation_status') && $tryoutSchedule->{$tryoutCode}->calculation_status === "GENERATING")
                <button class="btn btn-outline-primary waves-effect waves-float waves-light mb-1" type="button" disabled>
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Nilai akhir IRT sedang dikalkulasi
                </button>
              @else
                <a href="{{ route('ranking.specific-tryout.recalculate-irt', ['tryoutCode' => $tryoutCode]) }}" class="btn btn-outline-primary waves-effect waves-float waves-light mb-1" onclick="this.classList.add('disabled')"><i data-feather="award" class="mr-50 font-small-4"></i> Rekalkulasi nilai akhir IRT</a>
              @endif
            @endif
            <div class="table-responsive">
              <table id="datatables-basic" class="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Asal Sekolah</th>
                    <th>Mulai Mengerjakan</th>
                    <th>Selesai Mengerjakan</th>
                    <th>Lama Mengerjakan</th>
                    @foreach($data->ranks[0]->score_keys ?? [] as $score_keys)
                      <th>{{ $questionCategories ? $questionCategories[$score_keys] : $score_keys }}</th>
                    @endforeach
                    <th>Nilai Total</th>
                  </tr>
                </thead>
                <tbody>
                  @php $colspan = count($data->ranks[0]->score_keys ?? []) + 6 @endphp
                  @forelse($data->ranks as $index => $ranks)
                  @php
                      $parsedStartDate = Carbon\Carbon::parse($ranks->start)->timezone('Asia/Jakarta');
                      $parsedEndDate = Carbon\Carbon::parse($ranks->end)->timezone('Asia/Jakarta');

                      $start = $parsedStartDate < $parsedEndDate
                          ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . " WIB"
                          : '-';

                      $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . " WIB";

                      $doneInterval = $parsedStartDate < $parsedEndDate
                          ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE])
                          : '-';
                  @endphp
                  <tr>
                      <td>{{ $index + 1 }}</td>
                      <td>{{ $ranks->student_name }}</td>
                      <td>{{ $ranks->school_origin ?? "-" }}</td>
                      <td>{{ $start ?? '-' }}</td>
                      <td>{{ $end ?? '-' }}</td>
                      <td>{{ $doneInterval ?? '-' }}</td>
                      @foreach($ranks->score_keys as $question_category)
                      <td>
                          <label class="text-wrap">{{ $ranks->score_values->$question_category->score }}</label>
                      </td>
                      @endforeach
                      <td>
                          <label class="text-wrap">{{ $ranks->total_score }}</label>
                      </td>
                  </tr>
                  @empty
                  <tr>
                      <td colspan="{{ $colspan }}" class="text-center">Data ranking kosong</td>
                  </tr>
                  @endforelse
                </tbody>
              </table>
            </div>
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
@endsection

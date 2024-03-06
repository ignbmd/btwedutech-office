@extends('layouts/contentLayoutMaster')

@section('title', "Ranking - CPNS")

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
@if (Cache::has($cache_name))
    <section id="basic-datatable">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Laporan Dibuat Pada {{ $data->generate_at }}</div>
                    </div>
                    <div class="card-body">
                        <a href="{{ route('ranking-cpns.refresh', ['taskId' => $taskId]) }}"
                            class="btn btn-primary waves-effect waves-float waves-light mb-1"><i
                                data-feather="refresh-cw" class="mr-50 font-small-4"></i> Refresh Ranking</a>
                        @if ($data->data)
                            <a href="{{ route('ranking-cpns.download', ['taskId' => $taskId]) }}"
                                class="btn btn-primary waves-effect waves-float waves-light mb-1"><i data-feather="file"
                                    class="mr-50 font-small-4"></i> Download Ranking</a>
                        @endif
                        <div class="table-responsive">
                            <table id="datatables-basic" class="table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama</th>
                                        <th>Jurusan & Prodi</th>
                                        <th>Mulai Mengerjakan</th>
                                        <th>Selesai Mengerjakan</th>
                                        <th>Lama Mengerjakan</th>
                                        @foreach ($data->data[0]->score_keys ?? [] as $score_keys)
                                            <th>{{ $score_keys }}</th>
                                        @endforeach
                                        <th>Nilai Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @php $colspan = count($data->data[0]->score_keys ?? []) + 7 @endphp
                                    @forelse($data->data as $index => $data)
                                        @php
                                            $parsedStartDate = Carbon\Carbon::parse($data->start)->timezone('Asia/Jakarta');
                                            $parsedEndDate = Carbon\Carbon::parse($data->end)->timezone('Asia/Jakarta');

                                            $start = $parsedStartDate < $parsedEndDate ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . ' WIB' : '-';

                                            $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . ' WIB';

                                            $doneInterval = $parsedStartDate < $parsedEndDate ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE]) : '-';
                                        @endphp
                                        <tr>
                                            <td>{{ $index + 1 }}</td>
                                            <td>{{ $data->name }}
                                                {{-- {{ property_exists($data->student_branch_codes, $data->smartbtw_id) && $data->student_branch_codes->{$data->smartbtw_id} ? '(' . $data->student_branch_codes->{$data->smartbtw_id} . ')' : '' }} --}}
                                            </td>
                                            <td>{{ $data->instance_name ?? "-" }} ({{ $data->major }})</td>
                                            <td>{{ $start ?? '-' }}</td>
                                            <td>{{ $end ?? '-' }}</td>
                                            <td>{{ $doneInterval ?? '-' }}</td>
                                            @foreach ($data->score_keys as $question_category)
                                                <td>
                                                    <label
                                                        class="text-{{ $data->score_values->$question_category->passing_status ? 'success' : 'danger' }} text-wrap">{{ $data->score_values->$question_category->score }}</label>
                                                </td>
                                            @endforeach
                                            <td>
                                                <label
                                                    class="text-{{ $data->status ? 'success' : 'danger' }} text-wrap">{{ $data->total_score }}</label>
                                            </td>
                                            <td>
                                                <label
                                                    class="badge badge-{{ $data->status ? 'success' : 'danger' }} text-wrap text-uppercase">{{ $data->status ? "Memenuhi" : "Tidak memenuhi" }}</label>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="{{ $colspan }}" class="text-center">Data ranking kosong
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </section>
@else
    <meta http-equiv="refresh" content="10" />
    <center>
        <h3>Data sedang dipersiapkan, harap tunggu</h3>
        <div class="spinner-border"></div>
    </center>
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
@endsection
@extends('layouts/contentLayoutMaster')

@section('title', 'Rekapitulasi Laporan Perkembangan Tryout Siswa')

@section('vendor-style')
    {{-- vendor css files --}}
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/datatables.min.css')) }}">
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

    table {
        text-align: center;
    }

    .table-border-left {
        border-left: 2px solid #8b88883f !important;
    }

    .table-border-right {
        border-right: 2px solid #8b88883f !important;
    }

    .text-green {
        color: #00966D;
    }

    .text-red {
        color: #ED2E7E;
    }

    .bg-blue {
        background-color: #00d1e83b;
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
                    <option value="">Pilih Cabang</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="classroom_id" name="classroom_id" class="form-control text-capitalize mb-md-0 mb-2 select2"
                    required disabled>
                    <option value="">Pilih Kelas</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="code_category" name="code_category"
                    class="form-control text-capitalize mb-md-0 mb-2 select2" disabled>
                    <option value="">Pilih Kategori Tryout Kode</option>
                </select>
            </div>
            <div class="col-md-3 user_status">
                <button type="submit" id="btnFilter" class="btn btn-primary waves-effect waves-float waves-light"
                    disabled>Filter Data</button>
            </div>
        </div>
    </div>
</form>

<!-- Basic table -->
@if (request()->has('classroom_id'))
    @if (!is_null($cache_name) && !!$cache_value)
        <section id="basic-datatable">
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">Laporan Dibuat Pada {{ $results['generated_at'] }}</div>
                        </div>
                        <div class="card-body">
                            <input type="hidden" id="id_kelas" value="{{ request()->get('classroom_id') }}" />
                            <input type="hidden" id="kode_kategori" value="{{ request()->get('code_category') }}" />
                            @if (!$results['data'])
                                <a href="{{ route('performa.class-member.refresh-tryout', ['classroom_id' => request()->get('classroom_id') ?? null, 'code_category' => request()->get('code_category') ?? null]) }}"
                                    class="btn btn-outline-info waves-effect waves-float waves-light"><i
                                        data-feather="refresh-cw" class="mr-50 font-small-4"></i> Refresh Data</a>
                            @endif
                        </div>
                        <table id="datatables-basic"
                            class="table table-responsive table-bordered table-striped dataTable display">
                            <thead>
                                <tr>
                                    <th class="th-first-row table-border-right" rowspan="2">No</th>
                                    <th class="th-first-row table-border-right" rowspan="2">Nama</th>
                                    <th class="th-first-row" rowspan="2">Email</th>
                                    @foreach ($results['group'] ?? [] as $header)
                                        @if (property_exists($header, 'title'))
                                            <th class="th-first-row table-border-left" colspan="4">
                                                {{ $header->title }}
                                            </th>
                                        @endif
                                    @endforeach
                                    <th class="th-first-row table-border-left" colspan="4">Rata-rata</th>
                                    <th class="th-first-row table-border-left" colspan="4">CAT BKN</th>
                                    <th class="th-first-row table-border-left" colspan="4">Selisih</th>
                                    <th class="th-first-row table-border-left" rowspan="2">Aksi</th>
                                </tr>
                                <tr>
                                    @foreach ($results['group'] ?? [] as $header)
                                        @if (property_exists($header, 'title'))
                                            @foreach ($score_keys ?? [] as $key)
                                                <th
                                                    class="th-second-row {{ $key == 'TWK' ? 'table-border-left' : '' }}">
                                                    {{ $key }}</th>
                                            @endforeach
                                            <th class="th-second-row">SKD </th>
                                        @endif
                                    @endforeach
                                    <th class="table-border-left">TWK</th>
                                    <th>TIU</th>
                                    <th>TKP</th>
                                    <th>SKD</th>
                                    <th class="table-border-left">TWK</th>
                                    <th>TIU</th>
                                    <th>TKP</th>
                                    <th>SKD</th>
                                    <th class="table-border-left">TWK</th>
                                    <th>TIU</th>
                                    <th>TKP</th>
                                    <th>SKD</th>
                                </tr>
                            </thead>
                            @if ($results['data'])
                                <tbody>
                                    @foreach ($results['data'] ?? [] as $key => $result)
                                        <tr>
                                            <td class="table-border-right">{{ $key + 1 }}</td>
                                            <td class="table-border-right">{{ $result->student->name }}</td>
                                            <td>{{ $result->student->email ?? '-' }}</td>
                                            @foreach ($results['group'] ?? [] as $group)
                                                @if (property_exists($group, 'score_keys') &&
                                                    $group->score_keys != null &&
                                                    isset($group->task_id[$result->student->smartbtw_id]))
                                                    @foreach ($group->score_keys ?? [] as $score_keys)
                                                        <td
                                                            class="{{ $score_keys == 'TWK' ? 'table-border-left' : '' }}">
                                                            {{ $results['filtered_results']->{$result->student->smartbtw_id}[$group->task_id[$result->student->smartbtw_id]][$score_keys] ?? '-' }}
                                                        </td>
                                                    @endforeach
                                                    <td>
                                                        {{ $results['filtered_results']->{$result->student->smartbtw_id}[$group->task_id[$result->student->smartbtw_id]]['SKD'] ?? '- ' }}
                                                    </td>
                                                @else
                                                    <td class="table-border-left">-</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td class="table-border">-</td>
                                                @endif
                                            @endforeach
                                            @foreach ($result->average ?? [] as $index => $average)
                                                @if ($index == 'TWK')
                                                    <td class="table-border-left">{{ $average ?? '-' }}</td>
                                                @else
                                                    <td>{{ $average ?? '-' }}</td>
                                                @endif
                                            @endforeach
                                            @if (!property_exists($result, 'average'))
                                                <td class="table-border-left">-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            @else
                                                @if ($result->average == null)
                                                    <td class="table-border-left">-</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                @endif
                                            @endif
                                            @foreach ($result->score_bkn ?? [] as $index => $score_bkn)
                                                @if ($index == 'TWK')
                                                    <td class="table-border-left">{{ $score_bkn ?? '-' }}</td>
                                                @else
                                                    <td>{{ $score_bkn ?? '-' }}</td>
                                                @endif
                                            @endforeach
                                            @if (!property_exists($result, 'score_bkn'))
                                                <td class="table-border-left">-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            @else
                                                @if ($result->score_bkn == null)
                                                    <td class="table-border-left">-</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                @endif
                                            @endif
                                            @foreach ($result->all_score ?? [] as $index => $all_score)
                                                @if ($index == 'TWK')
                                                    <td
                                                        class="table-border-left {{ $all_score->diff < 0 ? 'text-red' : 'text-green' }}">
                                                        {{ $all_score->diff ?? '-' }}</td>
                                                @else
                                                    <td
                                                        class="{{ $all_score->diff < 0 ? 'text-red' : 'text-green' }}">
                                                        {{ $all_score->diff ?? '-' }}</td>
                                                @endif
                                            @endforeach
                                            @if (!property_exists($result, 'all_score'))
                                                <td class="table-border-left">-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            @endif
                                            <td class="table-border-left">
                                                <div class="d-inline-flex">
                                                    <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary"
                                                        data-toggle="dropdown">
                                                        Pilih Aksi
                                                        <i data-feather='chevron-down' class="font-small-4"></i>
                                                    </a>
                                                    <div class="dropdown-menu dropdown-menu-right">
                                                        @if (request()->has('code_category') && !!request()->get('code_category'))
                                                            <a href="/pembelajaran/grafik-performa-siswa/tryout-kode/{{ $result->student->smartbtw_id }}/{{ request()->get('code_category') }}"
                                                                target="__blank"
                                                                class="btn btn-flat-transparent dropdown-item w-100">
                                                                Lihat Grafik Perkembangan Siswa
                                                            </a>
                                                        @else
                                                            <a href="/pembelajaran/grafik-performa-siswa/{{ $result->student->smartbtw_id }}"
                                                                target="__blank"
                                                                class="btn btn-flat-transparent dropdown-item w-100">
                                                                Lihat Grafik Perkembangan Siswa
                                                            </a>
                                                        @endif
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                                <tfoot class="bg-blue">
                                    <tr>
                                        <td colspan="3">Rata-rata</td>
                                        @foreach ($results['group'] ?? [] as $group)
                                            @if (property_exists($group, 'score_keys') && $group->score_keys != null)
                                                @foreach ($group->score_keys ?? [] as $score_keys)
                                                    @php
                                                        $task_id = array_values($group->task_id);
                                                    @endphp
                                                    <td
                                                        class="{{ $score_keys == 'TWK' ? 'table-border-left' : '' }}">
                                                        {{ count($task_id) > 0 ? $results['all_tryout_group']->{$task_id[0]}[$score_keys] : '-' }}
                                                    </td>
                                                @endforeach
                                                <td>
                                                    {{ count($task_id) > 0 ? $results['all_tryout_group']->{$task_id[0]}['SKD'] : '-' }}
                                                </td>
                                            @else
                                                <td class="table-border-left">-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td class="table-border-right">-</td>
                                            @endif
                                        @endforeach
                                        @foreach ($results['total_sum_average'] ?? [] as $index => $total_sum_average)
                                            @if ($index == 'TWK')
                                                <td class="table-border-left">
                                                    {{ $total_sum_average->average ?? '-' }}
                                                </td>
                                            @else
                                                <td>{{ $total_sum_average->average ?? '-' }}</td>
                                            @endif
                                        @endforeach
                                        @foreach ($results['total_sum_average'] ?? [] as $index => $total_sum_average)
                                            @if ($index == 'TWK')
                                                <td class="table-border-left">
                                                    {{ $total_sum_average->score_bkn ?? '-' }}
                                                </td>
                                            @else
                                                <td>{{ $total_sum_average->score_bkn ?? '-' }}</td>
                                            @endif
                                        @endforeach
                                        @foreach ($results['all_diff'] ?? [] as $index => $all_diff)
                                            @if ($index == 'TWK')
                                                @if (isset($results['all_diff']['TWK']))
                                                    <td
                                                        class="table-border-left {{ $all_diff < 0 ? 'text-red' : 'text-green' }}">
                                                        {{ $all_diff ?? '-' }}
                                                    </td>
                                                @else
                                                    <td class="table-border-left">
                                                        -
                                                    </td>
                                                @endif
                                            @else
                                                @if (isset($results['all_diff']['TWK']))
                                                    <td class="{{ $all_diff < 0 ? 'text-red' : 'text-green' }}">
                                                        {{ $all_diff ?? '-' }}
                                                    </td>
                                                @else
                                                    <td>
                                                        -
                                                    </td>
                                                @endif
                                            @endif
                                        @endforeach
                                        <td class="table-border-left">-</td>
                                    </tr>
                                </tfoot>
                            @else
                                <tr>
                                    <td class="text-center" colspan="16">Data Kosong</td>
                                </tr>
                            @endif
                        </table>
                    </div>
                </div>
            </div>
        </section>
    @else
        <meta http-equiv="refresh" content="15" />
        <center>
            <h3>Data sedang dipersiapkan, harap tunggu</h3>
            <div class="spinner-border"></div>
        </center>
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
<script
    src="{{ $isAdmin ? asset(mix('js/scripts/pages/class-progress/central/code-tryout.js')) : asset(mix('js/scripts/pages/class-progress/branch/code-tryout.js')) }}">
</script>
@endsection

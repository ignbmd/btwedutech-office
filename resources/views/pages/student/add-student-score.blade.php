@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Skor Siswa ')

@section('vendor-style')
    {{-- vendor css files --}}
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

<?php
$years = range(date('Y'), 2019); // buat array tahun dari 2019 - tahun sekarang
?>
@section('content')
    <!-- Input Sizing start -->
    <section id="input-sizing">
        <div class="card">
            <div class="card-body">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <form action="{{ route('siswa.add.score') }}" method="POST">
                            @csrf
                            <input type="hidden" class="form-control dt-full-name" id="smartbtw_id" name="smartbtw_id"
                                placeholder="" value="{{ $smartbtw_id }}" />
                            <div class="form-group">
                                <label class="form-label" for="year">
                                    Tahun Ajaran
                                </label>
                                <select class="form-control dt-full-name" id="year" name="year">
                                    <option value="">Pilih Tahun Ajaran</option>
                                    @foreach ($years as $year)
                                        <option value="{{ $year }}" {{ $year == old('year') ? 'selected' : '' }}>
                                            {{ $year }}</option>
                                    @endforeach
                                </select>
                                @if ($errors->has('0'))
                                    <p class="text-danger">{{ $errors->default->first('0') ?? '' }}</p>
                                @else
                                    <p class="text-danger">{{ $errors->default->first('year') ?? '' }}</p>
                                @endif
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="score_twk">
                                    Skor TWK
                                </label>
                                <input type="number" class="form-control dt-full-name" id="score_twk" name="score_twk"
                                    placeholder="Skor TWK" min="1" value="{{ old('score_twk') }}" />
                                <p class="text-danger">{{ $errors->default->first('score_twk') ?? '' }}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="score_tiu">
                                    Skor TIU
                                </label>
                                <input type="number" class="form-control dt-full-name" id="score_tiu" name="score_tiu"
                                    placeholder="Skor TIU" min="1" value="{{ old('score_tiu') }}" />
                                <p class="text-danger">{{ $errors->default->first('score_tiu') ?? '' }}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="score_tkp">
                                    Skor TKP
                                </label>
                                <input type="number" class="form-control dt-full-name" id="score_tkp" name="score_tkp"
                                    placeholder="Skor TKP" min="1" value="{{ old('score_tkp') }}" />
                                <p class="text-danger">{{ $errors->default->first('score_tkp') ?? '' }}
                                </p>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="score_skd">
                                    Skor SKD
                                </label>
                                <input type="number" class="form-control dt-full-name" id="score_skd" name="score_skd"
                                    placeholder="Skor SKD" min="1" value="{{ old('score_skd') }}" />
                                <p class="text-danger">{{ $errors->default->first('score_skd') ?? '' }}</p>
                            </div>
                            <div class="mt-3 text-right">
                                <button type="submit" class="btn btn-success data-submit">
                                    <i data-feather='save' class="mr-50"></i> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
    <script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
    <script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
@endsection

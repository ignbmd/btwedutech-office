@extends('layouts/contentLayoutMaster')

@section('title', 'Hasil Pengecekan Kesehatan')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-wizard.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
    <div id="historyId" style="display: none">{{ $historyId }}</div>
    <div id="branchCode" style="display: none">{{ $branchCode }}</div>
    <div id="allowed" class="d-none">{{json_encode($allowed)}}</div>
    <div id="medical-checkup-summary-container"></div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/health-check/medical-checkup-summary.js')) }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Bayar & Tagih')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
    <span id="user" class="d-none">{{json_encode($user)}}</span>
    <div id="central-collect-receivable-container"></div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/pay-and-bill/central-collect-receivable.js')) }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Kode Diskon')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
    <div id="branchCode" class="d-none">{{ $userBranchCode }}</div>
    <div id="canShowDiscountCodeUsage" class="d-none">{{ $canShowDiscountCodeUsage ? "1" : "0" }}</div>
    <div id="canCreateDiscountCode" class="d-none">{{ $canCreateDiscountCode ? "1" : "0" }}</div>
    <div id="canEditDiscountCode" class="d-none">{{ $canEditDiscountCode ? "1" : "0" }}</div>
    <div id="canDeleteDiscountCode" class="d-none">{{ $canDeleteDiscountCode ? "1" : "0" }}</div>
    <div id="container"></div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/discount-code/index-discount-code.js')) }}"></script>
@endsection

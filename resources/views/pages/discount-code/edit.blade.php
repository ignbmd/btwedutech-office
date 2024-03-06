@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Kode Diskon')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
    <div id="branchCode" class="d-none">{{ $userBranchCode }}</div>
    <div id="is-central-admin-user" class="d-none">{{ $isCentralAdminUser }}</div>
    <div id="form-container"></div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/discount-code/edit-discount-code.js')) }}"></script>
@endsection

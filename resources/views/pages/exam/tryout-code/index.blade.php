@extends('layouts/contentLayoutMaster')

@section('title', 'Tryout Kode')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
    <div id="is-marketing-user" class="d-none">{{ json_encode($isMarketingUser) }}</div>
    <div id="is-branch-user" class="d-none">{{ json_encode($isBranchUser) }}</div>
    <div id="branchCode" class="d-none">{{ json_encode($userBranchCode) }}</div>
    <div id="live-ranking-host" class="d-none">{{ $liveRankingHost }}</div>
    <div id="tryout-code-container"></div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/exam/index-tryout-code.js')) }}"></script>
@endsection

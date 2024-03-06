@extends('layouts/contentLayoutMaster')

@section('title', 'Buat Tryout Kode CPNS')

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
@endsection
@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-wizard.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
@endsection

@section('content')
  <div id="is-marketing-user" class="d-none">{{ json_encode($isMarketingUser) }}</div>
  <div id="is-branch-user" class="d-none">{{ json_encode($isBranchUser) }}</div>
  <div id="branchCode" class="d-none">{{ json_encode($userBranchCode) }}</div>
  <div id="create-tryout-code"></div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/exam-cpns/create-tryout-code.js')) }}"></script>
@endsection

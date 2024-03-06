@extends('layouts/contentLayoutMaster')

@section('title', 'Tryout Coba Modul')

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
  <div id="trial-module-container"></div>
@endsection

@section('vendor-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
  <script src="{{ asset(mix('js/scripts/exam/index-trial-module.js')) }}"></script>
@endsection

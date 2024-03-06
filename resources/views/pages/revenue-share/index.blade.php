@extends('layouts/contentLayoutMaster')

@section('title', 'Bonus Penjualan')

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
@endsection

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('content')
  <div id="user" class="d-none">{{json_encode($user)}}</div>
  <div id="revenue-share-container"></div>
@endsection

@section('page-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
  <script src="{{ asset(mix('js/scripts/revenue-share/index.js')) }}"></script>
@endsection

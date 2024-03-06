@extends('layouts/contentLayoutMaster')

@section('title', 'Perbarui Transaksi')

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/pages/bill/detail.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
@endsection

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
@endsection

@section('content')
  <span id="user" class="d-none">{{json_encode($user)}}</span>
  <span id="allowed" class="d-none">{{json_encode($allowed)}}</span>
  <span id="billId" class="d-none">{{$billId}}</span>
  <div id="form-container"></div>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/bill/edit-bill.js')) }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Diskon Tagihan')

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/pages/bill/detail.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  @endsection

  @section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
@endsection



@section('content')
  <span id="user" class="d-none">{{json_encode($user)}}</span>
  <span id="allowed" class="d-none">{{json_encode($allowed)}}</span>
  <span id="billId" class="d-none">{{$billId}}</span>
  <section id="form-container"></section>
@endsection


@section('vendor-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
  <script src="{{ asset(mix('js/scripts/bill/edit-final-discount.js')) }}"></script>
@endsection

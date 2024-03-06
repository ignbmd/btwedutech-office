@extends('layouts/contentLayoutMaster')

@section('title', 'Biaya')

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection
@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
@endsection

@section('vendor-style')
@endsection

@section('page-style')
@endsection

@section('content')
  <span id="user" class="d-none">{{json_encode($user)}}</span>
  <span id="expenseId" class="d-none">{{json_encode($id)}}</span>
  <div id="form-container"></div>
@endsection

@section('page-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
  <script src="{{ asset(mix('js/scripts/expense/edit-expense.js')) }}"></script>
@endsection

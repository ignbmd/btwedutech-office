@extends('layouts/contentLayoutMaster')

@section('title', "Tambah Jadwal {$class->title}")

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
@endsection
@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
@endsection

@section('content')
  <span id="classId" style="display:none">{{$classId}}</span>
  <span id="classroom" style="display:none">{{json_encode($class)}}</span>
  <div id="form-container">
  </div>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/learning/add-schedule.js')) }}"></script>
@endsection

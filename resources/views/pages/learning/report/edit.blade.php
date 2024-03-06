@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Laporan Mengajar')

@section('vendor-style')
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
  <span id="classroomId" style="display: none">{{$class->_id}}</span>
  <span id="scheduleId" style="display: none">{{$schedule->_id}}</span>
  <span id="reportId" style="display: none">{{$reportId}}</span>
  <div id="form-container"></div>
@endsection

@section('page-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
  <script src="{{ asset(mix('js/scripts/learning/edit-report.js')) }}"></script>
@endsection

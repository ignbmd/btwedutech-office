@extends('layouts/contentLayoutMaster')

@section('title', 'Buat Laporan Mengajar')

@section('page-style')
<link rel="stylesheet" href="{{ asset(mix('css/lib/react/editor.css')) }}">
@endsection

@section('content')
  <span id="classroomId" style="display: none">{{$class->_id}}</span>
  <span id="scheduleId" style="display: none">{{$scheduleId}}</span>
  <span id="reportId" style="display: none"></span>
  <div id="form-container"></div>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/learning/add-report.js')) }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Presensi Siswa')

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<!-- Basic table -->
<section id="basic-datatable">
  <div id="allowed" class="d-none">{{json_encode($allowed)}}</div>
  <div id="classroomId" class="d-none">{{$classId}}</div>
  <div id="scheduleId" class="d-none">{{$scheduleId}}</div>
  <div id="schedule" class="d-none">{{json_encode($schedule)}}</div>
  <div id="classroom" class="d-none">{{json_encode($class)}}</div>
  <div id="is-online-class" class="d-none">{{$isOnlineClass}}</div>
  <div id="example"></div>
</section>
<!--/ Basic table -->
@endsection

@section('page-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
  <script src="{{ asset(mix('js/scripts/learning/presence.js')) }}"></script>
@endsection

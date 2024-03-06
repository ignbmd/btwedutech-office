@extends('layouts/contentLayoutMaster')

@section('title', 'Pratinjau Modul Soal')

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('content')
  <div id="module-preview-container"></div>
@endsection

@section('page-script')
<script>
  window.APP_ENV = `{{ env('APP_ENV') }}`;
</script>
<script src="{{ asset(mix('js/scripts/exam/module-preview.js')) }}"></script>
@endsection

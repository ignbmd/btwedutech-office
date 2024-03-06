@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Cabang')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css" crossorigin="" />
<link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('css/lib/react/map-leaflet.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
  <div id="form-container"></div>
@endsection

@section('vendor-script')
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/branch/edit-branch.js')) }}"></script>
@endsection

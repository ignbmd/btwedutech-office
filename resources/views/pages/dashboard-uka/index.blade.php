@extends('layouts/contentLayoutMaster')

@section('title', 'Dashboard UKA')

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    hr{
        height: 4px;
        background: grey ;
        border: none;
        border-radius: 10px;
        opacity: 50%;

    }
    </style>
@endsection

@section('content')
<div class="card card-md mb-2" style="height: 2000px">
    <div class="card-body">
      <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
        <iframe style="width: 100%; height: 1780px; border-radius: 10px" src="https://lookerstudio.google.com/embed/reporting/fc86911c-9df1-4eff-8cf0-40e0342a90ef/page/p_kjritpss4c" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
      </div>
    </div>
@endsection


@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
<script>
    $('.nav-tabs a').click(function (e) {
      e.preventDefault()
      $(this).tab('show')
    })
  </script>
@endsection
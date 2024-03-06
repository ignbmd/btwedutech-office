@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Kategori Soal CPNS')

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('content')
  <div id="edit-question-category-container"></div>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/exam-cpns/edit-question-category.js')) }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Materi')

@section('page-style')
<link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
@endsection

@section('content')
  <span id="user" class="d-none">{{json_encode($user)}}</span>
  <span id="materialId" class="d-none">{{$materialId}}</span>
  <div id="form-container"></div>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/material/edit-material.js')) }}"></script>
@endsection

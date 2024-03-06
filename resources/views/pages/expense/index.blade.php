@extends('layouts/contentLayoutMaster')

@section('title', 'Biaya')

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
@endsection

@section('content')
  <span id="user" class="d-none">{{json_encode($user)}}</span>
  <div id="expense"></div>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/expense/expense.js')) }}"></script>
@endsection

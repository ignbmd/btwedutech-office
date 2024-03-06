@extends('layouts/contentLayoutMaster')

@section('title', "Jadwal {$classSummary?->title}")

@section('vendor-style')
  <!-- Vendor css files -->
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/calendars/fullcalendar.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/pickers/flatpickr/flatpickr.min.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
<!-- Page css files -->
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-select.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/lib/react/react-dataTable-component.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/pickers/form-flat-pickr.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/pages/app-calendar.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-validation.css')) }}">
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<div class="card card-statistics">
  <div id="user" class="d-none">{{json_encode($user)}}</div>
  <div id="allowed" class="d-none">{{json_encode($allowed)}}</div>
  <div id="is-online-class" class="d-none">{{json_encode($isOnlineClass)}}</div>
  <div class="card-body statistics-body">
    <div class="row">
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-md-0">
        <div class="media">
          <div class="avatar bg-light-primary mr-2">
            <div class="avatar-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="feather feather-calendar avatar-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{$classSummary?->class_schedules ?? 0}}</h4>
            <p class="card-text font-small-3 mb-0">Jadwal</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-md-0">
        <div class="media">
          <div class="avatar bg-light-info mr-2">
            <div class="avatar-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="feather feather-users avatar-icon">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{$classSummary?->class_members ?? 0}}</h4>
            <p class="card-text font-small-3 mb-0">Siswa</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-sm-0">
        <div class="media">
          <div class="avatar bg-light-warning mr-2">
            <div class="avatar-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="feather feather-alert-circle avatar-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{$classSummary?->quota ?? 0}}</h4>
            <p class="card-text font-small-3 mb-0">Kapasitas Siswa</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-sm-0">
        <div class="media">
          <div class="avatar bg-light-success mr-2">
            <div class="avatar-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="feather feather-user avatar-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{$classSummary?->teachers ?? 0}}</h4>
            <p class="card-text font-small-3 mb-0">Pengajar</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<div id="schedule-container"></div>
@endsection

@section('vendor-script')
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
<script src="{{ asset(mix('js/scripts/learning/schedule.js')) }}"></script>
@endsection

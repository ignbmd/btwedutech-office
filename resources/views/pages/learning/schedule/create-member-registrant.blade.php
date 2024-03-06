@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Registrant Anggota Kelas')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('schedule.meeting-participant.member.create', $scheduleId) }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label">
                Jadwal
              </label>
              <input type="text" class="form-control" value="{{ $schedule->title }}" disabled readonly/>
            </div>

            <div class="form-group">
              <label class="form-label" for="level">
                Zoom Meeting ID
              </label>
              <input type="number" name="zoom_meeting_id" class="form-control" value="{{ $onlineClassMeeting->zoom_meeting_id }}" readonly/>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="class_member">
                Anggota Kelas
              </label>
              <select id="class_member" name="class_member[]" class="form-control select2 hide-search" multiple required>
                @foreach ($classMembers as $classMember)
                  <option value="{{ json_encode($classMember) }}">{{ $classMember->name }} ({{ $classMember->email }})</option>
                @endforeach
              </select>
              <p class="text-danger">@error('class_member[]'){{ $message }}@enderror</p>
            </div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='save' class="mr-50"></i> Proses
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
@endsection

@section('vendor-script')
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script>
  $('.select2').select2();
</script>
@endsection

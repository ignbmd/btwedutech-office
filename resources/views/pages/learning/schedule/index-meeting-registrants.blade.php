@extends('layouts/contentLayoutMaster')

@section('title', "Meeting Registrant")

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/sweetalert2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/rowGroup.bootstrap4.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
  <style>
    #DataTables_Table_0_length,
    #DataTables_Table_0_filter,
    #DataTables_Table_0_info,
    #DataTables_Table_0_paginate
    {
      padding-left: 1em;
      padding-right: 1em;
    }
  </style>
@endsection

@section('content')

<!-- Basic table -->
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header border-bottom p-1">
          <ul class="mb-0 nav nav-tabs">
            <li class="nav-item" id="pending-tab">
              <a class="py-2 nav-link {{ $meetingRegistrantsStatus === "pending" ? "active" : "" }}">
              <span class="align-middle">Pending</span>
              </a>
            </li>
            <li class="nav-item" id="approved-tab">
              <a class="py-2 nav-link {{ $meetingRegistrantsStatus === "approved" ? "active" : "" }}">
              <span class="align-middle">Approved</span>
              </a>
            </li>
            <li class="nav-item" id="denied-tab">
              <a class="py-2 nav-link {{ $meetingRegistrantsStatus === "denied" ? "active" : "" }}">
                <span class="align-middle">Denied</span>
              </a>
            </li>
          </ul>
          <div class="d-inline-flex">
            <a href="/pembelajaran/jadwal/{{$scheduleId}}/meeting-registrant/non-class-member/create" class="btn btn-outline-primary mr-1">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="feather feather-lock mr-50 font-small-4"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg> Tambah Registrant (Non Anggota Kelas)
              </span>
            </a>
            <a href="/pembelajaran/jadwal/{{$scheduleId}}/meeting-registrant/class-member/create" class="btn btn-primary">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="feather feather-lock mr-50 font-small-4"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg> Tambah Registrant (Anggota Kelas)
              </span>
            </a>
          </div>
        </div>
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama/Email Registrant</th>
                <th>Email Registrasi</th>
                <th>Anggota Kelas</th>
                @if($meetingRegistrantsStatus === "approved")
                <th>Join URL</th>
                @endif
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @foreach($meetingRegistrants ?? [] as $index => $data)
                <tr>
                  <td>{{ $index + 1 }}</td>
                  <td>
                    @if(isset($data->first_name) && isset($data->last_name))
                      {{ $data->first_name ." ". $data->last_name }}
                    @elseif(isset($classMembers[$data->email]))
                      {{ $classMembers[$data->email]->name }}
                    @else
                      {{ $data->email }}
                    @endif
                  </td>
                  <td>{{ $data->email }}</td>
                  <td>{{ isset($classMembers[$data->email]) ? "Ya" : "Tidak" }}</td>
                  @if($meetingRegistrantsStatus === "approved")
                    <td><a href="{{ $data->join_url }}">{{ $data->join_url }}</a></td>
                  @endif
                  <td>
                    @if($meetingRegistrantsStatus === "pending")
                      <div class="d-inline-flex">
                        <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary"
                            data-toggle="dropdown">
                            Pilih Aksi
                            <i data-feather='chevron-down' class="font-small-4"></i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right">
                          <form method="POST" action="{{ route('schedule.meeting-participant.approve', $scheduleId) }}">
                            @csrf
                            <input type="hidden" name="registrant_id" value="{{ $data->id }}" />
                            <input type="hidden" name="meeting_id" value="{{ $meetingBody->id }}" />
                            <input type="hidden" name="email" value="{{ $data->email }}" />
                            <input type="hidden" name="first_name" value="{{ $data->first_name }}" />
                            <input type="hidden" name="last_name" value="{{ $data->last_name }}" />
                            <button type="submit" class="btn btn-flat-transparent dropdown-item w-100">Terima Registrasi</button>
                          </form>
                          <form method="POST" action="{{ route('schedule.meeting-participant.deny', $scheduleId) }}">\
                            @csrf
                            <input type="hidden" name="registrant_id" value="{{ $data->id }}" />
                            <input type="hidden" name="meeting_id" value="{{ $meetingBody->id }}" />
                            <input type="hidden" name="email" value="{{ $data->email }}" />
                            <input type="hidden" name="first_name" value="{{ $data->first_name }}" />
                            <input type="hidden" name="last_name" value="{{ $data->last_name }}" />
                            <button type="submit" class="btn btn-flat-transparent dropdown-item w-100">Tolak Registrasi</button>
                          </form>
                        </div>
                      </div>
                    @elseif($meetingRegistrantsStatus === "approved")
                      <form method="POST" action="{{ route('schedule.meeting-participant.cancel', $scheduleId) }}">
                        @csrf
                        <input type="hidden" name="registrant_id" value="{{ $data->id }}" />
                        <input type="hidden" name="meeting_id" value="{{ $meetingBody->id }}" />
                        <input type="hidden" name="email" value="{{ $data->email }}" />
                        <button type="submit" class="btn btn-sm btn-info">Batalkan Registrasi</button>
                      </form>
                    @else
                      <form method="POST" action="{{ route('schedule.meeting-participant.approve', $scheduleId) }}">
                        @csrf
                        <input type="hidden" name="registrant_id" value="{{ $data->id }}" />
                        <input type="hidden" name="meeting_id" value="{{ $meetingBody->id }}" />
                        <input type="hidden" name="email" value="{{ $data->email }}" />
                        <button type="submit" class="btn btn-sm btn-info">Terima Registrasi</button>
                      </form>
                    @endif
                  </td>
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/sweetalert2.all.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection

@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script>
  const datatable = $(".datatables-basic").DataTable({
    language: {
      paginate: {
        previous: "&nbsp;",
        next: "&nbsp;",
      },
    }
  });

  const pendingTab = $("#pending-tab");
  const approvedTab = $("#approved-tab");
  const deniedTab = $("#denied-tab");

  pendingTab.on("click", function() {
    window.location.href = window.location.origin + window.location.pathname + "?status=pending";
  });

  approvedTab.on("click", function() {
    window.location.href = window.location.origin + window.location.pathname + "?status=approved";
  });

  deniedTab.on("click", function() {
    window.location.href = window.location.origin + window.location.pathname + "?status=denied";
  });
</script>
@endsection

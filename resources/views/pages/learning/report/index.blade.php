@extends('layouts/contentLayoutMaster')

@section('title', 'Laporan Mengajar')

@php
function getFileColor($fileType) {
  $colors = config("ui.file_color");
  $isTypeValid = array_key_exists($fileType, $colors);
  return $isTypeValid ? $colors[$fileType] : 'primary';
}
@endphp


@section('vendor-style')
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<section>
  <div class="row">
    <div class="col-12">
      @if (count(array_intersect(['read'], $allowed)))
        @if (!Count($reports))
          <!-- Plan Card starts-->
          <div class="col-md-6 mx-auto">
            <div class="card plan-card border-primary">
              <div class="card-header pb-1">
                <h5 class="mb-0 mx-auto text-muted">- Belum Ada Laporan -</h5>
              </div>
                @if (count(array_intersect(['create'], $allowed)))
                <div class="card-body text-center">
                  <a
                    href="/pembelajaran/laporan/{{request()->route('scheduleId')}}/tambah"
                    class="btn btn-primary text-center btn-block col-md-8 mx-auto"
                  >
                    Buat Laporan
                  </a>
                </div>
              @endif
            </div>
          </div>
          <!-- /Plan CardEnds -->

        @else
        <div class="report card card-apply-job card-app-design">
          @foreach ($reports as $report)
          @php
            $user = collect($users)->first(fn($d) => $d->id == $report->teacher_id);
          @endphp
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <div class="media">
                <div class="avatar mr-1">
                  @php
                    $defaultUrl = "https://btw-cdn.com/assets/office/image/user-1.png";
                    $photoUrl = $user?->profile_image ?? ($report?->teacher_photo ?? $defaultUrl);
                  @endphp
                  <img src="{{$defaultUrl}}" alt="Avatar" width="42" height="42">
                </div>
                <div class="media-body">
                  <h5 class="mb-0">{{$report->teacher_name ?? ''}}</h5>
                  <small class="text-muted">{{$report->teacher_bio ?? 'Dosen'}}</small>
                </div>
              </div>
              <div class="text-right">
                <div class="text-muted"><small>Dibuat oleh : <i>{{$report->creator_name ?? ''}}</i></small></div>
                <div class="text-muted"><small>Diperbarui oleh : <i>{{$report->updater_name ?? ''}}</i></small></div>
                @if (count(array_intersect(['edit'], $allowed)))
                  <a
                    href="/pembelajaran/laporan/{{request()->route('scheduleId')}}/edit/{{$report->_id}}"
                    class="btn btn-sm btn-outline-primary mt-50"
                    >
                    Edit
                  </a>
                @endif
              </div>
            </div>
            <div class="design-group">
              <div class="badge badge-light-warning mr-1">{{$report->classroom_title ?? ''}}</div>
              <div class="badge badge-light-primary">
                <span class="schedule-start-date d-none">{{$report->schedule_start_date}}</span>
                <span class="schedule-end-date d-none">{{$report->schedule_end_date}}</span>
                Jadwal: <span class="time"></span>
              </div>
            </div>
            <div class="design-group">
              <h5 class="apply-job-title">{{$report->title ?? ''}}</h5>
              <p class="card-text mb-2">
                {!! $report->description ?? '' !!}
              </p>
            </div>
            <div class="card-transaction">
              <div class="design-group">
                <h6 class="section-label">Lampiran</h6>
                @foreach (($report?->attachments ?? []) as $attachment)
                <div class="transaction-item">
                  <div class="media">
                    <div class="avatar bg-light-{{getFileColor($attachment->mime_type)}} rounded">
                      <div class="avatar-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          class="feather feather-file avatar-icon font-medium-3">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="media-body">
                      <h6 class="transaction-title">{{$attachment->file_name ?? ''}}</h6>
                      <small>{{$attachment->mime_type ?? ''}}</small>
                    </div>
                  </div>
                  <a href="{{$attachment->file_url}}" class="btn btn-primary btn-sm waves-effect waves-float waves-light">
                    Lihat <i data-feather='external-link'></i>
                  </a>
                </div>
                @endforeach
              </div>
            </div>
          </div>
          @endforeach
        </div>
        @endif
      @endif
    </div>
  </div>
</section>
@endsection

@section('vendor-script')
  <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
  <script>

    const getReportTime = (start='', end='') => {
      start = moment(start).format('DD MMMM YYYY • hh:mm');
      end = moment(end).format('hh:mm');
      return `${start} - ${end}`;
    }

    // Format report time
    const reports = document.querySelectorAll('.report') ?? [];
    reports.forEach(el => {
      const start = el.querySelector('.schedule-start-date').innerText;
      const end = el.querySelector('.schedule-end-date').innerText;
      el.querySelector('.time').innerText = getReportTime(start, end);
    });
  </script>
@endsection

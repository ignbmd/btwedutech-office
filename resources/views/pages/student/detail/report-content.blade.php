<form id="report-content-form" action="{{ route('siswa.detail', $student_profile->smartbtw_id) }}" method="GET">
<input type="hidden" name="active-tab" value="report" />
  <div class="row mt-3">
  <div class="col-12 col-md-2">
    <div class="filter-action-datatable">
      <label for="basicInput" class="">
        Program
      </label>
      <select class="select2-size-sm form-control form-control-lg" id="program" name="program">
        <option value="skd" {{ request()->has('program') && request()->program == 'skd' ? 'selected' : '' }}>SKD</option>
        <option value="skb" {{ request()->has('program') && request()->program == 'skb' ? 'selected' : '' }}>SKB</option>
        <option value="tps" {{ request()->has('program') && request()->program == 'tps' ? 'selected' : '' }}>TPS</option>
        <option value="tpa" {{ request()->has('program') && request()->program == 'tpa' ? 'selected' : '' }}>TPA</option>
        <option value="tka-saintek" {{ request()->has('program') && request()->program == 'tka-saintek' ? 'selected' : '' }}>TKA Saintek</option>
        <option value="tka-soshum" {{ request()->has('program') && request()->program == 'tka-soshum' ? 'selected' : '' }}>TKA Soshum</option>
        <option value="tka-campuran" {{ request()->has('program') && request()->program == 'tka-campuran' ? 'selected' : '' }}>TKA Campuran</option>
      </select>
    </div>
  </div>
  <div class="col-12 col-md-4">
    <div class="filter-action-datatable">
      <label for="basicInput" class="">
        Kategori
      </label>
      <select class="select2-size-sm form-control form-control-lg" id="exam_type" name="exam_type">
        <option value="">Semua Rapor</option>
      </select>
    </div>
  </div>
  <div class="col-12 col-md-2 d-flex flex-column justify-content-end mt-50">
    <button
      type="button"
      id="filter-report-button"
      class="btn btn-lg btn-gradient-primary data-submit d-flex align-items-center justify-content-center"
    >
      <i data-feather='filter' class="mr-50 flex-shrink-0"></i> Filter
    </button>
  </div>
  <div class="col-12 col-md-2 d-flex flex-column justify-content-end ml-auto mt-50">
    <button
      type="button"
      id="download-report-button"
      class="btn btn-lg btn-gradient-success data-submit d-flex align-items-center justify-content-center"
    >
      <i data-feather='download' class="mr-50 flex-shrink-0"></i> Download
    </button>
  </div>
</form>
<div class="col-12 col-md-2 d-flex flex-column justify-content-end mt-50">
  <button
    type="button"
    id="send-report-button"
    data-toggle="modal"
    data-target="#modals-slide-in"
    class="btn btn-lg btn-outline-primary data-submit d-flex align-items-center justify-content-center"
  >
    <i data-feather='send' class="mr-50 flex-shrink-0"></i> Kirim Raport
  </button>
</div>
</div>

<div class="card card-statistics mt-2">
  <div class="card-body statistics-body statistics-body--pb-0">
    <div class="row mt-1">
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-md-0">
        <div class="media">
          <div class="avatar bg-light-primary mr-2">
            <div class="avatar-content">
              <i data-feather="arrow-down" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_report['given'] }}</h4>
            <p class="card-text font-small-3 mb-0">Modul Diterima</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-md-0">
        <div class="media">
          <div class="avatar bg-light-primary mr-2">
            <div class="avatar-content">
              <i data-feather="check" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_report['done'] }}</h4>
            <p class="card-text font-small-3 mb-0">Modul Dikerjakan</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-sm-0">
        <div class="media">
          <div class="avatar bg-light-success mr-2">
            <div class="avatar-content">
              <i data-feather="edit-2" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_report['done_percent'] }}%</h4>
            <p class="card-text font-small-3 mb-0">Kepatuhan Mengerjakan</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-sm-0">
        <div class="media">
          <div class="avatar bg-light-success mr-2">
            <div class="avatar-content">
              <i data-feather="award" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_report['passed_percent'] }}%</h4>
            <p class="card-text font-small-3 mb-0">Kelulusan</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- TKA Campuran Report Table  -->
@if(request()->get('program') == 'tka-campuran')
<table class="datatables-basic table" id="report-table">
  <thead>
    <tr>
      <th colspan="2" rowspan="2">Nama Modul</th>
      <th rowspan="2">Tanggal Selesai Mengerjakan</th>
      <th>Matekatika</th>
      <th>Fisika</th>
      <th>Kimia</th>
      <th>Biologi</th>
      <th rowspan="2">Nilai Akhir</th>
      <th rowspan="2">Status</th>
      <th rowspan="2">Total Mengerjakan</th>
    </tr>
    <tr>
      <th>Sejarah</th>
      <th>Sosiologi</th>
      <th>Ekonomi</th>
      <th>Geografi</th>
    </tr>
  </thead>
  <tbody>
    @forelse($student_report['report'] as $report)
    <tr>
      <td rowspan="2">{{ $report->title }}</td>
      <td>{{ $report->saintek->title ?? "-" }}</td>
      <td>
        @if(property_exists($report->saintek, 'end'))
          {{ Carbon\Carbon::parse($report->saintek->end)->format('d M Y H:i:s') ?? "-" }}
        @else
          -
        @endif
      </td>
      <td>{{ $report->saintek->score[0]->score ?? "-" }}</td>
      <td>{{ $report->saintek->score[1]->score ?? "-" }}</td>
      <td>{{ $report->saintek->score[2]->score ?? "-" }}</td>
      <td>{{ $report->saintek->score[3]->score ?? "-" }}</td>
      <td>{{ $report->saintek->total_score ?? "-" }}</td>
      <td>{{ $report->saintek->status ? "Lulus" : "Tidak Lulus" }}</td>
      <td>{{ $report->saintek->repeat ? $report->saintek->repeat . " kali" : "-" }}</td>
    </tr>
    <tr>
      <td>{{ $report->soshum->title ?? "-" }}</td>
      <td>
        @if(property_exists($report->soshum, 'end'))
          {{ Carbon\Carbon::parse($report->soshum->end)->format('d M Y H:i:s') ?? "-" }}
        @else
          -
        @endif
      </td>
      <td>{{ $report->soshum->score[0]->score ?? "-" }}</td>
      <td>{{ $report->soshum->score[1]->score ?? "-" }}</td>
      <td>{{ $report->soshum->score[2]->score ?? "-" }}</td>
      <td>{{ $report->soshum->score[3]->score ?? "-" }}</td>
      <td>{{ $report->soshum->total_score ?? "-" }}</td>
      <td>
        @if(property_exists($report->soshum, 'status'))
          {{ $report->soshum->status ? "Lulus" : "Tidak Lulus" }}
        @else
          -
        @endif
      </td>
      <td>
        @if(property_exists($report->soshum, 'repeat'))
          {{ $report->soshum->repeat ? $report->soshum->repeat . " kali" : "-" }}
        @else
          -
        @endif
      </td>
    </tr>
    @empty
      <tr>
        <td colspan="18">Data Kosong</td>
      </tr>
    @endforelse
  </tbody>
</table>
{{ $paginator->links('pagination.custom') }}
<!-- Reguler Report Table  -->
@else
<table class="datatables-basic table" id="report-table">
  <thead>
    <tr>
      <th></th>
      <th>No</th>
      <th></th>
      <th>Nama Modul</th>
      <th>Tanggal Mulai Mengerjakan</th>
      <th>Tanggal Selesai Mengerjakan</th>
      <th>Lama Mengerjakan</th>
      @forelse($student_report['categories'] as $data)
        <th>{{ $data->category }}</th>
      @empty
      @endforelse
      <th>Nilai Akhir</th>
      <th>Status</th>
      <th>Total Mengerjakan</th>
    </tr>
  </thead>
</table>
@endif

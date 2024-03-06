<div class="card card-statistics">
  <div class="card-body statistics-body statistics-body--pb-0">
    <div class="row mt-1">
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-md-0">
        <div class="media">
          <div class="avatar bg-light-primary mr-2">
            <div class="avatar-content">
              <i data-feather="monitor" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_presence_summary->classroom }}</h4>
            <p class="card-text font-small-3 mb-0">Kelas diikuti</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-md-0">
        <div class="media">
          <div class="avatar bg-light-primary mr-2">
            <div class="avatar-content">
              <i data-feather="calendar" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_presence_summary->schedules }}</h4>
            <p class="card-text font-small-3 mb-0">Jadwal Pelajaran</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-sm-0">
        <div class="media">
          <div class="avatar bg-light-success mr-2">
            <div class="avatar-content">
              <i data-feather="check" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_presence_summary->attend }}</h4>
            <p class="card-text font-small-3 mb-0">Kali Hadir</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 col-12 mb-2 mb-sm-0">
        <div class="media">
          <div class="avatar bg-light-danger mr-2">
            <div class="avatar-content">
              <i data-feather="x" class="avatar-icon"></i>
            </div>
          </div>
          <div class="media-body my-auto">
            <h4 class="font-weight-bolder mb-0">{{ $student_presence_summary->absent }}</h4>
            <p class="card-text font-small-3 mb-0">Kali tidak hadir</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
<table class="datatables-basic table" id="presence-table">
  <thead>
    <tr>
      <th></th>
      <th>No</th>
      <th></th>
      <th>Kelas</th>
      <th>Status</th>
      <th>Keterangan</th>
      <th>Waktu Presensi</th>
    </tr>
  </thead>
</table>

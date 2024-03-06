<div class="col-lg-12 col-md-10">
  <div class="card user-card">
    <div class="card-body">
      <div class="row">
        <div class="col-xl-5 col-lg-12 d-flex flex-column justify-content-between border-container-lg">
          <div class="user-avatar-section">
            <div class="d-flex justify-content-start">
              @if($alumni->formal_picture)
              <img class="img-fluid rounded" src="{{$alumni->formal_picture}}"
                height="104" width="104" alt="User avatar" />
              @endif
              <div class="d-flex flex-column ml-1">
                <div class="user-info mb-1">
                  <h4 class="mb-0">
                    {{ $alumni->name }}
                  </h4>
                  <span class="card-text">{{ $alumni->email }}</span>
                  <span class="card-text"><small>{{ $alumni->phone }}</small></span>
                </div>
                <div class="d-flex flex-wrap">
                  @if(!$alumni->deleted_at)
                    <a href="{{url("alumni/$program/$selection/$id/edit")}}" class="btn btn-primary mr-2">Ubah</a>
                    <button type="button" class="btn btn-danger" id="delete-alumni-btn">Hapus</button>
                  @endif
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-7 col-lg-12 mt-2 mt-xl-0">
          <div class="user-info-wrapper">
            <div class="row">
              <div class="mb-1 col-md-6">
                <h5 className="mb-0 text-primary font-weight-bolder">Informasi Pribadi</h5>
                <small className="text-muted">Masukan informasi pribadi</small>
              </div>
            </div>
            <div class="row">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Asal Sekolah</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->school_origin ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Jurusan</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->major ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Instansi</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->instance ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Username Akun Instagram</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->social_ig ?? '-' }}</p>
            </div>
            <div class="row">
              <div class="mt-3 mb-1 col-md-6">
                <h5 className="mb-0 text-primary font-weight-bolder">Informasi Nilai, Kelulusan & Testimoni</h5>
                <small className="text-muted">Masukan informasi nilai, kelulusan & testimoni</small>
              </div>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text  font-weight-bold mb-0">Nilai TWK</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->twk ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text  font-weight-bold mb-0">Nilai TWK</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->twk ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text  font-weight-bold mb-0">Nilai TIU</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->tiu ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text  font-weight-bold mb-0">Nilai TKP</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->tkp ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Apakah lulus SKD ?</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->is_skd_passed ? 'Ya' : 'Tidak' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Apakah lulus pantukhir ?</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->is_all_passed ? 'Ya' : 'Tidak' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Apakah mengikuti program pembelajaran online ?</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->is_online_program ? 'Ya' : 'Tidak' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Apakah mengikuti program tatap muka ?</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->is_offline_program ? 'Ya' : 'Tidak' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Total Nilai</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->total_score ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Tahun Bergabung Di BTW</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->joined_year ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Tahun Lulus Seleksi</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->passed_year ?? '-' }}</p>
            </div>
            <div class="row my-50">
              <div class="col-6">
                <i data-feather="user" class="mr-1"></i>
                <span class="card-text font-weight-bold mb-0">Testimoni</span>
              </div>
              <p class="col-6 card-text mb-0">{{ $alumni->testimony ?? '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="col-lg-12 col-md-10">
    <div class="card user-card">
        <div class="card-body">
            <div class="row">
                <div class="col-xl-5 col-lg-12 d-flex flex-column justify-content-between border-container-lg">
                    <div class="user-avatar-section">
                        <div class="d-flex justify-content-start">
                            @if ($student_profile->photo)
                                <img class="img-fluid rounded" src="{{ $student_profile->photo }}" height="104"
                                    width="104" alt="User avatar" />
                            @endif
                            <div class="d-flex flex-column ml-1">
                                <div class="user-info mb-1">
                                    <h4 class="mb-0">
                                        {{ $student_profile->name }}
                                    </h4>
                                    <span class="card-text">{{ $student_profile->email }}</span>
                                    <span class="card-text"><small>{{ $student_profile->phone }}</small></span>
                                </div>
                                <div class="d-flex flex-wrap">
                                    @if (!$student_profile->deleted_at)
                                        <a href="{{ url('siswa/edit/' . $student_profile->smartbtw_id) }}"
                                            class="btn btn-primary mr-2">Ubah</a>
                                    @endif
                                    @if ($is_admin_pusat && !$student_profile->deleted_at)
                                        <button type="button" class="btn btn-danger"
                                            id="delete-student-btn">Hapus</button>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-7 col-lg-12 mt-2 mt-xl-0">
                      <div class="user-info-wrapper">
                        <div class="row">
                            <div class="col-6">
                                <i data-feather="credit-card" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">NIK</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_profile->nik ?? '-' }}</p>
                      </div>
                    <div class="user-info-wrapper">
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="calendar" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Tempat, Tanggal Lahir</span>
                            </div>
                            @if(!isset($student_profile->birth_date_location) && !isset($student_profile->birth_place))
                              <p class="col-6 card-text mb-0">-</p>
                            @elseif(!isset($student_profile->birth_date_location) && isset($student_profile->birth_place))
                              <p class="col-6 card-text mb-0">{{ $student_profile->birth_place }}</p>
                            @elseif(isset($student_profile->birth_date_location) && !isset($student_profile->birth_place))
                              <p class="col-6 card-text mb-0">{{ $student_profile->birth_date_location }}</p>
                            @else
                              <p class="col-6 card-text mb-0">{{ $student_profile->birth_place }}, {{ $student_profile->birth_date_location }}</p>
                            @endif
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="check" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Jenis Kelamin</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_profile->gender ? 'Laki-Laki' : 'Perempuan' }}
                            </p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="star" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Provinsi</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_province->name ?? '-' }}
                            </p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="flag" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Kabupaten</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_region->name ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="home" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Asal Sekolah</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_profile->school_origin ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="search" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Jurusan</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_profile->major ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="award" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Pendidikan Terakhir</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_profile->last_ed ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="user" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Nama Ayah / Wali</span>
                            </div>
                            <p class="col-6 card-text mb-0">
                                {{ $student_profile?->parent_datas?->parent_name ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="user" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Nama Ibu Kandung</span>
                            </div>
                            <p class="col-6 card-text mb-0">
                                {{ $student_profile?->birth_mother_name ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="phone" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">No.HP Orang Tua</span>
                            </div>
                            <p class="col-6 card-text mb-0">
                                {{ $student_profile?->parent_datas?->parent_number ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="map-pin" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Alamat</span>
                            </div>
                            <p class="col-6 card-text mb-0">{{ $student_profile->address ?? '-' }}</p>
                        </div>
                        <div class="row my-50">
                            <div class="col-6">
                                <i data-feather="target" class="mr-1"></i>
                                <span class="card-text  font-weight-bold mb-0">Tujuan Mengikuti Smart BTW</span>
                            </div>
                            @if ($student_profile->intention)
                                <p class="col-6 card-text mb-0">
                                    {{ $student_profile->intention == 'CPNS_TEST_PREPARATION' ? 'Persiapan Ujian CPNS' : 'Persiapan Masuk Sekolah Kedinasan' }}
                                </p>
                            @else
                                <p class="col-6 card-text mb-0">-</p>
                            @endif
                        </div>
                        @if ($student_profile->deleted_at)
                            <div class="row my-50">
                                <div class="col-6">
                                    <i data-feather="user" class="mr-1"></i>
                                    <span class="card-text  font-weight-bold mb-0">Status</span>
                                </div>
                                <p class="col-6 card-text mb-0">Dihapus</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
    {{-- Table CAT BKN --}}
    <hr>
    <div class="card user-card mt-3">
        <h3>Tabel Skor CAT BKN</h3>
        <div class="card-body">
            <div class="row">
                <a href="/siswa/tambah-skor/{{ $student_profile->smartbtw_id }}" class="btn btn-primary mr-2 mb-2"><i
                        class="mr-25" data-feather='plus'></i>Tambah
                    Skor</a>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">No</th>
                            <th scope="col">Tahun Ajaran</th>
                            <th scope="col">TWK</th>
                            <th scope="col">TIU</th>
                            <th scope="col">TKP</th>
                            <th scope="col">SKD</th>
                            <th scope="col">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @if (empty($student_score_bkn))
                            <tr>
                                <td colspan="7" class="text-center">Tidak ada data skor</td>
                            </tr>
                        @else
                            @php
                                $i = 1;
                            @endphp
                            @foreach ($student_score_bkn ?? [] as $score)
                                <tr>
                                    <th scope="row">{{ $i++ }}</th>
                                    <td>{{ $score->year }}</td>
                                    <td>{{ $score->score_twk }}</td>
                                    <td>{{ $score->score_tiu }}</td>
                                    <td>{{ $score->score_tkp }}</td>
                                    <td>{{ $score->score_skd }}</td>
                                    <td>
                                        <div class="d-inline-flex">
                                            <a class="pr-1 dropdown-toggle hide-arrow text-primary btn btn-sm btn-primary"
                                                data-toggle="dropdown">
                                                Pilih Aksi
                                                <i data-feather='chevron-down' class="font-small-4"></i>
                                            </a>
                                            <div class="dropdown-menu dropdown-menu-right">
                                                <a href="/siswa/{{ $student_profile->smartbtw_id }}/edit/{{ $score->_id }}"
                                                    class="btn btn-flat-transparent dropdown-item w-100">
                                                    Edit Skor
                                                </a>
                                                <form action="/siswa/score/delete/{{ $score->_id }}" method="POST">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit"
                                                        class="btn btn-flat-transparent dropdown-item w-100">
                                                        Delete Skor
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        @endif
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

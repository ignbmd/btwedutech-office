@extends('layouts/contentLayoutMaster')

@section('title', $pageTitle)

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
    .info-section {
      cursor: pointer;
    }
    .card {
      border: 1px solid #ccc;
      padding: 15px;
      margin: 10px;
      border-radius: 5px;
      width: 100%;
    }
    .card-title {
      font-weight: bold;
      padding: 0 0 0 10px;
      margin-bottom: 5px;
      background-color: #072442;
      border-radius: 5px 5px 0 0;
      color: white;
      font-size: 10%
    }
    .card-text {
      margin-bottom: 10px;
      margin-top: 10px;
      padding: 10px;
    }
    .card-radio {
      border: 1px solid #ccc;
      padding: 5px;
      border-radius: 5px;
    }
    .table td, .table th {
        border: 1px solid #565656;
    }
    .table td.radio-col {
      border-right: 1px solid #575757;
    }
    .error-message {
    color: red;
    font-size: 14px;
    margin-top: 5px;
}
  </style>

@endsection

@php
  $oldInput = old();
@endphp


@section('content')
<div id="old-input" class="d-none">{{ json_encode($oldInput) }}</div>
<section id="input-sizing">
  <form id="form" action="{{ route('store-hasil-wawancara') }}" method="POST">
    @csrf
    <div class="card">
      <h5 class="card-header"> Form Wawancara</h5>
      <div class="d-flex justify-content-between align-items-center mx-50 row pt-0 pb-2">
        <div class="col-md-6">
          <label>Pilih Cabang</label>
          <select id="branch_code" name="branch_code" class="form-control text-capitalize mb-md-0 mb-2 select2" required disabled>
            <option value=""> Pilih Cabang </option>
          </select>
        </div>
        <div class="col-md-6">
          <label>Pilih Kelas</label>
          <select id="classroom_id" name="classroom_id" class="form-control text-capitalize select2" required>
            <option value=""> Pilih Kelas </option>
          </select>
        </div>
        <div class="col-12 mt-2">
          <label>Pilih Siswa</label>
          <select id="class_member" name="class_member" class="form-control text-capitalize select2" required readonly>
            <option value=""> Pilih Siswa </option>
          </select>
          <input type="hidden" id="class_member_id" name="class_member_id" />
          <input type="hidden" id="class_member_email" name="class_member_email" />
        </div>
        <div class="col-md-6 mt-2">
          <label>PTK Tujuan</label>
          <input id="ptk-school" type="text" class="form-control" disabled>
          <div id="ptkSchoolError" class="error-message"></div>
        </div>
        <div class="col-md-6 mt-2">
          <label>Program Studi</label>
          <input id="study-program" type="text" class="form-control" disabled>
        </div>
        <div class="col-12 mt-2">
          <label>Sesi</label>
          <select name="session_id" id="session_id" class="form-control select2 @error('session') is-invalid @enderror" placeholder="Pilih Sesi" required>
            <option value="">Pilih Sesi</option>
            @foreach($sessionInterview as $data)
              <option value="{{ $data->_id }}" {{ $data->_id === old('session_id') ? 'selected' : '' }}>{{ $data->name }}</option>
            @endforeach
          </select>
        </div>
      </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mx-50 row pt-2 pb-2">
              <div class="card">
                {{-- Profile Calon Taruna Soal --}}
                <div class="card">
                  {{-- SOAL 1 --}}
                    <div class="table-responsive w-100">
                        <table id="datatables-basic" class="table">
                              <div class="card-title">A. PROFIL DAN POTENSI CALON TARUNA</div>
                          <div class="card-text">
                              <h3>1. Penampilan</h3>
                              <p class="mt-1">Detail Penilaian: Pakaian rapi bersih dan sesuai ketentuan (kemeja putih, celana/rok hitam, bersepatu)</p>
                              <h4 class="mt-2">Contoh Pertanyaan: - </h4>
                          </div>
                          <p class="ml-1">Skoring/Penilaian</p>
                          <tbody>
                            <tr>
                              <td class="radio-col" width="25%">
                                <div class="form-check">
                                  <input class="form-check-input" type="radio" name="penampilan" id="penampilan_1" value="4" required {{ old('penampilan') == "4" ? 'checked' : '' }}>
                                  <label class="form-check-label" for="penampilan_1">
                                    Sangat Memuaskan (Skor 4)
                                  </label>
                                </div>
                              </td>
                              <td>Kemeja putih, celana/rok panjang gelap bahan kain, sepatu hitam polos</td>
                            </tr>
                            <tr>
                              <td class="radio-col">
                                <div class="form-check">
                                  <input class="form-check-input" type="radio" name="penampilan" id="penampilan_2" value="3" required {{ old('penampilan') == "3" ? 'checked' : '' }}>
                                  <label class="form-check-label" for="penampilan_2">
                                    Memuaskan (Skor 3)
                                    </label>
                                </div>
                              </td>
                              <td>Kemeja putih, celana/rok panjang gelap bahan bukan kain, sepatu hitam bercorak warna lain</td>
                            </tr>
                            <tr>
                              <td class="radio-col">
                                <div class="form-check">
                                  <input class="form-check-input" type="radio" name="penampilan" id="penampilan_3" value="2" required {{ old('penampilan') == "2" ? 'checked' : '' }}>
                                  <label class="form-check-label" for="penampilan_3">
                                    Cukup Memuaskan (Skor 2)
                                  </label>
                                </div>
                              </td>
                              <td>Kemeja putih, celana/rok tidak berwarna gelap dan bukan kain, sepatu tidak hitam</td>
                            </tr>
                            <tr>
                              <td class="radio-col">
                                <div class="form-check">
                                  <input class="form-check-input" type="radio" name="penampilan" id="penampilan_4" value="1" required {{ old('penampilan') == "1" ? 'checked' : '' }}>
                                  <label class="form-check-label" for="penampilan_4">
                                    Kurang Memuaskan (Skor 1)
                                  </label>
                                </div>
                              </td>
                              <td>Kemeja tidak putih</td>
                            </tr>
                          </tbody>
                        </table>
                    </div>
                    {{-- Urutan soal ke-2--}}
                    <div class="table-responsive w-100">
                        <table id="datatables-basic" class="table">
                        <div class="card-text">
                            <h4 class="mt-2">2. Cara duduk dan berjabat</h4>
                            <p class="mt-1">Detail Penilaian: Lihat pada gambar</p>
                            <h4 class="mt-2">Contoh Pertanyaan: - </h4>
                        </div>
                        <p class="ml-1">Skoring/Penilaian</p>
                        <tbody>
                          <tr>
                            <td class="radio-col" width="25%">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="cara_duduk_dan_berjabat" id="cara_duduk_dan_berjabat_1" value="4" required {{ old('cara_duduk_dan_berjabat') == '4' ? 'checked' : '' }}>
                                <label class="form-check-label" for="cara_duduk_dan_berjabat_1">
                                  Sangat Memuaskan (Skor 4)
                                </label>
                              </div>
                            </td>
                            <td>
                                <img src="https://btw-cdn.com/assets/office/image/interviewtryout/duduk_bobot_3.png" alt="foto-duduk-bobot-3">
                                <img src="https://btw-cdn.com/assets/office/image/interviewtryout/salaman_bobot_3.png" alt="foto-salaman-bobot-3">
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="cara_duduk_dan_berjabat" id="cara_duduk_dan_berjabat_2" value="3" required {{ old('cara_duduk_dan_berjabat') == '3' ? 'checked' : '' }}>
                                <label class="form-check-label" for="cara_duduk_dan_berjabat_2">
                                  Memuaskan (Skor 3)
                                </label>
                              </div>
                            </td>
                            <td>
                                <img src="https://btw-cdn.com/assets/office/image/interviewtryout/duduk_bobot_2.png" alt="foto-duduk-bobot-2">
                                <img src="https://btw-cdn.com/assets/office/image/interviewtryout/salaman_bobot_2.png" alt="foto-salaman-bobot-2">
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="cara_duduk_dan_berjabat" id="cara_duduk_dan_berjabat_3" value="2" required {{ old('cara_duduk_dan_berjabat') == '2' ? 'checked' : '' }}>
                                <label class="form-check-label" for="cara_duduk_dan_berjabat_3">
                                  Cukup Memuaskan (Skor 2)
                                </label>
                              </div>
                            </td>
                            <td><img src="https://btw-cdn.com/assets/office/image/interviewtryout/duduk_bobot_1.png" alt="foto-duduk-bobot-1">
                                <img src="https://btw-cdn.com/assets/office/image/interviewtryout/salaman_bobot_1.png" alt="foto-salaman-bobot-1"></td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="cara_duduk_dan_berjabat" id="cara_duduk_dan_berjabat_4" value="1" required {{ old('cara_duduk_dan_berjabat') == '1' ? 'checked' : '' }}>
                                <label class="form-check-label" for="cara_duduk_dan_berjabat_4">
                                  Kurang Memuaskan (Skor 1)
                                </label>
                              </div>
                            </td>
                            <td><img src="https://btw-cdn.com/assets/office/image/interviewtryout/duduk_bobot_1.png" alt="foto-duduk-bobot-1">
                                <span class="ml-4"> Tidak berjabat tangan</span></td>
                          </tr>
                        </tbody>
                        </table>
                    </div>
                    {{-- Urutan soal ke-3--}}
                    <div class="table-responsive w-100".>
                        <table id="datatables-basic" class="table">
                        <div class="card-text">
                            <h4 class="mt-2">3. Praktek baris berbaris</h4>
                            <p class="mt-1">Detail Penilaian: Mampu mengikuti instruksi baris berbaris, posisi badan tegap, sikap berdiri sempurna</p>
                            <h4 class="mt-2">Contoh Pertanyaan: - </h4>
                        </div>
                        <p class="ml-1">Skoring/Penilaian</p>
                        <tbody>
                          <tr>
                            <td class="radio-col" width="25%">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="praktek_baris_berbaris" id="praktek_baris_berbaris_1" value="4" required {{ old('praktek_baris_berbaris') == '4' ? 'checked' : '' }}>
                                <label class="form-check-label" for="praktek_baris_berbaris_1">
                                  Sangat Memuaskan (Skor 4)
                                </label>
                              </div>
                            </td>
                            <td>
                                3 instruksi semuanya betul
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="praktek_baris_berbaris" id="praktek_baris_berbaris_2" value="3" required {{ old('praktek_baris_berbaris') == '3' ? 'checked' : '' }}>
                                <label class="form-check-label" for="praktek_baris_berbaris_2">
                                  Memuaskan (Skor 3)
                                </label>
                              </div>
                            </td>
                            <td>
                                3 instruksi salah 1
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="praktek_baris_berbaris" id="praktek_baris_berbaris_3" value="2" required {{ old('praktek_baris_berbaris') == '2' ? 'checked' : '' }}>
                                <label class="form-check-label" for="praktek_baris_berbaris_3">
                                  Cukup Memuaskan (Skor 2)
                                </label>
                              </div>
                            </td>
                            <td>
                                3 instruksi salah 2
                              </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="praktek_baris_berbaris" id="praktek_baris_berbaris_4" value="1" required {{ old('praktek_baris_berbaris') == '1' ? 'checked' : '' }}>
                                <label class="form-check-label" for="praktek_baris_berbaris_4">
                                  Kurang Memuaskan (Skor 1)
                                </label>
                              </div>
                            </td>
                            <td>
                              3 instruksi salah semua
                            </td>
                          </tr>
                        </tbody>
                        </table>
                    </div>
                    {{-- Soal 4 --}}
                      <div class="table-responsive w-100">
                        <table id="datatables-basic" class="table">
                        <div class="card-text">
                            <h4 class="mt-2">4. Penampilan Sopan Santun</h4>
                            <p class="mt-1">Detail Penilaian: Pengucapan salam, mata melihat ke arah pewawancara, memperhatikan ketika diajak berbicara</p>
                            <h4 class="mt-2">Contoh Pertanyaan: - </h4>
                        </div>
                        <p class="ml-1">Skoring/Penilaian</p>
                        <tbody>
                          <tr>
                            <td class="radio-col" width="25%">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="penampilan_sopan_santun" id="penampilan_sopan_santun_1" value="4" required {{ old('penampilan_sopan_santun') == '4' ? 'checked' : '' }}>
                                <label class="form-check-label" for="penampilan_sopan_santun_1">
                                  Sangat Memuaskan (Skor 4)
                                </label>
                              </div>
                            </td>
                            <td>
                              Mengucapkan salam, memperhatikan pewawancara, eye contact
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="penampilan_sopan_santun" id="penampilan_sopan_santun_2" value="3" required {{ old('penampilan_sopan_santun') == '3' ? 'checked' : '' }}>
                                <label class="form-check-label" for="penampilan_sopan_santun_2">
                                  Memuaskan (Skor 3)
                                </label>
                              </div>
                            </td>
                            <td>
                                Mengucapkan salam, kurang memperhatikan pewawancara, eye contact kurang</td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="penampilan_sopan_santun" id="penampilan_sopan_santun_3" value="2" required {{ old('penampilan_sopan_santun') == '2' ? 'checked' : '' }}>
                                <label class="form-check-label" for="penampilan_sopan_santun_3">
                                  Cukup Memuaskan (Skor 2)
                                </label>
                              </div>
                            </td>
                            <td>
                              Mengucapkan salam, posisi duduk kurang, tidak memperhatikan/ eye contact dengan pewawancara
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="penampilan_sopan_santun" id="penampilan_sopan_santun_4" value="1" required {{ old('penampilan_sopan_santun') == '1' ? 'checked' : '' }}>
                                <label class="form-check-label" for="penampilan_sopan_santun_4">
                                  Kurang Memuaskan (Skor 1)
                                </label>
                              </div>
                            </td>
                            <td>
                              Tidak mengucapkan salam
                            </td>
                          </tr>
                        </tbody>
                        </table>
                    </div>
                    {{-- Soal 5 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">5. Kepercayaan Diri dan Stabilitas Emosi</h4>
                          <p class="mt-1">Detail Penilaian: Tenang, tidak gugup, tidak ragu dalam menjawab dan menyampaikan pendapat, mampu menyesuaikan diri dengan situasi di ruang wawancara</p>
                          <h4 class="mt-2">Contoh Pertanyaan: - </h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kepercayaan_diri_dan_stabilitas_emosi" id="kepercayaan_diri_dan_stabilitas_emosi_1" value="4" required {{ old('kepercayaan_diri_dan_stabilitas_emosi') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kepercayaan_diri_dan_stabilitas_emosi_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            Tenang, tidak ragu dan sangat percaya diri
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kepercayaan_diri_dan_stabilitas_emosi" id="kepercayaan_diri_dan_stabilitas_emosi_2" value="3" required {{ old('kepercayaan_diri_dan_stabilitas_emosi') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kepercayaan_diri_dan_stabilitas_emosi_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            Kurang tenang dan kurang percaya diri
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kepercayaan_diri_dan_stabilitas_emosi" id="kepercayaan_diri_dan_stabilitas_emosi_3" value="2" required {{ old('kepercayaan_diri_dan_stabilitas_emosi') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kepercayaan_diri_dan_stabilitas_emosi_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            Grogi dan gugup
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kepercayaan_diri_dan_stabilitas_emosi" id="kepercayaan_diri_dan_stabilitas_emosi_4" value="1" required {{ old('kepercayaan_diri_dan_stabilitas_emosi') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kepercayaan_diri_dan_stabilitas_emosi_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            Tidak menjawab
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 6 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">6. Komunikasi</h4>
                          <p class="mt-1">Standar Penilaian: Kemampuan Berkomunikasi</p>
                          <h4>Contoh Pertanyaan:</h4>
                          <h4>1. Bagaimana Anda menilai kelebihan dan kekurangan pada diri anda ?</h4>
                          <h4>2. Jelaskan arti bahwa manusia itu makhluk sebagai makhluk individu dan makhluk sosial ?</h4>
                          <h4>3. Bagaimana anda mengelola medsos anda (memilih teman, memilih follower, upload berita dan mengubah status)</h4>
                          <h4>4. Pewawancara memberikan kesimpulan penilaian kemampuan berkomunikasi perserta dari pertanyaan yang diberikan </h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="komunikasi" id="komunikasi_1" value="4" required {{ old('komunikasi') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="komunikasi_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            Dapat menjelaskan secara terstruktur menggunakan Bahasa Indonesia yang baik dan benar serta mudah dipahami penjelasanya.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="komunikasi" id="komunikasi_2" value="3" required {{ old('komunikasi') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="komunikasi_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            Dapat menjelaskan secara tidak terstruktur namun menggunakan Bahasa Indonesia yang baik dan benar serta mudah dipahami penjelasanya.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="komunikasi" id="komunikasi_3" value="2" required {{ old('komunikasi') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="komunikasi_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            Dapat menjelaskan secara tidak terstruktur dan tidak menggunakan Bahasa Indonesia yang baik dan benar serta cenderung sulit dipahami penjelasanya.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="komunikasi" id="komunikasi_4" value="1" required {{ old('komunikasi') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="komunikasi_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            Tidak Dapat menjelaskan secara terstruktur dan tidak menggunakan Bahasa Indonesia yang baik dan benar serta sulit dipahami penjelasanya.</td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 7 --}}
                      <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">7. Pengembangan Diri</h4>
                          <p class="mt-1">Standar Penilaian: Kemampuan Mengembangkan Potensi Diri</p>
                          <h4 class="mt-2">Contoh Pertanyaan:</h4>
                          <h4>1. Bagaimana Anda mengembangkan potensi Anda ?</h4>
                          <h4>2. Bagaimana cara kamu berkontribusi dalam peningkatan prestasi sekolah yang kamu pilih ? (apabila kamu diterima jadi taruna / taruni)</h4>
                          <h4>3. Ceritakan kontribusi anda dalam mempertahankan & meningkatkan nama baik sekolah anda pada anda di SLTA</h4>
                          <h4>4. Apa upaya yang telah anda lakukan untuk mendapatkan pencapaian maupun peningkatan kemampuan dalam hidup anda?</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengembangan_diri" id="pengembangan_diri_1" value="4" required {{ old('pengembangan_diri') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengembangan_diri_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Dapat menjelaskan secara terstruktur pengembangan potensi diri dengan memberikan contoh kegiatan pengembangan potensi diri. </p>
                            <p>Jawaban yang rinci ada 4 unsur merencanakan, observasi (internal dan ekternal), adaptasi dan evaluasi </p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengembangan_diri" id="pengembangan_diri_2" value="3" required {{ old('pengembangan_diri') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengembangan_diri_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            <p>Dapat menjelaskan pengembangan potensi diri secara terbatas dengan memberikan contoh kegiatan pengembangan potensi diri.</p>
                            <p>Jawaban hanya ada 3 unsur yaitu merencanakan, observasi (internal dan ekternal) dan adaptasi</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengembangan_diri" id="pengembangan_diri_3" value="2" required {{ old('pengembangan_diri') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengembangan_diri_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Dapat menjelaskan pengembangan potensi diri secara terbatas namun tidak dapat memberikan  contoh kegiatan pengembangan potensi diri.</p>
                            <p>Jawaban ada 2 unsur yaitu merencanakan, observasi (internal dan ekternal)</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengembangan_diri" id="pengembangan_diri_4" value="1" required {{ old('pengembangan_diri') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengembangan_diri_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Tidak dapat menjelaskan pengembangan potensi dirinya</p>
                            <p>Jawaban hanya ada 1 unsur yaitu merencanakan</p>
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 8 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">8. Integritas</h4>
                          <p class="mt-1">Standar Penilaian: Tingkat Integritas</p>
                          <h4>Contoh Pertanyaan:</h4>
                          <h4>1. Bagaimana pendapat Anda apabila terdapat sahabat karib anda memberikan hadiah yang terindikasi dari hasil korupsi?</h4>
                          <h4>2. Pernahkah anda melakukan apa yang anad anggap sebagai "hal yang benar" dan melihat konsekuensi dari keputusan anda? Contohnya Anda melihat teman anda mengambil uang di kelas dan melaporkan ke guru adalah hal yang anggap anda benar tapi akan menganggu pertemanan anda. Jelaskan pendapat anda</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="integritas" id="integritas_1" value="4" required {{ old('integritas') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="integritas_1">
                              Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                          Menyatakan secara tegas untuk menolak pemberian tersebut dan dapat memberikan alasan penolakan tersebut.</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check" width="25%">
                              <input class="form-check-input" type="radio" name="integritas" id="integritas_2" value="3" required {{ old('integritas') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="integritas_2">
                              Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                          Menyatakan secara tegas untuk menolak pemberian tersebut dan tidak dapat memberikan alasan penolakan tersebut.</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="integritas" id="integritas_3" value="2" required {{ old('integritas') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="integritas_3">
                              Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                          Bersedia menerima pemberian tersebut.
                          </td>
                        </tr>
                        <tr>
                        <td class="radio-col">
                          <div class="form-check">
                            <input class="form-check-input" type="radio" name="integritas" id="integritas_4" value="1" required {{ old('integritas') == '1' ? 'checked' : '' }}>
                            <label class="form-check-label" for="integritas_4">
                              Kurang Memuaskan (Skor 1)
                            </label>
                          </div>
                        </td>
                        <td>
                          Tidak memberikan pendapat
                        </td>
                      </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 9 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">9. Kerjasama</h4>
                          <p class="mt-1">Standar Penilaian: Adaptasi kerjasama dalam Organisasi</p>
                          <h4 class="mt-2">Contoh Pertanyaan:</h4>
                          <h4>1. Bagaimana pendapat Anda tentang prinsip Kerjasama dalam kelompok</h4>
                          <h4>2. Berikan contoh keguatan di masa lalu bagaimana anda menangani perbedaan pendapat dalam berkerjasama atau berorganisasi?</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kerjasama" id="kerjasama_1" value="4" required {{ old('kerjasama') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kerjasama_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            Dapat menjelaskan prinsip Kerjasama dalam organisasi dengan rinci dan dapat memberikan contoh pelaksanaan bekerjasama dengan orang lain dalam satu kelompok.</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kerjasama" id="kerjasama_2" value="3" required {{ old('kerjasama') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kerjasama_2">
                                Memuaskan (Skor 3)
                              </label>
                            </div>
                          </td>
                          <td>
                            Dapat menjelaskan prinsip Kerjasama dalam organisasi dengan terbatas namun dapat memberikan contoh pelaksanaan bekerjasama dengan orang lain dalam satu kelompok.
                          </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kerjasama" id="kerjasama_3" value="2" required {{ old('kerjasama') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kerjasama_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            Dapat menjelaskan prinsip Kerjasama dalam organisasi dengan terbatas dan tidak dapat memberikan contoh pelaksanaan bekerjasama dengan orang lain dalam satu kelompok.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="kerjasama" id="kerjasama_4" value="1" required {{ old('kerjasama') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="kerjasama_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            Tidak dapat menjelaskan prinsip Kerjasama dalam organisasi dan tidak dapat memberikan contoh pelaksanaan bekerjasama dengan orang lain dalam satu kelompok.</td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 10 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">10. Mengelola Perubahan</h4>
                          <p class="mt-1">Standar Penilaian: Adaptasi Terhadap Perubahan</p>
                          <h4 class="mt-2">Contoh Pertanyaan</h4>
                          <h4>1. Bagaimana Anda mengelola perubahan Teknologi dan Informasi untuk berkerja dalam kelompok ?</h4>
                          <h4>2. Ceritakan rencana anda jika anda jadi taruna/taruni sekolah kedinasan perhubungan dan bagaimana cara anda membagi waktu ?</h4>
                          <h4>3. Ceritakan pengalaman anda tentang pembelajaran offline menjadi online pada masa covid-19?</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="mengelola_perubahan" id="mengelola_perubahan_1" value="4" required {{ old('mengelola_perubahan') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="mengelola_perubahan_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Dapat menjelaskan secara terstruktur Langkah - Langkah beradaptasi, berkomunikasi dan bekerja di dalam kelompok menghadapi perubahan Teknologi dan Informasi.</p>
                            <p>Jawaban lengkap ada 4 unsur yaitu merencanakan, peningkatan skill, experience (pengalamam) dan Skala Prioritas.</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="mengelola_perubahan" id="mengelola_perubahan_2" value="3" required {{ old('mengelola_perubahan') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="mengelola_perubahan_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            <p>Dapat menjelaskan secara tidak terstruktur Langkah – Langkah beradaptasi, berkomunikasi dan bekerja di dalam kelompok  menghadapi perubahan Teknologi dan Informasi .</p>
                            <p>Jawaban hanya 3 unsur yaitu merencanakan, peningkatan skill dan skala prioritas</p>
                          </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="mengelola_perubahan" id="mengelola_perubahan_3" value="2" required {{ old('mengelola_perubahan') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="mengelola_perubahan_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Dapat menjelaskan secara terbatas Langkah – Langkah beradaptasi, berkomunikasi dan bekerja di dalam kelompok menghadapi perubahan Teknologi dan Informasi .</p>
                            <p>Jawaban hanya 2 unsur merencanakan dan skala prioritas.</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="mengelola_perubahan" id="mengelola_perubahan_4" value="1" required {{ old('mengelola_perubahan') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="mengelola_perubahan_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Tidak dapat menjelaskan Langkah – Langkah beradaptasi, berkomunikasi dan bekerja di dalam kelompok  menghadapi perubahan Teknologi dan Informasi .</p>
                            <p>Jawaban hanya 1 unsur misalkan hanya skala prioritas</p>
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 11 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">11. Perekat Bangsa</h4>
                          <p class="mt-1">Standar Penilaian: Adaptasi Terhadap Wawasan Kebangsaan</p>
                          <h4 class="mt-2">Contoh Pertanyaan</h4>
                          <h4>1. Bagaimana pendapat Saudara tentang perbedaan suku, agama, ras, dan antar golongan yang ada di Indonesia?</h4>
                          <h4>2. Coba anda sebutkan kelima sila Pancasila! menurut anda rasa nasionalisme seperti apa yang harus dimiliki oleh seorang pelajar saat ini?</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="perekat_bangsa" id="perekat_bangsa_1" value="4" required {{ old('perekat_bangsa') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="perekat_bangsa_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            Berpandangan positif dan dapat memberikan contoh nyata dalam kehidupan sehari-hari dengan terstruktur.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="perekat_bangsa" id="perekat_bangsa_2" value="3" required {{ old('perekat_bangsa') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="perekat_bangsa_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            Berpandangan positif namun tidak memberikan contoh nyata dalam kehidupan sehari-hari dengan terstruktur.
                          </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="perekat_bangsa" id="perekat_bangsa_3" value="2" required {{ old('perekat_bangsa') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="perekat_bangsa_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            Berpandangan positif namun tidak memberikan contoh nyata dalam kehidupan sehari-hari dengan tidak terstruktur.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="perekat_bangsa" id="perekat_bangsa_4" value="1" required {{ old('perekat_bangsa') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="perekat_bangsa_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            Berpandangan negatif.
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 12 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">12. Pelayanan Publik</h4>
                          <p class="mt-1">Standar Penilaian: Sikap Melayani</p>
                          <h4 class="mt-2">Contoh Pertanyaan</h4>
                          <h4>1. Pernahkah Anda berurusan dengan salah satu lembaga pemerintah untuk mengurus dokumen kependudukan, surat ijin mengemudi, surat keterangan kelakuan baik, surat domisili bagaimana pendapat Anda?</h4>
                          <h4>2. Ceritakan tentang pengalaman di mana anda berhasil menyelesaikan masalah atau membantu seseorang dengan penuh kesabaran dan empati?</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pelayanan_publik" id="pelayanan_publik_1" value="4" required {{ old('pelayanan_publik') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pelayanan_publik_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            Memiliki pengalaman, menjelaskan rangkaian prosedur, menyampaikan ide-ide perbaikan layanan, ekspektasi layanan yang ideal.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pelayanan_publik" id="pelayanan_publik_2" value="3" required {{ old('pelayanan_publik') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pelayanan_publik_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            Memiliki pengalaman, menjelaskan rangkaian prosedur, tetapi tidak menyampaikan ide-ide perbaikan layanan, ekspektasi layanan yang ideal.
                          </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pelayanan_publik" id="pelayanan_publik_3" value="2" required {{ old('pelayanan_publik') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pelayanan_publik_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            Tidak memiliki pengalaman, tetapi dapat menyampaikan ide-ide perbaikan layanan, ekspektasi layanan yang ideal.
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pelayanan_publik" id="pelayanan_publik_4" value="1" required {{ old('pelayanan_publik') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pelayanan_publik_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            Tidak memiliki pengalaman pengalaman dan tidak menyampaikan ide-ide perbaikan layanan serta ekspektasi layanan ideal.
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 13 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">13. Pengambilan Keputusan</h4>
                          <p class="mt-1">Standar Penilaian: Tingkat integritas Diri</p>
                          <h4 class="mt-2">Contoh Pertanyaan</h4>
                          <h4>1. Bagaimana Anda mendapatkan informasi tentang sekolah yang Anda tuju dan mementukan pilihan pada sekolah dan jurusannya dan  Alasan anda memilih sekolah ini?
                            </h4>
                          <h4>2. Bagaimana cara kamu berkontribusi dalam peningkatan prestasi sekolah yang kamu pilih ? (apabila kamu di terima jadi taruna/taruni</h4>
                          <h4>3. Bagaimana anda menghadapi tantangan atau kegagalan dan tetap termotivasi untuk terus maju?</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengambilan_keputusan" id="pengambilan_keputusan_1" value="4" required {{ old('pengambilan_keputusan') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengambilan_keputusan_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Kemauan sendiri dan mampu menjelaskan proses pendaftaran dan seleksi serta mengetahui dengan rinci informasi sekolah yang dituju.</p>
                            <p>Jawaban yang rinci ada 4 unsur merencanakan, observasi (internal dan ekternal), adaptasi dan evaluasi.</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengambilan_keputusan" id="pengambilan_keputusan_2" value="3" required {{ old('pengambilan_keputusan') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengambilan_keputusan_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            <p>Kemauan sendiri dan mampu menjelaskan proses pendaftaran dan seleksi serta mengetahui sebagian informasi sekolah yang dituju.</p>
                            <p>Jawaban hanya ada 3 unsur yaitu merencanakan, observasi (internal dan ekternal) dan adaptasi</p>
                          </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengambilan_keputusan" id="pengambilan_keputusan_3" value="2" required {{ old('pengambilan_keputusan') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengambilan_keputusan_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Dorongan orang lain dan mampu menjelaskan  proses pendaftaran dan seleksi serta mengetahui sebagian informasi sekolah yang dituju.</p>
                            <p>Jawaban ada 2 unsur yaitu merencanakan, observasi (internal dan ekternal).</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="pengambilan_keputusan" id="pengambilan_keputusan_4" value="1" required {{ old('pengambilan_keputusan') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="pengambilan_keputusan_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Dorongan orang lain dan Tidak mampu menjelaskan proses pendaftaran dan seleksi serta tidak mengetahui informasi sekolah yang dituju.</p>
                            <p>Jawaban hanya ada 1 unsur yaitu merencanakan</p>
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 14 --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                          <h4 class="mt-2">14. Orientasi Hasil</h4>
                          <p class="mt-1">Standar Penilaian: Ketangguhan dalam menjalani Pendidikan</p>
                          <h4 class="mt-2">Contoh Pertanyaan</h4>
                          <h4>1. Bagaimana Kesiapan Anda hidup di Asrama dan Bagaimana Pendapat Anda terhadap Pola Kehidupan di Asrama?</h4>
                          <h4>2. Apa pencapaian terbesar kamu atau prestasi besar/tertinggi sampai saat ini</h4>
                          <h4>3. Bagaimana kesiapan Anda hidup di Asrama dan bagaimana pendapat Anda terhadap pola kehidupan di Asrama</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="orientasi_hasil" id="orientasi_hasil_1" value="4" required {{ old('orientasi_hasil') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="orientasi_hasil_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Peserta sangat yakin dengan kesanggupannya tinggal di asrama, dan dapat memberikan contoh kehidupan di asrama.</p>
                            <p>Jawaban memiliki unsur unsur sbb jenis prestasi (kapan dan pembuktian berupa sertifikat, foto dan tanda peserta), latar belakang ( cara pencapaian, keterlibatan orang lain atau Lembaga) dan dampak.</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="orientasi_hasil" id="orientasi_hasil_2" value="3" required {{ old('orientasi_hasil') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="orientasi_hasil_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>
                            <p>Peserta yakin dengan kesanggupannya tinggal di asrama, namun tidak dapat memberikan contoh kehidupan di asrama.</p>
                            <p>Jawaban memiliki unsur jenis pencapaian/prestasi dan latar belakang.</p>
                          </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="orientasi_hasil" id="orientasi_hasil_3" value="2" required {{ old('orientasi_hasil') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="orientasi_hasil_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Peserta ragu-ragu  dengan kesanggupannya tinggal di asrama.</p>
                            <p>Jawaban hanya memiliki satu unsur yaitu hanya jenis prestasi</p>
                          </td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="orientasi_hasil" id="orientasi_hasil_4" value="1" required {{ old('orientasi_hasil') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="orientasi_hasil_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>
                            <p>Peserta tidak yakin dengan kesanggupannya tinggal di asrama.</p>
                            <p>Tidak bisa menjelaskan</p>
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                </div>

                {{-- card pertantanyaan POTENSI CALON TARUNA --}}
                <div class="card">
                  {{-- Soal 1 Potensi --}}
                    <div class="table-responsive w-100">
                        <table id="datatables-basic" class="table">
                            <div class="card-title">B. PRESTASI DAN BAHASA ASING</div>
                        <div class="card-text">
                          <h4 class="mt-2">1. Prestasi Akademik</h4>
                          <p class="mt-1">Standar Penilaian: Pencapaian Prestasi Akademik</p>
                          <h4 class="mt-2">Contoh Pertanyaan:</h4>
                          <h4 class="mt-2">1. Apakah Saudara dapat menjelaskan prestasi akademik yang pernah dicapai ? (Dapat menunjukan bukti prestasi)</h4>
                        </div>
                        <p class="ml-1">Skoring/Penilaian</p>
                        <tbody>
                          <tr>
                            <td class="radio-col" width="25%">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="prestasi_akademik" id="prestasi_akademik_1" value="4" required {{ old('prestasi_akademik') == '4' ? 'checked' : '' }}>
                                <label class="form-check-label" for="prestasi_akademik_1">
                                  Sangat Memuaskan (Skor 4)
                                </label>
                              </div>
                            </td>
                            <td>Juara 3 besar tingkat nasional/ internasional</td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="prestasi_akademik" id="prestasi_akademik_2" value="3" required {{ old('prestasi_akademik') == '3' ? 'checked' : '' }}>
                                <label class="form-check-label" for="prestasi_akademik_2">
                                  Memuaskan (Skor 3)
                                </label>
                              </div>
                            </td>
                            <td>Juara 3 besar tingkat Daerah (Provinsi/ Kabupaten/Kota)
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="prestasi_akademik" id="prestasi_akademik_3" value="2" required {{ old('prestasi_akademik') == '2' ? 'checked' : '' }}>
                                <label class="form-check-label" for="prestasi_akademik_3">
                                  Cukup Memuaskan (Skor 2)
                                </label>
                              </div>
                            </td>
                            <td>Juara 3 besar tingkat Sekolah</td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="prestasi_akademik" id="prestasi_akademik_4" value="1" required {{ old('prestasi_akademik') == '1' ? 'checked' : '' }}>
                                <label class="form-check-label" for="prestasi_akademik_4">
                                  Kurang Memuaskan (Skor 1)
                                </label>
                              </div>
                            </td>
                            <td>Berpartisipasi sebagai peserta</td>
                          </tr>
                        </tbody>
                        </table>
                    </div>
                    {{-- Soal 2 potensi --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                        <h4 class="mt-2">2. Prestasi Non Akademik (Olahraga, Seni, Sosial Budaya, dan Agama)</h4>
                        <p class="mt-1">Standar Penilaian: Pencapaian Prestasi Non Akademik</p>
                        <h4 class="mt-2">Contoh Pernyataan</h4>
                        <h4>1. Apakah Saudara dapat menjelaskan prestasi non akademik yang pernah dicapai? (Dapat menunjukan bukti prestasi)</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="prestasi_non_akademik" id="prestasi_non_akademik_1" value="4" required {{ old('prestasi_non_akademik') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="prestasi_non_akademik_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>Juara 3 besar tingkat nasional/ internasional</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="prestasi_non_akademik" id="prestasi_non_akademik_2" value="3" required {{ old('prestasi_non_akademik') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="prestasi_non_akademik_2">
                                Memuaskan (Skor 3)
                                </label>
                            </div>
                          </td>
                          <td>Juara 3 besar tingkat Daerah (Provinsi/ Kabupaten/Kota)</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="prestasi_non_akademik" id="prestasi_non_akademik_3" value="2" required {{ old('prestasi_non_akademik') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="prestasi_non_akademik_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>Juara 3 besar tingkat Sekolah</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="prestasi_non_akademik" id="prestasi_non_akademik_4" value="1" required {{ old('prestasi_non_akademik') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="prestasi_non_akademik_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>Berpartisipasi sebagai peserta</td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                    {{-- Soal 3 Potensi --}}
                    <div class="table-responsive w-100">
                      <table id="datatables-basic" class="table">
                      <div class="card-text">
                        <h4 class="mt-2">3. Bahasa Asing</h4>
                        <p class="mt-1">Standar Penilaian: Penguasaan Bahasa Asing</p>
                        <h4 class="mt-2">Contoh Pertanyaan:</h4>
                        <h4 class="mt-2">1. Apakah anda menguasai bahasa asing? Bahasa asing apa yang anda kuasai? Perkenalkan diri Anda dan kegiatan sehari-hari dengan bahasa inggris !</h4>
                      </div>
                      <p class="ml-1">Skoring/Penilaian</p>
                      <tbody>
                        <tr>
                          <td class="radio-col" width="25%">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="bahasa_asing" id="bahasa_asing_1" value="4" required {{ old('bahasa_asing') == '4' ? 'checked' : '' }}>
                              <label class="form-check-label" for="bahasa_asing_1">
                                Sangat Memuaskan (Skor 4)
                              </label>
                            </div>
                          </td>
                          <td>Menguasai lebih dari 1 bahasa asing secara aktif, dapat memperkenalkan diri menggunakan bahasa asing yang dikuasai serta berbicara dengan 1-2 bahasa asing dengan pewawancara dengan fasih</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="bahasa_asing" id="bahasa_asing_2" value="3" required {{ old('bahasa_asing') == '3' ? 'checked' : '' }}>
                              <label class="form-check-label" for="bahasa_asing_2">
                                Memuaskan (Skor 3)
                              </label>
                            </div>
                          </td>
                          <td>Menguasai bahasa asing secara aktif, dapat memperkenalkan diri menggunakan 1 bahasa asing yang dikuasai serta berbicara dengan 1 bahasa asing dengan pewawancara dengan fasih</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="bahasa_asing" id="bahasa_asing_3" value="2" required {{ old('bahasa_asing') == '2' ? 'checked' : '' }}>
                              <label class="form-check-label" for="bahasa_asing_3">
                                Cukup Memuaskan (Skor 2)
                              </label>
                            </div>
                          </td>
                          <td>Menguasai bahasa asing secara aktif, dapat memperkenalkan diri menggunakan 1 bahasa asing yang dikuasai</td>
                        </tr>
                        <tr>
                          <td class="radio-col">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" name="bahasa_asing" id="bahasa_asing_4" value="1" required {{ old('bahasa_asing') == '1' ? 'checked' : '' }}>
                              <label class="form-check-label" for="bahasa_asing_4">
                                Kurang Memuaskan (Skor 1)
                              </label>
                            </div>
                          </td>
                          <td>Menguasai bahasa asing pasif</td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                  </div>
                  {{-- Bersedia Pindah Jurusan --}}
                  <div class="card">
                    <div class="table-responsive w-100 p-1">
                      <table id="datatables-basic" class="table">
                      {{-- <div class="card-text">
                      </div> --}}
                        <h5>Apakah bersedia pindah jurusan? </h5>
                        {{-- <textarea name="note" id="note" class="form-control w-100" placeholder="Masukan Catatan ...." ></textarea> --}}
                        <tbody>
                          <tr>
                            <td class="radio-col" width="25%">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="bersedia_pindah_jurusan" id="bersedia_pindah_jurusan_1" value="true" required {{ old('bersedia_pindah_jurusan') == 'true' ? 'checked' : '' }}>
                                <label class="form-check-label" for="bersedia_pindah_jurusan_1">
                                  Bersedia
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="bersedia_pindah_jurusan" id="bersedia_pindah_jurusan_2" value="false" required {{ old('bersedia_pindah_jurusan') == 'false' ? 'checked' : '' }}>
                                <label class="form-check-label" for="bersedia_pindah_jurusan_2">
                                  Tidak Bersedia
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {{-- Penutup --}}
                  <div class="card">
                    <div class="table-responsive w-100 p-1">
                      <table id="datatables-basic" class="table">
                      {{-- <div class="card-text">
                      </div> --}}
                      <h4 class="mt-2">Penutup</h4>
                        <h5>Apakah perserta menyampaikan kata penutup yang berisi ucapan  terima kasih, permohonan maaf dan harapan  </h5>
                        {{-- <textarea name="note" id="note" class="form-control w-100" placeholder="Masukan Catatan ...." ></textarea> --}}
                        <tbody>
                          <tr>
                            <td class="radio-col" width="25%">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="closing_statement" id="closing_statement_1" value="true" required {{ old('closing_statement') == 'true' ? 'checked' : '' }}>
                                <label class="form-check-label" for="closing_statement_1">
                                  Ya
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td class="radio-col">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="closing_statement" id="closing_statement_2" value="false" required {{ old('closing_statement') == 'false' ? 'checked' : '' }}>
                                <label class="form-check-label" for="closing_statement_2">
                                  Tidak
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {{-- <div class="card"> --}}
                    <div class="table-responsive w-100 p-1">
                      <table id="datatables-basic" class="table">
                      {{-- <div class="card-text">
                      </div> --}}
                      <tbody>
                        <h5>Tambah Catatan (Opsional)</h5>
                        <textarea name="note" id="note" class="form-control w-100" placeholder="Masukan Catatan ...." >{{ old('note') ?? '' }}</textarea>
                      </tbody>
                      </table>
                    </div>
                  {{-- </div> --}}
                  <div class="d-flex justify-content-end">
                    <button id="submit-btn" type="submit" class="btn btn-primary" disabled>Simpan Hasil Wawancara</button>
                  </div>
                </div>
            </div>
        </div>
    </div>
    </form>
</section>
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/vfs_fonts.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.rowGroup.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/interview-session/app.js')) }}"></script>
@endsection

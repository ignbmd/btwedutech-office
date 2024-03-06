@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Siswa')

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
          <form action="{{ route('siswa.store') }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label" for="nama_lengkap">
                Nama <span style="color: red">*</span>
              </label>
              <input type="text" class="form-control dt-full-name" id="nama_lengkap" name="nama_lengkap" placeholder=""  required/>
              <p class="text-danger">{{ session()->get('errors')->nama_lengkap[0] ?? '' }}</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">
                Email <span style="color: red">*</span>
              </label>
              <input type="email" id="email" name="email" class="form-control dt-post" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->email[0] ?? '' }}</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="no_wa">
                No. HP <span style="color: red">*</span>
              </label>
              <input type="text" id="no_wa" name="no_wa" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->no_wa[0] ?? '' }}</p>
            </div>
            <div class=" form-group">
              <label class="form-label d-block" for="nik">
                NIK
              </label>
              <input type="text" id="nik" name="nik" class="form-control" placeholder=""/>
              <p class="text-danger">{{ session()->get('errors')->nik[0] ?? '' }}</p>
            </div>
            <div class=" form-group">
              <label class="form-label d-block" for="birth_place">
                Tempat Lahir
              </label>
              <input type="text" id="birth_place" name="birth_place" class="form-control" placeholder=""/>
              <p class="text-danger">{{ session()->get('errors')->birth_place[0] ?? '' }}</p>
            </div>
            <div class=" form-group">
              <label class="form-label d-block" for="ttl">
                Tanggal Lahir <span style="color: red">*</span>
              </label>
              <input type="date" id="ttl" name="ttl" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->ttl[0] ?? '' }}</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="basic-icon-default-email">Jenis Kelamin <span style="color: red">*</span></label>
              <div class="d-flex mt-1">
                <div class="custom-control custom-radio mr-2">
                  <input type="radio" id="1" name="jk" class="custom-control-input" value="1" required>
                  <label class="custom-control-label" for="1">Laki-laki</label>
                </div>
                <div class="custom-control custom-radio">
                  <input type="radio" id="0" name="jk" class="custom-control-input" value="0" required>
                  <label class="custom-control-label" for="0">Perempuan</label>
                </div>
              </div>
              <p class="text-danger">{{ session()->get('errors')->jk[0] ?? '' }}</p>
            </div>

            <h4>INFORMASI DOMISILI</h4>

            <div class="form-group">
              <label class="form-label d-block" for="id_provinsi">
                Provinsi Tempat Tinggal <span style="color: red">*</span>
              </label>
              <select id="id_provinsi" name="id_provinsi" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->id_provinsi[0] ?? '' }}</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="kab_kota_id">
                Kabupaten Tempat Tinggal <span style="color: red">*</span>
              </label>
              <select id="kab_kota_id" name="kab_kota_id" class="form-control hide-search" required>
                <option>Pilih Kabupaten</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->kab_kota_id[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="alamat">
                Alamat Tempat Tinggal
              </label>
              <input type="text" id="alamat" name="alamat" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->alamat[0] ?? '' }}</p>
            </div>

            <h4>INFORMASI PENDIDIKAN</h4>

            <div class="form-group">
              <label class="form-label d-block" for="pendidikan_terakhir">
                  Pendidikan Terakhir <span style="color: red">*</span>
              </label>
              <select id="pendidikan_terakhir" name="pendidikan_terakhir" class="form-control hide-search" required>
                  <option>Pilih</option>
                  <option value="SMA">SMA/MA</option>
                  <option value="SMK">SMK</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->pendidikan_terakhir[0] ?? '' }}</p>
          </div>


            <div class=" form-group">
              <label class="form-label d-block" for="school_major">
                Jurusan <span style="color: red">*</span>
              </label>
              {{-- <input type="text" id="jurusan" name="jurusan" class="form-control" placeholder="" required/> --}}
              <select id="school_major" name="school_major" class="form-control hide-search" required>
                <option >Pilih Jurusan</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->school_major[0] ?? '' }}</p>
            </div>

            <h4> INFORMASI ASAL SEKOLAH </h4>
            <div class=" form-group">
              <label class="form-label d-block" for="id_province_school">
                Provinsi Asal Sekolah <span style="color: red">*</span>
              </label>
              <select id="id_province_school" name="id_province_school" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->id_province_school[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="id_province_school">
                Kabupaten Asal Sekolah <span style="color: red">*</span>
              </label>
              <select id="id_kab_school" name="id_kab_school" class="form-control hide-search" required>
                <option>Pilih Kabupaten</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->id_kab_school[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="asal_sekolah">
                Asal Sekolah <span style="color: red">*</span>
              </label>
              {{-- <input type="text" id="asal_sekolah" name="asal_sekolah" class="form-control" placeholder="" required/> --}}
              <select id="asal_sekolah" name="asal_sekolah" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->asal_sekolah[0] ?? '' }}</p>
            </div>

            <h4>INFORMASI ORANG TUA/WALI</h4>

            <div class=" form-group">
              <label class="form-label d-block" for="nama_ortu">
                Nama Ayah / Wali <span style="color: red">*</span>
              </label>
              <input type="text" id="nama_ortu" name="nama_ortu" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->nama_ortu[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="nama_ibu_kandung">
                Nama Ibu Kandung
              </label>
              <input type="text" id="nama_ibu_kandung" name="nama_ibu_kandung" class="form-control" placeholder=""/>
              <p class="text-danger">{{ session()->get('errors')->birth_mother_name[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="hp_ortu">
                No. HP Orang Tua <span style="color: red">*</span>
              </label>
              <input type="text" id="hp_ortu" name="hp_ortu" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->hp_ortu[0] ?? '' }}</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="tujuan_tryout">
                Tujuan Mengikuti Smart BTW <span style="color: red">*</span>
              </label>
              <select id="tujuan_tryout" name="tujuan_tryout" class="form-control hide-search" required>
                <option value="CPNS_TEST_PREPARATION" selected>Persiapan Ujian CPNS</option>
                <option value="SEKDIN_TEST_PREPARATION">Persiapan Masuk Sekolah Kedinasan</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->tujuan_tryout[0] ?? '' }}</p>
            </div>

            @if($is_user_pusat)
            <div class="form-group">
              <label class="form-label d-block" for="kode_cabang">
                Cabang <span style="color: red">*</span>
              </label>
              <select id="kode_cabang" name="kode_cabang" class="form-control select2 hide-search" required>
                <option value="">Pilih Kode Cabang</option>
                @foreach ($branches as $branch)
                  <option value="{{ $branch->code }}">{{ $branch->code }} - {{ $branch->name }}</option>
                @endforeach
              </select>
              <p class="text-danger">{{ session()->get('errors')->kode_cabang[0] ?? '' }}</p>
            </div>
            @else
            <input type="hidden" name="kode_cabang" value="{{ auth()->user()->branch_code }}">
            @endif
            <input type="hidden" name="account_type" id="account_type" value="btwedutech">
            {{-- <div class="form-group">
              <label class="form-label d-block" for="catatan">
                Informasi Tambahan (Opsional)
              </label>
              <textarea name="catatan" id="catatan" cols="30" rows="10" class="form-control" placeholder="Dapat info BTW dari mana?"></textarea>
            </div> --}}

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='save' class="mr-50"></i> Simpan
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
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script>
  (function (window, document, $) {
  "use strict";

  populateProvince();
  $("#kode_cabang").select2();


  // Events
  $("#id_provinsi").on("change", function () {
    // Remove previous kabupaten / kota options
    $("#kab_kota_id").empty().trigger("change");

    populateRegion();
  });


  $("#id_province_school").on("change", function(){
    $('#id_kab_school').empty().trigger("change");
    populateRegion();

  })

  $("#pendidikan_terakhir").on("change", function(){
    $('#school_major').empty().trigger("change");
    schoolMajor();
  })

  $("#id_kab_school").on("change", function(){
    $("#asal_sekolah").empty().trigger("change");
    schoolOrigin();
  })


  $("form").on("submit", function (e) {
    e.preventDefault();
    submitForm(this);
  });


  // Functions
  function populateProvince() {
    const id_provinsi = $("#id_provinsi").val();
    $.ajax({
      url: "/api/location",
      method: "GET",
      dataType: "json",
      data: {type: "PROVINCE"},
      success: function (response, textStatus, jqXHR) {
            if (Array.isArray(response.data)) {
                const mappedData = response.data.map((province) => ({
                    id: province._id,
                    text: province.name,
                }));

                // const newMappedData = response.data.map((province) =>({
                //   id: JSON.stringify(province),
                //   text: province.name,
                // }))
                const decode = JSON.parse($("#id_provinsi").val());
                const decodeIdSchool = JSON.parse($("#id_province_school").val());
                $("#id_provinsi").select2({
                    data: mappedData
                });

                $("#id_province_school").select2({
                    data:  mappedData
                });

                populateRegion();
            } else {
                console.error("Tidak ditemukan data:", response.data);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Gagal mendapatkan data:", errorThrown);
        }
    });
  };

  function populateRegion() {
    const id_provinsi = $("#id_provinsi").val();
    const id_provinsi_school = $("#id_province_school").val();
    $.ajax({
      url: `/api/location`,
      method: "GET",
      dataType: "json",
      data: {type: "REGION"},
      success: function (response, textStatus, jqXHR) {
        const filterAndMappedData = response.data.filter((region)=>{
          return region.parent_id == id_provinsi;
        }).map((region)=> ({
          id: region._id,
          text: region.name
        }))

        const filterAndMappedDataForSchool = response.data.filter((region)=>{
          return region.parent_id == id_provinsi_school;
        }).map((region)=> ({
          id: region._id,
          text: region.name
        }))

        // menambah opsi statik pada pilih kabupaten sekolah
        const appendStaticOption = $("#id_kab_school");
        appendStaticOption.empty().trigger("change");

        appendStaticOption.append('<option>Pilih Kabupaten</option>')

        $("#kab_kota_id").select2({
          data: filterAndMappedData
        });

        $("#id_kab_school").select2({
          data: filterAndMappedDataForSchool
        });
      },
    });
  };

  function schoolMajor (){
    const typeSchool = $("#pendidikan_terakhir").val();
    $.ajax({
      url: `/api/competition-map/school/origin/${typeSchool}/educations`,
      method: "GET",
      dataType: "json",
      success: function (response, textStatus, jqXHR) {
        const mappedData = response.data.map((major)=>({
          id: JSON.stringify(major),
          text: major.name
        }))
        $("#school_major").select2({
          data: mappedData
        });
      },
    });
  }

  function schoolOrigin (){
    const typeSchool = $("#pendidikan_terakhir").val();
    const locationId = $("#id_kab_school").val();
    $.ajax({
      url: `/api/highschools/types/${typeSchool}/locations/${locationId}`,
      method: "GET",
      dataType: "json",
      success: function (response, textStatus, jqXHR) {
        const mappedData = response.data.map((schoolOrigin)=>({
          // id: schoolOrigin._id,
          id: JSON.stringify(schoolOrigin),
          text: schoolOrigin.name
        }))
        const appendStaticOption = $("#asal_sekolah");
        appendStaticOption.empty().trigger("change");

        appendStaticOption.append('<option>Pilih Sekolah</option>')
        $("#asal_sekolah").select2({
          data: mappedData
        });
      },
    })
  }

  function submitForm(form) {
    const submitButton = $('.data-submit');
    submitButton.html(`
      ${feather.icons["save"].toSvg({
        class: "font-small-4 mr-25",
      })} Menyimpan Data
    `);
    submitButton.attr("disabled", true);
    form.classList.add('block-content');
    form.submit();
  }

})(window, document, jQuery);

</script>
@endsection

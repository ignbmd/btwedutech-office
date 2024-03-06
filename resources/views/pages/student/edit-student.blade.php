@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Siswa')

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
          <form action="{{ route('siswa.update', $student_profile->smartbtw_id) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="form-group">
              <label class="form-label" for="nama_lengkap">
                Nama<span style="color: red"> *</span>
              </label>
              <input
                type="text"
                class="form-control dt-full-name"
                id="nama_lengkap" name="nama_lengkap"
                placeholder=""
                value="{{ $student_profile->name }}" required
              />
              <p class="text-danger">{{ session()->get('errors')->nama_lengkap[0] ?? '' }}</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">
                Email<span style="color: red"> *</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-control dt-post"
                placeholder=""
                value="{{ $student_profile->email }}"
                @if(!$is_user_pusat) disabled @endif
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="no_wa">
                No. HP<span style="color: red"> *</span>
              </label>
              <input
                type="text"
                id="no_wa"
                name="no_wa"
                class="form-control"
                placeholder=""
                value="{{ $student_profile->phone }}"
                required
              />
              <p class="text-danger">{{ session()->get('errors')->no_wa[0] ?? '' }}</p>
            </div>
            <div class=" form-group">
              <label class="form-label d-block" for="nik">
                NIK
              </label>
              <input
                type="text"
                id="nik"
                name="nik"
                class="form-control"
                placeholder=""
                value="{{ $student_profile?->nik ?? "" }}"
              />
              <p class="text-danger">{{ session()->get('errors')->nik[0] ?? '' }}</p>
            </div>
            <div class=" form-group">
              <label class="form-label d-block" for="birth_place">
                Tempat Lahir
              </label>
              <input
                type="text"
                id="birth_place"
                name="birth_place"
                class="form-control"
                placeholder=""
                value="{{ $student_profile->birth_place ?? "" }}"
              />
              <p class="text-danger">{{ session()->get('errors')->birth_place[0] ?? '' }}</p>
            </div>
            <div class=" form-group">
              <label class="form-label d-block" for="ttl">
                Tanggal Lahir<span style="color: red"> *</span>
              </label>
              <input
                type="date"
                id="ttl"
                name="ttl"
                class="form-control"
                placeholder=""
                value="{{ $student_profile->birth_date_location ?? "" }}"
                required
              />
              <p class="text-danger">{{ session()->get('errors')->ttl[0] ?? '' }}</p>
            </div>

            <div class="form-group">
              <label
                lass="form-label"
                for="basic-icon-default-email"
              >
                Jenis Kelamin
                <span style="color: red"> *</span>
              </label>
              <div class="d-flex mt-1">
                <div class="custom-control custom-radio mr-2">
                  <input
                    type="radio"
                    id="1"
                    name="jk"
                    class="custom-control-input"
                    value="1" {{ $student_profile->gender == 1 ? 'checked' : '' }}
                    required
                  />
                  <label class="custom-control-label" for="1">Laki-laki</label>
                </div>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    id="0"
                    name="jk"
                    class="custom-control-input"
                    value="0" {{ $student_profile->gender == 0 ? 'checked' : '' }}
                    required
                  >
                  <label class="custom-control-label" for="0">Perempuan</label>
                </div>
              </div>
              <p class="text-danger">{{ session()->get('errors')->jk[0] ?? '' }}</p>
            </div>

            <h5>INFORMASI DOMISILI</h5>
            <div class="form-group">
              <label class="form-label d-block" for="id_provinsi">
                Provinsi Tempat Tinggal<span style="color: red"> *</span>
              </label>
              <select id="id_provinsi" name="id_provinsi" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->id_provinsi[0] ?? '' }}</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="kab_kota_id">
                Kabupaten Tempat Tinggal<span style="color: red"> *</span>
              </label>
              <select id="kab_kota_id" name="kab_kota_id" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->kab_kota_id[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="alamat">
                Alamat Tempat Tinggal<span style="color: red"> *</span>
              </label>
              <input
                type="text"
                id="alamat"
                name="alamat"
                class="form-control"
                placeholder=""
                value="{{ $student_profile->address }}"
                required
              />
              <p class="text-danger">{{ session()->get('errors')->alamat[0] ?? '' }}</p>
            </div>

            <h5>INFORMASI PENDIDIKAN</h5>
            <div class=" form-group">
              <label class="form-label d-block" for="pendidikan_terakhir">
                Pendidikan Terakhir<span style="color: red"> *</span>
              </label>
              <select id="pendidikan_terakhir" name="pendidikan_terakhir" class="form-control hide-search" required>
                <option value="" selected>Pilih</option>
                <option value="SMA" {{ $student_profile->last_ed === 'SMA' ? 'selected' : '' }}>SMA/MA</option>
                <option value="SMK" {{ $student_profile->last_ed === 'SMK' ? 'selected' : '' }}>SMK</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->pendidikan_terakhir[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="school_major">
                Jurusan<span style="color: red"> *</span>
              </label>
              <select id="school_major" name="school_major" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->school_major[0] ?? '' }}</p>
            </div>

            <h5>INFORMASI ASAL SEKOLAH</h5>
            <div class="form-group">
              <label class="form-label d-block" for="id_provinsi_sekolah">
                Provinsi Asal Sekolah<span style="color: red"> *</span>
              </label>
              <select id="id_provinsi_sekolah" name="id_provinsi_sekolah" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->id_provinsi_sekolah[0] ?? '' }}</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="id_kabupaten_sekolah">
                Kabupaten Asal Sekolah<span style="color: red"> *</span>
              </label>
              <select id="id_kabupaten_sekolah" name="id_kabupaten_sekolah" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->id_kabupaten_sekolah[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="asal_sekolah">
                Asal Sekolah<span style="color: red"> *</span>
              </label>
              <select id="asal_sekolah" name="asal_sekolah" class="form-control hide-search" required>
              </select>
              <p class="text-danger">{{ session()->get('errors')->asal_sekolah[0] ?? '' }}</p>
            </div>

            <h5>INFORMASI ORANG TUA/WALI</h5>
            <div class=" form-group">
              <label class="form-label d-block" for="nama_ortu">
                Nama Orang Tua / Wali <span style="color: red"> *</span>
              </label>
              <input
                type="text"
                id="nama_ortu"
                name="nama_ortu"
                class="form-control"
                placeholder=""
                value="{{ $student_profile?->parent_datas?->parent_name ?? "" }}"
                required
              />
              <p class="text-danger">{{ session()->get('errors')->nama_ortu[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="nama_ibu_kandung">
                Nama Ibu Kandung
              </label>
              <input
                type="text"
                id="nama_ibu_kandung"
                name="nama_ibu_kandung"
                class="form-control"
                placeholder=""
                value="{{ $student_profile?->birth_mother_name ?? "" }}"
              />
              <p class="text-danger">{{ session()->get('errors')->birth_mother_name[0] ?? '' }}</p>
            </div>

            <div class=" form-group">
              <label class="form-label d-block" for="hp_ortu">
                No. HP Orang Tua<span style="color: red"> *</span>
              </label>
              <input
                type="text"
                id="hp_ortu"
                name="hp_ortu"
                class="form-control"
                placeholder=""
                value="{{ $student_profile?->parent_datas?->parent_number ?? "" }}"
                required
              />
              <p class="text-danger">{{ session()->get('errors')->hp_ortu[0] ?? '' }}</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="tujuan_tryout">
                Tujuan Mengikuti Smart BTW<span style="color: red"> *</span>
              </label>
              <select id="tujuan_tryout" name="tujuan_tryout" class="form-control hide-search" required>
                <option
                  value="CPNS_TEST_PREPARATION"
                  {{ $student_profile->intention == 'CPNS_TEST_PREPARATION' ? 'selected' : '' }}
                >
                  Persiapan Ujian CPNS
                </option>
                <option
                  value="SEKDIN_TEST_PREPARATION"
                  {{ $student_profile->intention == 'SEKDIN_TEST_PREPARATION' ? 'selected' : '' }}
                >
                  Persiapan Masuk Sekolah Kedinasan
                </option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->tujuan_tryout[0] ?? '' }}</p>
            </div>

            @if($is_user_pusat)
            <div class="form-group">
              <label class="form-label d-block" for="kode_cabang">
                Cabang <span style="color: red">*</span>
              </label>
              <select id="kode_cabang" name="kode_cabang" class="form-control hide-search" required>
                <option value="">Pilih Kode Cabang</option>
                @foreach ($branches as $branch)
                  <option
                    value="{{ $branch->code }}"
                    @if($branch->code == $student_profile->branch_code)
                    selected
                    @endif
                  >
                    {{ $branch->code }} - {{ $branch->name }}
                  </option>
                @endforeach
              </select>
              <p class="text-danger">{{ session()->get('errors')->kode_cabang[0] ?? '' }}</p>
            </div>
            <input type="hidden" name="account_type" value="{{ $student_profile_api_gateway->account_type }}">
            @else
              <input type="hidden" name="kode_cabang" value="{{ auth()->user()->branch_code }}">
              <input type="hidden" name="account_type" value="{{ $student_profile_api_gateway->account_type }}">
            @endif
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

  $("#kode_cabang").select2();

  const studentProvinceId = @json($student_profile->province_id);
  let studentRegionId = @json($student_profile->region_id);
  let studentSchool = @json($student_initial_schools ?? null);
  let studentMajor =  @json($student_initial_major ?? null);

  const studentMajorId = @json($student_initial_major->id ?? null);
  const lastStudyStudent = @json($student_profile->last_ed ?? null);
  const lastEducationSchoolProvince = @json($school_province->_id ?? null);

  let lastEducationSchoolDistrict = @json($school_district->_id ?? null);
  let lastEducationDistrictHasBeenSet = false;
  let lastSchoolHasBeenSet = false;
  let lastEducationProvinceHasBeenSet = false;


  let filterSekolah = null;
  let filterKabupaten = null;
  let filterProvinsi = null;
  let filterJurusan = null;

  populateProvince();
  schoolMajor();
  populateProvinceSchool();

  // Events
  $("#id_provinsi").on("change", function () {
    // Remove previous kabupaten / kota options
    $("#kab_kota_id").empty().trigger("change");

    const id_provinsi = $("#id_provinsi").val();
    populateRegion(id_provinsi);
  });

  $("#id_provinsi_sekolah").on("change", function(){
    $('#id_kabupaten_sekolah').empty().trigger("change");

    const provinceId = $("#id_provinsi_sekolah").val();
    populateRegionSchool(provinceId);
  })

  $("#id_kabupaten_sekolah").on("change", function(){
    $('#asal_sekolah').empty().trigger("change");
    const locationId = $("#id_kabupaten_sekolah").val() == "null" ? null : $("#id_kabupaten_sekolah").val();
    populateSchoolOrigin(locationId);
  })

  $("#pendidikan_terakhir").on("change", function(){
    $('#asal_sekolah').empty().trigger("change");
    const locationId = $("#id_kabupaten_sekolah").val() == "null" ? null : $("#id_kabupaten_sekolah").val();
    populateSchoolOrigin(locationId);

     const last_ed = $("#pendidikan_terakhir").val();
    schoolMajor();
  })

  $("form").on("submit", function (e) {
    e.preventDefault();
    submitForm(this);
  });

  // Functions
  function populateProvince(){
    const id_provinsi = studentProvinceId ?? $("#id_provinsi").val();
    $.ajax({
      url: "/api/location",
      method: "GET",
      dataType: "json",
      data: {type: "PROVINCE"},
      success: function (response, textStatus, jqXHR) {
        const newMappedData = response.data.map((province) =>({
          id: province._id,
          text: province.name,
        }));
        $("#id_provinsi").select2({
          data:  newMappedData
        });
        if(!$('#id_provinsi').find("option[value='" + null + "']").length) {
          const newOption = new Option("Pilih Provinsi", null, true, true);
          $('#id_provinsi').prepend(newOption).trigger("change");
        }
        if(
          id_provinsi && $(`#id_provinsi option[value='${id_provinsi}']`).length > 0
        ) {
          $("#id_provinsi").val(id_provinsi).trigger("change");
        }

        populateRegion(id_provinsi);
      },
    });
  };

  function populateRegion(provinceId){
    $.ajax({
      url: `/api/location`,
      method: "GET",
      dataType: "json",
      data: {type: "REGION"},
      success: function (response, textStatus, jqXHR) {
        const mappedData = response.data.filter((region)=>{
          return region.parent_id == provinceId;
        }).map((region) =>({
                  id: region._id,
                  text: region.name,
                }))

        $("#kab_kota_id").select2({
          data: mappedData
        });
        if(!$('#kab_kota_id').find("option[value='" + null + "']").length) {
          const newOption = new Option("Pilih Kabupaten/Kota", null, true, true);
          $('#kab_kota_id').prepend(newOption).trigger("change");
        }
        if(
          studentRegionId && $(`#kab_kota_id option[value='${studentRegionId}']`).length > 0
        ) {
          $("#kab_kota_id").val(studentRegionId).trigger("change");
          studentRegionId = null
        }
      },
    });
  };

  function populateProvinceSchool(){
    const id_provinsi = $("#id_provinsi_sekolah").val();
    $.ajax({
      url: "/api/location",
      method: "GET",
      dataType: "json",
      data: {type: "PROVINCE"},
      success: function (response, textStatus, jqXHR) {
        const newMappedData = response.data.map((province) =>({
          id: province._id,
          text: province.name,
        }));
        $("#id_provinsi_sekolah").select2({
          data:  newMappedData
        });

        if(!$('#id_provinsi_sekolah').find("option[value='" + null + "']").length) {
          const newOption = new Option("Pilih Provinsi", null, true, true);
          $('#id_provinsi_sekolah').prepend(newOption).trigger("change");
        }

        if(
          lastEducationSchoolProvince &&
          $(`#id_provinsi_sekolah option[value='${lastEducationSchoolProvince}']`).length > 0
        ) {
          $("#id_provinsi_sekolah").val(lastEducationSchoolProvince).trigger("change")
        };

        if(lastEducationProvinceHasBeenSet) {
          $("#id_provinsi_sekolah").val(lastEducationProvinceHasBeenSet).trigger("change");
          lastEducationProvinceHasBeenSet = true;
        }
      },
    });
  }

  function populateRegionSchool(provinceSchoolId){
    $.ajax({
      url: `/api/location`,
      method: "GET",
      dataType: "json",
      data: {type: "REGION"},
      success: function (response, textStatus, jqXHR) {
        const mappedData = response.data.filter((region)=>{
          return region.parent_id == provinceSchoolId;
        }).map((region) =>({
                  id: region._id,
                  text: region.name,
                }))

        $("#id_kabupaten_sekolah").select2({
          data: mappedData
        });
        if(!$('#id_kabupaten_sekolah').find("option[value='" + null + "']").length) {
          const newOption = new Option("Pilih Kabupaten/Kota", null, true, true);
          $('#id_kabupaten_sekolah').prepend(newOption).trigger("change");
        }
        if(
          lastEducationSchoolDistrict &&
          $(`#id_kabupaten_sekolah option[value='${lastEducationSchoolDistrict}']`).length > 0
        ) {
          $("#id_kabupaten_sekolah").val(lastEducationSchoolDistrict).trigger("change")
          lastEducationSchoolDistrict = null
        };

        if(lastEducationSchoolDistrict && !lastEducationDistrictHasBeenSet) {
          $("#id_kabupaten_sekolah").val(lastEducationSchoolDistrict).trigger("change");
          lastEducationDistrictHasBeenSet = true;
        }
      },
    });
  };

  function populateSchoolOrigin (locationId){
    const typeSchool = $("#pendidikan_terakhir").val();
    if (locationId == null) {
        return;
    }

    $.ajax({
      url: `/api/highschools/types/${typeSchool}/locations/${locationId}`,
      method: "GET",
      dataType: "json",
      success: function (response, textStatus, jqXHR) {
        const mappedData = response.data.map((schoolOrigin)=>{
          const newOption = new Option(schoolOrigin.name, JSON.stringify(schoolOrigin), false, false);
          $(newOption).attr('data-school-id', schoolOrigin._id);
          $(newOption).attr('data-school', JSON.stringify(schoolOrigin));
          $('#asal_sekolah').append(newOption).trigger('change');
          return schoolOrigin;
        })

        if(!$('#asal_sekolah').find("option[value='" + null + "']").length) {
          const newOption = new Option("Pilih Sekolah", null, true, true);
          $('#asal_sekolah').prepend(newOption).trigger("change");
        }

        if(
          studentSchool &&
          $(`#asal_sekolah option[data-school-id='${studentSchool._id}']`).length > 0
        ) {
          const studentSchoolOption = $(`#asal_sekolah option[data-school-id='${studentSchool._id}']`);
          const studentSchoolData = studentSchoolOption.data("school");
          $("#asal_sekolah").val(JSON.stringify(studentSchoolData) ).trigger("change");
          studentSchool = null
        };

        if(studentSchool && !lastSchoolHasBeenSet) {
          $("#asal_sekolah").val(studentSchool).trigger("change");
          lastSchoolHasBeenSet = true;
        }
      },
    })
  }

  //jurusan
  function schoolMajor (){
    const typeSchool = $("#pendidikan_terakhir").val();
    $.ajax({
      url: `/api/competition-map/school/origin/${typeSchool}/educations`,
      method: "GET",
      dataType: "json",
      success: function (response, textStatus, jqXHR) {

        const mappedData = response.data.map((major) => {
          const newOption = new Option(major.name, JSON.stringify(major), false, false);
          $(newOption).attr('data-major-id', major.id);
          $(newOption).attr('data-major', JSON.stringify(major));
          $('#school_major').append(newOption).trigger('change');
          return major;
        })

        if(!$('#school_major').find("option[value='" + null + "']").length) {
          const newOption = new Option("Pilih Jurusan", null, true, true);
          $('#school_major').prepend(newOption).trigger("change");
        }

        if(
          studentMajor &&
          $(`#school_major option[data-major-id='${studentMajor.id}']`).length > 0
        ) {
          const studentMajorOption = $(`#school_major option[data-major-id='${studentMajor.id}']`);
          const studentMajorData = studentMajorOption.data("major");
          $("#school_major").val(JSON.stringify(studentMajorData) ).trigger("change");
          studentMajor = null
        };
      },
    });
  }

  function submitForm(form) {
    const submitButton = $('.data-submit');
    submitButton.html(`
      ${feather.icons["save"].toSvg({
        class: "font-small-4 mr-25",
      })} Memperbarui Data
    `);
    submitButton.attr("disabled", true);
    form.classList.add('block-content');
    form.submit();
  }

})(window, document, jQuery);

</script>
@endsection

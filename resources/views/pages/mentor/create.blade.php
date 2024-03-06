@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Mentor Baru')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
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
          <form action="{{ route('mentor.store') }}" method="POST" enctype="multipart/form-data">
            @csrf

            <div class="form-group">
              <label class="form-label" for="name">
                Nama
              </label>
              <input type="text" class="form-control dt-full-name" id="name" name="name" placeholder=""  required/>
              <p class="text-danger">{{ session()->get('errors')->{'0.name'}[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="email">
                Email
              </label>
              <input type="email" id="email" name="email" class="form-control dt-post" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->{'0.email'}[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">
                No.HP
              </label>
              <input type="number" id="phone" name="phone" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('phone')->{'0.phone'}[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="basic-icon-default-email">Jenis Kelamin</label>
              <div class="d-flex mt-1">
                <div class="custom-control custom-radio mr-2">
                  <input type="radio" id="1" name="gender" class="custom-control-input" value="1" required>
                  <label class="custom-control-label" for="1">Laki-laki</label>
                </div>
                <div class="custom-control custom-radio">
                  <input type="radio" id="0" name="gender" class="custom-control-input" value="0" required>
                  <label class="custom-control-label" for="0">Perempuan</label>
                </div>
              </div>
              <p class="text-danger">{{ session()->get('errors')->{'0.gender'}[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="nik">
                NIK
              </label>
              <input type="number" id="nik" name="nik" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->{'0.nik'}[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="address">
                Alamat
              </label>
              <input type="text" id="address" name="address" class="form-control" placeholder="" required/>
              <p class="text-danger">{{ session()->get('errors')->{'0.address'}[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="bio">
                Bio (Opsional)
              </label>
              <textarea name="bio" id="bio" cols="30" rows="10" class="form-control"></textarea>
            </div>

            @if($is_pusat_user)
            <div class="form-group">
              <label class="form-label d-block" for="branch_code">
                Cabang
              </label>
              <select id="branch_code" name="branch_code" class="form-control" required>
                <option value="">Pilih Cabang</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->{'0.branch_code'}[0] ?? "" }}</p>
            </div>
            <div class="form-group">
              <label class="form-label d-block" for="npwp_image">
                Role Mentor
              </label>
              <select name="roles[]" id="roles" class="form-control select2" multiple>
              </select>
              <p class="text-danger">{{ session()->get('errors')->{'0.roles'}[0] ?? "" }}</p>
            </div>
            @endif

            <div class="form-group">
              <label class="form-label d-block" for="profile_image">
                Foto Profil (Opsional)
              </label>
              <input type="file" name="profile_image" />
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="ktp_image">
                Foto KTP
              </label>
              <input type="file" name="ktp_image" required/>
              <p class="text-danger">{{ session()->get('errors')->{'0.ktp_image'}[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="npwp_image">
                Foto NPWP (Opsional)
              </label>
              <input type="file" name="npwp_image" />
              <p class="text-danger">{{ session()->get('errors')->{'0.npwp_image'}[0] ?? "" }}</p>
            </div>

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
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>

<script>
  $(function() {
    "use strict";

    if($("#branch_code").length) {
      populateBranches();
    }

    $("#roles").select2({
      tags: true,
      tokenSeparators: [',', ' '],
      createTag: function (params) {
        const term = $.trim(params.term);
        if (term === '') return null;
        return {id: term, text: term};
      }
    });

    $("form").on("submit", function (e) {
      e.preventDefault();
      submitForm(this);
    });

    function populateBranches() {
      $.ajax({
        url: '/api/branch/all',
        method: 'GET',
        dataType: 'json',
        success: function(results) {
          const data = $.map(results.data, function(obj) {
            obj.id = obj.id || obj.code;
            obj.text = obj.text || obj.name;

            return obj;
          });
          $("#branch_code").select2({data: data});
        }
      });
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
  });
</script>
@endsection

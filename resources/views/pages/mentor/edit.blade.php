@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Mentor')

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
          <form action="{{ route('mentor.update', $mentor->id) }}" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            <div class="form-group">
              <label class="form-label" for="name">
                Nama
              </label>
              <input type="text" class="form-control dt-full-name" id="name" name="name" placeholder=""  value="{{ $mentor->name }}" required/>
              <p class="text-danger">{{ session()->get('errors')->name[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="email">
                Email
              </label>
              <input type="email" id="email" name="email" class="form-control dt-post" placeholder="" value="{{ $mentor->email }}" required/>
              <p class="text-danger">{{ session()->get('errors')->email[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">
                No.HP
              </label>
              <input type="number" id="phone" name="phone" class="form-control" placeholder="" value="{{ $mentor->phone }}" required/>
              <p class="text-danger">{{ session()->get('errors')->phone[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="basic-icon-default-email">Jenis Kelamin</label>
              <div class="d-flex mt-1">
                <div class="custom-control custom-radio mr-2">
                  <input
                    type="radio"
                    id="1"
                    name="gender"
                    class="custom-control-input"
                    value="1"
                    @if($mentor->gender == 1) checked @endif
                    required>
                  <label class="custom-control-label" for="1">Laki-laki</label>
                </div>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    id="0"
                    name="gender"
                    class="custom-control-input"
                    value="0"
                    @if($mentor->gender == 0) checked @endif
                    required>
                  <label class="custom-control-label" for="0">Perempuan</label>
                </div>
              </div>
              <p class="text-danger">{{ session()->get('errors')->gender[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="nik">
                NIK
              </label>
              <input type="number" id="nik" name="nik" class="form-control" placeholder="" value="{{ $mentor->nik }}" required/>
              <p class="text-danger">{{ session()->get('errors')->nik[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="address">
                Alamat
              </label>
              <input type="text" id="address" name="address" class="form-control" placeholder="" value="{{ $mentor->address }}" required/>
              <p class="text-danger">{{ session()->get('errors')->address[0] ?? "" }}</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="bio">
                Bio (Opsional)
              </label>
              <textarea name="bio" id="bio" cols="30" rows="10" class="form-control">{{ $mentorBio }}</textarea>
            </div>

            @if($is_pusat_user)
            <div class="form-group">
              <label class="form-label d-block" for="branch_code">
                Cabang
              </label>
              <select id="branch_code" name="branch_code" class="form-control" required>
                <option value="">Pilih Cabang</option>
              </select>
              <p class="text-danger">{{ session()->get('errors')->branch_code[0] ?? "" }}</p>
            </div>
            <div class="form-group">
              <label class="form-label d-block" for="npwp_image">
                Role Mentor
              </label>
              <select name="roles[]" id="roles" class="form-control select2" multiple>
                @foreach($mentor->roles as $role)
                  @if($role === "mentor") @php continue @endphp @endif
                  <option value="{{$role}}" selected>{{$role}}</option>
                @endforeach
              </select>
              <p class="text-danger">{{ session()->get('errors')->roles[0] ?? "" }}</p>
            </div>
            @endif

            <div class="form-group">
              <label class="form-label d-block" for="profile_image">
                Foto Profil (Opsional)
              </label>
              <input type="file" name="profile_image" />
            </div>
            @if($mentor->profile_image)
            <div class="my-50">
              <img src="{{ $mentor->profile_image }}" width="100">
            </div>
            @endif

            <div class="form-group">
              <label class="form-label d-block" for="ktp_image">
                Foto KTP (Opsional)
              </label>
              <input type="file" name="ktp_image" />
            </div>
            @if($mentor->ktp_image)
            <div class="my-50">
              <img src="{{ $mentor->ktp_image }}" width="100">
            </div>
            @endif

            <div class="form-group">
              <label class="form-label d-block" for="npwp_image">
                Foto NPWP (Opsional)
              </label>
              <input type="file" name="npwp_image" />
            </div>
            @if($mentor->npwp_image)
            <div class="my-50">
              <img src="{{ $mentor->npwp_image }}" width="100">
            </div>
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

    $("form").on("submit", function (e) {
      e.preventDefault();
      submitForm(this);
    });

    $("#roles").select2({
      tags: true,
      tokenSeparators: [',', ' '],
      createTag: function (params) {
        const term = $.trim(params.term);
        if (term === '') return null;
        return {id: term, text: term};
      }
    });

    function populateBranches() {
      const mentorBranchCode = @json($mentor->branch_code);
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
          $("#branch_code").val(mentorBranchCode).trigger('change');
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

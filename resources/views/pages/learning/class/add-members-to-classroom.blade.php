@extends('layouts/contentLayoutMaster')

@section('title', "Tambah Anggota Kelas " .$selectedClassroom->title. " Ke Kelas Lain")

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection

@section('content')
<!-- Basic table -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('kelas.member.add-to-classroom', ['classId' => $classroom_id])}}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label">
                Kelas Saat Ini
              </label>
              <input type="text" class="form-control dt-full-name" value="{{ $selectedClassroom->title }} ({{ $selectedClassroom->year }})" disabled/>
            </div>

            <div class="form-group">
              <label class="form-label">
                Pindahkan Siswa Ke Kelas
              </label>
              <select name="classroom_id" id="classroom_id" class="form-control select2" required>
                <option>Pilih Kelas Tujuan</option>
                @foreach ($ongoingClassrooms as $classroom)
                  <option value="{{ $classroom->_id }}">{{ $classroom->title }} ({{ property_exists($classroom, "is_online") && $classroom->is_online ? "Kelas Online" : "Kelas Offline"}}) - {{ $classroom->year }}</option>
                @endforeach
              </select>
            </div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='user-plus' class="mr-50"></i> Proses
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->
@endsection


@section('vendor-script')
{{-- vendor files --}}
<script src="{{ asset(mix('vendors/js/forms/spinner/jquery.bootstrap-touchspin.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
@endsection
@section('page-script')
{{-- Page js files --}}
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script>
  $("#classroom_id").select2({});


  // Events
  $("form").on("submit", function (e) {
    e.preventDefault();
    submitForm(this);
  });


  // Functions
  function submitForm(form) {
    const submitButton = $('.data-submit');
    submitButton.html(`
      ${feather.icons["user-plus"].toSvg({
        class: "font-small-4 mr-25",
      })} Memproses
    `);
    submitButton.attr("disabled", true);
    form.classList.add('block-content');
    form.submit();
  }
</script>
@endsection

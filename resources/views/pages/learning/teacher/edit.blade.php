@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Kelas ABC')

@section('vendor-style')
  {{-- vendor css files --}}
  <link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12">
          <form action="">
            <div class="form-group">
              <label class="form-label" for="basic-icon-default-fullname">
                Nama Kelas
              </label>
              <input type="text" class="form-control dt-full-name" id="basic-icon-default-fullname"
                placeholder="CPNS" />
            </div>
            <div class="form-group">
              <label class="form-label" for="basic-icon-default-post">
                Deskripsi <small class="text-muted">(Opsional)</small>
              </label>
              <input type="text" id="basic-icon-default-post" class="form-control dt-post" placeholder="" />
            </div>
            <div class="form-group col-md-3 p-0">
              <label class="form-label" for="basic-icon-default-email">Kuota Kelas</label>
              <div class="input-group">
                <input type="number" class="touchspin-color" value=""
                  data-bts-button-down-class="btn btn-primary"
                  data-bts-button-up-class="btn btn-primary" />
              </div>
            </div>

            <div class="mt-3">
              <button type="button" class="btn btn-success data-submit">
                <i data-feather='save'></i> Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
@endsection

@section('page-script')
  <script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Produk Satuan')

@section('vendor-style')
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/file-uploaders/dropzone.min.css')) }}">
@endsection
@section('page-style')
<link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-validation.css')) }}">
@endsection

@section('content')
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-lg-6">
        <form id="addSingleForm" method="POST" action="/produk-assessment/tambah" enctype="multipart/form-data">
            @csrf
            <x-product.base-add-form type="single" />

            <div class="mt-3">
              <button type="submit" class="btn btn-success data-submit">
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

@section('vendor-script')
<script src="{{ asset(mix('vendors/js/forms/cleave/cleave.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/validation/jquery.validate.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/dropzone.min.js')) }}"></script>
@endsection
@section('page-script')
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-input-mask.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/product/add-product.js')) }}"></script>
@endsection

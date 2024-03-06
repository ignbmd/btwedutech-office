@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Paket')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
@endsection
@section('page-style')
{{-- Page Css files --}}
<link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-validation.css')) }}">
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/default.min.css">
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-lg-6">
          <form id="editPackageForm" action="/produk/perbarui" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            @include('pages.product._base-edit-form')

            <div>
              <input type="hidden" id="currentIncludedProduct" value="{{ json_encode($product->included_product) }}">
              <label class="form-label" for="included-product">
                Pilih produk untuk dipaketkan <small class="text-muted">(Opsional)</small>
              </label>
              <select id="included-product" name="included_product[]" class="select2 form-control" multiple>
              </select>
            </div>

            <div class="mt-3">
              <button type="submit" class="btn btn-primary data-submit">
                <i data-feather='save'></i> Perbarui
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Modal -->
<div class="modal fade" id="editLegacyProductModal" tabindex="-1" role="dialog" aria-labelledby="editLegacyProductModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="editLegacyProductModalTitle">Edit Legacy Product</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form id="editLegacyProductForm">
          <div class="form-group">
            <label for="legacy_product_title">Nama Produk Legacy</label>
            <input type="text" name="legacy_product_title" id="legacy_product_title" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="legacy_product_type" id="legacy_product_type_label">Tipe Produk Legacy</label>
            <select name="legacy_product_type" id="legacy_product_type" class="form-control" required>
              <option value="1">Paket Premium</option>
              <option value="0">Tryout Premium</option>
            </select>
          </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-success" id="editLegacyProductSubmitButton">Perbarui</button>
      </div>
        </form>
    </div>
  </div>
</div>
@endsection

@section('vendor-script')
<script src="{{ asset(mix('vendors/js/forms/cleave/cleave.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/forms/validation/jquery.validate.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/highlight.min.js"></script>
<script src="https://cdn.quilljs.com/1.3.6/quill.min.js" type="text/javascript"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-input-mask.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/pages/product/edit-product.js')) }}"></script>
@endsection

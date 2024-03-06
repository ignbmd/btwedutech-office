@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Dynamic Survey Form')

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
<section id="input-sizing">
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-lg-6">
                    <form action="{{ route('dynamic-menu.update',  ['id' => $formsData->_id]) }}" id="dynamic-form" method="POST">
                        @csrf
                        <div class="form-group">
                            <div class="form-group">
                                <label for="name" class="form-label">
                                    Nama
                                </label>
                                <input type="text" name="name" class="form-control" id="name" placeholder="Masukan nama" required value="{{ $formsData->name }}">
                            </div>
                            <div class="form-group">
                                <label for="tags" class="form-label">
                                    Tags 
                                </label>
                                <select id="tags" class="select2 form-control hide-search" name="tags[]" multiple>
                                    @foreach($formsData->tags as $tag)
                                    <option value="{{ $tag }}" selected>{{ $tag }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <button type="submit" id="submit-button" class="btn btn-primary">
                                <i data-feather='save' class="mr-50"></i> Save
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
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/highlight.min.js"></script>
<script src="https://cdn.quilljs.com/1.3.6/quill.min.js" type="text/javascript"></script>
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-number-input.js')) }}"></script>
<script src="{{ asset(mix('js/scripts/forms/form-input-mask.js')) }}"></script>
<script>
  $("#tags").select2({
    placeholder: "Pilih Tags",
    minimumResultsForSearch: Infinity,
    tags: true,
  });
</script>
@endsection
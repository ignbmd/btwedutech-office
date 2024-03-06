@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Application Control List')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/sweetalert2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
{{-- Input  Sizing --}}
<section id="input-sizing">
    <div class="card">
        <div class="card-body">
            <div>
                <form action="{{ route('acl-sso.update.update', ['id' => $ACLData->id]) }}" id="application" method="POST">
                    @csrf
                    <div class="form-group">
                        {{-- <div class="form-group">
                            <label><b>Application Name</label>
                            <input type="text" class="form-control" required name="applications_name">
                        </div> --}}
                        <div class="form-group">
                            <label class="form-label" for="application">
                              Application
                            </label>
                            <select name="application_name" id="application_name" class="form-control select2 @error('application_name') is-invalid @enderror" placeholder="Application" required>
                              @foreach($ACLDistinct as $data)
                                <option value="{{ $data->id }}"{{ $ACLData->applications->id === $data->id ?"selected":""}}>{{ $data->application_name }}</option>
                              @endforeach
                            </select>
                            <p class="text-danger">@error('application_name'){{ $message }}@enderror</p>
                          </div>
                        <div class="form-group">
                            <label>Resource</label>
                            <input type="text" class="form-control" required name="resource" value="{{ $ACLData->resource }}">
                        </div>
                        <div class="form-group">
                            <label>Default Role</label>
                            <input type="text" class="form-control" required name="default_role" value="{{ $ACLData->default_role }}">
                        </div>
                        <button type="submit" id="submit-button" class="btn btn-primary">
                            <i data-feather='save' class="mr-50"></i> Save
                          </button>
                    </div>
                </form>
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
<script src="{{ asset(mix('js/scripts/forms/form-select2.js')) }}"></script>
@endsection
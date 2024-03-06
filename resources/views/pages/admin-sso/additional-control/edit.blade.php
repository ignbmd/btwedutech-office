@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Additional Controls')

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
                <form action="{{ route('additional-control-sso.update', ['id' => $additionalControl->id]) }}" id="add-additionalControl" method="POST">
                    @csrf
                    <div class="form-group">
                        <div class="form-group">
                            <label class="form-label" for="username">
                              Users
                            </label>
                            <select name="username" id="user_role_id" class="form-control select2 @error('username') is-invalid @enderror" placeholder="Username" required>
                              @foreach($users as $data)
                                <option value="{{ $data->id }}"{{ $additionalControl->user_roles->id === $data->id ?"selected" : ""}}>{{ $data->users->name }} ({{ $data->users->email}}) - {{ $data->role_name }}</option>
                              @endforeach
                            </select>
                            <p class="text-danger">@error('username'){{ $message }}@enderror</p>
                          </div>
                          <div class="form-group">
                            <label class="form-label" for="acl">
                              ACL
                            </label>
                            <select name="acl" id="acl" class="form-control select2 @error('acl') is-invalid @enderror" placeholder="ACL" required>
                              @foreach($ACLDistinct as $data)
                                <option value="{{ $data->resource }}" {{ $additionalControl->resource === $data->resource ?"selected" : "" }}>{{ $data->resource }}</option>
                              @endforeach
                            </select>
                            <p class="text-danger">@error('acl'){{ $message }}@enderror</p>
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

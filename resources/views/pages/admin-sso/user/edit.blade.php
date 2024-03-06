@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Users')

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
                <form action="{{ route('user-sso.edit', ['id' => $usersData->id]) }}" id="users" method="POST">
                    @csrf
                    <div class="form-group">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" class="form-control" required name="name" value="{{ $usersData->name }}">
                            <p class="text-danger">@error('name'){{ $message }}@enderror</p>
                          </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="text" class="form-control" required name="email" value="{{ $usersData->email}}">
                            <p class="text-danger">@error('email'){{ $message }}@enderror</p>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" class="form-control" name="password">
                        </div>
                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" class="form-control" name="password">
                        </div>
                          <div class="form-group">
                            <label class="form-label" for="users">
                              Base Role
                            </label>
                            <select name="base_role" id="base_role" class="form-control select2 @error('base_role') is-invalid @enderror" required>
                              <option value={{ $usersData->base_role }}>{{ $usersData->base_role }}</option>"
                              <option value="">Pilih User</option>
                              <option value="user">User</option>
                            </select>
                            <p class="text-danger">@error('base_role'){{ $message }}@enderror</p>
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
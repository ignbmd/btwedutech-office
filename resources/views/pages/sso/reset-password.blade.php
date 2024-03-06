@php
config(['custom.custom.blankPage' => true]);
@endphp
@extends('layouts/fullLayoutMaster')

@section('title', 'Reset Password')
@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection
@section('page-style')
    {{-- Page Css files --}}
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-validation.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/pages/page-auth.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
    <div class="auth-wrapper auth-v1 px-2">
        <div class="auth-inner py-2">
            <!-- Reset Password v1 -->
            <div class="card mb-0">
                <div class="card-body">
                    <img src="https://btw-cdn.com/assets/office/logo/main.svg" width="50%" />

                    <h4 class="card-title mt-2 mb-1">Perbarui Password Kamu 🔒</h4>
                    <p class="card-text mb-2">Harap memperbarui password kamu untuk dapat mengakses fitur pada BTW Edutech
                        Office</p>

                    <form class="auth-reset-password-form mt-2" action="/update-password" id="resetPasswordForm" method="POST">
                        @csrf
                        <div class="form-group">
                            <div class="d-flex justify-content-between">
                                <label for="reset-password-new">Password Baru</label>
                            </div>
                            <div class="input-group input-group-merge form-password-toggle @error('reset_password_new') is-invalid @enderror">
                                <input type="password"
                                    class="form-control form-control-merge @error('reset_password_new') is-invalid @enderror"
                                    id="reset-password-new"
                                    name="reset_password_new"
                                    placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                    aria-describedby="reset-password-new" tabindex="1" autofocus required />
                                <div class="input-group-append">
                                    <span class="input-group-text cursor-pointer"><i data-feather="eye"></i></span>
                                </div>
                            </div>
                            @error('reset_password_new')
                                <span class="invalid-feedback">{{ $message }}</span>
                            @enderror
                        </div>
                        <div class="form-group">
                            <div class="d-flex justify-content-between">
                                <label for="reset-password-confirm">Konfirmasi Password Baru</label>
                            </div>
                            <div class="input-group input-group-merge form-password-toggle @error('reset_password_confirm') is-invalid @enderror">
                                <input
                                    type="password"
                                    class="form-control form-control-merge @error('reset_password_confirm') is-invalid @enderror"
                                    id="reset-password-confirm"
                                    name="reset_password_confirm"
                                    placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                    aria-describedby="reset-password-confirm"
                                    tabindex="2"
                                    required
                                />
                                <div class="input-group-append">
                                    <span class="input-group-text cursor-pointer"><i data-feather="eye"></i></span>
                                </div>
                            </div>
                            @error('reset_password_confirm')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="form-group">
                          <div class="col-md-12">
                              @if ($errors->has('g-recaptcha-response'))
                                <span class="text-info">{{ $errors->first('g-recaptcha-response') }}</span>
                              @endif
                          </div>
                        </div>
                        <button class="btn btn-primary btn-block mt-3 mb-2 g-recaptcha" tabindex="3" data-sitekey="{{ config('recaptcha.sitekey') }}" data-callback="onSubmit" data-action="submit">Perbarui</button>
                    </form>
                </div>
            </div>
            <!-- /Reset Password v1 -->
        </div>
    </div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/forms/validation/jquery.validate.min.js')) }}"></script>
    <script src="https://www.google.com/recaptcha/api.js"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/pages/page-auth-reset-password.js')) }}"></script>
    <script> function onSubmit() { document.getElementById("resetPasswordForm").submit(); }; </script>
@endsection

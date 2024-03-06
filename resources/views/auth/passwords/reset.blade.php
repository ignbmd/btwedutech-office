@php
$configData = Helper::applClasses();
@endphp
@extends('layouts/fullLayoutMaster')

@section('title', 'Reset Password')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    {{-- Page Css files --}}
    <link rel="stylesheet" href="{{ asset(mix('css/base/pages/page-auth.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-validation.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

{{-- @foreach ($errors->all() as $key => $error)
    {{ $error, $key }}<br/>
@endforeach --}}
@section('content')
    <div class="auth-wrapper auth-v2">
        <div class="auth-inner row m-0">
            <!-- Left Text-->
            @include('panels/leftContainerAuth')
            <!-- /Left Text-->
            <!-- Reset password-->
            <div class="d-flex col-lg-4 align-items-center auth-bg px-2 p-lg-5">
                <div class="col-12 col-sm-8 col-md-6 col-lg-12 px-xl-2 mx-auto">
                    <h2 class="card-title font-weight-bold mb-1">Reset Password 🔒</h2>
                    @if (!$email)
                        <div class="alert alert-danger mt-1 alert-validation-msg" role="alert">
                            <div class="alert-body">
                                <i data-feather="info" class="mr-50 align-middle"></i>
                                Alamat URL sudah tidak berlaku, harap request reset password kembali
                            </div>
                        </div>
                    @else
                        <p class="card-text mb-2">Kata sandi baru Anda harus berbeda dari kata sandi yang digunakan
                            sebelumnya
                        </p>
                        <form class="auth-reset-password-form mt-2" action="/password/reset" method="POST">
                            @csrf
                            <input type="hidden" name="email" value="{{ $email }}">
                            <input type="hidden" name="token" value="{{ $token }}">
                            <div class="form-group">
                                <div class="d-flex justify-content-between">
                                    <label for="reset-password-new">Password Baru</label>
                                </div>
                                <div class="input-group input-group-merge form-password-toggle @error('password') error is-invalid @enderror">
                                    <input class="form-control form-control-merge @error('password') error @enderror"
                                        id="reset-password-new" type="password" name="password" placeholder="············"
                                        aria-describedby="reset-password-new" autofocus="" tabindex="1" required/>
                                    <div class="input-group-append">
                                        <span class="input-group-text cursor-pointer">
                                            <i data-feather="eye"></i>
                                        </span>
                                    </div>
                                </div>
                                @error('password')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                            <div class="form-group">
                                <div class="d-flex justify-content-between">
                                    <label for="reset-password-confirm">Konfirmasi Password Baru</label>
                                </div>
                                <div class="input-group input-group-merge form-password-toggle">
                                    <input
                                        class="form-control form-control-merge @error('password_confirmation') is-invalid @enderror"
                                        id="reset-password-confirm" type="password" name="password_confirmation"
                                        placeholder="············" aria-describedby="reset-password-confirm" tabindex="2" required />
                                    <div class="input-group-append">
                                        <span class="input-group-text cursor-pointer"><i data-feather="eye"></i></span>
                                    </div>
                                </div>
                            </div>
                            @error('password_confirmation')
                                <span class="invalid-feedback" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                            <button class="btn btn-primary btn-block mt-3" tabindex="3">Simpan</button>
                        </form>
                    @endif
                    <p class="text-center mt-2">
                        <a href="{{ url('/login') }}">
                            <i data-feather="chevron-left"></i> Kembali ke login
                        </a>
                    </p>
                </div>
            </div>
            <!-- /Reset password-->
        </div>
    </div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/forms/validation/jquery.validate.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/pages/page-auth-reset-password.js')) }}"></script>
@endsection

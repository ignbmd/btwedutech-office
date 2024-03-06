@php
$configData = Helper::applClasses();
@endphp
@extends('layouts/fullLayoutMaster')

@section('title', 'Forgot Password')

@section('page-style')
    {{-- Page Css files --}}
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/forms/form-validation.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/base/pages/page-auth.css')) }}">
@endsection

@section('content')
    <div class="auth-wrapper auth-v2">
        <div class="auth-inner row m-0">
            <!-- Left Text-->
            @include('panels/leftContainerAuth')
            <!-- /Left Text-->
            <!-- Forgot password-->
            <div class="d-flex col-lg-4 align-items-center auth-bg px-2 p-lg-5">
                <div class="col-12 col-sm-8 col-md-6 col-lg-12 px-xl-2 mx-auto">
                    <h2 class="card-title font-weight-bold mb-1">Lupa Password? 🔒</h2>
                    <p class="card-text mb-2">Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset kata
                        sandi Anda</p>
                    @if (Session::has('alert'))
                        <div class="alert alert-success mt-1 alert-validation-msg alert-dismissible" role="alert">
                            <div class="alert-body">
                                <i data-feather="info" class="mr-50 align-middle"></i>
                                <span>{{ Session::get('alert') }}</span>
                            </div>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    @elseif(Session::has('alert-danger'))
                        <div class="alert alert-danger mt-1 alert-validation-msg alert-dismissible" role="alert">
                            <div class="alert-body">
                                <i data-feather="info" class="mr-50 align-middle"></i>
                                <span>{{ Session::get('alert-danger') }}</span>
                            </div>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                    @endif
                    <form class="auth-forgot-password-form mt-2" id="sendResetPasswordLinkForm" action="/password/email" method="POST">
                        @csrf
                        <div class="form-group">
                            <label class="form-label" for="forgot-password-email">Email</label>
                            <input class="form-control" id="forgot-password-email" type="text" name="email"
                                placeholder="john@example.com" aria-describedby="forgot-password-email" autofocus=""
                                tabindex="1" />
                        </div>

                        <div class="form-group">
                          <div class="col-md-12">
                              @if ($errors->has('g-recaptcha-response'))
                                <span class="text-info">{{ $errors->first('g-recaptcha-response') }}</span>
                              @endif
                          </div>
                        </div>

                        <button class="btn btn-primary btn-block mt-3 g-recaptcha" tabindex="2" data-sitekey="{{ config('recaptcha.sitekey') }}" data-callback="onSubmit" data-action="submit">Kirim reset link</button>
                    </form>
                    <p class="text-center mt-2">
                        <a href="{{ url('login') }}">
                            <i data-feather="chevron-left"></i> Kembali ke login
                        </a>
                    </p>
                </div>
            </div>
            <!-- /Forgot password-->
        </div>
    </div>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/forms/validation/jquery.validate.min.js')) }}"></script>
    <script src="https://www.google.com/recaptcha/api.js"></script>
@endsection

@section('page-script')
    <script src="{{ asset(mix('js/scripts/pages/page-auth-forgot-password.js')) }}"></script>
    <script> function onSubmit() { document.getElementById("sendResetPasswordLinkForm").submit(); }; </script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Home')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
    <!-- Kick start -->
    <div class="card card-congratulations">
        <div class="card-body text-center">
            <img src="https://btw-cdn.com/assets/office/image/decore-left.png" class="congratulations-img-left"
                alt="card-img-left" />
            <img src="https://btw-cdn.com/assets/office/image/decore-right.png" class="congratulations-img-right"
                alt="card-img-right" />
            <div class="avatar avatar-xl bg-white shadow">
                <div class="avatar-content">
                    <i data-feather="smile" class="font-large-2 text-primary"></i>
                </div>
            </div>
            <div class="text-center">
                <h1 class="mb-1 text-white">Selamat Datang, {{ Auth::user()?->name }}</h1>
                <p class="card-text m-auto w-75">
                    di <strong>BTW Edutech Office</strong>
                </p>
            </div>
        </div>
    </div>

    @if($isKeuanganUser && count($unpaidBills) > 0)
      <div class="row">
        <div class="col">
          <div class="alert-container">
            <h3 class="alert-heading">Pemberitahuan</h3>
            @foreach($unpaidBills as $key => $value)
              <div class="alert alert-h-plus-1 my-1">
                <div class="alert-body text-xl">
                  {!! $value['message'] !!}
                </div>
              </div>
            @endforeach
          </div>
        </div>
      </div>
    @endif

    {{-- <div class="card-header">
      <h4 class="card-title">Kick start your next project 🚀</h4>
    </div>
    <div class="card-body">
      <div class="card-text">
        <p>
          Getting start with your project custom requirements using a ready template which is quite difficult and time
          taking process, Vuexy Admin provides useful features to kick start your project development with no efforts !
        </p>
        <ul>
          <li>
            Vuexy Admin provides you getting start pages with different layouts, use the layout as per your custom
            requirements and just change the branding, menu &amp; content.
          </li>
          <li>
            Every components in Vuexy Admin are decoupled, it means use use only components you actually need! Remove
            unnecessary and extra code easily just by excluding the path to specific SCSS, JS file.
          </li>
        </ul>
      </div>
    </div> --}}
    <!--/ Kick start -->

@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

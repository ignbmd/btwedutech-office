@extends('layouts/contentLayoutMaster')

@section('title', "Top Up Koin")

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/spinner/jquery.bootstrap-touchspin.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/forms/select/select2.min.css')) }}">
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<section id="input-sizing">
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-12 col-md-8">
                    <form action="{{ route('top-up-coin.store') }}" id="" method="POST">
                        @csrf
                        <div class="form-group">
                            <div class="form-group">
                                <label class="form-label" for="smartbtw_id">
                                    BTW Edutech ID
                                </label>
                                <input type="text" class="form-control" id="smartbtw_id" name="smartbtw_id"
                                placeholder="Masukan BTW Edutech ID siswa">
                                <p class="text-danger">@error('smartbtw_id'){{ $message }}@enderror</p>
                            </div>
        
                            <div class="form-group">
                                <label  class="form-label" for="coins">
                                    Koin
                                </label>
                                <input type="number" class="form-control" id="coins" min="1" name="coins" 
                                    placeholder="jumlah yang dimasukan adalah jumlah dalam bentuk Rp">
                                <p class="text-danger">@error('coins'){{ $message }}@enderror</p>
                            </div>
        
                            <div class="mt-3 text-right">
                                <button type="submit" class="btn btn-success data-submit">
                                  <i data-feather='save' class="mr-50"></i> Simpan
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
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
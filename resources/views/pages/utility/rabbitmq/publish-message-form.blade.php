@extends('layouts/contentLayoutMaster')

@section('title', 'Publish RabbitMQ Message')

@section('vendor-style')
{{-- vendor css files --}}
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form id="submit-form" action="{{ route('utility.rabbitmq.publish-message') }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label" for="key">
                Routing Key
              </label>
              <input type="text" name="key" class="form-control @error('key') is-invalid @enderror" value="{{ old('key') ?? "" }}"  />
              <p class="text-danger">@error('key'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="payload">
                Payload
              </label>
              <textarea name="payload" id="payload" class="form-control @error('payload') is-invalid @enderror" cols="30" rows="10" >{{ old('payload') ?? "" }}</textarea>
              <p class="text-danger">@error('payload'){{ $message }}@enderror</p>
            </div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success" id="submit-button">
                <i data-feather='save' class="mr-50"></i> Publish message
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
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
<script>
    const formElement = document.getElementById("submit-form");
    const submitButtonElement = document.getElementById("submit-button");
    formElement.addEventListener("submit", function() {
      this.classList.add("block-content");
      submitButtonElement.disabled = true;
    });
</script>
@endsection

@extends('layouts/contentLayoutMaster')

@section('title', 'Tambah Reward')

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
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('reward.store') }}" method="POST">
            @csrf
            <div class="form-group">
              <label class="form-label" for="level_required">
                Syarat Level
              </label>
              <input type="number" class="form-control" id="level_required" name="level_required" min="0" value="{{ old('level_required') ?? "" }}" required/>
              <p class="text-danger">@error('level_required'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="type">
                Tipe Reward
              </label>
              <select id="type" name="type" class="form-control select2 hide-search" required>
                @foreach ($rewardTypes as $rewardType)
                  <option value="{{ $rewardType }}">{{ $rewardType }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="type">
                Rarity Reward
              </label>
              <select id="rarity" name="rarity" class="form-control select2 hide-search" required>
                @foreach ($rarityTypes as $rarityType)
                  <option value="{{ $rarityType }}">{{ $rarityType }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="amount">
                Jumlah
              </label>
              <input type="number" class="form-control" id="amount" name="amount" min="1" value="{{ old('amount') ?? "" }}" required/>
              <p class="text-danger">@error('amount'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="description">
                Deskripsi
              </label>
              <textarea name="description" id="description" class="form-control" required>{{ old('description') ?? "" }}</textarea>
              <p class="text-danger">@error('description'){{ $message }}@enderror</p>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="is-custom-code-name">
              <label class="form-check-label" for="is-custom-code-name">
                Kustomisasi Kode Reward
              </label>
            </div>
            <div class="form-group mt-1" id="custom-code-name-container"></div>

            <div class="mt-3 text-right">
              <button type="submit" class="btn btn-success data-submit">
                <i data-feather='save' class="mr-50"></i> Simpan
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
<script src="{{ asset(mix('vendors/js/forms/select/select2.full.min.js')) }}"></script>
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection
@section('page-script')
<script>
  $(".select2").select2();
  const customCodeNameContainer = $("#custom-code-name-container");
  const isCustomCodeNameCheckbox = $("#is-custom-code-name");

  isCustomCodeNameCheckbox.on("change", function() {
      const customCodeNameFormElement = `
        <label class="form-label" for="code_name">
          Kode Reward
        </label>
        <input type="text" class="form-control" id="code_name" name="code_name" required/>
        <p class="text-danger">@error('description'){{ $message }}@enderror</p>
      `;
    if (this.checked) customCodeNameContainer.append(customCodeNameFormElement);
    else customCodeNameContainer.empty();
  });
</script>
@endsection

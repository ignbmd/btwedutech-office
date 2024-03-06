@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Reward')

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
          <form action="{{ route('reward.update', $reward->_id) }}" method="POST">
            @csrf
            @method("PUT")
            <div class="form-group">
              <label class="form-label" for="level_required">
                Syarat Level
              </label>
              <input type="number" class="form-control" id="level_required" name="level_required" min="0" value="{{ isset($reward->level_required) ? $reward->level_required : old('level_required') ?? "" }}" required/>
              <p class="text-danger">@error('level_required'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="type">
                Tipe Reward
              </label>
              <select id="type" class="form-control select2 hide-search" disabled readonly>
                @foreach ($rewardTypes as $rewardType)
                  <option value="{{ $rewardType }} {{ $reward->type === $rewardType ? 'selected' : '' }}">{{ $rewardType }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-group">
              <label class="form-label d-block" for="type">
                Rarity Reward
              </label>
              <select id="rarity" name="rarity" class="form-control select2 hide-search" required>
                @foreach ($rarityTypes as $rarityType)
                  <option value="{{ $rarityType }}" {{ $reward->rarity === $rarityType ? 'selected' : '' }}>{{ $rarityType }}</option>
                @endforeach
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="amount">
                Jumlah
              </label>
              <input type="number" class="form-control" id="amount" name="amount" min="1" value="{{ isset($reward->amount) ? $reward->amount : old('amount') ?? "" }}" required/>
              <p class="text-danger">@error('amount'){{ $message }}@enderror</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="description">
                Deskripsi
              </label>
              <textarea name="description" id="description" class="form-control" required>{{ isset($reward->description) ? $reward->description : old('description') ?? "" }}</textarea>
              <p class="text-danger">@error('description'){{ $message }}@enderror</p>
            </div>

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
</script>
@endsection

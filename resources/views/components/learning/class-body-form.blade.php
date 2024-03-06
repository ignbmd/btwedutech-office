<style>
  .is-invalid ~ .select2 .select2-selection {
    border: 1px solid #ea5455;
  }
  .text-error {
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.857rem;
    color: #ea5455;
  }

</style>

@if (\App\Helpers\UserRole::isAdmin())
  <div class="form-group">
    <label class="form-label d-block" for="branch_code">
      Cabang
    </label>
    <select
      id="branch_code"
      name="branch_code"
      class="select2 select2-tokenizer form-control hide-search dt-branch_code @error('branch_code') is-invalid @enderror"
    >
      @php
        $branchCode = [old('branch_code'), $data?->branch_code];
      @endphp
      <option value="">Pilih Cabang</option>
      @foreach ($branches as $branch)
        <option
          value="{{$branch->code}}"
          @if($type == 'edit' && in_array($branch->code, $branchCode)) selected @endif
        >
          {{$branch->name}}
        </option>
      @endforeach
    </select>
    @error('branch_code')
      <div class="text-error">{{$message}}</div>
    @enderror
    {{-- ajax error --}}
    <div class="text-error d-none" id='error-branch_code'></div>
  </div>
@endif

<div class="form-group">

  <label class="form-label" for="basic-icon-default-fullname">
    Nama Kelas
  </label>
  <input
    id="title"
    type="text"
    class="form-control dt-title @error('title') is-invalid @enderror"
    id="basic-icon-default-fullname"
    placeholder="CPNS"
    @if($type == 'edit') value="{{old('title') ?? $data?->title}}" @endif
    name="title"
  />
  @error('title')
    <div class="text-error">{{$message}}</div>
  @enderror

  {{-- ajax error --}}
  <div class="text-error d-none" id='error-title'></div>
</div>

<div class="form-group">
  <label class="form-label" for="basic-icon-default-post">
    Deskripsi <small class="text-muted">(Opsional)</small>
  </label>
  <textarea
    name="description"
    class="form-control dt-description"
    id="description"
  >{{old('description') ?? $data?->description}}
  </textarea>
</div>

<div class="form-group">
  <label class="form-label" for="basic-icon-default-post">
    Tahun Penyelenggaraan
  </label>
  <input
    id="year"
    type="number"
    name="year"
    id="basic-icon-default-post"
    class="form-control dt-year @error('year') is-invalid @enderror @if($type == 'edit') col-md-2 @else col-md-4 @endif"
    placeholder=""
    @if($type == 'edit') value={{old('year') ?? $data?->year}} @else value="{{Carbon\Carbon::now()->year}}" @endif
  />
  @error('year')
    <div class="text-error">{{$message}}</div>
  @enderror
  {{-- ajax error --}}
  <div class="text-error d-none" id='error-year'></div>
</div>


<div class="form-group">
  <label class="form-label d-block" for="status">
    Status
  </label>
  <select
    id="status"
    name="status"
    class="form-control hide-search dt-status @error('status') is-invalid @enderror"
  >
    @php
      $status = [old('status'), $data?->status];
    @endphp
    <option value="">Pilih Status</option>
    <option
      value="ONGOING"
      @if($type == 'edit' && in_array('ONGOING', $status)) selected @endif
    >
      Sedang Berlangsung
    </option>
    <option
      value="NOT_ACTIVE"
      @if($type == 'edit' && in_array('NOT_ACTIVE', $status)) selected @endif
    >
      Tidak Aktif
    </option>
    @if ($type == 'edit')
      <option
        value="ENDED"
        @if($type == 'edit' && in_array('ENDED', $status)) selected @endif
      >
        Selesai
      </option>
    @endif
  </select>
  @error('status')
    <div class="text-error">{{$message}}</div>
  @enderror
  {{-- ajax error --}}
  <div class="text-error d-none" id='error-status'></div>
</div>

<div class="form-group">
  <label class="form-label" for="basic-icon-default-email">Kuota Kelas (Max: 1000)</label>
  <div class="input-group p-0 @if($type == 'edit') col-md-6 @else col-md-8 @endif">
    <input
      id="quota"
      type="number"
      class="touchspin-step touchspin-color touchspin-min-max dt-quota @error('quota') is-invalid @enderror form-control"
      data-bts-button-down-class="btn btn-primary"
      data-bts-button-up-class="btn btn-primary"
      @if($type == 'edit') value={{old('quota') ?? $data?->quota}} @endif
      name="quota"
      />
  </div>
  @error('quota')
    <div class="text-error">{{$message}}</div>
  @enderror
  {{-- ajax error --}}
  <div class="text-error d-none" id='error-quota'></div>
</div>

<div class="form-group">
  <label class="form-label" for="basic-icon-default-email">Program</label>
  <select
    id="tags"
    class="select2 select2-tokenizer form-control dt-tags @error('tags') is-invalid @enderror"
    multiple
    name="tags[]"
  >
    @if ($type == 'edit')
      @foreach ($data->tags as $tag)
        <option
          value="{{$tag}}"
          @if (in_array($tag, old('tags') ?? $data->tags)) selected @endif
        >
          {{$tag}}
        </option>
      @endforeach
    @endif
  </select>
  @error('tags')
    <div class="text-error">{{$message}}</div>
  @enderror
  {{-- ajax error --}}
  <div class="text-error d-none" id='error-tags'></div>
</div>

@if($utype === "central")
<div class="form-group d-flex flex-column">
  <label class="form-label" for="basic-icon-default-post">
    Tipe Kelas
  </label>
  <div class="mt-50 custom-switch custom-control custom-control-inline">
    <input type="checkbox" class="custom-control-input" name="is_online" id="is_online" @if($type == "edit" && property_exists($data, "is_online") && $data->is_online) checked @endif>
    <label class="custom-control-label is-online-label" for="is_online">
      @if($type == "edit")
        {{ property_exists($data, "is_online") && $data->is_online ? "Kelas Online" : "Kelas Offline" }}
      @else
        Kelas Offline
      @endif
    </label>
  </div>
  @error('is_online')
    <div class="text-error">{{$message}}</div>
  @enderror
  {{-- ajax error --}}
  <div class="text-error d-none" id='error-is-online'></div>
</div>

<div class="form-group">
  <label class="form-label d-block" for="product_id">
    Produk Kelas (Opsional)
  </label>
  <select
    id="product_id"
    name="product_id"
    class="form-control hide-search dt-product_id @error('product_id') is-invalid @enderror"
  >
    <option value="1">Pilih Produk</option>
    @foreach ($products as $product)
      <option
        value="{{ $product->_id }}"
        @if($type == 'edit' && $data?->product_id === $product->_id ) selected @endif
      >
        {{ $product->title }} ( {{ $product->product_code }} )
      </option>
    @endforeach
  </select>
  @error('product_id')
    <div class="text-error">{{$message}}</div>
  @enderror
  {{-- ajax error --}}
  <div class="text-error d-none" id='error-product_id'></div>
</div>
@endif

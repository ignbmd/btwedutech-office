<div class="form-group">
  <input type="hidden" name="id" value="{{ $product->_id }}">
  <input type="hidden" name="is_package_product" id="isPackageProduct" value="{{ $isPackageProduct }}">
  <input type="hidden" name="current_base_price" value="{{ $product->base_price }}" />
  <input type="hidden" name="current_sell_price" value="{{ $product->sell_price }}" />
  <input type="hidden" name="current_max_discount_amount" value="{{ $product->max_discount->amount }}" />
  <input type="hidden" id="current_product_type" name="current_product_type" value="{{ $product->type }}" />
</div>
<div class="form-group">
  <label class="form-label" for="product_name">
    Nama Produk
  </label>
  <input type="text" name="title" class="form-control dt-full-name" id="product_name" placeholder="" value="{{ $product->title }}"
    required />
</div>
<div class="form-group">
  <label class="form-label" for="description">
    Deskripsi <small class="text-muted">(Opsional)</small>
  </label>
  <div id="description-container">
    {!! $product->description !!}
  </div>
  <input type="hidden" name="description" id="description" class="form-control dt-post" placeholder="" required />
</div>
<div class="form-group">
  <label class="form-label" for="description">
    Deskripsi JSON <small class="text-muted">(Opsional)</small>
  </label>
  <textarea name="description_json" class="form-control" id="description_json">{!! $product?->description_json ?? "" !!}</textarea>
</div>
<div class="form-group">
  <label class="form-label" for="type">
    Tipe
  </label>
  <select id="type" name="type" class="form-control hide-search">
    <option value="ASSESSMENT_PRODUCT" @if($product->type == 'ASSESSMENT_PRODUCT') selected @endif>Product Assessment</option>
    <option value="ASSESSMENT_PSYCHOLOG_PRODUCT" @if($product->type == 'ASSESSMENT_PSYCHOLOG_PRODUCT') selected @endif>Product Assessment Psikolog</option>
    <option value="BUNDLE_PSYCHOLOG_PRODUCT" @if($product->type == 'BUNDLE_PSYCHOLOG_PRODUCT') selected @endif>Produk Bundle Psikolog</option>
    <option value="ASSESSMENT_TOEFL_MASA" @if($product->type == 'ASSESSMENT_TOEFL_MASA') selected @endif>Produk Assessment TOEFL MASA</option>
  </select>
</div>
<div class="form-group">
  <label class="form-label" for="sub-product-type">
    Sub Tipe Produk <small class="text-muted" id="sub-product-type-state-label"></small>
  </label>
  <input type="hidden" id="currentSubProductType" value="{{ json_encode($product->tags) }}">
  <select id="sub-product-type" class="form-control hide-search" name="sub_product_type[]" multiple>
  </select>
</div>
<div class="form-group">
  <label class="form-label" for="product_code">
    Kode Produk
  </label>
  <input type="text" name="product_code" class="form-control dt-full-product_code" id="product_code" value="{{ $product->product_code }}" required />
</div>
<div class="form-group">
  <label class="form-label" for="branch-code">
    Kode Cabang
  </label>
  <input type="hidden" id="currentBranchCode" name="current_branch_code" value="{{ $product->branch_code }}" />
  <select id="branch-code" name="branch_code" class="select2 form-control form-control-lg">
    <option value="">Please wait...</option>
  </select>
</div>
<div class="form-group">
  <label class="form-label" for="base-price">
    Harga Dasar
  </label>
  <input type="text" name="base_price" class="form-control numeral-mask" id="base-price" placeholder=""
    value="{{ $product->base_price }}" />
</div>
<div class="form-group">
  <label class="form-label" for="sell-price">
    Harga Jual
  </label>
  <input type="text" name="sell_price" class="form-control numeral-mask" id="sell-price" placeholder=""
    value="{{ $product->sell_price }}" />
</div>
<div class="form-group" id="coin-amount-container">
</div>
<div class="form-group">
  <label class="form-label" for="installment-price">
    Harga Cicilan (Opsional)
  </label>
  <input type="text" name="installment_price" class="form-control numeral-mask" placeholder="" id="installment-price" value="{{ $product?->installment_price ?? 0 }}"/>
</div>
<div class="form-group">
  <label class="form-label" for="installment-period">
    Periode Cicilan (Opsional)
  </label>
  <input type="text" name="installment_period" class="form-control numeral-mask" placeholder="" id="installment-period" value="{{ $product?->installment_period ?? 0 }}"/>
</div>
<div class="form-group" id="coin-amount-container">
</div>
<div class="form-group">
  <label class="form-label" for="sell-price">
    Kuantitas
  </label>
  <input type="text" name="quantity" class="form-control numeral-mask" id="quantity" placeholder=""
    value="{{ $product?->amount ?? 1 }}" />
</div>
<div class="form-group">
  <label class="form-label" for="status-active">
    Status
  </label>
  <div class="d-flex">
    <div class="custom-control custom-radio mr-1">
      <input type="radio" id="status-active" name="status" class="custom-control-input" value="1" @if ($product->status == '1')
      checked
      @endif
      />
      <label class="custom-control-label" for="status-active">Aktif</label>
    </div>
    <div class="custom-control custom-radio">
      <input type="radio" id="status-inactive" name="status" class="custom-control-input" value="0" @if ($product->status == '0')
      checked
      @endif
      />
      <label class="custom-control-label" for="status-inactive">Tidak Aktif</label>
    </div>
  </div>
</div>
<div class="form-group">
  <label class="form-label" for="duration">
    Durasi
  </label>
  <div class="row">
    <div class="col-3">
      <input type="number" id="duration" name="duration" class="form-control" value="{{ $product->duration }}" />
    </div>
    <div class="col-4 pl-0">
      <select id="duration-type" name="duration_type" class="select2 form-control form-control-lg hide-search">
        <option value="MONTH" @if ($product->duration_type == 'MONTH') selected @endif>Bulan</option>
        <option value="YEAR" @if ($product->duration_type == 'YEAR') selected @endif>Tahun</option>
      </select>
    </div>
  </div>
</div>
<div class="form-group">
  <label class="form-label" for="base-price">
    IAP Product Id
  </label>
  <input type="text" name="iap_product_id" class="form-control" placeholder="" id="base-price"
    value="{{ $product->iap_product_id }}" />
  <p><small class="form-text">Required For IOS Product</small></p>
</div>
<div class="form-group">
  <label class="form-label" for="base-price">
    Upload Foto Produk <small class="text-muted">(Opsional)</small>
  </label>
  <input type="file" name="images[]" class="d-block mt-50" multiple />
  <input type="hidden" name="current_images" value="{{ json_encode($product->image) }}" />
  <div class="image-previews mt-2">
    @if ($product->image && count($product->image) > 0)
      @foreach (array_slice($product->image, 0, 3) as $image)
      <div class="block">
        <img src="{{ $image }}" alt="">
      </div>
      @endforeach
    @endif
  </div>
  @if ($product->image && count($product->image) > 3)
    @php
        $imgLeft = count($product->image) - 3;
    @endphp
    <div class="text-center alert alert-primary mt-1">
      <p>Dan {{ $imgLeft }} Gambar Lainnya</p>
    </div>
  @endif
</div>
<div class="form-group">
  <label class="form-label d-block" for="max_discount_type">
    Tipe Diskon
  </label>
  <div class="d-flex">
    <div class="custom-control custom-radio mr-1">
      <input type="radio" name="max_discount_type" id="fixed" value="fixed" class="custom-control-input" {{ $product->max_discount->type == 'FIXED' ? 'checked' : '' }} />
      <label class="custom-control-label" for="fixed">Fixed</label>
    </div>
    <div class="custom-control custom-radio">
      <input type="radio" name="max_discount_type" id="percent" value="percent" class="custom-control-input" {{ $product->max_discount->type == 'PERCENT' ? 'checked' : '' }}>
      <label class="custom-control-label" for="percent">Percent</label>
    </div>
  </div>
</div>
<div class="form-group" id="max_discount_container">
  <label for="max_discount_amount" id="max_discount_amount_label">
  </label>
</div>

<div class="form-group">
  <label class="form-label" for="product_name">
    Nama Produk
  </label>
  <input type="text" name="title" class="form-control dt-full-name" id="product_name" placeholder="" required />
</div>
<div class="form-group">
  <label class="form-label" for="description">
    Deskripsi <small class="text-muted">(Opsional)</small>
  </label>
  <div id="description-container"></div>
  <input type="hidden" name="description" id="description" class="form-control dt-post" placeholder="" required />
</div>
<div class="form-group">
  <label class="form-label" for="description">
    Deskripsi JSON <small class="text-muted">(Opsional)</small>
  </label>
  <textarea name="description_json" class="form-control" id="description_json"></textarea>
</div>
<div class="form-group">
  <label class="form-label" for="type">
    Tipe Produk
  </label>
  <select id="type" name="type" class="select2 form-control hide-search">
    <option value=""></option>
    <option value="ONLINE_PRODUCT">Product Online</option>
    <option value="OFFLINE_PRODUCT">Product Offline</option>
    <option value="COIN_PRODUCT">Product Koin</option>
    <option value="COIN_CURRENCY">Mata Uang Koin</option>
    <option value="ONLINE_PRODUCT_IOS">Product Online IOS</option>
    <option value="ONLINE_PRODUCT_ANDROID">Product Online Android</option>
  </select>
</div>
<div class="form-group">
  <label class="form-label" for="sub-product-type">
    Sub Tipe Produk <small class="text-muted" id="sub-product-type-state-label"></small>
  </label>
  <select id="sub-product-type" class="select2 form-control hide-search" name="sub_product_type[]" multiple>
  </select>
</div>
<div class="form-group">
  <label class="form-label" for="program">
    Program
  </label>
  <select id="program" name="program" class="select2 form-control form-control-lg hide-search">
    <option value="skd" selected>SKD</option>
    <option value="skb">SKB</option>
    <option value="tps">TPS</option>
    <option value="tpa">TPA</option>
    <option value="lpdp">LPDP</option>
    <option value="sim">SIM</option>
    <option value="bumn">BUMN</option>
    <option value="tkda">TKDA</option>
    <option value="pppk">PPPK</option>
    <option value="tni-polri">TNI/POLRI</option>
    <option value="tka-saintek">TKA Saintek</option>
    <option value="tka-soshum">TKA Soshum</option>
    <option value="tka-campuran">TKA Campuran</option>
    <option value="general">General</option>
  </select>
</div>
<div class="form-group" id="add-new-legacy-container">
  <label class="form-label" for="add-new-legacy">
    Tambah Produk Legacy
  </label>
  <div class="d-flex">
    <div class="custom-control custom-radio mr-1">
      <input type="radio" id="add-new-legacy-true" name="add-new-legacy" class="custom-control-input" value="1" required/>
      <label class="custom-control-label" for="add-new-legacy-true">Ya</label>
    </div>
    <div class="custom-control custom-radio">
      <input type="radio" id="add-new-legacy-false" name="add-new-legacy" class="custom-control-input" value="0" />
      <label class="custom-control-label" for="add-new-legacy-false">Tidak</label>
    </div>
  </div>
</div>
<div class="form-group" id="legacy-container">
</div>
<div class="form-group" id="child-product-container"></div>
<div class="form-group" id="parent-product-container"></div>
<div class="form-group">
  <label class="form-label" for="branch-code">
    Kode Cabang
  </label>
  <select id="branch-code" name="branch_code[]" class="select2 form-control form-control-lg" multiple>
  </select>
</div>
<div class="form-group">
  <label class="form-label" for="base-price">
    Harga Dasar
  </label>
  <input type="text" name="base_price" class="form-control numeral-mask" placeholder="" id="base-price" />
</div>
<div class="form-group">
  <label class="form-label" for="sell-price">
    Harga Jual
  </label>
  <input type="text" name="sell_price" class="form-control numeral-mask" placeholder="" id="sell-price" />
</div>
<div class="form-group" id="coin-amount-container">
</div>
<div class="form-group">
  <label class="form-label" for="installment-price">
    Harga Cicilan (Opsional)
  </label>
  <input type="text" name="installment_price" class="form-control numeral-mask" placeholder="" id="installment-price" />
</div>
<div class="form-group">
  <label class="form-label" for="installment-period">
    Periode Cicilan (Opsional)
  </label>
  <input type="text" name="installment_period" class="form-control numeral-mask" placeholder="" id="installment-period" />
</div>
<div class="form-group">
  <label class="form-label" for="sell-price">
    Kuantitas
  </label>
  <input type="number" name="quantity" class="form-control numeral-mask" placeholder="1" id="quantity" value="1" />
</div>
<div class="form-group">
  <label class="form-label" for="status-active">
    Status
  </label>
  <div class="d-flex">
    <div class="custom-control custom-radio mr-1">
      <input type="radio" id="status-active" name="status" class="custom-control-input" value="1" checked />
      <label class="custom-control-label" for="status-active">Aktif</label>
    </div>
    <div class="custom-control custom-radio">
      <input type="radio" id="status-inactive" name="status" class="custom-control-input" value="0" />
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
      <input type="number" id="duration" name="duration" class="form-control" />
    </div>
    <div class="col-4 pl-0">
      <select id="duration-type" name="duration_type" class="select2 form-control form-control-lg hide-search">
        <option value="MONTH" selected>Bulan</option>
        <option value="YEAR">Tahun</option>
      </select>
    </div>
  </div>
</div>
<div class="form-group">
  <label class="form-label" for="base-price">
    IAP Product Id
  </label>
  <input type="text" name="iap_product_id" class="form-control" placeholder="" id="base-price" />
  <p><small class="form-text">Required For IOS Product</small></p>
</div>
<div class="form-group">
  <label class="form-label" for="base-price">
    Upload Foto Produk <small class="text-muted">(Opsional)</small>
  </label>
  <input type="file" name="images[]" class="d-block mt-50" multiple/>
</div>
<div class="form-group">
  <label class="form-label d-block" for="max_discount_type">
    Tipe Diskon
  </label>
  <div class="d-flex">
    <div class="custom-control custom-radio mr-1">
      <input type="radio" name="max_discount_type" id="fixed" value="fixed" class="custom-control-input" checked />
      <label class="custom-control-label" for="fixed">Fixed</label>
    </div>
    <div class="custom-control custom-radio">
      <input type="radio" name="max_discount_type" id="percent" value="percent" class="custom-control-input">
      <label class="custom-control-label" for="percent">Percent</label>
    </div>
  </div>
</div>

<div class="form-group" id="max_discount_container">
  <label for="max_discount_amount" id="max_discount_amount_label">
  </label>
</div>

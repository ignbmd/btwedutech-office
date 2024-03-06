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
  <input type="text" name="description" id="description" class="form-control dt-post" placeholder="" required />
</div>
<div class="form-group">
  <label class="form-label" for="legacy-id">
    Legacy Id
  </label>
  <select id="legacy-id" name="legacy_id" class="select2 form-control form-control-lg">
    <option value="">Pilih Legacy Id</option>
    <option value="23">23 - SKD Premium 60 Modul</option>
    <option value="14">14 - SKD Premium 10 Modul</option>
  </select>
</div>
<div class="form-group">
  <label class="form-label" for="branch-code">
    Kode Cabang
  </label>
  <select id="branch-code" name="branch_code" class="select2 form-control form-control-lg">
    <option value="">Pilih Kode Cabang</option>
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
    <option value="tka-saintek">TKA Saintek</option>
    <option value="tka-soshum">TKA Soshum</option>
    <option value="tka-campuran">TKA Campuran</option>
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
<div class="form-group">
  <label class="form-label" for="type">
    Tipe
  </label>
  <select id="type" name="type" class="select2 form-control hide-search">
    <option value="">Pilih Tipe Produk</option>
    <option value="ONLINE_PRODUCT">Product Online</option>
    <option value="OFFLINE_PRODUCT">Product Offline</option>
    <option value="ONLINE_PRODUCT_IOS">Product Online IOS</option>
    <option value="ONLINE_PRODUCT_ANDROID">Product Online Android</option>
  </select>
</div>
<div class="form-group d-none" id="onlineProductType">
  <label class="form-label" for="sub-online-type">
    Tipe Online Produk
  </label>
  <select id="sub-online-type" name="sub_online_type" class="select2 form-control hide-search">
    <option value="" selected>Pilih Tipe Online Produk</option>
    <option value="PACKAGE">Paket</option>
    <option value="TRYOUT">Tryout</option>
  </select>
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

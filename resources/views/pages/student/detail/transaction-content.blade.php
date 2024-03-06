<div class="form-row justify-content-end">
  <div class="col-2 mr-1">
    <label>Status Transaksi</label>
    <select name="transaction-status" id="transaction-status" class="form-control">
      <option value="">Semua Transaksi</option>
      <option value="settlement">Lunas</option>
      <option value="canceled">Dibatalkan</option>
      <option value="pending">Menunggu Konfirmasi</option>
    </select>
  </div>
</div>
<table class="datatables-basic table" id="transaction-table">
  <thead>
    <tr>
      <th></th>
      <th>No</th>
      <th></th>
      <th>Nama Produk</th>
      <th>Status</th>
      <th>Harga</th>
      <th>Tanggal Transaksi</th>
    </tr>
  </thead>
</table>

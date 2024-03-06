@extends('layouts/contentLayoutMaster')

@section('title', 'Edit Transaksi Paket')

@section('content')
<!-- Input Sizing start -->
<section id="input-sizing">
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-6">
          <form action="{{ route('transaction.package.update', $transaction->data->id) }}" method="POST">
            @csrf
            @method('PUT')
            <div class="form-group">
              <label for="nama_lengkap">
                Nama Siswa
              </label>
              <input type="text" class="form-control" value="{{ $transaction->data->nama_lengkap }}" disabled/>
            </div>
            <div class="form-group">
              <label class="form-label">
                Email
              </label>
              <input type="email" class="form-control" value="{{ $transaction->data->email }}" disabled/>
            </div>
            <div class="form-group">
              <label class="form-label">
                Paket Dibeli
              </label>
              <input type="text" class="form-control" value="{{ $transaction->data->title }} ({{ $transaction->data->alias }})" disabled/>
            </div>
            <div class="form-group">
              <label class="form-label">
                Harga
              </label>
              <input type="text" class="form-control" value="Rp {{ number_format($transaction->data->final_amount,2,',','.') }}" disabled/>
            </div>
            <div class="form-group">
              <label class="form-label">
                Tanggal Transaksi
              </label>
              <input type="text" class="form-control" value="{{ $transaction->data->tanggal_transaksi }}" disabled/>
            </div>
            <div class="form-group">
              <label class="form-label">Bukti Foto</label>
              @if($transaction->data->photo) <img src="{{ $transaction->data->photo }}" width="100%">
              @else <input type="text" class="form-control" value="Melalui Payment Gateway" disabled/> @endif
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="is_approved" class="form-control" style="width:100" required>
              <option value=''>--choose--</option>
              <option value="1">Aktif</option>
            </select>
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

@extends('layouts/contentLayoutMaster')

@section('title', 'Transaksi Paket Belum Lunas')

@section('vendor-style')
<link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
@endsection

@section('page-style')
  <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
@endsection

@section('content')

<!-- Basic table -->
<section id="basic-datatable">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-header p-1 border-bottom ml-auto">
          <form>
            <div class="d-inline-flex">
              <input type="text" class="form-control input-lg mr-1" name="search" placeholder="Masukan nama atau email">
              <input type="submit" class="hide-arrow text-white btn btn-sm btn-gradient-primary" value="Cari">
            </div>
          </form>
        </div>
        <div class="table-responsive">
          <table class="datatables-basic table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Paket Dibeli</th>
                <th>Tanggal Transaksi</th>
                <th>Program</th>
                <th>Harga</th>
                <th>Bukti Pembayaran</th>
                <th>Status Pembayaran</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              @php $no = 1; @endphp
              @forelse($transactions as $data)
              <tr>
                <td>{{ $no++ }}</td>
                <td>{{ $data->nama_lengkap }}</td>
                <td>{{ $data->email }}</td>
                <td>{{ $data->title }}</td>
                <td>{{ $data->tanggal_transaksi }}</td>
                <td>{{ $data->alias }}</td>
                <td>Rp {{ number_format($data->final_amount,2,',','.') }}</td>
                @if(isset($data->photo))
                  <td><a href="javascript:void(0);" onclick="gambar( '{{$data->photo}}' )" class="" data-toggle="modal" data-target="#tutorialsplaneModal"><img height="200" width="300" src="{{ $data->photo }}"></a></td>
                @else
                  <td>Melalui Payment Gateway</td>
                @endif
                <td>
                  <div class="badge badge-pill badge-light-warning">
                    Belum Lunas
                  </div>
                </td>
                <td>
                  <a href="{{ route('transaction.package.edit', $data->id) }}" class="hide-arrow text-white btn btn-sm btn-gradient-warning">Edit</a>
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="10" class="text-center">Data Kosong</td>
              </tr>
              @endforelse
            </tbody>
          </table>
        </div>
        <nav aria-label="Page navigation example">
          <span class="pagination justify-content-center mt-3">
            {{ $transactions->appends($params)->links("pagination::bootstrap-4") }}
          </span>
        </nav>

      </div>
    </div>
  </div>
</section>
<!--/ Basic table -->

<!----modal starts here--->
<div id="tutorialsplaneModal" class="modal fade" role='dialog'>
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Bukti Pembayaran Siswa</h4>
      </div>
      <div class="modal-body">
        <img class="gambar_bukti" id="gambar_bukti" style="width:100%;height:100%;">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
<!--Modal ends here--->
@endsection


@section('vendor-script')
<script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
@endsection

@section('page-script')
<script>
  function gambar(src){
    $('.gambar_bukti').attr('src', src);
    $('#tutorialsplaneModal').modal();
  }
</script>
@endsection

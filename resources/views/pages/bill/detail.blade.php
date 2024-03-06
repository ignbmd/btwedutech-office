@extends('layouts/contentLayoutMaster')

@section('title', 'Detail Transaksi')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/extensions/toastr.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/dataTables.bootstrap4.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/responsive.bootstrap4.min.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('vendors/css/tables/datatable/buttons.bootstrap4.min.css')) }}">
@endsection
@section('page-style')
    <link rel="stylesheet" href="{{ asset(mix('css/base/plugins/extensions/ext-component-toastr.css')) }}">
    <link rel="stylesheet" href="{{ asset(mix('css/pages/bill/detail.css')) }}">
@endsection

@php
function formatPrice($n)
{
    return number_format($n, 0, ',', '.');
}
@endphp

@section('content')
    <section>
        <div id="allowed" class="d-none">{{ json_encode($allowed) }}</div>
        <div id="user" class="d-none">{{ json_encode($user) }}</div>
        <div id="bill" class="d-none">{{ json_encode($bill) }}</div>
        <div id="billId" class="d-none">{{ $billId }}</div>
        <div id="studentName" class="d-none">{{ $bill->bill_to }}</div>
        <input type="hidden" id="billBranchCode" value="{{ $bill->branch_code }}">
        <input type="hidden" id="billProductName" value="{{ $bill->title }}">
        <div id="defaultParentPhone" class="d-none">
            @if (isset($student->parent_datas->parent_number))
                {{ $student->parent_datas->parent_number ?? null }}
            @else
                {{ $student->parent_number ?? null }}
            @endif
        </div>
        <div id="selectedTransactionId" class="d-none"></div>
        <div id="selectedCreatedAt" class="d-none"></div>
        <div id="paymentWebHost" class="d-none">{{ env('PAYMENT_WEB_HOST') }}</div>
        <div class="row">
            <div class="col-12">
                {{-- Top Card --}}
                <div class="card">
                    <div class="card-body">
                        <h4>Invoice {{ $bill->ref_number }}</h4>
                        <div class="mt-3">
                            <h6 class="mb-1">Tanggal:</h6>
                            <table>
                                <tbody>
                                    <tr>
                                        <td class="pr-1">Tanggal Dibuat:</td>
                                        <td>
                                            <span class="badge badge-pill badge-primary">
                                              {{ \Carbon\Carbon::parse($bill->created_at)->format('d M Y ') }}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="pr-1">Tanggal Jatuh Tempo:</td>
                                        <td>
                                            <span class="badge badge-pill badge-warning">
                                              {{ $isAssessmentProductBill
                                                  ? "-"
                                                  : \Carbon\Carbon::parse($bill->due_date)->format('d M Y ')
                                              }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-2">
                            <h6 class="mb-1">Kepada:</h6>
                            <table>
                                <tbody>
                                    <tr>
                                        <td width="50%" class="pr-1">Nama:</td>
                                        <td width="50%"><span class="font-weight-bold">{{ $bill->bill_to }}</span>
                                        </td>
                                    </tr>
                                    @if ($bill?->nik && $bill?->nik !== "-")
                                      <tr>
                                        <td width="50%" class="pr-1">NIK:</td>
                                        <td width="50%"><span class="font-weight-bold">{{ $bill?->nik ?? "-" }}</span>
                                        </td>
                                      </tr>
                                    @endif
                                    <tr>
                                        <td width="50%" class="pr-1">No HP:</td>
                                        <td width="50%">{{ $bill->phone }}</td>
                                    </tr>
                                    <tr>
                                        <td width="50%" class="pr-1">Alamat:</td>
                                        <td width="50%">{{ $bill->address }}</td>
                                    </tr>
                                    <tr>
                                        <td width="50%" class="pr-1">Email:</td>
                                        <td width="50%">{{ $bill->email }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-2">
                            <h6 class="mb-1">Detail Pembayaran:</h6>
                            <table>
                                <tbody>
                                    {{-- @foreach ($bill->product_item as $key => $product)
                                        <tr>
                                            <td class="pr-1 align-top">Produk {{ $key + 1 }}:</td>
                                            <td>
                                                <span
                                                    class="font-weight-bold"><b>{{ $product->product_description }}</b></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="pb-1 pr-1 align-top">Harga Produk:</td>
                                            <td class="pb-1">
                                                <span class="font-weight-bold"><b>Rp
                                                        {{ formatPrice($product->final_amount) }}</b></span>
                                            </td>
                                        </tr>
                                    @endforeach --}}
                                    <tr>
                                      <td class="pr-1">Nama Produk</td>
                                      <td><strong>{{ $bill->title }}</strong></td>
                                    </tr>
                                    <tr>
                                      <td class="pr-1">Harga Produk</td>
                                      <td><strong>Rp {{ formatPrice(($bill?->final_bill + $bill?->final_discount) ?? 0) }}</strong></td>
                                    </tr>
                                    <tr>
                                        <td class="pr-1">Total Diskon:</td>
                                        <td><b>Rp {{ formatPrice($bill->final_discount) }}</b></td>
                                    </tr>
                                    <tr>
                                        <td class="pr-1">Total Tagihan:</td>
                                        <td><b>Rp {{ formatPrice($bill->final_bill) }}</b></td>
                                    </tr>
                                    <tr>
                                        <td class="pr-1">Sudah dibayar:</td>
                                        <td class="text-success">Rp {{ formatPrice($bill->paid_bill) }}</td>
                                    </tr>
                                    <tr>
                                        <td class="pr-1">Sisa Pembayaran Saat Ini:</td>
                                        <td class="text-danger">Rp {{ formatPrice($bill->remain_bill) }}</td>
                                    </tr>
                                    <tr>
                                        <td class="pr-1 pt-1">Status Tagihan:</td>
                                        <td class="pt-1">
                                            <span
                                                class="badge badge-pill {{ $bill->status == 'CLOSED' ? 'badge-success' : 'badge-danger' }}">{{ $bill->status }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        @if ($bill->note ?? false)
                          <div class="notes mt-2 col-md-6">
                            <div><i>{{ $bill->note ?? '' }}</i></div>
                          </div>
                        @endif
                        <p class="text-secondary mt-2 mb-0">Dibuat Oleh: {{ $bill->created_by }}</p>
                        <p class="text-secondary mt-25">Diperbarui Oleh: {{ $bill->created_by }}</p>
                        {{-- TODO:
                          * Show Sweet Alert if last history bill status is pending
                          ** Disable button if bill status closed --}}
                        @if(!$isAssessmentProductBill)
                        <div class="mt-3">
                            @php
                                $isPendingExist = collect($bill->transaction ?? [])->some(fn($t) => $t?->transaction_status == 'PENDING');
                                $isClosed = $bill->status == 'CLOSED';
                                $isDisabled = $isClosed || $isPendingExist;
                            @endphp

                            <div class="btn-group" role="group">
                              <button id="btnGroupDrop1" type="button" class="btn btn-primary mr-1 waves-effect waves-float waves-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  <i data-feather="file-plus"></i>
                                  Tambah
                              </button>
                              <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                                <a href="/tagihan/detail/{{ $billId }}/create" class="dropdown-item @if ($isDisabled) disabled @endif">
                                  Tambah Transaksi Baru
                                </a>
                                <a href="/tagihan/{{ $billId }}/retur-pembayaran" class="dropdown-item @if (!$isBillReturnable) disabled @endif">
                                  Tambah Retur/Diskon Tagihan
                                </a>
                              </div>
                            </div>

                            @if ($bill->product_type == 'OFFLINE_PRODUCT')
                                @if ($isBillReconcileable)
                                    <a href="/tagihan/{{ $billId }}/rekonsiliasi"
                                        class="btn mr-1 waves-effect waves-float waves-light btn-outline-primary"
                                        onclick="this.classList.add('disabled')">
                                        <i data-feather='dollar-sign'></i>
                                        Rekonsiliasi Tagihan
                                    </a>
                                @elseif($isBillAlreadyReconciled)
                                    <button type="button"
                                        class="btn mr-1 waves-effect waves-float waves-light btn-outline-primary disabled">
                                        <i data-feather='dollar-sign'></i>
                                        Tagihan sudah direkonsiliasi
                                    </button>
                                @else
                                    <button type="button"
                                        class="btn mr-1 waves-effect waves-float waves-light btn-outline-secondary disabled">
                                        <i data-feather='dollar-sign'></i>
                                        Tagihan belum dapat direkonsiliasi
                                    </button>
                                @endif
                            @endif

                            <div class="btn-group mr-1" role="group">
                                <button id="btnGroupDrop2" type="button" class="btn btn-outline-primary dropdown-toggle"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i data-feather="zoom-in"></i>
                                    Lihat
                                </button>
                                <div class="dropdown-menu" aria-labelledby="btnGroupDrop2">
                                    <a href="/tagihan/invoice/{{ $billId }}" class="dropdown-item">
                                        <i data-feather='file'></i>
                                        Lihat Invoice
                                    </a>
                                    <a href="/tagihan/letter/{{ $billId }}/pdf" class="dropdown-item">
                                        <i data-feather='file-text'></i>
                                        Lihat Surat Penagihan
                                    </a>
                                </div>
                            </div>

                            <div class="btn-group" role="group">
                                <button id="btnGroupDrop3" type="button" class="btn btn-outline-warning dropdown-toggle"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i data-feather="edit-3"></i>
                                    Ubah
                                </button>
                                <div class="dropdown-menu" aria-labelledby="btnGroupDrop3">
                                    <a href="/admin/tagihan/{{ $billId }}/final-discount/edit"
                                      class="dropdown-item @if(!$canEditBillDiscount) disabled @endif">
                                      Ubah Diskon Tagihan
                                    </a>
                                    @if($canEditBillStatus)
                                      <a
                                        class="dropdown-item"
                                        href="/tagihan/{{ $billId }}/edit-status">
                                        Ubah Status Tagihan
                                      </a>
                                    @endif
                                    <a
                                      class="dropdown-item @if($isBillAlreadyReconciled) disabled @endif"
                                      href="/tagihan/{{ $billId }}/due-date/edit">
                                      Ubah Tanggal Jatuh Tempo Tagihan
                                    </a>
                                    <a
                                      class="dropdown-item"
                                      href="/tagihan/{{ $billId }}/edit-note">
                                      Ubah Catatan Tagihan
                                    </a>
                                </div>
                            </div>
                        </div>
                        @else
                        <div class="mt-3">
                            @php
                                $isPendingExist = collect($bill->transaction ?? [])->some(fn($t) => $t?->transaction_status == 'PENDING');
                                $isClosed = $bill->status == 'CLOSED';
                                $isDisabled = $isClosed || $isPendingExist;
                            @endphp

                            <div class="btn-group mr-1" role="group">
                                <button id="btnGroupDrop2" type="button" class="btn btn-outline-primary dropdown-toggle"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i data-feather="zoom-in"></i>
                                    Lihat
                                </button>
                                <div class="dropdown-menu" aria-labelledby="btnGroupDrop2">
                                    <a href="/tagihan/invoice/{{ $billId }}" class="dropdown-item">
                                        <i data-feather='file'></i>
                                        Lihat Invoice
                                    </a>
                                </div>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
                {{-- End Top Card --}}

                <!-- Send Receipt Sidebar -->
                <div class="modal modal-slide-in fade" id="send-receipt-sidebar" aria-hidden="true">
                    <div class="modal-dialog sidebar-lg">
                        <div class="modal-content p-0">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">×</button>
                            <div class="modal-header mb-1">
                                <h5 class="modal-title">
                                    <span class="align-middle">Kirim Receipt</span>
                                </h5>
                            </div>
                            <div class="modal-body flex-grow-1">
                                <div id="alert" class="alert alert-primary p-1" role="alert">
                                    Silahkan cek whatsapp kamu
                                </div>
                                <form id="send-form">
                                    <div class="form-group">
                                        <label for="phone" class="form-label">No Whatsapp</label>
                                        <input type="text" class="form-control" id="phone" name="phone"
                                            value=@if (isset($student->parent_datas->parent_number)) {{ $student->parent_datas->parent_number ?? null }}
                                        @else
                                        {{ $student->parent_number ?? null }} @endif />
                                    </div>
                                    <div class="form-group">
                                        <span class="badge badge-light-primary">
                                            <i data-feather="link" class="mr-25"></i>
                                            <span class="align-middle">Recipt Attached</span>
                                        </span>
                                    </div>
                                    <div class="form-group d-flex flex-wrap mt-2">
                                        <button id="button-send" type="submit"
                                            class="btn btn-primary mr-1">Kirim</button>
                                        <button type="button" class="btn btn-outline-secondary"
                                            data-dismiss="modal">Batalkan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- /Send Invoice Sidebar -->

                <!-- Send Payment Link Sidebar -->
                <div class="modal modal-slide-in fade" id="send-payment-link-sidebar" aria-hidden="true">
                    <div class="modal-dialog sidebar-lg">
                        <div class="modal-content p-0">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">×</button>
                            <div class="modal-header mb-1">
                                <h5 class="modal-title">
                                    <span class="align-middle">Kirim Link Pembayaran</span>
                                </h5>
                            </div>
                            <div class="modal-body flex-grow-1">
                                <div id="alert-send-payment-link" class="alert alert-primary p-1" role="alert">
                                    Pesan berhasil terkirim
                                </div>
                                <form id="send-payment-link-form">
                                    <div class="form-group">
                                        <label for="phone" class="form-label">No Whatsapp</label>
                                        <input type="text" class="form-control" id="phone" name="phone"
                                            value=@if (isset($student->parent_datas->parent_number)) {{ $student->parent_datas->parent_number ?? null }}
                                        @else
                                        {{ $student->parent_number ?? null }} @endif />
                                    </div>
                                    <div class="form-group">
                                        <a id="payment-link" href="" class="text-primary"
                                            target="_blank">
                                            <span class="badge badge-light-primary">
                                                <i data-feather="link" class="mr-25"></i>
                                                Link Pembayaran
                                            </span>
                                        </a>
                                    </div>
                                    <div class="form-group d-flex flex-wrap mt-2">
                                        <button id="button-send-payment-link" type="submit"
                                            class="btn btn-primary mr-1">Kirim</button>
                                        <button type="button" class="btn btn-outline-secondary"
                                            data-dismiss="modal">Batalkan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- /Send Payment Link Sidebar -->

                {{-- Bottom Card --}}
                <div class="card">
                    <div class="card-body overflow-hidden">
                        <table class="table" id="transaction-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>No. Transaksi</th>
                                    <th>Catatan</th>
                                    <th>Total Bayar</th>
                                    <th>Biaya</th>
                                    <th>Sub Total</th>
                                    <th>Metode Transaksi</th>
                                    <th>Status</th>
                                    <th>Dibuat oleh</th>
                                    <th>Tanggal Transaksi</th>
                                    <th>Bukti Pembayaran</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="12" class="text-center">Loading...</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
                {{-- End Bottom Card --}}

            </div>
        </div>
    </section>
@endsection

@section('vendor-script')
    <script src="{{ asset(mix('vendors/js/extensions/toastr.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/jquery.dataTables.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/datatables.bootstrap4.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/dataTables.responsive.min.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/responsive.bootstrap4.js')) }}"></script>
    <script src="{{ asset(mix('vendors/js/tables/datatable/datatables.buttons.min.js')) }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"
        integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js"
        integrity="sha512-AA1Bzp5Q0K1KanKKmvN/4d3IRKVlv9PYgwFPvm32nPO6QS8yH1HO7LbgB1pgiOxPtfeg5zEn2ba64MUcqJx6CA=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
@endsection
@section('page-script')
    <script src="{{ asset(mix('js/scripts/utility/utils.js')) }}"></script>
    <script src="{{ asset(mix('js/scripts/pages/transaction/history-transaction-datatables.js')) }}"></script>
@endsection

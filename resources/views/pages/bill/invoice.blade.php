@extends('layouts/contentLayoutMaster')

@section('title', 'Invoice')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('vendors/css/pickers/flatpickr/flatpickr.min.css') }}">
@endsection
@section('page-style')
    <link rel="stylesheet" href="{{ asset('css/base/plugins/forms/pickers/form-flat-pickr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/bill/invoice.css') }}">
@endsection

@php
$lastTransaction = collect($bill?->transaction)->last();

function priceFormat($num)
{
    return number_format($num, 0, ',', '.');
}

function dateFormat($date)
{
    return Carbon\Carbon::parse($date ?? '')->format('d/m/Y');
}
@endphp

@section('content')
    <span class="d-none" id="billId">{{ $billId }}</span>
    <span class="d-none" id="studentName">{{ $bill?->bill_to ?? '' }}</span>
    <span class="d-none" id="invoiceAmount">Rp
        {{ priceFormat(($bill->final_bill ?? 0) - ($bill->paid_bill ?? 0)) }}</span>
    <span class="d-none" id="user">{{ json_encode($user) }}</span>
    <span class="d-none" id="allowed">{{ json_encode($allowed) }}</span>
    <section class="invoice-preview-wrapper">
        <div class="row invoice-preview">
            <!-- Invoice -->
            <div class="col-xl-9 col-md-8 col-12">
                <div class="card invoice-preview-card">
                    <div class="card-body invoice-padding pb-0">
                        <!-- Header starts -->
                        <div class="d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0">
                            <div>
                                <div class="logo-wrapper">
                                    <img src="{{ env('BASE_IMG_URL') }}/logo/btw-edutech-red-text-full.svg"
                                        width="70%" />
                                </div>
                                <p class="card-text mb-25"><b>PT. Bina Taruna Wiratama</b></p>
                                <p>NPWP: 85.700.627.4-901.000</p>
                                <p class="card-text mb-50">tanya@btwedutech.com</p>
                                <p class="card-text mb-25">Jl. Bypass Ngurah Rai No.176, Sanur Kaja</p>
                                <p class="card-text mb-25">Denpasar Selatan, Kota Denpasar, Bali 80228</p>
                                <p class="card-text mb-0">(0361) 270128</p>
                            </div>
                            <div class="mt-md-0 mt-2">
                                <h4 class="invoice-title">
                                    Invoice
                                    <span class="invoice-number">#{{ $bill?->ref_number ?? '' }}</span>
                                </h4>

                                <h5> Dikeluarkan Oleh: </h5>
                                <p class="mb-0">{{ $branch->name ?? '' }}</p>
                                <p class="mb-0">{{ $branch->address ?? '' }}</p>

                                <br>

                                <div class="invoice-date-wrapper">
                                    <p class="invoice-date-title">Tanggal Dibuat:</p>
                                    <p class="invoice-date">{{ dateFormat($bill->created_at ?? '') }}</p>
                                </div>
                                <div class="invoice-date-wrapper">
                                    <p class="invoice-date-title">Jatuh Tempo:</p>
                                    <p class="invoice-date">{{ $isAssessmentProductBill ? "-" : dateFormat($bill->due_date ?? '') }}</p>
                                </div>
                            </div>
                        </div>

                        {{-- <div class="receipt-header-detail">
                          <b>Kwitansi dikeluarkan oleh:</b>
                          <div class="contact">
                            <p style="color: rgb(110, 110, 110); font-weight:bold">
                              {{$branch->name ?? ''}}
                            </p>
                            <span style="white-space: normal; line-height: 150%">{{$branch->address ?? ''}}</span>
                          </div>
                        </div> --}}
                        <!-- Header ends -->
                    </div>

                    <hr class="invoice-spacing" />

                    <!-- Address and Contact starts -->
                    <div class="card-body invoice-padding pt-0">
                        <div class="row invoice-spacing">
                            <div class="col-xl-6 p-0">
                                <h6 class="mb-2">Tagihan Kepada:</h6>
                                <h6 class="mb-25">{{ $bill?->bill_to ?? '' }}</h6>
                                @if ($bill?->nik && $bill?->nik !== "-")
                                  <p class="card-text mb-25"><small>NIK: {{ $bill?->nik ?? '' }}</small></p>
                                @endif
                                <p class="card-text mb-50"><small>{{ $bill?->email ?? '' }}</small></p>
                                <p class="card-text mb-25">{{ $bill?->address ?? '' }}</p>
                                <p class="card-text mb-0">{{ $bill?->phone ?? '' }}</p>
                                <p id="default-phone" class="card-text mb-0 d-none">
                                    @if (isset($student->parent_datas->parent_number))
                                        {{ $student->parent_datas->parent_number ?? '' }}
                                    @else
                                        {{ $student->parent_number ?? '' }}
                                    @endif
                                </p>
                            </div>
                            <div class="col-xl-6 p-0 mt-xl-0 mt-2">
                                <h6 class="mb-2">Detail Pembayaran:</h6>
                                @php
                                    $isPaid = $bill?->remain_bill == 0;
                                @endphp
                                <table>
                                    <tbody>
                                        <tr>
                                            <td class="pr-1">Metode Pembayaran:</td>
                                            <td><span
                                                    class="font-weight-bold">{{ $isSiplahBill ? "SIPLAH" : config('ui.billing.payment_method')[$lastTransaction->transaction_method ?? ''] ?? '' }}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="pr-1">Status:</td>
                                            <td class="text-{{ $isPaid ? 'success' : 'danger' }}">
                                                {{ $isPaid ? 'Lunas' : 'Belum Lunas' }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <!-- Address and Contact ends -->

                    <!-- Invoice Description starts -->
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="py-1">Nama Produk</th>
                                    <th class="py-1">Harga Produk</th>
                                </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td class="py-1">
                                  <p class="card-text font-weight-bold mb-25">
                                    {{ $bill->title }}
                                  </p>
                                </td>
                                <td class="py-1">
                                  <span class="font-weight-bold">{{ priceFormat(($bill?->final_bill + $bill?->final_discount) ?? 0) }}</span>
                                </td>
                              </tr>
                                {{-- @foreach ($bill?->product_item ?? [] as $product)
                                    <tr>
                                        <td class="py-1">
                                            <p class="card-text font-weight-bold mb-25">
                                                {{ $product->product_description }}
                                            </p>
                                        </td>
                                        <td class="py-1">
                                            <span class="font-weight-bold">{{ $product->quantity }}</span>
                                        </td>
                                        <td class="py-1">
                                            <span
                                                class="font-weight-bold">{{ priceFormat($product->final_amount ?? 0) }}</span>
                                        </td>
                                    </tr>
                                @endforeach --}}
                            </tbody>
                        </table>
                    </div>

                    <div class="card-body invoice-padding pb-0">
                        <div class="row invoice-sales-total-wrapper">
                            <div class="col-md-4 order-md-1 order-2 mt-md-0 mt-3"></div>
                            <div class="col-md-8 d-flex justify-content-end order-md-2 order-1">
                                <div class="invoice-total-wrapper">
                                    <div class="invoice-total-item">
                                        <p class="invoice-total-title">Subtotal:</p>
                                        <p class="invoice-total-amount">
                                            Rp
                                            {{ $isAssessmentProductBill ? priceFormat($bill->final_bill) : priceFormat(collect($bill?->product_item)->sum(fn($p) => $p?->final_amount)) }}
                                        </p>
                                    </div>
                                    <div class="invoice-total-item text-success">
                                        <p class="invoice-total-title">Diskon:</p>
                                        <p class="invoice-total-amount">- Rp
                                            {{ priceFormat($bill->final_discount ?? 0) }}
                                        </p>
                                    </div>
                                    {{-- <div class="invoice-total-item text-warning">
                                        <p class="invoice-total-title">Pajak:</p>
                                        <p class="invoice-total-amount">Rp {{priceFormat($bill->final_tax ?? 0)}}</p>
                                    </div> --}}
                                    <div class="invoice-total-item">
                                        <p class="invoice-total-title">Total:</p>
                                        <p class="invoice-total-amount">Rp {{ priceFormat($bill->final_bill ?? 0) }}</p>
                                    </div>
                                    <div class="invoice-total-item text-success">
                                        <p class="invoice-total-title">Sudah Dibayar:</p>
                                        <p class="invoice-total-amount">Rp {{ priceFormat($bill->paid_bill ?? 0) }}</p>
                                    </div>
                                    <hr class="my-50" />
                                    <div class="invoice-total-item text-danger">
                                        <p class="invoice-total-title">Sisa Pembayaran:</p>
                                        <p class="invoice-total-amount">Rp
                                            {{ priceFormat(($bill->final_bill ?? 0) - ($bill->paid_bill ?? 0)) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Invoice Description ends -->

                    <hr class="invoice-spacing" />

                    <!-- Invoice Note starts -->
                    <div class="card-body invoice-padding pt-0">
                        <div class="row">
                            <div class="col-12">
                                <span class="font-weight-bold">Catatan:</span>
                                <span>{{ $bill->note ?? '-' }}</span>
                            </div>
                        </div>
                        {{-- @if($isBinsusBill)
                        <div class="row">
                            <div class="col-12">
                                <span class="font-weight-bold">* Sesuai dengan surat perjanjian nomor:
                                    118/BTW-BALI/VI/2022</span>
                            </div>
                        </div>
                        @endif --}}
                    </div>
                    <!-- Invoice Note ends -->
                </div>
            </div>
            <!-- /Invoice -->

            <!-- Invoice Actions -->
            <div class="col-xl-3 col-md-4 col-12 invoice-actions mt-md-0 mt-2">
                <div class="card">
                    <div class="card-body">
                        <button class="btn btn-primary btn-block mb-75" data-toggle="modal"
                            data-target="#send-invoice-sidebar">
                            Kirim Invoice
                        </button>
                        <a class="btn btn-outline-secondary btn-block btn-download-invoice mb-75"
                            href="{{ url("tagihan/invoice/$billId/pdf") }}" target="_blank">Download</a>
                        <a class="btn btn-outline-secondary btn-block mb-75"
                            href="{{ url("tagihan/invoice/$billId/print") }}" target="_blank">
                            Print
                        </a>
                    </div>
                </div>
            </div>
            <!-- /Invoice Actions -->
        </div>
    </section>

    <!-- Send Invoice Sidebar -->
    <div class="modal modal-slide-in fade" id="send-invoice-sidebar" aria-hidden="true">
        <div class="modal-dialog sidebar-lg">
            <div class="modal-content p-0">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">×</button>
                <div class="modal-header mb-1">
                    <h5 class="modal-title">
                        <span class="align-middle">Kirim Invoice</span>
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
                                value=@if (isset($student->parent_datas->parent_number)) {{ $student->parent_datas->parent_number ?? '' }}
                            @else
                            {{ $student->parent_number ?? '' }} @endif />
                        </div>
                        <div class="form-group">
                            <span class="badge badge-light-primary">
                                <i data-feather="link" class="mr-25"></i>
                                <span class="align-middle">Invoice Attached</span>
                            </span>
                        </div>
                        <div class="form-group d-flex flex-wrap mt-2">
                            <button id="button-send" type="submit" class="btn btn-primary mr-1">Kirim</button>
                            <button type="button" class="btn btn-outline-secondary"
                                data-dismiss="modal">Batalkan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <!-- /Send Invoice Sidebar -->
@endsection

@section('vendor-script')
    <script src="{{ asset('vendors/js/forms/repeater/jquery.repeater.min.js') }}"></script>
    <script src="{{ asset('vendors/js/pickers/flatpickr/flatpickr.min.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('js/scripts/pages/transaction/invoice.js') }}"></script>
@endsection

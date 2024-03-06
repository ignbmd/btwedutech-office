@extends('layouts/fullLayoutMaster')

@section('title', 'Slip Pengeluaran #1101')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('vendors/css/pickers/flatpickr/flatpickr.min.css') }}">
@endsection
@section('page-style')
    <link rel="stylesheet" href="{{ asset('css/base/plugins/forms/pickers/form-flat-pickr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/base/pages/app-invoice-print.css') }}">
@endsection

@php
  $debit = collect($expense->journal_records)
    ->filter(fn($j) => $j->position == 'DEBIT') ?? [];
  $totalDebit = $debit->sum('amount') ?? 0;

  $credit = collect($expense->journal_records)
    ->filter(fn($j) => $j->position == 'CREDIT') ?? [];
  $totalCredit = $credit->sum('amount') ?? 0;

@endphp

@section('content')
    <div class="invoice-print p-3">
        <div class="d-flex mb-2">
            <img src="{{ env('BASE_IMG_URL') }}/logo/btw-edutech-red-text-full.svg" width="200" />
        </div>
        <div>
            <p class="mb-0"><b>PT. Bina Taruna Wiratama</b></p>
            <p class="mb-0"><small>tanya@btwedutech.com</small></p>
            <p class="mb-0"><small>Jl. Bypass Ngurah Rai No.176, Sanur Kaja</small></p>
            <p class="mb-0"><small>Denpasar Selatan, Kota Denpasar, Bali 80228</small></p>
            <p class="mb-0"><small>(0361) 270128</small></p>
        </div>
        <hr class="my-2" />
        <h2 class="text-center font-weight-bolder">SLIP PENGELUARAN</h2>

        <hr class="my-2" />

        <div class="row pb-2">
            <div class="col-sm-6 mt-sm-0 mt-2">
                <table>
                    <tbody>
                        <tr>
                            <td class="pr-1">Dibayar Kepada:</td>
                            <td><strong>{{$expense->contact->name ?? ''}}</strong></td>
                        </tr>
                        <tr>
                            <td class="pr-1 pt-2">Akun Penarikan:</td>
                            <td class="text-danger pt-2">{{$credit->first()->account_name ?? ""}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-sm-6 mt-sm-0 mt-2">
                <table>
                    <tbody>
                        <tr>
                            <td class="pr-1">No Transaksi:</td>
                            <td class="text-danger">#{{$expense->ref_number ?? ''}}</td>
                        </tr>
                        <tr class="mt-2">
                            <td class="pr-1 pt-2">Tanggal Transaksi:</td>
                            <td class="text-danger pt-2">
                              {{Carbon\Carbon::parse($expense->created_at?? '')->format('d/m/Y')}}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="table-responsive mt-2">
            <table class="table m-0">
                <thead>
                    <tr>
                        <th class="py-1">No Akun</th>
                        <th class="py-1">Nama Akun</th>
                        <th class="py-1 text-right">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                  @foreach ($debit as $item)
                    <tr>
                        <td class="py-1">
                            <p>{{$item->account_code ?? ''}}</p>
                        </td>
                        <td class="py-1 pl-4">
                            <p class="">{{$item->account_name ?? ''}}</p>
                        </td>
                        <td class="py-1 text-right">
                            <strong>Rp. {{number_format($item->amount ?? 0, 0, ',', '.')}}</strong>
                        </td>
                    </tr>
                  @endforeach
                </tbody>
            </table>
        </div>

        <div class="row invoice-sales-total-wrapper mt-3">
            <div class="col-md-4 order-md-1 order-2 mt-md-0 mt-3">
            </div>
            <div class="col-md-8 d-flex justify-content-end order-md-2 order-1">
                <div class="invoice-total-wrapper">
                    <div class="invoice-total-item">
                        <p class="invoice-total-title">Subtotal:</p>
                        <p class="invoice-total-amount">Rp. {{number_format($totalDebit ?? 0, 0, ',', '.')}}</p>
                    </div>
                    <hr class="my-50" />
                    <div class="invoice-total-item">
                        <p class="invoice-total-title">Total:</p>
                        <p class="invoice-total-amount">Rp. {{number_format($totalCredit ?? 0, 0, ',', '.')}}</p>
                    </div>
                </div>
            </div>
        </div>

        <hr class="my-2" />

        <div class="row">
            <div class="col-12">
                <span class="font-weight-bold">Terbilang:</span>
                <span id="terbilang" class="text-uppercase">{{$totalCredit}}</span>
            </div>
            <div class="col-12 mt-50">
                <span class="font-weight-bold">Keterangan:</span>
                <span>{{$expense->note ?? ''}}</span>
            </div>
        </div>

        <div class="row">
            <table width="100%" border="1" class="text-center mt-3">
                <thead>
                    <th>Dibuat oleh,</th>
                    <th>Diperiksa oleh,</th>
                    <th>Disetujui oleh,</th>
                    <th>Diterima oleh,</th>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 50px"></td>
                        <td style="padding: 50px"></td>
                        <td style="padding: 50px"></td>
                        <td style="padding: 50px"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
@endsection

@section('vendor-script')
    <script src="{{ asset('vendors/js/forms/repeater/jquery.repeater.min.js') }}"></script>
    <script src="{{ asset('vendors/js/pickers/flatpickr/flatpickr.min.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('js/scripts/utility/terbilang.js') }}"></script>
    <script src="{{ asset('js/scripts/pages/transaction/invoice-print.js') }}"></script>
    <script>
        const terbilangEl = $('#terbilang');
        terbilangEl.html(terbilang(terbilangEl.text()));
    </script>
@endsection

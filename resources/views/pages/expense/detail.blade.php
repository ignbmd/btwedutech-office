@extends('layouts/contentLayoutMaster')

@section('title', 'Detail Biaya')

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('vendors/css/pickers/flatpickr/flatpickr.min.css') }}">
@endsection
@section('page-style')
    <link rel="stylesheet" href="{{ asset('css/base/plugins/forms/pickers/form-flat-pickr.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/bill/invoice.css') }}">
@endsection

@section('content')
    <section class="invoice-preview-wrapper">
        <div class="row invoice-preview">
            <!-- Invoice -->
            <div class="col-xl-9 col-md-8 col-12">
                <div class="card invoice-preview-card">
                    <div class="card-body invoice-padding pb-0">
                        <!-- Header starts -->
                        <div
                            class="d-flex align-items-center justify-content-between flex-md-row flex-column invoice-spacing mt-0">
                            <div>
                                <p class="mb-0"><small>Transaksi</small></p>
                                <h3>Biaya <span class="font-weight-bolder">#{{$expense->ref_number ?? ''}}</span></h3>
                            </div>
                            <h4 class="invoice-title text-success mb-0 font-weight-bolder">
                                LUNAS
                            </h4>
                        </div>
                        <!-- Header ends -->
                    </div>

                    <hr class="invoice-spacing mt-0" />

                    <!-- Address and Contact starts -->
                    <div class="card-body invoice-padding pt-0">
                        <div class="row invoice-spacing">
                            <div class="col-xl-6 p-0">
                                <h6 class="mb-2">Penerima:</h6>
                                <h6 class="mb-25">{{$expense->contact->name ?? ''}}</h6>
                                <p class="card-text mb-50"><small>{{$expense->contact->email ?? ''}}</small></p>
                                <p class="card-text mb-25">{{$expense->contact->address ?? ''}}</p>
                                <p class="card-text mb-0">{{$exense->contact->phone ?? ''}}</p>
                            </div>
                            <div class="col-xl-6 p-0 mt-xl-0 mt-2">
                                <h6 class="mb-2">Detail Pembayaran:</h6>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td class="pr-1">Tanggal Transaksi:</td>
                                            <td>{{Carbon\Carbon::parse($expense->transaction_date?? '')->format('d/m/Y')}}</td>
                                        </tr>
                                        <tr>
                                            <td class="pr-1">Tag:</td>
                                            <td>{{join(", ", $expense->tags ?? [])}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <!-- Address and Contact ends -->

                    <!-- Invoice Description starts -->
                    @php
                        $debit = collect($expense->journal_records ?? [])
                          ->filter(fn($j) => $j->position == 'DEBIT');
                        $totalDebit = $debit->sum('amount') ?? 0;

                        $credit = collect($expense->journal_records ?? [])
                          ->filter(fn($j) => $j->position == 'CREDIT');
                        $totalCredit = $credit->sum('amount') ?? 0;
                    @endphp
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="py-1">Akun Biaya</th>
                                    <th class="py-1">Posisi</th>
                                    <th class="py-1">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($debit as $item)
                                  <tr>
                                      <td class="py-1">
                                          <p class="card-text font-weight-bold mb-25">
                                            {{$item->account_name ?? '-'}}
                                            {{ ($item->account_code ?? null) ? "({$item->account_code})" : ''}}
                                          </p>
                                      </td>
                                      <td>
                                        <span>{{$item->position ?? ''}}</span>
                                      </td>
                                      <td class="py-1">
                                          <span>Rp. {{number_format($item->amount ?? 0, 0, ',', '.')}}</span>
                                      </td>
                                  </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <div class="card-body invoice-padding pb-0">
                        <div class="row invoice-sales-total-wrapper">
                            <div class="col-md-4 order-md-1 order-2 mt-md-0 mt-3">
                            </div>
                            <div class="col-md-8 d-flex justify-content-end order-md-2 order-1">
                                <div class="invoice-total-wrapper">
                                    <div class="invoice-total-item">
                                        <p class="invoice-total-title">Subtotal:</p>
                                        <p class="invoice-total-amount">
                                          Rp. {{number_format($totalDebit ?? 0, 0, ',', '.')}}
                                        </p>
                                    </div>
                                    <div class="invoice-total-item text-success">
                                        <p class="invoice-total-title">Sudah Dibayar:</p>
                                        <p class="invoice-total-amount">
                                          Rp. {{number_format($totalCredit ?? 0, 0, ',', '.')}}
                                        </p>
                                    </div>
                                    {{-- <hr class="my-50" /> --}}
                                    {{-- <div class="invoice-total-item h4">
                                        <p class="invoice-total-title">Sisa Tagihan:</p>
                                        <p class="invoice-total-amount">
                                          Rp {{number_format($totalCredit - $totalDebit, 0, ',', '.')}}
                                        </p>
                                    </div> --}}
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Invoice Description ends -->
{{--
                    <div class="card-body pb-0">
                      <p class="card-text mb-0">
                        <small>Terakhir diperbarui oleh Dwiky Chandra pada 21/03/2021 10:00 WIB</small>
                      </p>
                    </div>
                    <hr class="invoice-spacing" /> --}}

                    <!-- Invoice Note starts -->
                    <div class="card-body invoice-padding pt-0 pb-4">
                        <div class="row">
                            <div class="col-12">
                                <span class="font-weight-bold">Catatan:</span>
                                <p class="mt-25">{{$expense->note ?? ''}}</p>
                            </div>

                            <div class="col-6">
                                <span class="font-weight-bold">Lampiran:</span>

                                @foreach (($expense->document ?? []) as $item)
                                  @php
                                    $fileNameArray = explode('.', $item->name ?? '');
                                    $extension = $fileNameArray[count($fileNameArray)-1] ?? '';
                                  @endphp
                                  <div class="card-transaction mt-75">
                                      <div class="transaction-item bg-light-primary p-50 rounded">
                                          <div class="media">
                                              <div class="avatar bg-white rounded">
                                                  <div class="avatar-content">
                                                      <i data-feather='image' class="text-primary"></i>
                                                  </div>
                                              </div>
                                              <div class="media-body">
                                                  <h6 class="transaction-title">{{$item->name ?? ''}}</h6>
                                                  <small>{{$extension}}</small>
                                              </div>
                                          </div>
                                          <a href="{{$item->path ?? ''}}" class="btn btn-primary btn-sm waves-effect waves-float waves-light">
                                              Lihat <i data-feather='external-link'></i>
                                          </a>
                                      </div>
                                  </div>
                                @endforeach
                            </div>

                        </div>
                    </div>
                    <!-- Invoice Note ends -->
                </div>
            </div>
            <!-- /Invoice -->

            <!-- Invoice Actions -->
            <div class="col-xl-3 col-md-4 col-12 invoice-actions mt-md-0 mt-2">
                <div class="card">
                    <div class="card-body">
                      @php
                          $id = $expense->id ?? '';
                      @endphp
                        <a
                          class="btn btn-primary btn-block"
                          href="{{ url("biaya/slip/print/$id") }}"
                          target="_blank"
                          >
                            <i data-feather='printer'></i> Cetak
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
                    <form>
                        <div class="form-group">
                            <label for="wa_number" class="form-label">No Whatsapp</label>
                            <input type="text" class="form-control" id="wa_number" value="085776876552" />
                        </div>
                        <div class="form-group">
                            <span class="badge badge-light-primary">
                                <i data-feather="link" class="mr-25"></i>
                                <span class="align-middle">Invoice Attached</span>
                            </span>
                        </div>
                        <div class="form-group d-flex flex-wrap mt-2">
                            <button type="button" class="btn btn-primary mr-1" data-dismiss="modal">Kirim</button>
                            <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Batalkan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <!-- /Send Invoice Sidebar -->

    <!-- Add Payment Sidebar -->
    <div class="modal modal-slide-in fade" id="add-payment-sidebar" aria-hidden="true">
        <div class="modal-dialog sidebar-lg">
            <div class="modal-content p-0">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">×</button>
                <div class="modal-header mb-1">
                    <h5 class="modal-title">
                        <span class="align-middle">Add Payment</span>
                    </h5>
                </div>
                <div class="modal-body flex-grow-1">
                    <form>
                        <div class="form-group">
                            <input id="balance" class="form-control" type="text" value="Invoice Balance: 5000.00"
                                disabled />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="amount">Payment Amount</label>
                            <input id="amount" class="form-control" type="number" placeholder="$1000" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="payment-date">Payment Date</label>
                            <input id="payment-date" class="form-control date-picker" type="text" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="payment-method">Payment Method</label>
                            <select class="form-control" id="payment-method">
                                <option value="" selected disabled>Select payment method</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Debit">Debit</option>
                                <option value="Credit">Credit</option>
                                <option value="Paypal">Paypal</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="payment-note">Internal Payment Note</label>
                            <textarea class="form-control" id="payment-note" rows="5"
                                placeholder="Internal Payment Note"></textarea>
                        </div>
                        <div class="form-group d-flex flex-wrap mb-0">
                            <button type="button" class="btn btn-primary mr-1" data-dismiss="modal">Send</button>
                            <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <!-- /Add Payment Sidebar -->
@endsection

@section('vendor-script')
@endsection

@section('page-script')
@endsection

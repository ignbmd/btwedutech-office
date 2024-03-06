<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Invoice - BTW Edutech Office</title>
    <style>
        @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 300;
            src: url(https://fonts.gstatic.com/s/montserrat/v18/JTURjIg1_i6t8kCHKm45_cJD7g4.ttf) format('truetype');
        }

        @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/montserrat/v18/JTUSjIg1_i6t8kCHKm45xW4.ttf) format('truetype');
        }

        @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 500;
            src: url(https://fonts.gstatic.com/s/montserrat/v18/JTURjIg1_i6t8kCHKm45_ZpC7g4.ttf) format('truetype');
        }

        @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 600;
            src: url(https://fonts.gstatic.com/s/montserrat/v18/JTURjIg1_i6t8kCHKm45_bZF7g4.ttf) format('truetype');
        }

        * {
            font-family: 'Montserrat', sans-serif;
        }

        /* table {
          border: 1px solid black;
        } */

        #product-table th,
        #product-table td {
            padding: 5px 0;
        }

        #product-table th {
            border: 1px solid #aaa;
            border-left: none;
            border-right: none;
        }

        #product-table thead th:last-child,
        #product-table tbody td:last-child {
            text-align: left;
        }

        #calc-table td {
            padding: 5px 0;
        }

        #calc-table tr td:first-child {
            width: 50% !important;
        }

        #calc-table tr td:last-child {
            text-align: right !important;
        }

        #calc-table tr:last-child td.last {
            border: 1px solid #aaa;
            border-left: 0;
            border-right: 0;
            border-bottom: 0;
        }

        .text-success {
            color: #28c76f !important
        }

        .text-danger {
            color: #ea5455 !important;
        }

        .mark {
            transform: rotate(-30deg);
            opacity: .1;
            font-size: 4rem;
            font-weight: bold;
            z-index: -1;
            padding: .5rem 2rem;
            position: absolute;
            left: 15%;
            top: 30%;
            white-space: nowrap;
            width: 60%;
            text-align: center;
        }

        .mark-success {
            border: 1rem solid #28c76f;
            color: #28c76f;
        }

        .mark-danger {
            border: 1rem solid #ea5455;
            color: #ea5455;
        }

        .address-p {
          margin: 2px 0;
        }

        .small-text {
          font-size: .9rem;
        }

        .text-grey-1 {
          color: #929392;
        }

        .text-grey-2 {
          color: rgb(164, 164, 164);
        }

        .text-grey-3 {
          color: #747474;
        }

        .font-weight-bold {
          font-weight: bold;
        }

        .font-weight-bolder {
          font-weight: bolder;
        }
      </style>
</head>

<body>
    @php
        $lastTransaction = collect($bill?->transaction)->last();
        if (!function_exists('priceFormat')) {
            function priceFormat($num)
            {
                return number_format($num, 0, ',', '.');
            }
        }

        if (!function_exists('dateFormat')) {
            function dateFormat($date)
            {
                return Carbon\Carbon::parse($date ?? '')->format('d/m/Y');
            }
        }

        $isPaid = ($bill->remain_bill ?? 0) == 0;
    @endphp

    {{-- <div class="mark mark-{{$isPaid ? 'success' : 'danger'}}">
    <p>{{$isPaid ? 'Lunas' : 'Belum Lunas'}}</p>
  </div> --}}

    <div>
        <table style="width: 100%">
            <tr>
                <td>
                    <div>
                        <img style="width: 240px"
                            src="https://btw-cdn.com/assets/office/logo/logo_edutech.svg" />
                    </div>
                    <div style="margin-top: 15px">
                        <p class="address-p"><b>PT. Bina Taruna Wiratama</b></p>
                        <p class="address-p">NPWP: 85.700.627.4-901.000</p>
                        <p class="address-p">tanya@btwedutech.com</p>
                        <p class="address-p">Jl. Bypass Ngurah Rai No.176, Sanur Kaja</p>
                        <p class="address-p">Denpasar Selatan, Kota Denpasar, Bali 80228</p>
                        <p class="address-p">(0361) 270128</p>
                    </div>
                </td>
                <td style="text-align: right; vertical-align:top">
                    <h4>INVOICE #{{ $bill->ref_number ?? '' }}</h4>

                    <b>Invoice dikeluarkan oleh:</b>
                    <div>
                        <p class="address-p text-grey-3 font-weight-bolder">{{ $branch->name ?? '' }}</p>
                        <p class="address-p" style="white-space: normal; line-height: 150%">{{ $branch->address ?? '' }}
                        </p>
                    </div>
                </td>
            </tr>
            <tr>
                <td></td>
                <td style="text-align: right">
                    <div style="margin:0">
                        <span>Tanggal Dibuat :</span>
                        <span>{{ dateFormat($bill->created_at ?? '') }}</span>
                    </div>
                    <div style="margin-bottom:.2rem">
                        <span>Jatuh Tempo :</span>
                        <span>{{ $isAssessmentProductBill ? "-" : dateFormat($bill->due_date ?? '') }}</span>
                    </div>
                </td>
            </tr>
        </table>

        <hr />
        <br>
        <table style="width: 100%; padding:0;" cellpadding="0">
            <tr>
                <td style="vertical-align: top; padding:0;" colspan="2">
                    <h4 style="margin:0 0 10px 0;">Tagihan Kepada:</h4>
                    <p style="margin:0 0 10px 0;"><b>{{ $bill->bill_to ?? '' }}</b></p>
                    @if ($bill?->nik && $bill?->nik !== "-")
                      <p style="margin:0 0 10px 0;">NIK: {{ $bill?->nik ?? '' }}</p>
                    @endif
                    <p style="margin:0 0 10px 0;">{{ $bill->email ?? '' }}</p>
                    <p style="margin:0 0 10px 0;">{{ $bill->address ?? '' }}</p>
                    <p style="margin:0 0 10px 0;">{{ $bill->phone ?? '' }}</p>
                </td>
                <td style="vertical-align: top">
                    <h4 style="margin:0">Detail Pembayaran</h4>
                    <table style="border: 0; border-collapse: collapse;">
                        <tr style="margin:0">
                            <td style="padding:5px 0 5px 0">Metode Pembayaran</td>
                            <td>:&nbsp;&nbsp;</td>
                            <td>
                                {{ $isSiplahBill ? "SIPLAH" : config('ui.billing.payment_method')[$lastTransaction->transaction_method ?? ''] ?? '' }}
                            </td>
                        </tr>
                        <tr style="margin:0; padding:0">
                            <td style="padding:5px 0 5px 0">Status</td>
                            <td>:&nbsp;&nbsp;</td>
                            <td style="padding:0; margin:0">
                                <p style="padding:0; margin:0" class="text-{{ $isPaid ? 'success' : 'danger' }}">
                                    {{ $isPaid ? 'Lunas' : 'Belum Lunas' }}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <br>
        <table id="product-table" style="width: 100%">
            <thead>
                <tr style="text-align: left;">
                    <th>Nama Produk</th>
                    <th>Harga Produk</th>
                </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{{ $bill->title }}</strong></td>
                <td><strong>{{ priceFormat(($bill?->final_bill + $bill?->final_discount) ?? 0) }}</strong></td>
              </tr>
                {{-- @foreach ($bill->product_item ?? [] as $item)
                    <tr>
                        <td>{{ $item->product_description ?? '' }}</td>
                        <td><strong>{{ $item->quantity ?? 0 }}</strong></td>
                        <td><strong>Rp {{ priceFormat($item->final_amount ?? 0) }}</strong></td>
                    </tr>
                @endforeach --}}
            </tbody>
        </table>

        <br><br>
        <table id="calc-table" style="width: 100%">
            <tr>
                <td></td>
                <td>Subtotal</td>
                <td>Rp {{ $isSiplahBill ? priceFormat($bill->final_bill) : priceFormat(collect($bill?->product_item)->sum(fn($p) => $p?->final_amount)) }}</td>
            </tr>
            <tr>
                <td></td>
                <td>Discount</td>
                <td> - Rp {{ priceFormat($bill->final_discount ?? 0) }}</td>
            </tr>
            {{-- <tr>
        <td></td>
        <td>Pajak</td>
        <td>Rp {{priceFormat($bill->final_tax ?? 0)}}</td>
      </tr> --}}
            <tr>
                <td></td>
                <td>Total</td>
                <td>Rp {{ priceFormat($bill->final_bill ?? 0) }}</td>
            </tr>
            <tr>
                <td></td>
                <td>Sudah Dibayar</td>
                <td>Rp {{ priceFormat($bill->paid_bill ?? 0) }}</td>
            </tr>
            <tr>
                <td></td>
                <td class="last">Sisa Pembayaran:</td>
                <td class="last">Rp {{ priceFormat(($bill->final_bill ?? 0) - ($bill->paid_bill ?? 0)) }}</td>
            </tr>
        </table>

        <br><br>
        <hr class="my-2" />
        @if($bill->note)
        <div style="text-align: justify">
            <p class="text-grey-1 font-weight-bold" style="margin-block-end:0;">Catatan:</p>
            <p class="text-grey-1 small-text" style="margin-block-start: .2rem; margin-block-end:0;">{{ $bill->note ?? '-' }}</p>
            {{-- <p class="text-grey-1 small-text" style="margin-block-start: .2rem; margin-block-end:0;">Sesuai dengan perjanjian Nomor : 421/SP-BINSUS/BTW-BALI-2023 Bahwa 1). BTW Edutech tidak memberikan janji atau jaminan
dalam bentuk apapun untuk kelulusan peserta didik dalam setiap seleksi masuk Perguruan Tinggi Kedinasan; 2). BTW Edutech
bersedia mengembalikan biaya yang dikerluarkan peserta didik apabila yang bersangkutan tidak lulus dalam proses seleksi
Perguruan Tinggi Kedinasan, dengan syarat & ketentuan sebagaimanan dimaksud pada perjanjian yang telah ditandatangani para
pihak.</p> --}}
        </div>
        @endif
        <div style="text-align: justify">
            <p class="text-grey-1 font-weight-bold" style="font-size: 1em; margin-bottom: 6px;">Untuk di perhatikan:</p>
            <ol type="1" ol style="margin-block-start: 0 !important; margin-left: .2rem !important; padding-left: 1rem !important" class="text-grey-1 small-text">
              <li>Bimbel BTW adalah lembaga bimbel dibawah naungan BTW Edutech (PT. Bina Taruna Wiratama) yang murni memberikan bimbingan belajar pelatihan kepada siswa dalam mempersiapkan diri mengikuti berbagai tahapan seleksi masuk PTK, PTN, CPNS, TNI & POLRI.</li>
              <li>Biaya yang dibayarkan adalah murni biaya bimbingan belajar dan pelatihan sesuai program yang diikuti.</li>
              <li>Tidak ada pengembalian biaya apabila siswa yang bersangkutan tidak lulus dalam tahapan seleksi yang diikuti kecuali dengan perjanjian tertulis.</li>
              <li>BTW Edutech dan Bimbel BTW tidak memberikan janji atau menjamin kelulusan siswa bimbel dalam seleksi yang diikuti.</li>
              <li>Segala bentuk pembayaran akan diberikan kwitansi resmi dari BTW Edutech (PT. Bina Taruna Wiratama).</li>
              <li>Kwitansi ini telah dikeluarkan secara elektronik dan dijamin keabsahannya dengan melakukan scan pada QR Code yang disediakan.</li>
              <li>2x Pengulangan Program yang sama, khusus Program Super Intensif PTN, Binsus PTK & Intensif TNI/POLRI.</li>
              <li>Garansi Tidak berlaku untuk Program Reguler.</li>
            </ol>
        </div>

        {{-- @if($isBinsusBill)
        <div>
            <span class="font-weight-bold">* Sesuai dengan surat perjanjian nomor: 118/BTW-BALI/VI/2022</span>
        </div>
        @endif --}}
    </div>
    <script>
        window.print();
    </script>
</body>

</html>

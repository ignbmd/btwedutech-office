<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>Kwitansi Pembayaran - {{$transaction->ref_number ?? ''}}</title>
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

    html,
    body {
      font-family: "Montserrat", sans-serif;
      padding: 15px;
    }

    table {
      width: 100%;
    }

    table,
    tr,
    td {
      /* border: 1px solid #000; */
      border-collapse: collapse;
    }

    .text-right {
      text-align: right;
    }

    .vertical-align-top {
      vertical-align: top;
    }

    .font-600 {
      font-weight: 600;
    }

    .font-800 {
      font-weight: 800;
    }

    .receipt-header-detail {
      line-height: 0.6;
    }

    .receipt-header-detail .contact {
      font-size: 0.8em;
    }

    #receipt-title {
      line-height: 0.5;
    }

    #receipt-title p {
      font-size: 0.85em;
    }

    .receipt-body-row.first td {
      padding-top: 40px;
    }

    .receipt-body-row td {
      padding-top: 8px;
    }

    #footer-row td {
      padding-top: 40px;
    }

    .qr-block {
      width: 300px;
      margin-left: auto;
      text-align: center;
    }

    .qr-block p {
      margin-bottom: 5px;
    }

    .price-block {
      border: 1px solid #000;
      padding: 10px;
      margin-top: 20px;
    }

    .note-block {
      margin-top: 20px;
      padding: 2px 0px;
      text-align: justify;
    }

    .note-block span {
      display: block;
    }

    .note-block .label {
      font-size: 0.8em;
    }

    .note-block .note {
      font-size: 0.9em;
      margin-top: 5px;
    }

    .small-text {
      color: rgb(164, 164, 164);
      font-size: .9rem;
    }

    .text-bold {
      font-weight: bold;
    }

    .text-bolder {
      font-weight: bolder;
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

    @media print {
      .note-block {
          background-color: #eaeaea !important;
          -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>

@php

  function priceFormat($num) {
    return number_format($num, 0, ",", ".");
  }

  function dateFormat($date) {
    return \Carbon\Carbon::parse($date ?? '')->format('d/m/Y');
  }
@endphp

<body>

  <table>

    <tr>
      <td class="vertical-align-top" width="60%">
        <img src="https://btw-cdn.com/assets/office/logo/logo_edutech.svg" width="200" />
        <div class="receipt-header-detail">
          <p class="font-600 title">PT. Bina Taruna Wiratama</p>
          <div class="contact">
            <p>tanya@btwedutech.com</p>
            <p>Jl. Bypass Ngurah Rai No.176, Sanur Kaja</p>
            <p>Denpasar Selatan, Kota Denpasar, Bali 80228</p>
            <p>(0361) 270128</p>
          </div>
        </div>
      </td>
      <td class="text-right" width="40%">
        <div class="receipt-header-detail">
          <b>Kwitansi dikeluarkan oleh:</b>
          <div class="contact">
            <p style="color: rgb(110, 110, 110); font-weight:bold">
              {{$branch->name ?? ''}}
            </p>
            <span style="white-space: normal; line-height: 150%">{{$branch->address ?? ''}}</span>
          </div>
        </div>
      </td>
    </tr>

  </table>

  <table>
    <tr>
      <td id="receipt-title">
        <h4 class="font-800">Kwitansi Pembayaran</h4>
        <p style="white-space: nowrap;">Nomor : {{$transaction->ref_number ?? '-'}}</p>
      </td>
    </tr>
  </table>

  <table>

    <tr class="receipt-body-row first">
      <td width="30%">
        Sudah diterima dari
      </td>
      <td width="10px">
        :
      </td>
      <td>
        {{$transaction->bill->bill_to ?? ''}}
      </td>
    </tr>

    @php
      $final = $transaction->final_transaction ?? 0;
      $fee = $transaction->transaction_fee ?? 0;
      $total = $final + $fee;
    @endphp
    <tr class="receipt-body-row">
      <td width="30%">
        Uang Sebesar
      </td>
      <td width="10px">
        :
      </td>
      <td style="text-transform: uppercase">
        {{ $total !== 0 ? \App\Helpers\Number::terbilang($total) : "NOL" }} RUPIAH
      </td>
    </tr>

    <tr class="receipt-body-row">
      <td width="30%">
        Untuk Pembayaran
      </td>
      <td width="10px">
        :
      </td>
      <td>
        {{$transaction->bill->title ?? '-'}}
      </td>
    </tr>
  </table>
  <table>
    <tr id="footer-row" style="border: 1 solid black">
      <td class="vertical-align-top" colspan="2">
        <div class="price-block font-600" style="width: 70%">
          Rp {{priceFormat($total)}}
        </div>
        @if($transaction->note)
        <div class="note-block" style="width: 75%">
          <p class="text-grey-1 text-bold" style="margin-block-end:0;">Catatan:</p>
          <p class="text-grey-1 small-text" style="margin-block-start: .2rem; margin-block-end:0;">{{ $transaction->note ?? "-" }}</p>
          {{-- <p class="text-grey-1 small-text" style="margin-block-start: .2rem; margin-block-end:0;">Sesuai dengan perjanjian Nomor : 421/SP-BINSUS/BTW-BALI-2023 Bahwa 1). BTW Edutech tidak memberikan janji atau jaminan
dalam bentuk apapun untuk kelulusan peserta didik dalam setiap seleksi masuk Perguruan Tinggi Kedinasan; 2). BTW Edutech
bersedia mengembalikan biaya yang dikerluarkan peserta didik apabila yang bersangkutan tidak lulus dalam proses seleksi
Perguruan Tinggi Kedinasan, dengan syarat & ketentuan sebagaimanan dimaksud pada perjanjian yang telah ditandatangani para
pihak.</p> --}}
        </div>
        @endif
        {{-- <p style="color: grey">

        </p> --}}
      </td>

      <td colspan="2" class="text-right">
        <div class="qr-block">
          <p>{{Carbon\Carbon::parse($transaction->created_at ?? '')->format('d F Y')}}</p>
          <br>
          @php
            $downloadId = $transaction->id ?? '';
            $downloadUrl = "/file/kwitansi/{$downloadId}/pdf?token=". env('DOWNLOAD_FILE_TOKEN');
          @endphp
          {!! QrCode::size(120)->generate(url($downloadUrl)); !!}

          <p>{{$transaction->created_by ?? ''}}</p>
        </div>
      </td>
    </tr>
  </table>

  <br>
  <br>
  {{-- <p style="color: #878787; font-size: .8em; margin-bottom: 6px">
    <b>Catatan:</b>
  </p>
  <div class="small-text">
    <ol style="margin-block-start: 0 !important; padding-left: 12px !important; line-height: 1.7;">
      @if($isBinsusBill)
      <li>
        Sesuai dengan surat perjanjian nomor: 118/BTW-BALI/VI/2022
      </li>
      @endif
      <li>
        Bimbel BTW adalah lembaga bimbel dibawah naungan BTW Edutech (PT. Bina Taruna Wiratama) yang murni memberikan bimbingan belajar dan pelatihan kepada siswa dalam mempersiapkan diri mengikuti berbagai tahapan seleksi masuk PTK, PTN,  CPNS, TNI & POLRI.
      </li>
      <li>
        Biaya yang dibayarkan adalah murni biaya bimbingan belajar dan pelatihan sesuai program yang diikuti.
      </li>
      <li>
        Tidak ada pengembalian biaya apabila siswa yang bersangkutan tidak lulus dalam tahapan seleksi yang diikuti.
      </li>
      <li>
        Bimbel BTW tidak menjamin kelulusan siswa bimbel dalam seleksi yang diikuti.
      </li>
      <li>
        Segala bentuk pembayaran akan diberikan kwitansi resmi dari BTW Edutech (PT. Bina Taruna Wiratama).
      </li>
      <li>
        Kwitansi ini telah dikeluarkan secara elektronik dan dijamin keabsahannya dengan melakukan
      scan pada QR Code yang disediakan
      </li>
    </ol>
    <br>
  </div> --}}

  <div style="text-align: justify">
      <p class="text-grey-1 text-bold" style="font-size: 1em; margin-bottom: 6px;">Untuk di perhatikan:</p>
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

  <script>
    window.print();
  </script>
</body>

</html>

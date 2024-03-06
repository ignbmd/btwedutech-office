@php
  $date = $is_preview ? Carbon\Carbon::now()->locale('id') : Carbon\Carbon::parse($created_at)->locale('id');
  $day = $date->day;
  $month = $date->monthName;
  $year = $date->year;
  $downloadUrl = !$is_preview ? "/bukti-pembayaran-cash/{$proof_id}/download?token=". env('DOWNLOAD_FILE_TOKEN') : null;
  function priceFormat($num) {
      return number_format($num, 0, ",", ".");
  }
@endphp

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>{{ isset($ref_number) ? "Bukti Terima Uang - $ref_number" : "Bukti Terima Uang" }}</title>
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
      height: 330mm;
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
      margin: 0 auto;
      text-align: center;
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

    #footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
    }

    .qr-block {
      width: 300px;
      margin-left: auto;
      text-align: center;
    }

    .created-by-block {
      width: 300px;
      text-align: center;
    }

    .qr-block p, .created-by-block p {
      margin-bottom: 5px;
    }

    .price-block {
      border: 1px solid #000;
      padding: 10px;
      margin-top: 20px;
    }

    .note-block {
      margin-top: 20px;
      padding: 2px 10px;
      border-left: 7px solid #ccc;
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
      font-size: .7rem;
    }

    .watermark {
      border-width: 6px;
      border-style: solid;
      border-color: #cccccc;
      border-radius: 8px;
      color: #cccccc;
      opacity:0.6;
      position: absolute;
      z-index: 1;
      left:40%;
      top: 40%;
      padding: 10px;
      font-size: 60pt;
      transform: rotate(-45deg);
      -webkit-transform: rotate(-45deg);
      -ms-transform: rotate(-45deg);
    }

      .text-grey-1 {
        color: #878787;
      }

      .text-grey-2 {
        color: rgb(164, 164, 164);
      }

    @media print {
      html,
      body {
        font-family: "Montserrat", sans-serif;
        padding: 15px;
      }

      .note-block {
          background-color: #eaeaea !important;
          -webkit-print-color-adjust: exact;
      }
      .text-grey-1 {
        color: #878787;
        -webkit-print-color-adjust: exact;
      }

      .text-grey-2 {
        color: rgb(164, 164, 164);
        -webkit-print-color-adjust: exact;
      }

      .watermark {
        border-width: 6px;
        border-style: solid;
        border-color: #cccccc;
        border-radius: 8px;
        color: #cccccc;
        opacity:0.6;
        position: absolute;
        z-index: 1;
        left:20%;
        top:40%;
        padding: 10px;
        font-size: 60pt;
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
        -ms-transform: rotate(-45deg);
        -webkit-print-color-adjust: exact;
      }

      #footer {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
      }

    }
  </style>
</head>

<body>

  <table>

    <tr>
      <td class="vertical-align-top" width="60%">
        <img src="https://btw-cdn.com/assets/office/logo/btw-edutech-red-text-full.svg" width="200" />
        <div class="receipt-header-detail font-800" style="margin-top: 50px">
          Surat Tanda Terima Uang
          {{-- <b>Kwitansi dikeluarkan oleh:</b>
          <div class="contact">
            <p style="color: rgb(110, 110, 110); font-weight:bold">
              {{$branch->name ?? ''}}
            </p>
            <span style="white-space: normal; line-height: 150%">{{$branch->address ?? ''}}</span> --}}
          </div>
        </div>
      </td>
    </tr>

  </table>

  <table>

    @if(!$is_preview)
      <tr class="receipt-body-row first">
        <td width="30%">
          No.
        </td>
        <td width="10px">
          :
        </td>
        <td>
          {{ $ref_number }}
        </td>
      </tr>
    @endif

    <tr class="receipt-body-row {{ $is_preview ? 'first' : '' }}">
      <td width="30%">
        Tanggal
      </td>
      <td width="10px">
        :
      </td>
      <td>
        {{ $day }} {{ $month }} {{ $year }}
      </td>
    </tr>

    <tr class="receipt-body-row">
      <td width="30%">
        Nominal
      </td>
      <td width="10px">
        :
      </td>
      <td>
        Rp. {{ priceFormat($amount) }}
      </td>
    </tr>

    <tr class="receipt-body-row">
      <td width="30%">
        Terbilang
      </td>
      <td width="10px">
        :
      </td>
      <td style="text-transform: capitalize">
        {{ $amount_text }}
      </td>
    </tr>

    <tr class="receipt-body-row">
      <td width="30%">
        Keterangan
      </td>
      <td width="10px">
        :
      </td>
      <td>
        {{ $payment_for }}
      </td>
    </tr>
  </table>

  {{-- <table border="1" style="margin-top:40px; text-align: center;">
    <tr>
      <th>No</th>
      <th>Jenis Penerimaan</th>
      <th>No Cek / BG</th>
      <th>Jumlah</th>
      <th>Keterangan</th>
    </tr>
    <tr>
      <td>1</td>
      <td>CASH</td>
      <td>&nbsp;</td>
      <td>Rp {{ priceFormat($amount) }}</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td colspan="3">Total</td>
      <td>Rp {{ priceFormat($amount) }}</td>
      <td>&nbsp;</td>
    </tr>
  </table> --}}

  {{-- <table style="margin-top: 20px; border-top: 1px solid black; border-bottom: 1px solid black;">
    <tr class="receipt-body-row">
      <td width="30%">
        Terbilang
      </td>
      <td width="10px">
        :
      </td>
      <td style="text-transform: capitalize">
        {{ $amount_text }}
      </td>
    </tr>
  </table> --}}

  @if($is_preview) <div class="watermark">PREVIEW</div> @endif

  <table style="margin-top: 50px;">
    <tr id="footer-row">
      <td colspan="2">
        <div class="created-by-block">
          <p>Yang Menerima</p>
          <br><br><br><br><br>
          <p>{{ $name }}</p>
        </div>
      </td>
      <td colspan="2" class="text-right">
        <div class="qr-block">
          {{-- <p>{{ $day }} {{ $month }} {{ $year }}</p> --}}
          <p>Yang Menyerahkan</p>
          <br><br><br><br><br>
          <p>Nicole Marie Hostiadi</p>
        </div>
      </td>
    </tr>
  </table>
  <br>
  <br>

  {{-- <p class="text-grey-1" style="font-size: .8em; margin-bottom: 6px">
    <b>Catatan:</b>
  </p>
  <div class="small-text">
    <ol style="margin-block-start: 0 !important; padding-left: 12px !important; line-height: 1.7;">
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
        Segala bentuk pembayaran akan diberikan kuitansi resmi dari BTW Edutech (PT. Bina Taruna Wiratama).
      </li>
      <li>
        Kwitansi ini telah dikeluarkan secara elektronik dan dijamin keabsahannya dengan melakukan
      scan pada QR Code yang disediakan
      </li>
    </ol>
    <br>
  </div>
  <br><br> --}}

  {{-- footer --}}
  <div id='footer' class="contact text-grey-1">
    <div>
      PT Bina Taruna Wiratama
    </div>
    <div>
        <span>
            <img style="width: 15px" src="https://btw-cdn.com/assets/edutech/icons/telp-outline-black.svg">
            (0361) 270128
        </span>
        <span style="margin-left: 10px">
            <img style="width: 15px" src="https://btw-cdn.com/assets/edutech/icons/envelope-outline-black.svg">
            tanya@btwedutech.com
        </span>
        <span style="margin-left: 10px">
          <img style="width: 15px" src="https://btw-cdn.com/assets/edutech/icons/www-outline-black.svg">
          www.btwedutech.com
      </span>
    </div>
    <div>
        <div>Jl. Bypass Ngurah Rai No.176, Sanur Kaja Kota Denpasar, Bali - 80228</div>
    </div>
  </div>

  {{-- <table>

    <tr>
      <td class="text-right" width="100%">
        <div class="receipt-header-detail">
          <p class="font-600 text-grey-1">PT. Bina Taruna Wiratama</p>
          <div class="contact text-grey-2">
            <p>tanya@btwedutech.com</p>
            <p>Jl. Bypass Ngurah Rai No.176, Sanur Kaja</p>
            <p>Denpasar Selatan, Kota Denpasar, Bali 80228</p>
            <p>(0361) 270128</p>
          </div>
        </div>
      </td>
    </tr>

  </table> --}}

  <script>
    window.print();
    window.onafterprint = () => top.window.close();
  </script>
</body>

</html>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
    <style>
      /* devanagari */
      @font-face {
        font-family: "Poppins";
        font-style: normal;
        font-weight: 400;
        src: url("https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrFJA.ttf")
          format("truetype");
      }

      @page {
        margin: 0;
      }

      html,
      body {
        margin: 0 !important;
      }

      *,
      body {
        font-family: "Poppins", sans-serif !important;
      }

      .header {
        background: #6263f2;
        width: 100%;
      }

      .header td {
        padding: 20px 40px;
      }

      .header .title {
        text-transform: uppercase;
        color: white;
        font-weight: bold;
        font-size: 1.2rem;
      }

      .content {
        margin: 0 40px;
      }

      .info {
        margin-top: 20px;
      }

      .module {
        border-radius: 10px;
        width: 100%;
        margin-top: 20px;
      }

      .custom-table {
        width: 100%;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #d9dbe9;
        border-collapse: collapse;
      }

      .custom-table .head {
        background: #6263f2;
        color: white;
        text-transform: capitalize;
        font-weight: bold;
      }

      .custom-able .head th {
        text-align: center;
      }

      .custom-table th,
      .custom-table td {
        padding: 10px;
        border: 1px solid #d9dbe9;
      }

      .text-green {
        color: #00ba88;
      }

      .text-red {
        color: #ed2e7e;
      }

      #footer {
        text-align: right;
        margin-top: 100px;
      }
    </style>
  </head>

  <body>
    <table class="header">
      <tr>
        <td class="title">
          <h2>
            RANKING SISWA TPS IRT
          </h2>
        </td>
        <td style="text-align: right; color: white;">
          <img
            style="width: 150px;"
            src="https://btw-cdn.com/assets/v3/logo/smartbtw-small-white-text.png"
          />
          <div style="margin-top: 4px;">
            <span>
              <img
                style="width: 15px;"
                src="https://btw-cdn.com/assets/v3/icons/whatsapp-outline-white.png"
              />
              0822 6000 8545
            </span>
            <span style="margin-left: 10px;">
              <img
                style="width: 15px;"
                src="https://btw-cdn.com/assets/v3/icons/globe-outline-white.png"
              />
              www.smartbtw.com
            </span>
          </div>
        </td>
      </tr>
    </table>

    <br />
    <div style="text-align: center;">
      <h2 style="margin-bottom: 0;">{{ $title }}</h2>
      <h3 style="margin-top: 0; font-weight: normal;">
        Tanggal {{ $date }}
      </h3>
    </div>
    <br />

    <div class="content">
      <table class="items custom-table" style="margin-top: 20px;">
        <tr class="head">
          <th>No.</th>
          <th>Nama</th>
          <th>Lokasi</th>
          <th>Mulai Mengerjakan</th>
          <th>Selesai Mengerjakan</th>
          <th>Lama Mengerjakan</th>
          <th>Potensi Kognitif</th>
          <th>Penalaran Matematika</th>
          <th>Literasi Bahasa Indonesia</th>
          <th>Literasi Bahasa Inggris</th>
          <th>Total Nilai</th>
        </tr>
        @foreach($ranking as $index => $data)
          <tr>
            <td style="text-align: center;">{{ $data->pos }}</td>
            <td>{{ $data->name }}</td>
            <td style="text-align: center;">{{ $data->branch_name ?? "-" }}</td>
            <td style="text-align: center;">{{ $data->start }}</td>
            <td style="text-align: center;">{{ $data->end }}</td>
            <td style="text-align: center;">{{ $data->duration }}</td>
            @foreach($data->score ?? [] as $scoreIndex => $scoreValue)
              <td style="text-align: center;">{{ $scoreValue->score }}</td>
            @endforeach
            <td style="text-align: center;" >{{ $data->total_score }}</td>
          </tr>
        @endforeach
      </table>

      <div id="footer">
        <div>
          <img
            style="height: 30px;"
            src="https://btw-cdn.com/assets/edutech/logo/edutech-black-text.svg"
            alt=""
          />
        </div>
        <div>
          <span>
            <img
              style="width: 15px;"
              src="https://btw-cdn.com/assets/edutech/icons/telp-outline-black.svg"
            />
            0822 6000 8545
          </span>
          <span style="margin-left: 10px;">
            <img
              style="width: 15px;"
              src="https://btw-cdn.com/assets/edutech/icons/envelope-outline-black.svg"
            />
            tanya@btwedutech.com
          </span>
        </div>
        <div>
          <span>
            <img
              style="width: 15px;"
              src="https://btw-cdn.com/assets/edutech/icons/www-outline-black.svg"
            />
            www.smartbtw.com
          </span>
        </div>
        <div>
          <div>Jl. Bypass Ngurah Rai No.176, Sanur Kaja,</div>
          <div>Kota Denpasar, Bali - 80228</div>
        </div>
        <div style="font-size: 12px;">
          © Copyright 2021 PT. Bina Taruna Wiratama. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>

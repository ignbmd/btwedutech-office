<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>LAPORAN REKAPITULASI PERKEMBANGAN SISWA KELAS BTW EDUTECH</title>

    <style>
      @font-face {
        font-family: "VisbyRoundRegular";
        src: url("https://btw-cdn.com/assets/btw-edutech/fonts/VisbyRoundCF/VisbyRoundCF-Regular.ttf")
            formatformat("truetype");
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: "VisbyRoundMedium";
        src: url("https://btw-cdn.com/assets/btw-edutech/fonts/VisbyRoundCF/VisbyRoundCF-Medium.ttf")
            format("truetype");
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: "VisbyRoundDemiBold";
        src: url("https://btw-cdn.com/assets/btw-edutech/fonts/VisbyRoundCF/VisbyRoundCF-DemiBold.ttf")
            format("truetype");
        font-weight: 600;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: "VisbyRoundBold";
        src: url("https://btw-cdn.com/assets/btw-edutech/fonts/VisbyRoundCF/VisbyRoundCF-Bold.ttf")
            format("truetype");
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: "VisbyRoundExtraBold";
        src: url("https://btw-cdn.com/assets/btw-edutech/fonts/VisbyRoundCF/VisbyRoundCF-ExtraBold.ttf")
            format("truetype");
        font-weight: 800;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: "VisbyRoundHeavy";
        src: url("https://btw-cdn.com/assets/btw-edutech/fonts/VisbyRoundCF/VisbyRoundCF-Heavy.ttf")
        format("truetype");
        font-weight: 900;
        font-style: normal;
        font-display: swap;
      }


      *,
      ::before,
      ::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: VisbyRoundMedium, sans-serif;
        color: #585858;
        font-size: 14px;
        font-weight: normal;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      th {
        font-weight: normal;
      }

      .w500 {
        font-weight: 500;
      }

      .w600 {
        font-weight: 600;
      }

      .w700 {
        font-weight: 700;
      }

      .w800 {
        font-weight: 800;
      }

      .container {
        padding: 25px;
      }

      .container-header {
        padding: 0px;
        margin: 0;
      }

     /* header {
         padding-right: 28px;
      }*/

      #header-title {
        color: white;
        min-width: 339px;
        /* width: 339px; */
        padding: 16px 25px;
        background-color: #476bd8;
        border-bottom-right-radius: 24px;
      }

      #header-title-p {
        max-width: 80%;
        font-size: 16px;
        font-family: VisbyRoundBold;
      }

      #header-contact {
        max-width: 80%;
        min-width: 150px;
        font-size: 9.3px;
        padding: 10px 25px;
        background-color: #b7c9ff;
        font-family: VisbyRoundBold;
        border-bottom-right-radius: 24px;
      }

      #header-contact-p {
         margin-left: 8px;
      }

      #header-logo {
        width: 100%;
        margin: auto;
        display: flex;
        color: #1a1a1a;
        padding-right: 28px;
        padding-left: 20px;
        justify-content: end;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      .center {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .text-right {
        text-align: right;
      }

      .text-center {
        text-align: center;
      }

      .text-left {
        text-align: left;
      }

      #student-information-card {
        color: black;
        font-size: 12px;
        line-height: 20px;
        letter-spacing: 1%;
        margin-bottom: 35px;
        font-family: VisbyRoundDemiBold;
      }

      #learning-development-title {
        font-size: 13px;
        color: #476BD8;
        letter-spacing: 3%;
        margin-bottom: 8px;
        font-family: VisbyRoundDemiBold;
      }

      #learning-development-subtitle {
        font-size: 13px;
        color: #476BD8;
        letter-spacing: 1.5%;
        font-family: VisbyRoundMedium;
      }

      .card {
        border-radius: 12px;
        background-color: #F9f9f9;
        border: 2px solid #f1f1f1;
      }

      .card #sub-item {
        width: 33.3%;
        padding: 12px;
        border-right: 2px solid #f1f1f1;
      }

      .card #last-sub-item {
        width: 33.3%;
        padding: 12px;
      }

      .card #familiarity-passed {
        color: #FF5151 ;
      }

      .card #familiarity-failed {
        color: #10BB67 ;
      }

      #familiarity{
        text-align: center;
        border: 2px solid #F1F1F1;
        border-radius: 6px;
      }

      #card-familiarity{
        border-right: 2px solid #F1F1F1;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
      }

      #first-col {
        padding: 8px;
        color: white;
        font-size: 12px;
        letter-spacing: 0.015em;
        background-color: #476BD8;
        border-top-left-radius: 6px;
        border-right: 2px solid #F1F1F1;
        font-family: 'VisbyRoundDemiBold';
      }

      .col {
        padding: 8px;
        color: white;
        font-size: 12px;
        letter-spacing: 0.015em;
        background-color: #476BD8;
        border-right: 2px solid #F1F1F1;
        font-family: 'VisbyRoundDemiBold';
      }

      #last-col {
        background-color: #476BD8;
        color: white;
        padding: 8px;
        border-top-right-radius: 6px;
        font-family: 'VisbyRoundDemiBold';
        font-size: 12px;
        letter-spacing: 0.015em;
      }

      #first-col-content {
        padding: 8px;
        font-size: 12px;
        color: #476BD8;
        letter-spacing: 0.015em;
        background-color: white;
        border-bottom-left-radius: 6px;
        border-right: 2px solid #F1F1F1;
        border-top: 0;
        font-family: 'VisbyRoundDemiBold';
      }

      .col-content {
        padding: 8px;
        font-size: 12px;
        color: #476BD8;
        letter-spacing: 0.015em;
        background-color: #F9F9F9;
        border-right: 2px solid #F1F1F1;
        font-family: 'VisbyRoundDemiBold';
      }

      #last-col-content {
        padding: 8px;
        font-size: 12px;
        color: #476BD8;
        letter-spacing: 0.015em;
        background-color: #F9F9F9;
        font-family: 'VisbyRoundDemiBold';
      }

      .card .card-title {
        font-size: 16px;
        line-height: 18px;
        margin-bottom: 2px;
        font-size: #474747;
        letter-spacing: 0.015em;
        font-family: VisbyRoundBold;
      }

      .card .description {
        font-size: 9px;
        line-height: 12px;
        letter-spacing: 0.03em;
        font-family: VisbyRoundDemiBold ;
      }

      footer {
        background-color: white;
      }

      footer table,
      footer table img {
        vertical-align: middle;
      }

      #footer-copyright {
        width: 100%;
        padding: 5px 0;
        font-size: 7px;
        color: #949494;
        text-align: center;
        background-color: #f9f9f9;
        font-family: VisbyRoundMedium;
      }
    </style>
  </head>
  <body>
    <header class="container-header">
      <table style="background-color: #e8edff;">
        <tr>
          <td style="background: #b7c9ff; min-width: 339px">
            <div id="header-title">
              <h1 id="header-title-p">
                LAPORAN HASIL PERKEMBANGAN BELAJAR
              </h1>
            </div>
          </td>
          <td id="header-contact">
            <table>
              <tr>
                <td style="padding-bottom: 6px;">
                  <figure class="center">
                    <img
                      src="https://btw-cdn.com/assets/btw-edutech/icons/pdf/globe.svg"
                      alt="Website"
                      width="11"
                      height="11"
                      class="center"
                    />
                  </figure>
                </td>
                <td style="padding-bottom: 6px;">
                  <p id="header-contact-p">
                    www.btwedutech.com
                  </p>
                </td>
              </tr>
              <tr>
                <td>
                  <figure class="center">
                    <img
                      src="https://btw-cdn.com/assets/btw-edutech/icons/pdf/phone_call.svg"
                      alt="Phone Icon"
                      width="11"
                      height="11"
                      class="center"
                    />
                  </figure>
                </td>
                <td>
                  <p id="header-contact-p">
                    0822 6000 8545
                  </p>
                </td>
              </tr>
            </table>
          </td>
          <td>
            <figure id="header-logo">
              <img
                src="https://btw-cdn.com/assets/btw-edutech/logo/btwedutech-2023.png"
                alt="BTW Edutech"
                width="50"
                class="center"
              />
            </figure>
          </td>
        </tr>
      </table>
    </header>

    <div class="container" style="min-height: 768px">
      <div id="student-information-card">
        <table>
          <tr>
            <td style="width: 108px">Nama</td>
            <td>:</td>
            <td>Jessica Alexandra</td>
          </tr>
          <tr>
            <td style="width: 108px">Seleksi</td>
            <td>:</td>
            <td>SKD / CPNS</td>
          </tr>
          <tr>
            <td style="width: 108px">Posisi Laporan</td>
            <td>:</td>
            <td>Selasa, 23 Mei 2023</td>
          </tr>
        </table>
      </div>
      <div>
        <div style="margin-bottom: 44px;">
          <p id="learning-development-title" >1. Pengayaan Soal
            <span id="learning-development-subtitle">
            (Akses Pembahasan)
            </span>
          </p>
          <div class="card" id="discussion-card">
            <table>
              <tr>
                <td id="sub-item">
                  <div>
                    <p class="card-title">TWK: 45%</p>
                    <p class="description">Total Pembahasan soal diakses: 121 <br />
                      Dari total soal seluruhnya: 1314</p>
                  </div>
                </td>
                <td id="sub-item">
                  <div>
                    <p class="card-title">TIU: 22%</p>
                    <p class="description">Total Pembahasan soal diakses: 121 <br />
                        Dari total soal seluruhnya: 1314</p>
                  </div>
                </td>
                <td id="last-sub-item">
                  <div>
                    <p class="card-title">TKP: 103%</p>
                    <p class="description">Total Pembahasan soal diakses: 121 <br />
                      Dari total soal seluruhnya: 1314</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div style="margin-bottom: 44px;">
          <p id="learning-development-title" >2. Pembiasaan Sistim Ujian
          </p>
          <div id="familiarity">
            <table>
              <tr>
                <th id="first-col">UKA Diterima</th>
                <th class="col">UKA Dikerjakan</th>
                <th class="col">Lulus UKA</th>
                <th class="col">Kepatuhan</th>
                <th class="col">Kelulusan</th>
                <th id="last-col">Rata-rata total</th>
              </tr>
              <tr>
                <td id="first-col-content">32</td>
                <td class="col-content">13</td>
                <td class="col-content">8</td>
                <td class="col-content">87%</td>
                <td class="col-content">92%</td>
                <td id="last-col-content">16%</td>
              </tr>
            </table>
          </div>
          <div>
            <p style="color: #1A1A1A; font-family: VisbyRoundBold; font-size: 9px; letter-spacing: 3%; text-transform: uppercase;margin-top: 18px;">Keterangan:</p>
            <ul style="padding-left: 18px;">
              <li><span style="font-family: VisbyRoundBold; font-size: 10px; letter-spacing: 1%;">Rata-Rata Total =</span> <span style="color: black; font-family: VisbyRoundMedium; font-weight: 400; font-size: 9px; letter-spacing: 3%;">Total Nilai TWK / Jumlah Modul Dikerjakan</span></li>
            </ul>
          </div>
        </div>
        <div style="margin-bottom: 44px;">
          <p id="learning-development-title" >3. Strategi Optimasi Waktu
            <span id="learning-development-subtitle">
                (Rata-rata waktu mengerjakan)
            </span>
          </p>
          <div class="card" id="time-optimazation-strategy">
              <table>
                  <tr>
                    <td id="sub-item">
                      <div>
                        <p class="card-title">TWK: <span id="familiarity-passed">34:50</span></p>
                        <p class="description">Waktu yang direkomendasikan:<br /> 35 Menit (dengan toleransi </br>
                            -+ 3,5 Menit)</p>
                      </div>
                    </td>
                    <td id="sub-item">
                      <div>
                        <p class="card-title">TIU: <span id="familiarity-failed">35:10</span></p>
                        <p class="description">Waktu yang direkomendasikan:<br /> 35 Menit (dengan toleransi </br>
                            -+ 3,5 Menit)</p>
                      </div>
                    </td>
                    <td id=last-sub-item>
                      <div>
                        <p class="card-title">TKP: <span id="familiarity-passed">37:12</span></p>
                        <p class="description">Waktu yang direkomendasikan:<br /> 25 Menit (dengan toleransi </br>
                            -+ 2,5 Menit)</p>
                      </div>
                    </td>
                  </tr>
                </table>
          </div>
          <div>
              <p style="color: #1A1A1A; font-family: VisbyRoundBold; font-size: 9px; letter-spacing: 3%; text-transform: uppercase;
              margin-bottom: 4px; margin-top: 18px">Keterangan:</p>
              <table>
                <tr>
                  <td>
                    <div style="width:8px; height:8px; border-radius: 2px; background-color: #10BB67; margin-bottom: 8px; "></div>
                  </td>
                  <td><p style="color: black; font-family: VisbyRoundDemiBold; font-size: 10px; letter-spacing: 3%;
                  margin-bottom: 8px;
                  color: #6C6C6C;">Pengerjaan Sesuai waktu yang direkomendasikan</p></td>
                </tr>
                <tr>
                  <td>
                    <div style="width:8px; height:8px; border-radius: 2px; background-color: #FF5151;
                    "></div>
                  </td>
                  <td><p style="color: black; font-family: VisbyRoundDemiBold; font-size: 10px; letter-spacing: 3%;
                  line-height: 12px;
                  color: #6C6C6C;">Pengerjaan dibawah atau melebihi waktu yang direkomendasikan</p></td>
                </tr>
              </table>
          </div>
        </div>
      </div>
    </div>
    <footer>
      <div style="margin: 16px 25px;">
        <table style="width: 60%">
          <td>
            <figure>
              <img
                src="https://btw-cdn.com/assets/btw-edutech/logo/btwedutech-2023.png"
                alt="BTW Edutech"
                width="56"
              />
            </figure>
          </td>
          <td>
            <div style="padding-left: 12px;">
              <p
                style="
                  color: #232324;
                  font-family: VisbyRoundBold;
                  font-size: 8px;
                "
              >
                PT. Bina Taruna Wiratama
              </p>
              <table>
                <tr>
                  <td style="width: 10px">
                    <figure>
                      <img
                        src="https://btw-cdn.com/assets/btw-edutech/icons/pdf/phone_call.svg"
                        alt="Phone Icon"
                        width="9"
                        class="center"
                        style="width: 9px"
                      />
                    </figure>
                  </td>
                  <td>
                    <p style="
                    margin-left: 2px;
                    font-family: VisbyRoundMedium;
                    font-size: 7.56px;
                    width: 65px;
                    line-height: 20px;
                  "">
                      0822 6000 8545
                    </p>
                  </td>
                  <td style="width: 10px">
                    <figure>
                      <img
                        src="https://btw-cdn.com/assets/btw-edutech/icons/pdf/mail.svg"
                        alt="Mail Icon"
                        width="9"
                        class="center"
                        style="width: 9px"
                      />
                    </figure>
                  </td>
                  <td>
                    <p style="
                    margin-left: 2px;
                    font-family: VisbyRoundMedium;
                    font-size: 7.56px;
                    width: 93px;
                    line-height: 20px;
                  "">
                      tanya@btwedutech.com
                    </p>
                  </td>
                  <td style="width: 10px">
                    <figure>
                      <img
                        src="https://btw-cdn.com/assets/btw-edutech/icons/pdf/globe.svg"
                        alt="Website"
                        class="center"
                        style="width: 9px"
                      />
                    </figure>
                  </td>
                  <td>
                    <p style="
                    margin-left: 2px;
                    font-family: VisbyRoundMedium;
                    font-size: 7.56px;
                    width: 100px;
                    line-height: 20px;
                  "">
                      www.btwedutech.com
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #4E4B66; font-family: VisbyRoundMedium;
              font-size: 7.56px;">Jl. Bypass Ngurah Rai No. 176, Sanur Kaja, Kota Denpasar, Bali - 80228</p>
            </div>
          </td>
        </table>
      </div>
      <div id="footer-copyright">
        <p>© Copyright 2023 PT. Bina Taruna Wiratama. All rights reserved.</p>
      </div>
    </footer>
  </body>
</html>

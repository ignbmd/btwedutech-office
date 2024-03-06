<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Peta Persaingan Tryout - {{ $tryout_title }} - {{ $tryout_date }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Poppins', sans-serif !important;
        }

        body {
            margin: 0;
        }

        .header {
            background: #6263F2;
            width: 100%;
        }

        .header td {
            padding: 20px 40px;
        }

        .header .title {
            text-transform: uppercase;
            color: white;
            font-weight: bold;
            font-size: 1rem;
        }

        .content {
            margin: 0 50px;
        }

        table.info {
            margin-top: 30px;
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
            border-collapse: collapse;
        }

        .custom-table .head {
            background: #6263F2;
            color: white;
            text-transform: capitalize;
            font-weight: bold;
        }

        .custom-table .head th {
            text-align: center;
        }

        .custom-table th,
        .custom-table td {
            border: 1px solid #D9DBE9;
        }

        .custom-table th {
            padding: 10px;
        }

        .custom-table td {
            height: 50px;
            padding: 5px;
        }

        .text-green {
            color: #00966D;
        }

        .text-red {
            color: #ED2E7E;
        }

        .bg-gray {
            background-color: #f7f7f7;
        }

        .bg-highlight {
            background-color: #B2B3FF;
        }

        table.custom-table tbody tr,
        table.custom-table tbody td {
            word-break: break-word;
            font-weight: 600;
        }

        #footer {
            text-align: right;
            margin: 20px 50px;
        }

        ul li {
            padding-bottom: 5px;
        }

        table {
            font-size: .80rem !important;
        }

        .th-second-row {
            background: #6263F2;
            color: white;
        }
    </style>
</head>

<body>
    {{-- Header --}}
    <table class="header">
        <tr>
            <td class="title">
                Peta Persaingan Tryout - {{ $tryout_title }} - {{ $tryout_date }}
            </td>
            <td style="text-align: right; color: white">
                <img style="width: 150px;" src="https://btw-cdn.com/assets/v3/logo/smartbtw-small-white-text.png">
                <div style="margin-top: 4px">
                    {{-- Contacts --}}
                    <span>
                        <img style="width: 15px" src="https://btw-cdn.com/assets/v3/icons/whatsapp-outline-white.png">
                        0822 6000 8545
                    </span>
                    <span style="margin-left: 10px">
                        <img style="width: 15px" src="https://btw-cdn.com/assets/v3/icons/globe-outline-white.png">
                        www.smartbtw.com
                    </span>
                </div>
            </td>
        </tr>
    </table>

    <div class="content">

        <table class="info">
            <tr>
                <td><strong>Tryout</strong></td>
                <td>: {{ $tryout_title }}</td>
            </tr>
            <tr>
                <td style="width: 20%"><strong>Tanggal &nbsp;&nbsp;</strong></td>
                <td style="width: 80%">: {{ $tryout_date }}</td>
            </tr>
        </table>

        <table class="items custom-table" style="margin-top: 20px">
            <tr class="head">
                <th rowspan="2" width="15%">Nama</th>
                <th rowspan="2" width="4%">TWK</th>
                <th rowspan="2" width="4%">TIU</th>
                <th rowspan="2" width="4%">TKP</th>
                <th rowspan="2" width="4%">Total</th>
                <th rowspan="2" width="4%">Status</th>
                <th rowspan="2" width="15%">Sekolah</th>
                <th rowspan="2" width="15%">Jurusan</th>
                <th rowspan="2" width="4%">Kuota</th>
                <th rowspan="2" width="4%">Ranking</th>
            </tr>
            <tbody style="text-align: center">
                @if ($allData)
                    @foreach ($allData as $data)
                        <tr class={{ $data->gray == true ? 'bg-gray' : null }}>
                            <td>{{ $data->name }}</td>
                            <td>{{ $data->twk }}</td>
                            <td>{{ $data->tiu }}</td>
                            <td>{{ $data->tkp }}</td>
                            <td>{{ $data->total }}</td>
                            <td class={{ $data->status == 'TIDAK LULUS' ? 'text-red' : 'text-green' }}>
                                {{ $data->status }}</td>
                            <td>{{ $data->sekolah }}</td>
                            <td>{{ $data->jurusan }}</td>
                            <td>{{ $data->kuota }}</td>
                            <td>{{ $data->ranking }}</td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td class="text-center" colspan="15">Data kosong</td>
                    </tr>
                @endif
            </tbody>
        </table>
    </div>

    {{-- Description --}}
    {{-- <div class="content">
        <ul style="padding-left: 20px">
            <li><strong>Rata-rata TWK =</strong> Total Jumlah Nilai TWK / Jumlah Modul Diterima</li>
            <li><strong>Rata-rata TIU =</strong> Total Jumlah Nilai TIU / Jumlah Modul Diterima</li>
            <li><strong>Rata-rata TKP =</strong> Total Jumlah Nilai TKP / Jumlah Modul Diterima</li>
            <li><strong>Rata-rata SKD =</strong> Total Jumlah SKD / Jumlah Modul Diterima</li>
            <li><strong>Selisih =</strong> Pengurangan dari Nilai BKN dan Rata-rata</li>
        </ul>
    </div> --}}

    {{-- footer --}}
    <div id='footer'>
        <div>
            <img style="height: 30px" src="https://btw-cdn.com/assets/edutech/logo/edutech-black-text.svg"
                alt="">
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
        </div>
        <div>
            <span>
                <img style="width: 15px" src="https://btw-cdn.com/assets/edutech/icons/www-outline-black.svg">
                www.btwedutech.com
            </span>
        </div>
        <div>
            <div>Jl. Bypass Ngurah Rai No.176, Sanur Kaja,</div>
            <div>Kota Denpasar, Bali - 80228</div>
        </div>
        <div style="font-size: 12px">
            © Copyright 2021 PT. Bina Taruna Wiratama. All rights reserved.
        </div>
    </div>
</body>

</html>

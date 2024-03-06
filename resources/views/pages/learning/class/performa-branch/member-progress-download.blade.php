<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ 'Laporan Rekapitulasi Perkembangan Siswa Kelas SmartBTW - ' . $classTitle }}</title>

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
            font-size: 1.2rem;

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
            margin: 0 50px;
        }

        ul li {
            padding-bottom: 5px;
        }
    </style>
</head>

<body>
    {{-- Header --}}
    <table class="header">
        <tr>
            <td class="title">
                Laporan Rekapitulasi Perkembangan Siswa Kelas SmartBTW
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
                <td><strong>Kelas</strong></td>
                <td>: {{ $classTitle }}</td>
            </tr>
            <tr>
                <td><strong>Program</strong></td>
                <td>: {{ $program === "tps" ? "TPS IRT" : "SKD (Seleksi Kompetensi Dasar)" }}</td>
            </tr>
            @if ($examType)
                <tr>
                    <td><strong>Tipe Laporan</strong></td>
                    <td>: {{ $examType }}</td>
                </tr>
            @endif
            <tr>
                <td style="width: 20%"><strong>Posisi Laporan &nbsp;&nbsp;</strong></td>
                <td style="width: 80%">:
                    {{ Carbon\Carbon::parse($payload['generated_at'])->locale('id')->translatedFormat('l, d F Y H:i:s') }}
                    WIB</td>
            </tr>
        </table>

        <table class="items custom-table" style="margin-top: 20px">
            <tr class="head">
                <th rowspan="2" width="4%">No</th>
                <th rowspan="2" width="15%">Nama</th>
                @if (count($class) > 1)
                    <th rowspan="2" width="10%">Kelas</th>
                @endif
                {{-- <th rowspan="2" width="15%">Email</th> --}}
                <th rowspan="2" width="8%">Modul Diterima</th>
                <th rowspan="2" width="8%">Modul Dikerjakan</th>
                <th rowspan="2" width="8%">Persentase Kepatuhan</th>
                @if($program !== "tps")
                  <th rowspan="2" width="8%">Persentase Kelulusan</th>
                  <th colspan="4" width="20%">Nilai Rata-rata</th>
                @else
                  <th colspan="5" width="15%">Nilai Rata-rata</th>
                @endif
                <th rowspan="2" width="8%">Rata-rata Mengerjakan</th>
                <th rowspan="2" width="8%">Total Mengerjakan</th>
            </tr>
            <tr class="head">
              @foreach($scoreKeys as $key)
                <th>{{$scoreKeysAbbreviation[$key]}}</th>
              @endforeach
              <th>{{ strtoupper($program) }}</th>
            </tr>
            <tbody>
                @php $no = 1 @endphp
                @foreach ($payload['results'] as $result)
                    <tr class="row" style="text-align: center">
                        <td>{{ $no++ }}</td>
                        <td class="{{ isset($orderBy) && $orderBy == "name" ? 'bg-highlight' : '' }}">
                            {{ $result->student->name }}</td>
                        @if (count($class) > 1)
                            <td class="{{ isset($orderBy) && $orderBy == 2 ? 'bg-highlight' : '' }}">
                                {{ $studentClasses[$result->student->smartbtw_id] }}</td>
                        @endif
                        {{-- <td class="{{ isset($orderBy) && $orderBy == 2 ? 'bg-highlight' : '' }}">{{ $result->student->email ?? '-' }}</td> --}}
                        <td class="{{ isset($orderBy) && $orderBy == "received-module" ? 'bg-highlight' : '' }}">
                            {{ $result->given }}</td>
                        <td class="{{ isset($orderBy) && $orderBy == "done-module" ? 'bg-highlight' : '' }}">
                            {{ $result->done }}</td>
                        <td class="{{ isset($orderBy) && $orderBy == "done-percent" ? 'bg-highlight' : '' }}">
                            {{ round($result->done_percent, 0) }}%</td>

                        @if($program !== "tps")
                          <td class="{{ isset($orderBy) && $orderBy == "passed-percent" ? 'bg-highlight' : '' }}">
                              {{ round($result->passed_percent, 0) }}%</td>
                          <td
                            class="{{ $result->subject->score_values && $result->subject->score_values->TWK->average_score > $nilaiMinimal->TWK
                                ? 'text-green'
                                : 'text-red' }} {{ isset($orderBy) && $orderBy == "average-0" ? 'bg-highlight' : '' }}">
                            {{ $result->subject->score_values->TWK->average_score }}
                          </td>
                          <td
                            class="{{ $result->subject->score_values && $result->subject->score_values->TIU->average_score > $nilaiMinimal->TIU
                                ? 'text-green'
                                : 'text-red' }} {{ isset($orderBy) && $orderBy == "average-1" ? 'bg-highlight' : '' }}">
                            {{ $result->subject->score_values->TIU->average_score }}
                          </td>
                          <td
                            class="{{ $result->subject->score_values && $result->subject->score_values->TKP->average_score > $nilaiMinimal->TKP
                                ? 'text-green'
                                : 'text-red' }} {{ isset($orderBy) && $orderBy == "average-2" ? 'bg-highlight' : '' }}">
                            {{ $result->subject->score_values->TKP->average_score }}
                          </td>

                        @else
                          @foreach($scoreKeys as $index => $keys)
                            <td
                              class="{{ isset($orderBy) && $orderBy == "average-$index" ? 'bg-highlight' : '' }}">
                              {{ $result->subject->score_values->{$keys}->average_score }}
                            </td>
                          @endforeach

                        @endif

                        @if($program !== "tps")
                          <td
                              class="{{ $result->subject->score_values &&
                              $result->subject->score_values->TWK->average_score > $nilaiMinimal->TWK &&
                              $result->subject->score_values->TIU->average_score > $nilaiMinimal->TIU &&
                              $result->subject->score_values->TKP->average_score > $nilaiMinimal->TKP
                                  ? 'text-green'
                                  : 'text-red' }} {{ isset($orderBy) && $orderBy == "average-total" ? 'bg-highlight' : '' }}">
                              {{ $result->subject->average_score }}
                          </td>
                        @else
                          <td
                            class="{{ isset($orderBy) && $orderBy == "average-total" ? 'bg-highlight' : '' }}">
                            {{ $result->subject->average_score }}
                          </td>
                        @endif

                        <td class="{{ isset($orderBy) && $orderBy == "average-try" ? 'bg-highlight' : '' }}">
                            {{ $result->report_average_try }}</td>
                        <td class="{{ isset($orderBy) && $orderBy == "repeat-total" ? 'bg-highlight' : '' }}">
                            {{ property_exists($result, 'report_repeat_sum')
                                ? ($result->report_repeat_sum > 0
                                    ? $result->report_repeat_sum . ' kali'
                                    : '0')
                                : '0' }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    {{-- Description --}}
    <div class="content">
        <ul style="padding-left: 20px">
            @foreach($scoreKeys as $key)
            <li><strong>Rata-rata {{ $key }} =</strong> Total Jumlah Nilai {{$key}} / Jumlah Modul Diterima</li>
            @endforeach
            <li><strong>Rata-rata Nilai Akhir =</strong> Total Jumlah Nilai Akhir / Jumlah Modul Diterima</li>
        </ul>
    </div>

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

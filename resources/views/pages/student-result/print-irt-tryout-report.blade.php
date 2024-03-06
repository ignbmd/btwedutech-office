<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>

        /* devanagari */
        @font-face {
            font-family: 'Poppins';
            font-style: normal;
            font-weight: 400;
            src: url('https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrFJA.ttf') format('truetype');
        }

        *, body {
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
            margin: 0 40px;
        }

        .info {
            margin-top: 20px;
        }

        .module{
            border-radius: 10px;
            width: 100%;
            margin-top: 20px;
        }

        .custom-table {
            width: 100%;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #D9DBE9;
            border-collapse: collapse
        }
        .custom-table .head {
            background: #6263F2;
            color: white;
            text-transform: capitalize;
            font-weight: bold;
        }
        .custom-able .head th {
            text-align: center;
        }
        .custom-table th, .custom-table td {
            padding: 10px;
            border: 1px solid #D9DBE9;
        }

        .text-green {
            color: #00BA88
        }

        .text-red {
            color: #ED2E7E;
        }

        #footer {
            text-align: right;
            margin-top: 100px;
        }
    </style>
</head>
<body>
    {{-- Header --}}
    <table class="header">
        <tr>
            <td class="title">
                Laporan Hasil Perkembangan Belajar TPS IRT
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
                <td>Nama</td>
                <td>: {{$user->name ?? ''}}</td>
            </tr>
            <tr>
                <td>Program</td>
                <td>: {{strtoupper("TPS IRT") ?? ''}}</td>
            </tr>
            <tr>
                <td width="20%">Posisi Laporan &nbsp;&nbsp;</td>
                @if($is_last_week_report)
                  <td width="80%">: {{ Carbon\Carbon::parse($start_date)->locale('id')->translatedFormat('l, d F Y') }} - {{ Carbon\Carbon::parse($end_date)->locale('id')->translatedFormat('l, d F Y') }}</td>
                @else
                  <td width="80%">: {{ Carbon\Carbon::now()->locale('id')->translatedFormat('l, d F Y') }}</td>
                @endif
            </tr>
        </table>

        <table class="module custom-table">
            <tr class="head">
                <th>Modul Diterima</th>
                <th>Modul Dikerjakan</th>
                <th>Kepatuhan Pengerjaan</th>
            </tr>
            <tr style="font-size: 1.5rem">
                <th>{{$report->given ?? 0}}</th>
                <th>{{$report->done ?? 0}}</th>
                <th>{{number_format($report->done_percent, 2) ?? 0}}% </th>
            </tr>
        </table>

        <table class="items custom-table" style="margin-top: 20px">
            @if (count($report->report ?? []) > 0)
                @if ($program != 'tka-campuran')
                    @php
                        $keys = $report->report[0]->score_keys ?? [];
                    @endphp
                    <tr class="head">
                        <th>Nama Modul</th>
                        <th>Tanggal Mulai Mengerjakan</th>
                        <th>Tanggal Selesai Mengerjakan</th>
                        <th>Lama Mengerjakan</th>
                        @foreach ($keys as $v)
                            <th style="word-wrap: break-word">{{str_replace("_", " ", $v)}}</th>
                        @endforeach
                        <th>Nilai Akhir</th>
                        <th>Total Mengerjakan</th>
                    </tr>
                    @foreach ($report->report as $r)

                    @php
                        $parsedStartDate = \Carbon\Carbon::parse($r->start)->timezone('Asia/Jakarta');
                        $parsedEndDate = \Carbon\Carbon::parse($r->end)->timezone('Asia/Jakarta');

                        $start = $parsedStartDate < $parsedEndDate
                            ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . " WIB"
                            : '-';

                        $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . " WIB";

                        $doneInterval = $parsedStartDate < $parsedEndDate
                            ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE])
                        : '-';
                    @endphp

                        <tr style="text-align: center">
                            <td>{{$r->title ?? ''}}</td>
                            <td>{{ $start ?? '' }}</td>
                            <td>{{ $end }}</td>
                            <td>{{ $doneInterval }}</td>
                            @foreach ($r->score_keys as $s)
                                <td>{{$r->score_values->$s->score ?? ''}}</td>
                            @endforeach
                            <td>{{$r->total_score ?? ''}}</td>
                            <td>{{$r->repeat ?? ''}} kali</td>
                        </tr>
                    @endforeach

                @else
                    @php
                        $saintekKeys = collect($report->report[0]->saintek->score ?? [])->map(fn ($s) => $s->category);
                        $soshumKeys = collect($report->report[0]->soshum->score ?? [])->map(fn ($s) => $s->category);
                    @endphp
                    {{-- TKA Campuran --}}
                    <tr class="head">
                        <th colspan="2" rowspan="2">Nama Modul</th>
                        <th rowspan="2">Tanggal Selesai Mengerjakan</th>
                        @foreach ($saintekKeys as $i => $v)
                            <th>{{$v}}</th>
                        @endforeach
                        <th rowspan="2">Nilai Akhir</th>
                        <th rowspan="2">Status</th>
                        <th rowspan="2">Total Mengerjakan</th>
                    </tr>
                    <tr class="head">
                        @foreach ($soshumKeys as $i => $v)
                            <th>{{$v}}</th>
                        @endforeach
                    </tr>
                    @foreach ($report->report as $r)
                        <tr style="text-align: center">
                            <td rowspan="2">{{$r->title ?? ''}}</td>
                            <td>{{$r->saintek->title ?? ''}}</td>
                            <td>{{Carbon\Carbon::create($r->saintek->end)->locale('id')->translatedFormat('d M Y H:i:s') ?? ''}}</td>
                            @foreach ($saintekKeys as $i => $v)
                                <td class="{{$r->status ? 'text-green' : 'text-red'}}">{{$r->subject_values->{$v}->score ?? ''}}</td>
                            @endforeach
                            <td class="{{$r->status ? 'text-green' : 'text-red'}}">{{$r->saintek->total_score ?? ''}}</td>
                            <td class="{{$r->status ? 'text-green' : 'text-red'}}">{{$r->saintek->status ? 'LULUS' : 'TIDAK LULUS'}}</td>
                            <td>{{$r->saintek->repeat ?? ''}} kali</td>
                        </tr>
                        <tr style="text-align: center">
                            <td>{{$r->soshum->title ?? ''}}</td>
                            <td>{{Carbon\Carbon::create($r->soshum->end)->locale('id')->translatedFormat('d M Y H:i:s') ?? ''}}</td>
                            @foreach ($soshumKeys as $i => $v)
                                <td class="{{$r->status ? 'text-green' : 'text-red'}}">{{$r->subject_values->{$v}->score ?? ''}}</td>
                            @endforeach
                            <td class="{{$r->status ? 'text-green' : 'text-red'}}">{{$r->saintek->total_score ?? ''}}</td>
                            <td class="{{$r->status ? 'text-green' : 'text-red'}}">{{$r->saintek->status ? 'LULUS' : 'TIDAK LULUS'}}</td>
                            <td>{{$r->saintek->repeat ?? ''}} kali</td>
                        </tr>
                    @endforeach
                @endif
            @endif
        </table>

        <br>
        {{-- Average --}}
        <table class="module custom-table">
            <tr class="head">
                @foreach (($report->subject->score_keys ?? []) as $key)
                    <th>Rata-Rata {{$key}}</th>
                @endforeach
                <th>Rata-Rata nilai akhir</th>
            </tr>
            <tr style="font-size: 1.5rem">
                @foreach (($report->subject->score_keys ?? []) as $k)
                    <th>{{$report->subject->score_values->$k->average_score ?? 0}}</th>
                @endforeach
                <th>{{$report->subject->average_score ?? 0}}</td>
            </tr>
        </table>

        {{-- Description --}}
        <br>
        <section class="description">
            <div>
                <ul>
                    @foreach (($report->subject->score_keys ?? [])  as $k)
                        <li>
                            <b>Rata-Rata {{$k}} = </b> Total Nilai {{$k}} / Jumlah Modul Diterima
                        </li>
                    @endforeach
                    <li>
                        <b>Rata-Rata Nilai Akhir = </b> Total Nilai Akhir / Jumlah Modul Diterima
                    </li>
                </ul>
            </div>
        </section>

        {{-- footer --}}
        <div id='footer'>
            <div>
                <img style="height: 30px" src="https://btw-cdn.com/assets/edutech/logo/edutech-black-text.svg" alt="">
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
                © Copyright 2021  PT. Bina Taruna Wiratama.  All rights reserved.
            </div>
        </div>

    </div>
</body>
</html>


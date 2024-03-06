@php
setlocale(LC_TIME, 'id_ID');
Carbon\Carbon::setLocale('id');
function statusText($state=null) {
if ($state === true) return 'LULUS';
if ($state === false) return 'TIDAK LULUS';
return null;
}
function textColor($state=null) {
if ($state === true) return 'text-green';
if ($state === false) return 'text-red';
return null;
}
function dateFormat($date=null, $format='l, d/m/Y H:i:s', $timezone='Asia/Jakarta') {
if(!$date) return null;
return Carbon\Carbon::create($date)
->timezone($timezone)
->locale('id')
->translatedFormat($format);
}

$program = $ranks[0]->program ?? '';
$programTitle = str_replace('-', ' ', $program);
$programTitle = strtoupper($programTitle);
$score_keys = $ranks[0]->score_keys ?? [];
@endphp

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

        @page {
            margin: 0;
        }

        html,
        body {
            margin: 0 !important;
        }

        *,
        body {
            font-family: 'Poppins', sans-serif !important;
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

        .module {
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

        .custom-table th,
        .custom-table td {
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
                <h2>
                    RANKING SISWA {{$programTitle}}
                </h2>
            </td>
            <td style="text-align: right; color: white">
                <img style="width: 150px;" src="https://btw-cdn.com/assets/v3/logo/smartbtw-small-white-text.png">
                <div style="margin-top: 4px">
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

    <br>
    <div style="text-align: center">
        <h2 style="margin-bottom: 0">{{$ranks[0]->title ?? ''}}</h2>
        <h3 style="margin-top: 0;font-weight: normal">Tanggal {{dateFormat(date('Y-m-d'), 'd F Y')}}</h3>
    </div>
    <br>

    <div class="content">
        <table class="items custom-table" style="margin-top: 20px">
            @if (count($ranks ?? []) > 0)
            <tr class="head">
                <th>No.</th>
                <th>Nama</th>
                <th>Asal Sekolah</th>
                <th>Mulai Mengerjakan</th>
                <th>Selesai Mengerjakan</th>
                <th>Lama Mengerjakan</th>
                @foreach($score_keys as $key)
                    <th>{{ $key }}</th>
                @endforeach
                <th>Total Nilai</th>
                <th>Status</th>
            </tr>
            @if ($program != 'tka-campuran')
            @foreach ($ranks as $i => $r)

            @php
                $parsedStartDate = Carbon\Carbon::parse($r->start)->timezone('Asia/Jakarta');
                $parsedEndDate = Carbon\Carbon::parse($r->end)->timezone('Asia/Jakarta');

                $start = $parsedStartDate < $parsedEndDate
                    ? $parsedStartDate->locale('fr')->isoFormat('L LTS') . " WIB"
                    : '-';

                $end = $parsedEndDate->locale('fr')->isoFormat('L LTS') . " WIB";

                $doneInterval = $parsedStartDate < $parsedEndDate
                    ? $parsedStartDate->locale('id')->diffForHumans($parsedEndDate, ['parts' => 2, 'join' => ', ', 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE])
                    : '-';
            @endphp

            <tr>
                <td style="text-align: center">{{$i+1}}</td>
                <td>{{$r->student_name ?? ''}} {{ property_exists($student_branch_codes, $r->smartbtw_id) && $student_branch_codes->{$r->smartbtw_id} ? '('.$student_branch_codes->{$r->smartbtw_id}.')' : '' }}</td>
                <td style="text-align: center">{{$r->school_origin ?? '-'}}</td>
                <td style="text-align: center">{{ $start }}</td>
                <td style="text-align: center">{{ $end }}</td>
                <td style="text-align: center">{{ $doneInterval }}</td>
                @foreach($score_keys as $key)
                <td style="text-align: center" class="{{textColor($r->score_values->{$key}->is_passed ?? null)}}">
                    {{$r->score_values->$key->score ?? ''}}
                </td>
                @endforeach
                <td style="text-align: center" class="{{textColor($r->status ?? null)}}">
                    {{$r->total_score ?? ''}}
                </td>
                <td style="text-align: center" class="{{textColor($r->status ?? null)}}">
                    {{$r->status_text ?? ''}}
                </td>
            </tr>
            @endforeach
            @else
            @foreach ($ranks as $i => $r)
            @php
            $startDate = $r->saintek->start ?? $r->soshum->start;
            $endDate = $r->saintek->end ?? $r->soshum->end;
            @endphp
            <tr>
                <td style="text-align: center">{{$i+1}}</td>
                <td>{{$r->student_name ?? ''}}</td>
                <td style="text-align: center">{{ dateFormat($startDate ?? null, 'd F y . H:i:s') }}</td>
                <td style="text-align: center">{{ dateFormat($endDate ?? null, 'd F y . H:i:s') }}</td>
                <td style="text-align: center" class="{{textColor($r->status ?? null)}}">
                    {{$r->total_score ?? ''}}
                </td>
                <td style="text-align: center" class="{{textColor($r->status ?? null)}}">
                    {{$r->status_text ?? ''}}
                </td>
            </tr>
            @endforeach
            @endif
            @endif
        </table>

        {{-- footer --}}
        <div id='footer'>
            <div>
                <img style="height: 30px" src="https://btw-cdn.com/assets/edutech/logo/edutech-black-text.svg" alt="">
            </div>
            <div>
                <span>
                    <img style="width: 15px" src="https://btw-cdn.com/assets/edutech/icons/telp-outline-black.svg">
                    0822 6000 8545
                </span>
                <span style="margin-left: 10px">
                    <img style="width: 15px" src="https://btw-cdn.com/assets/edutech/icons/envelope-outline-black.svg">
                    tanya@btwedutech.com
                </span>
            </div>
            <div>
                <span>
                    <img style="width: 15px" src="https://btw-cdn.com/assets/edutech/icons/www-outline-black.svg">
                    www.smartbtw.com
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
    </div>

</body>

</html>

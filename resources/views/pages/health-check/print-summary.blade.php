@php
$stakes = [
    '1' => [
        'value' => '1',
        'color' => '#008b41',
    ],
    '2' => [
        'value' => '2',
        'color' => '#03b834',
    ],
    '3' => [
        'value' => '2P',
        'color' => '#ffaf14',
    ],
    '4' => [
        'value' => '3',
        'color' => '#ff6527',
    ],
    '5' => [
        'value' => '4',
        'color' => '#ff1d23',
    ],
];
@endphp

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Hasil Pemeriksaan Kesehatan</title>
    <style>
        @font-face {
            font-family: "Poppins";
            font-style: normal;
            font-weight: 400;
            src: url("https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrFJA.ttf") format("truetype");
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

        .main {
            margin: 0 50px;
        }

        .text-center {
            text-align: center;
        }

        .font-weight-bolder {
            font-weight: bolder;
        }

        table {
            width: 100%;
        }

        table,
        th,
        td {
            border: 1px solid black;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 5px;
        }

        th {
            font-weight: bold;
        }

        #title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
        }

        #biodata-table,
        #note-table,
        #detail-table {
            margin-top: 20px;
        }

        #note-table th {
          text-align: left;
        }

        #footer-table {
            margin-top: 30px;
        }

        #footer-table,
        #footer-table th,
        #footer-table td {
            border: 0;
        }

        #footer-table td {
            vertical-align: top;
        }

        .footer-image-wrapper {
            margin-top: 80px;
            text-align: right;
        }

    </style>
</head>

<body>

    <header>
        <div>
            <img src="https://btw-cdn.com/assets/office/image/mcu-header.png" alt="header" width="100%" />
        </div>
    </header>
    <div class="main">
        <h1 id="title">
            <b>Hasil Pemeriksaan Kesehatan</b>
        </h1>
        <table id="biodata-table">

            <tr>
                <td width="30%">Nama</td>
                <td width="70%">{{ $summary->data->name }}</td>
            </tr>
            <tr>
                <td width="30%">Email</td>
                <td width="70%">{{ $summary->data->email }}</td>
            </tr>
            <tr>
                <td width="30%">Cabang</td>
                <td width="70%">{{ $branchName }}</td>
            </tr>
            <tr>
                <td width="30%">Kelas</td>
                <td width="70%">
                    @if (count($classrooms) > 0)
                        <ul>
                            @foreach ($classrooms as $className)
                                <li>{{ $className }}</li>
                            @endforeach
                        </ul>
                    @else
                        -
                    @endif
                </td>
            </tr>
            <tr>
                <td width="30%">Umur</td>
                <td width="70%">{{ $summary->data->age }}</td>
            </tr>
            <tr>
                <td width="30%">Tinggi Badan</td>
                <td width="70%">{{ $summary->data->height }}</td>
            </tr>
            <tr>
                <td width="30%">Berat Badan</td>
                <td width="70%">{{ $summary->data->weight }}</td>
            </tr>
        </table>

        <table id="detail-table">

            <tr>
                <th>NO</th>
                <th>AREA PEMERIKSAAN</th>
                <th>RINCIAN</th>
                <th>STATUS</th>
                <th>CATATAN</th>
            </tr>

            @php
                $detailPerArea = [];
                $isAlreadyFirstArea = [];
            @endphp

            @foreach ($summary->data->summary as $indexSummary => $itemSummary)
                @foreach ($summary->data->detail_answers as $itemAnswer)
                    @php
                        if (isset($detailPerArea[$itemSummary->area]) && $itemSummary->area == $itemAnswer->area) {
                            array_push($detailPerArea[$itemSummary->area], $itemAnswer);
                        }
                        if (!isset($detailPerArea[$itemSummary->area]) && $itemSummary->area == $itemAnswer->area) {
                            $detailPerArea[$itemSummary->area][] = $itemAnswer;
                        }
                    @endphp
                @endforeach
            @endforeach

            @foreach ($summary->data->summary as $indexSummary => $itemSummary)
                @if (isset($detailPerArea[$itemSummary->area]))
                    @foreach ($detailPerArea[$itemSummary->area] as $indexDetail => $itemDetail)
                        @if ($indexDetail == 0 && !in_array($itemDetail->area, ['TB', 'BMI']))
                            <tr>
                                <td class="text-center" rowspan={{ count($detailPerArea[$itemSummary->area]) }}>
                                    {{ $indexSummary + 1 }}
                                </td>
                                <td rowspan={{ count($detailPerArea[$itemSummary->area]) }}>
                                    {{ $itemSummary->text }}
                                </td>
                                <td>{{ $itemDetail->name }}</td>
                                <td class="text-center">{{ $itemDetail->value == 1 ? 'TIDAK' : 'YA' }}</td>
                                <td style="color: {{ $stakes[$itemSummary->value]['color'] }}"
                                    class="text-center font-weight-bolder"
                                    rowspan={{ count($detailPerArea[$itemSummary->area]) }}>
                                    STAKES {{ $stakes[$itemSummary->value]['value'] }}</td>
                            </tr>
                        @endif
                        @if ($indexDetail >= 1 && !in_array($itemDetail->area, ['TB', 'BMI']))
                            <tr>
                                <td>{{ $itemDetail->name }}</td>
                                <td class="text-center">{{ $itemDetail->value == 1 ? 'TIDAK' : 'YA' }}</td>
                            </tr>
                        @endif
                    @endforeach
                @else
                    <tr>
                        <td class="text-center">{{ $indexSummary + 1 }}</td>
                        <td>{{ $itemSummary->text }}</td>
                        <td>{{ $itemSummary->area == 'BMI' ? $summary->data->bmi : '-' }}</td>
                        <td class="text-center">-</td>
                        <td style="color: {{ $itemSummary->value ? $stakes[$itemSummary->value]['color'] : '#000' }}"
                            class="text-center font-weight-bolder">
                            @if ($itemSummary->value)
                                STAKES {{ $stakes[$itemSummary->value]['value'] }}
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endif
            @endforeach
        </table>

        <table id="note-table">
            <tr>
                <th>Catatan</th>
            </tr>
            <tr>
              <td>{{ $summary->data->comment ?? '-' }}</td>
            </tr>
        </table>

        <table id="footer-table">
            <tbody>
                <tr>
                    <td>
                        <div>
                            <p style="margin-bottom: 0;">{{ \Carbon\Carbon::now()->format('d M Y') }}</p>
                            <p style="margin-top: 0;">Dokter Pemeriksa</p>
                            <div style="height: 50px;"></div>
                            <p style="letter-spacing: 2px;">............................</p>
                        </div>
                    </td>
                    <td>
                        <div style="text-align: right;">
                            <p style="margin-bottom: 0;">Status Kesehatan</p>
                            <p style="margin-top: 0; color: {{ $stakes[$highestStakes]['color'] }}"
                                class="font-weight-bolder">{{ in_array($stakes[$highestStakes]['value'], ["1", "2", "2P"]) ? "MS" : "TMS" }}</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="footer-image-wrapper">
            <img src="https://btw-cdn.com/assets/office/image/mcu-footer.png" alt="header" width="400px" />
        </div>
    </div>
</body>

</html>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Tagihan Pembayaran</title>
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

        .text-success {
            color: #28c76f !important
        }

        .text-danger {
            color: #ea5455 !important;
        }

        .button {
            border-radius: 6px;
            color: #fff;
            border: 0;
            padding: 14px 30px;
            font-size: 16px;
            font-weight: 600;
            width: 300px;
            display: inline-block;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
        }

        .button-secondary {
            background-color: #25d366;
        }
    </style>
</head>

<body>
    @php
        if (!function_exists('priceFormat')) {
            function priceFormat($num)
            {
                return number_format($num, 0, ',', '.');
            }
        }

        if (!function_exists('dateFormat')) {
            function dateFormat($date)
            {
                return Carbon\Carbon::parse($date ?? '')->format('d M Y');
            }
        }
        $dueDateMessage = '';
        $dueDateInDays = $bill->due_date ? dateFormat($bill->due_date) : '-';

        if ($bill->dueDateInDays > 0) {
            $dueDateMessage = 'akan berakhir dalam waktu ' . $bill->dueDateInDays . ' hari. Segera lakukan pembayaran sebelum <b>' . $dueDateInDays . '</b>';
        } elseif ($bill->dueDateInDays === 0) {
            $dueDateMessage = 'berakhir <b>hari ini</b>. Harap segera lakukan pembayaran';
        } else {
            $dueDateMessage = 'sudah <b>melewati masa tenggang pembayaran</b>. Harap segera lakukan pembayaran';
        }

    @endphp
    <div>
        <figure style="margin-left: auto;">
            <img style="width: 280px;" src="https://btw-cdn.com/assets/office/logo/btw-edutech-red-text-full.svg" />
        </figure>
        <div style="margin-top: 30px">
            <p>Halo <b>{{ $bill->bill_to }}</b></p>
            <p>Ini merupakan notifikasi otomatis masa tenggang pembayaran {{ $bill->title ?? '' }} BTW
                Edutech.</p>
            <p>Kami informasikan bahwa masa tenggang pembayaran {{ $bill->title ?? '' }} BTW Edutech Anda
                {!! $dueDateMessage !!}.</p>
        </div>

        <h4>Informasi Tagihan:</h4>
        <table style="width: 100%">
            <tr>
                <td width="30%">
                    <p style="margin-top: 0">ID Tagihan</p>
                </td>
                <td>
                    <p style="margin-top: 0">
                        <span style="margin-right: 10px">:</span>
                        {{ $bill->id ? str_pad($bill->id, 7, '0', STR_PAD_LEFT) : '' }}
                    </p>
                </td>
            </tr>
            <tr>
                <td width="30%"><p style="margin-top: 0">Nama Lengkap</p></td>
                <td>
                    <p style="margin-top: 0">
                        <span style="margin-right: 10px">:</span> {{ $bill->bill_to }}
                    </p>
                </td>
            </tr>
            <tr>
                <td width="30%"><p style="margin-top: 0">Program</p></td>
                <td>
                    <p style="margin-top: 0">
                        <span style="margin-right: 10px">:</span> {{ $bill->title ?? '' }}
                    </p>
                </td>
            </tr>
            <tr>
                <td width="30%"><p style="margin-top: 0">Tanggal Jatuh Tempo</p></td>
                <td>
                    <p style="margin-top: 0; color: {{ $bill->dueDateInDays <= 0 ? '#ff0000' : '#000' }}">
                        <span style="margin-right: 10px">:</span>
                        {{ $bill->due_date ? dateFormat($bill->due_date) : '-' }}
                    </p>
                </td>
            </tr>
            <tr>
                <td width="30%"><p style="margin-top: 0">Total Tagihan<sup><b>*</b></sup></p></td>
                <td>
                    <p style="margin-top: 0">
                        <span style="margin-right: 10px">:</span>Rp {{ priceFormat($bill->remain_bill) }}
                    </p>
                </td>
            </tr>
        </table>

        <p style="color: #323232; margin-top: 30px">
          <i><sup><b>*</b></sup>Nominal yang tertera merupakan total tagihan keseluruhan, bukan nominal cicilan per bulan</i>
        </p>

        <div style="margin-top: 25px">
            {{-- <p>Pembayaran dapat dilakukan melalui tombol berikut:</p>
            <a href={{ env('PAYMENT_WEB_HOST') . "/transaction/" . $bill->encrypted_id }}
                class="button-primary">
                Bayar Sekarang
            </a> --}}
            {{-- <p style="margin-top: 50px">Untuk Informasi lebih lanjut mengenai pembayaran program BTW Edutech, silakan
                menghubungi tim kami melalui:</p> --}}
            <p style="margin-top: 50px">Untuk Informasi lebih lanjut mengenai pembayaran dan nominal cicilan, silakan
                menghubungi Admin pada cabang <b>{{ $branch->name }}</b> :</p>
            @if ($branch->contact)
                <table width="100%">
                    <tr>
                        <td width="20">
                            <img width="20" src="https://btw-cdn.com/assets/edutech/icons/contact-wa.svg" />
                        </td>
                        <td style="padding-left: 5px">{{ $branch->contact }}</td>
                    </tr>
                </table>
                <a href="https://wa.me/{{ $branch->contact }}" class="button button-secondary" style="margin-top: 8px">
                    Hubungi Admin Cabang
                </a>
            @else
                <table width="100%">
                    <tr>
                        <td width="20">
                            <img width="20" src="https://btw-cdn.com/assets/edutech/icons/contact-wa.svg" />
                        </td>
                        <td style="padding-left: 5px">Nomor Tidak Tertera</td>
                    </tr>
                </table>
            @endif

            <p>atau kunjungi kantor cabang pada alamat berikut: </p>
            <table width="100%">
                <tr>
                    <td width="20">
                        <img width="20" src="https://btw-cdn.com/assets/edutech/icons/pin.svg" />
                    </td>
                    <td style="text-transform: capitalize; padding-left: 5px">{{ $branch->address }}</td>
                </tr>
            </table>

            <br />
            <br />
            <br />
            <p style="margin-top: 20px">Terima Kasih.</p>
            <p style="margin-top: 8px"><b>BTW Edutech</b><br /> <i>Kamu Sukses, Indonesia Maju!</i></p>
        </div>

    </div>
    <script>
        window.print();
    </script>
</body>

</html>

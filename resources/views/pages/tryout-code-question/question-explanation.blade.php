<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>
      {{ "Pembahasan Soal UKA Kode " . $tryoutCode->packages->title . " - Soal #" . $questionId }}
    </title>
    <link rel="shortcut icon" type="image/x-icon" href="https://btw-cdn.com/assets/office/icons/favicon.png">
  </head>
  <body style="margin: 0">
    <iframe
      src="{{$iframeLink}}"
      frameborder="0"
      style="width: 100vw; height: 100vh;"
    ></iframe>
  </body>
</html>


{{-- @extends('layouts/contentLayoutMaster')

@section('title', "Pembahasan Soal " . $stage->type . " Stage " . $stage->stage . " Level " . $stage->level . " - Soal #" . $questionId)

@section('content')
<section style="height: 100vh;">
  <div class="row w-100 h-100">
    <div class="col-md-12 w-100 h-100">
      <div class="card w-100 h-100">
        <div class="card-body w-100 h-100">
          <iframe id="explanation-iframe" src="{{$iframeLink}}" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  </div>
</section>
@endsection --}}

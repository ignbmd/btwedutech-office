<div class="d-none d-lg-flex col-lg-8 align-items-center p-5 bg-primary overflow-hidden">
  <!-- Brand logo-->
  <div class="partner-logo-container">

    <a class="mr-2" href="javascript:void(0);">
      <img src="https://btw-cdn.com/assets/edutech/logo/edutech-white-text.svg" alt="Smartbtw" width="200" />
    </a>
    <a href="javascript:void(0);">
      <img src="https://btw-cdn.com/assets/v3/logo/smartbtw-white-text.png" alt="Smartbtw" width="200" />
    </a>

  </div>
  <!-- /Brand logo-->
  <div class='auth-circle-bg-container'>
    <div class='circle circle1'></div>
    <div class='circle circle2'></div>
    <div class='circle circle3'></div>
  </div>
  <div class="auth-illustration-container">
    @if($configData['theme'] === 'dark')
    <img class="img-fluid" src="{{asset('images/pages/login.svg')}}" alt="Login V2" />
    @else
    <img class="img-fluid" src="{{asset('images/pages/login.svg')}}" alt="Login V2" />
    @endif
  </div>
  <p class="slogan-text">Gak cuma bikin pinter, tapi Lulus!</p>
</div>

<body class="vertical-layout vertical-menu-modern {{ $configData['showMenu'] === true ? '2-columns' : '1-column' }}
{{ $configData['blankPageClass'] }} {{ $configData['bodyClass'] }}
{{ $configData['verticalMenuNavbarType'] }}
{{ $configData['sidebarClass'] }} {{ $configData['footerType'] }}" data-menu="vertical-menu-modern" data-col="{{ $configData['showMenu'] === true ? '2-columns' : '1-column' }}" data-layout="{{ ($configData['theme'] === 'light') ? '' : $configData['layoutTheme'] }}" style="{{ $configData['bodyStyle'] }}" data-framework="laravel" data-asset-path="{{ asset('/')}}">

  {{-- Include Sidebar --}}
  @if((isset($configData['showMenu']) && $configData['showMenu'] === true))
  @include('panels.sidebar')
  @endif

  @section('page-style')
    <link rel="stylesheet" type="text/css" href="{{ asset('css/components/custom-alert.css') }}">
  @endsection

  {{-- Include Navbar --}}
  @include('panels.navbar')

  <!-- BEGIN: Content-->
  <div class="app-content content {{ $configData['pageClass'] }}">
    <!-- BEGIN: Header-->
    @if(isset($unpaid_bills_counts) && $unpaid_bills_counts['total'])
      <div class="row">
        <div class="col">
          <div class="alert-container">
            <h3 class="alert-heading">Pemberitahuan</h3>
            @foreach($unpaid_bills_counts as $key => $value)
              @if($key === "total" || !$value['count']) @continue; @endif
              <div class="{{$value["alert-class"]}}">
                <div class="alert-body text-xl">
                  {!! $value['message'] !!}
                </div>
              </div>
            @endforeach
          </div>
        </div>
      </div>
    @endif

    <div class="content-overlay"></div>
    <div class="header-navbar-shadow"></div>
    @if(($configData['contentLayout']!=='default') && isset($configData['contentLayout']))
    <div class="content-area-wrapper {{ $configData['layoutWidth'] === 'boxed' ? 'container p-0' : '' }}">
      <div class="{{ $configData['sidebarPositionClass'] }}">
        <div class="sidebar">
          {{-- Include Sidebar Content --}}
          @yield('content-sidebar')
        </div>
      </div>
      <div class="{{ $configData['contentsidebarClass'] }}">
        <div class="content-wrapper">
          <div class="content-body">
            {{-- Include Page Content --}}
            @yield('content')
          </div>
        </div>
      </div>
    </div>
    @else
    <div class="content-wrapper {{ $configData['layoutWidth'] === 'boxed' ? 'container p-0' : '' }}">
      {{-- Include Breadcrumb --}}
      @if($configData['pageHeader'] === true && isset($configData['pageHeader']))
      @include('panels.breadcrumb')
      @endif

      <div class="content-body">
        {{-- @isset($unpaid_bills_counts)
          <div class="row">
            <div class="col-md-12">
              <div class="alert alert-secondary" role="alert">
                <ul>
                  @foreach($unpaid_bills_counts as $key => $bill_count)
                    @if($bill_count !== 0)
                      @if($key === "past") <li class="text-danger">Anda memiliki {{ $bill_count }} tagihan yang sudah melewati tanggal jatuh tempo</li>
                      @elseif($key === "today") <li class="text-warning">Anda memiliki {{ $bill_count }} yang jatuh tempo pada hari ini</li>
                      @else <li>Anda memiliki {{ $bill_count }} tagihan yang akan jatuh tempo {{ $key }} hari lagi</li>
                      @endif
                    @endif
                  @endforeach
                </ul>
              </div>
            </div>
          </div>
        @endisset --}}
        {{-- Include Page Content --}}
        @yield('content')
      </div>
    </div>
    @endif

  </div>
  <!-- End: Content-->

  <div class="sidenav-overlay"></div>
  <div class="drag-target"></div>

  {{-- include footer --}}
  @include('panels/footer')

  {{-- include default scripts --}}
  @include('panels/scripts')

  <script type="text/javascript">
    $(window).on('load', function() {
      if (feather) {
        feather.replace({
          width: 14
          , height: 14
        });
      }
    })

  </script>
</body>

</html>

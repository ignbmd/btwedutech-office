{{-- Vendor Scripts --}}
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.33/moment-timezone.min.js" integrity="sha512-jkvef+BAlqJubZdUhcyvaE84uD9XOoLR3e5GGX7YW7y8ywt0rwcGmTQHoxSMRzrJA3+Jh2T8Uy6f8TLU3WQhpQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="{{ asset(mix('vendors/js/vendors.min.js')) }}"></script>
@yield('vendor-script')
{{-- Theme Scripts --}}
<script src="{{ asset(mix('js/core/app-menu.js')) }}"></script>
<script src="{{ asset(mix('js/core/app.js')) }}"></script>
{{-- page script --}}
@yield('page-script')
<script>
  $(function() {
      'use strict';

      @if(Session::has('flash-message'))
        toastr["{{ session('flash-message')['type'] }}"](
        "{{ session('flash-message')['message'] }}",
        "{{ session('flash-message')['title'] }}", {
            closeButton: true,
            tapToDismiss: false,
            timeOut: 3000,
        });
      @endif

      /**
       * Custom Toggle User Dropdown
       *
       * this is necessary because if combined with compiled react script
       * the dropdown wouldn't work
       */

      const dropwdownUserLink = $('a#dropdown-user');
      const dropwdownMenu = $('#dropdown-user-menu')

      dropwdownUserLink.on('click', function() {
        dropwdownMenu.toggleClass('show');
        dropwdownUserLink.toggleClass('show');
      })
  });

function getTimezone() {
  const dom = document.getElementById("timezone");
  return dom?.innerText;
};


function formatAllTime(className='.moment-format', format='DD MMMM YYYY') {
  const doms = document.querySelectorAll(className);
  [...doms].forEach((dom) => {
    const val = dom.innerText;
    dom.innerText = moment(val).format(format);
  })
}

formatAllTime();
</script>
{{-- page script --}}

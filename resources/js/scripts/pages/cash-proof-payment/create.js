"use strict";

(function (window, document, $) {
  const form = document.getElementById("form");
  const createPaymentProofButton = document.getElementById('create-button');
  const previewPaymentProofButton = document.getElementById('preview-button');
  let submitType = null;

  loadCleaveInput();
  loadEventListeners();

  function loadCleaveInput() {
    new Cleave(".price-input", {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand'
    });
  }

  function loadEventListeners() {
    createPaymentProofButton.addEventListener("click", () => {
      submitType = "create";
    });
    previewPaymentProofButton.addEventListener("click", () => {
      submitType = "preview";
    });
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      if(submitType == "create") form.action = "/bukti-pembayaran-cash";
      else form.action = "/bukti-pembayaran-cash/lihat";
      document.form.submit(); // document.form_name.submit()
    });
  }

})(window, document, jQuery);

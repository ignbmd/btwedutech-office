"use strict";

(function (window, document, $) {
  const form = document.getElementById("form");
  const createButton = document.getElementById("create-button");
  const previewButton = document.getElementById("preview-button");
  let submitType = null;

  loadCleaveInput();
  loadEventListeners();

  function loadCleaveInput() {
    new Cleave(".price-input", {
      numeral: true,
      numeralThousandsGroupStyle: "thousand",
    });
  }

  function loadEventListeners() {
    createButton.addEventListener("click", () => {
      submitType = "create";
    });
    previewButton.addEventListener("click", () => {
      submitType = "preview";
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submitType == "create") form.action = "/surat-terima-cash";
      else form.action = "/surat-terima-cash/lihat";
      document.form.submit(); // document.form_name.submit()
    });
  }
})(window, document, jQuery);

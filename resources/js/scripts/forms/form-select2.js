/*=========================================================================================
    File Name: form-select2.js
    Description: Select2 is a jQuery-based replacement for select boxes.
    It supports searching, remote data sets, and pagination of results.
    ----------------------------------------------------------------------------------------
    Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
    Author: Pixinvent
    Author URL: hhttp://www.themeforest.net/user/pixinvent
==========================================================================================*/
(function (window, document, $) {
  "use strict";
  var select = $(".select2"),
    selectLg = $(".select2-size-lg"),
    selectSm = $(".select2-size-sm"),
    hideSearch = $('.hide-search');

  select.each(function () {
    var $this = $(this);
    const withTokenizer = $this.hasClass("select2-tokenizer");
    const tokenization = withTokenizer
      ? {
          tags: true,
          tokenSeparators: [","],
        }
      : {};
    $this.wrap('<div class="position-relative"></div>');
    $this.select2({
      // the following code is used to disable x-scrollbar when click in select input and
      // take 100% width in responsive also
      dropdownAutoWidth: true,
      width: "100%",
      dropdownParent: $this.parent(),
      ...tokenization
    });
  });

  // Large
  selectLg.each(function () {
    var $this = $(this);
    $this.wrap('<div class="position-relative"></div>');
    $this.select2({
      dropdownAutoWidth: true,
      dropdownParent: $this.parent(),
      width: "100%",
      containerCssClass: "select-lg",
    });
  });

  // Small
  selectSm.each(function () {
    var $this = $(this);
    $this.wrap('<div class="position-relative"></div>');
    $this.select2({
      dropdownAutoWidth: true,
      dropdownParent: $this.parent(),
      width: "100%",
      containerCssClass: "select-sm",
    });
  });

  // Hide Search Box
  hideSearch.select2({
    placeholder: 'Select an option',
    minimumResultsForSearch: Infinity
  });
})(window, document, jQuery);

/*=========================================================================================
        File Name: form-input-mask.js
        Description: Input Masks
        ----------------------------------------------------------------------------------------
        Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
        Author: Pixinvent
        Author URL: hhttp://www.themeforest.net/user/pixinvent
==========================================================================================*/

$(function () {
  "use strict";

  var numeralMask = $(".numeral-mask");

  //Numeral
  if (numeralMask.length) {
    numeralMask.each((index, element) => {
      new Cleave(numeralMask[index], {
        numeral: true,
        numeralDecimalMark: "thousand",
        delimiter: ".",
      });
    });
  }
});

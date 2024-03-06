//  File Name: app-ecommerce-details.js
//  Description: App Ecommerce Details js.
//  ----------------------------------------------------------------------------------------------
//  Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
//  Author: PIXINVENT
//  Author URL: http://www.themeforest.net/user/pixinvent
// ================================================================================================

$(function () {
  'use strict';

  var productsSwiper = $('.swiper-container');

  // Init Swiper
  if (productsSwiper.length) {
    new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 55,
      // init: false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
    });
  }
});

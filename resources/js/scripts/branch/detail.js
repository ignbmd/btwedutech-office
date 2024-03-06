/*=========================================================================================
  File Name: map-leaflet.js
  Description: Leaflet Maps
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: Pixinvent
  Author URL: hhttp://www.themeforest.net/user/pixinvent
==========================================================================================*/

$(function () {
  "use strict";

  const branchLat = $('#lat').val();
  const branchLng = $('#lng').val();

  if ($("#branch-location").length) {
    const branchLatLng = { lat: branchLat, lng: branchLng };
    const markerMap = L.map("branch-location").setView(branchLatLng, 16);
    L.marker(branchLatLng)
      .bindPopup(Object.values(branchLatLng).join(", "))
      .openPopup()
      .addTo(markerMap);
    L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(markerMap);
  }
});

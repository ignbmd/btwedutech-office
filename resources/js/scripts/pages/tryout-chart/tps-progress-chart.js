"use strict";

const potensiKognitifChartContext = document
  .getElementById("potensi_kognitif_score_chart")
  .getContext("2d");
const penalaranMatematikaChartContext = document
  .getElementById("penalaran_matematika_score_chart")
  .getContext("2d");
const literasiBahasaIndonesiaChartContext = document
  .getElementById("literasi_bahasa_indonesia_score_chart")
  .getContext("2d");
const literasiBahasaInggrisChartContext = document
  .getElementById("literasi_bahasa_inggris_score_chart")
  .getContext("2d");
const tpsChartContext = document
  .getElementById("tps_score_chart")
  .getContext("2d");

const potensiKognitifChart = new Chart(
  potensiKognitifChartContext,
  potensiKognitifChartConfig
);
const penalaranMatematikaChart = new Chart(
  penalaranMatematikaChartContext,
  penalaranMatematikaChartConfig
);
const literasiBahasaIndonesiaChart = new Chart(
  literasiBahasaIndonesiaChartContext,
  literasiBahasaIndonesiaChartConfig
);
const literasiBahasaInggrisChart = new Chart(
  literasiBahasaInggrisChartContext,
  literasiBahasaInggrisChartConfig
);
const tpsChart = new Chart(tpsChartContext, tpsChartConfig);

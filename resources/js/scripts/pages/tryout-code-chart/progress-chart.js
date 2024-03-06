"use strict";

const twkChartContext = document.getElementById('twk_score_chart').getContext('2d');
const tiuChartContext = document.getElementById('tiu_score_chart').getContext('2d');
const tkpChartContext = document.getElementById('tkp_score_chart').getContext('2d');
const skdChartContext = document.getElementById('skd_score_chart').getContext('2d');

const twkChart = new Chart(twkChartContext, twkChartConfig);
const tiuChart = new Chart(tiuChartContext, tiuChartConfig);
const tkpChart = new Chart(tkpChartContext, tkpChartConfig);
const skdChart = new Chart(skdChartContext, skdChartConfig);

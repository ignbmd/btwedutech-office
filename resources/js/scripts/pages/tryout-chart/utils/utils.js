"use strict";

const studentResult = getStudentResult();
const moduleSummary = getModuleSummary();
const chartLabels = studentResult.charts.labels;
const mostRepetitionCount = studentResult.charts.mostRepetitionCount;

// console.log(moduleSummary);
// console.log(studentResult);

const legendMargin = {
  id: 'legendMargin',
  beforeInit(chart, legend, options) {
    const fitValue = chart.legend.fit;

    chart.legend.fit = function fit() {
      fitValue.bind(chart.legend)();
      return this.height += 20;
    }
  }
}

function getStudentResult() {
  return JSON.parse(document.getElementById('student-result').innerText);
}

function getModuleSummary() {
  return JSON.parse(document.getElementById('module-summary').innerText);
}

function generateRandomColor() {
  const colors = [];
  for(let i = 0; i < studentResult.charts.labelCount; i++) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
  }
  return colors;
}

function generateSingleDatasetColor() {
  const colors = [];
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);

  for(let i = 0; i < studentResult.charts.labelCount; i++) {
    colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
  }
  return colors;
}

function printAverageDoneMinute() {
  return studentResult.charts.average_done_minute
    ? `${
        typeof studentResult.charts.average_done_minute === "number"
          ? Number(studentResult.charts.average_done_minute).toFixed(0) +
            " menit"
          : "-"
      } `
    : "-";
}

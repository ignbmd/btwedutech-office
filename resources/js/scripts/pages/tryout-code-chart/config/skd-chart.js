"use strict";

function generateDatasets() {
  const datasets = [];
  if (!mostRepetitionCount) {
    const dataset = {
      label: ``,
      data: [null],
      borderWidth: 1,
      pointRadius: 5,
      backgroundColor: "#fff",
      borderColor: "#fff",
      pointHoverRadius: 10,
    };
    datasets.push(dataset);
    return datasets;
  }

  for (let i = 0; i < mostRepetitionCount; i++) {
    const index = `dataset_${i}`;
    const dataset = {
      label: `Putaran ${i + 1}`,
      data: studentResult.charts.score_dataset.SKD[index],
      backgroundColor: generateSingleDatasetColor(),
      borderColor: generateSingleDatasetColor(),
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 10,
    };
    datasets.push(dataset);
  }
  return datasets;
}

const skdChartConfig = {
  type: "line",
  data: {
    labels: chartLabels,
    datasets: generateDatasets(),
  },
  options: {
    // maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      title: {
        display: true,
        text: studentResult.student.name,
      },
      subtitle: {
        display: true,
        text: [
          `Modul Dikerjakan: ${
            studentResult.done > 0
              ? studentResult.done + " modul"
              : studentResult.done
          }`,
          `Nilai Rata-Rata SKD: ${studentResult.charts.average_score.SKD}`,
          `Rata-Rata Mengerjakan: ${studentResult.report_average_try}`,
          `Total Mengerjakan: ${
            studentResult.report_repeat_sum > 0
              ? studentResult.report_repeat_sum + " kali"
              : studentResult.report_repeat_sum
          }`,
          `Rata-rata waktu mengerjakan ${printAverageDoneMinute()}`,
        ],
      },
      tooltip: {
        usePointStyle: true,
        callbacks: {
          afterLabel: (context) => {
            return `Tanggal selesai mengerjakan: ${
              studentResult.charts.endDates[context.datasetIndex][
                context.dataIndex
              ] ?? "-"
            }`;
          },
        },
      },
      legend: {
        labels: {
          padding: 20,
        },
      },
    },
    scales: {},
  },
  plugins: [legendMargin],
};

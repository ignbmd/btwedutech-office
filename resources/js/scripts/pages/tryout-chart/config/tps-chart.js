"use strict";

// Potensi Kognitif Chart
function generatePotensiKognitifDatasets() {
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
      data: studentResult.charts.score_dataset["Potensi Kognitif"][index],
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

const potensiKognitifChartConfig = {
  type: "line",
  data: {
    labels: chartLabels,
    datasets: generatePotensiKognitifDatasets(),
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
          `Nilai Rata-Rata Potensi Kognitif: ${studentResult.charts.average_score["Potensi Kognitif"]}`,
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
    tooltips: {
      mode: "index",
      intersect: true,
    },
    scales: {},
  },
  plugins: [legendMargin],
};

// Penalaran Matematika Chart
function generatePenalaranMatematikaDatasets() {
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
      data: studentResult.charts.score_dataset["Penalaran Matematika"][index],
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

const penalaranMatematikaChartConfig = {
  type: "line",
  data: {
    labels: chartLabels,
    datasets: generatePenalaranMatematikaDatasets(),
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
          `Nilai Rata-Rata Penalaran Matematika: ${studentResult.charts.average_score["Penalaran Matematika"]}`,
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
    tooltips: {
      mode: "index",
      intersect: true,
    },
    scales: {},
  },
  plugins: [legendMargin],
};

// Literasi Bahasa Indonesia Chart
function generateLiterasiBahasaIndonesiaDatasets() {
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
      data: studentResult.charts.score_dataset["Literasi Bahasa Indonesia"][
        index
      ],
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

const literasiBahasaIndonesiaChartConfig = {
  type: "line",
  data: {
    labels: chartLabels,
    datasets: generateLiterasiBahasaIndonesiaDatasets(),
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
          `Nilai Rata-Rata Literasi Bahasa Indonesia: ${studentResult.charts.average_score["Literasi Bahasa Indonesia"]}`,
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
    tooltips: {
      mode: "index",
      intersect: true,
    },
    scales: {},
  },
  plugins: [legendMargin],
};

// Literasi Bahasa Inggris Chart
function generateLiterasiBahasaInggrisDatasets() {
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
      data: studentResult.charts.score_dataset["Literasi Bahasa Inggris"][
        index
      ],
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

const literasiBahasaInggrisChartConfig = {
  type: "line",
  data: {
    labels: chartLabels,
    datasets: generateLiterasiBahasaInggrisDatasets(),
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
          `Nilai Rata-Rata Literasi Bahasa Inggris: ${studentResult.charts.average_score["Literasi Bahasa Inggris"]}`,
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
    tooltips: {
      mode: "index",
      intersect: true,
    },
    scales: {},
  },
  plugins: [legendMargin],
};

// TPS Score Chart
function generateTPSChartDatasets() {
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
      data: studentResult.charts.score_dataset.TPS[index],
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

const tpsChartConfig = {
  type: "line",
  data: {
    labels: chartLabels,
    datasets: generateTPSChartDatasets(),
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
          `Nilai Rata-Rata TPS: ${studentResult.charts.average_score.TPS}`,
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

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Chart from "chart.js/auto";

const ChartStudentSmapata = ({ smartbtwId, typeChart }) => {
  const [dataChart, setDataChart] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const type = typeChart;
        const data = await getChart(smartbtwId, type);
        setDataChart(data);
      } catch (error) {
        setData([]);
      }
    })();
  }, []);

  const getChart = async (id, type) => {
    const response = await axios.get(
      `/api/samapta/students/chart/${id}/type/${type}`
    );
    const data = response.data;
    const dataArray = Object.keys(data).map((key) => data[key]);
    const slicedArray =
      dataArray.length > 10 ? dataArray.slice(0, 10) : dataArray;

    return slicedArray || [];
  };

  const data_chart = dataChart;
  const data = {
    labels: data_chart,
    datasets: [
      {
        backgroundColor: "rgb(0, 0, 54)",
        borderColor: "rgb(0, 0, 54)",
        data: data_chart,
        barThickness: 20,
        barPercentage: 0.9,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        position: "top",
        barPercentage: 0.2,
        categoryPercentage: 0.8,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        anchor: "end",
        align: "top",
        color: "white",
      },
    },
    series: [
      {
        type: "stackingColumn100",
        fill: "#ccc",
      },
    ],
  };

  return (
    <div>
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};
export default ChartStudentSmapata;

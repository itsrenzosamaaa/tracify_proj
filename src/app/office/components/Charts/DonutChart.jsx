"use client";

import dynamic from "next/dynamic";
import { Paper } from "@mui/material";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DonutChart = () => {
  const options = {
    chart: {
      type: "donut",
    },
    labels: ["Accessories", "Electronic", "Clothing"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    legend: {
      position: "right",
      offsetY: 0,
      height: 230,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => {
                return series.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
  };

  const series = [44, 55, 41]; // Data corresponding to the labels

  return (
    <Chart options={options} series={series} type="donut" height={350} />
  );
};

export default DonutChart;

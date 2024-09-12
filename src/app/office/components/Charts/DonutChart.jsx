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
    <Paper elevation={2} sx={{ padding: "1rem", height: "31.5rem" }}>
      <h1>Hello, Officer</h1>
      <p>This is the current reported items as of now...</p>
      <Chart options={options} series={series} type="donut" height={350} />
    </Paper>
  );
};

export default DonutChart;

"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { PortfolioDistribution } from "@/lib/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DonutChartProps {
  data: PortfolioDistribution[];
  width?: number;
  height?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 200,
  height = 200,
}) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      animations: {
        enabled: true,
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
    },
    labels: data.map((d) => d.label),
    colors: data.map((d) => d.color),
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              color: "#6b7280",
            },
            value: {
              show: true,
              fontSize: "18px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              color: "#1a1a2e",
              formatter: (val: string) => `${val}%`,
            },
            total: {
              show: true,
              showAlways: false,
              label: "Total",
              fontSize: "11px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              color: "#6b7280",
              formatter: () => "100%",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      labels: { colors: "#6b7280" },
      markers: {
        size: 6,
        shape: "circle",
      },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 160 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  const series = data.map((d) => d.value);

  return (
    <div className="flex items-center justify-center">
      <Chart
        options={options}
        series={series}
        type="donut"
        width={width}
        height={height}
      />
    </div>
  );
};

export default DonutChart;

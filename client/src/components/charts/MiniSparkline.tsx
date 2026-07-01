"use client";

import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MiniSparklineProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  isPositive,
  width = 100,
  height = 36,
}) => {
  const color = isPositive ? "#16a34a" : "#dc2626";

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    stroke: {
      curve: "smooth",
      width: 1.5,
    },
    colors: [color],
    tooltip: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
  };

  const series = [
    {
      name: "Price",
      data: data,
    },
  ];

  return (
    <div className="inline-flex items-center" style={{ width, height }}>
      <Chart
        options={options}
        series={series}
        type="area"
        width={width}
        height={height}
      />
    </div>
  );
};

export default MiniSparkline;

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions, ChartData } from 'chart.js';
import '../charts/ChartConfig';
import { GlobalStats } from '../../types';

interface GlobalComparisonChartProps {
  myScore: number;
  globalStats: GlobalStats;
}

export const GlobalComparisonChart: React.FC<GlobalComparisonChartProps> = ({ myScore, globalStats }) => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#e5e7eb" : "#666";

  const data: ChartData<'bar'> = {
    labels: ["Global Avg", "Your Score", "Topper"],
    datasets: [{
      label: "Score (%)",
      data: [
        globalStats.avg,
        myScore,
        globalStats.highest
      ],
      backgroundColor: [
        "rgba(108, 117, 125, 0.5)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(245, 158, 11, 0.8)",
      ],
      borderColor: [
        "rgba(108, 117, 125, 1)",
        "rgba(30, 58, 138, 1)",
        "rgba(245, 158, 11, 1)",
      ],
      borderWidth: 1,
      borderRadius: 5,
    }]
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: { display: false },
        ticks: { color: textColor },
      },
      y: { grid: { display: false }, ticks: { color: textColor } },
    },
  };

  return <Bar data={data} options={options} />;
};

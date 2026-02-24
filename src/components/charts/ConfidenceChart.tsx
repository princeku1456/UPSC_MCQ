import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions, ChartData } from 'chart.js';
import './ChartConfig';

interface ConfidenceChartProps {
  confValues: number[];
  confStats: any;
}

export const ConfidenceChart: React.FC<ConfidenceChartProps> = ({ confValues, confStats }) => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#e5e7eb" : "#666";

  const data: ChartData<'bar'> = {
    labels: ["100% Confidence", "75% Confidence", "50% Confidence", "0% Confidence"],
    datasets: [{
      label: "Accuracy %",
      data: confValues,
      backgroundColor: ["#10b981", "#6366f1", "#f59e0b", "#ef4444"],
      borderRadius: 5,
      borderWidth: 1,
      barThickness: 35
    }]
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const idx = context.dataIndex;
            const confKey = [100, 75, 50, 0][idx];
            const s = confStats[confKey];
            return [
              ` Accuracy: ${context.raw}%`,
              ` Total Attempted: ${s.total}`,
              ` Total Correct: ${s.correct}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: textColor,
          callback: (val) => val + "%"
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

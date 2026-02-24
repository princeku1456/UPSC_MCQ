import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions, ChartData } from 'chart.js';
import { HistoryEntry } from '../../types';
import './ChartConfig';

interface PerformanceChartProps {
  data: HistoryEntry[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const chartDataReversed = [...data].reverse();
  const labels = chartDataReversed.map((item) => {
    let dateObj: Date | null = null;
    if (item.timestamp) {
       if (item.timestamp.seconds) dateObj = new Date(item.timestamp.seconds * 1000);
       else if (typeof item.timestamp === 'string') dateObj = new Date(item.timestamp);
       else if (item.timestamp instanceof Date) dateObj = item.timestamp;
    }
    return dateObj ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently";
  });

  const scores = chartDataReversed.map(item => item.scorePercent);
  const subjects = chartDataReversed.map(item => item.subject);
  const chapters = chartDataReversed.map(item => item.chapterName);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const tooltipBg = isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const tooltipText = isDark ? "#f3f4f6" : "#1f2937";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [{
      label: "Accuracy",
      data: scores,
      borderColor: "#2563eb",
      borderWidth: 3,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(37, 99, 235, 0.4)");
        gradient.addColorStop(1, "rgba(37, 99, 235, 0.0)");
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#2563eb",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: "#f59e0b",
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 2,
    }],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleFont: { size: 13, weight: "bold" },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => subjects[tooltipItems[0].dataIndex],
          label: (context) => [
            `📖 ${chapters[context.dataIndex]}`,
            `📅 ${labels[context.dataIndex]}`,
            `🎯 Score: ${context.raw}%`,
          ],
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        beginAtZero: true,
        max: 110,
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { size: 11 },
          stepSize: 20,
          callback: (value) => value + "%",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

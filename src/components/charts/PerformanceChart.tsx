import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { HistoryEntry } from '../../types';
import type { ChartOptions } from 'chart.js';

interface Props {
    data: HistoryEntry[];
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
    const chartData = useMemo(() => {
        const reversed = [...data].reverse();

        const labels = reversed.map(item => {
             let dateVal;
             if (item.timestamp?.seconds) {
                 dateVal = new Date(item.timestamp.seconds * 1000);
             } else if (typeof item.timestamp === 'string') {
                 dateVal = new Date(item.timestamp);
             } else {
                 dateVal = new Date();
             }
             return dateVal.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        });

        const scores = reversed.map(item => item.scorePercent);

        return {
            labels,
            datasets: [{
                label: "Accuracy",
                data: scores,
                borderColor: "#2563eb",
                borderWidth: 3,
                backgroundColor: (context: any) => {
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
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        };
    }, [data]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                titleColor: "#1f2937",
                bodyColor: "#1f2937",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                   label: (context) => `🎯 Score: ${context.raw}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 110,
                grid: {
                    // borderDash: [5, 5]
                },
                ticks: { stepSize: 20, callback: (v) => v + "%" }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return <div style={{ height: 300, width: '100%' }}><Line data={chartData} options={options} /></div>;
};

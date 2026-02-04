import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { HistoryEntry } from '../../types';
import type { ChartOptions } from 'chart.js';

interface Props {
    data: HistoryEntry[];
}

export const ConfidenceChart: React.FC<Props> = ({ data }) => {
    const chartData = useMemo(() => {
        const stats = {
            100: { total: 0, correct: 0 },
            75: { total: 0, correct: 0 },
            50: { total: 0, correct: 0 },
            0: { total: 0, correct: 0 }
        };

        data.forEach(res => {
            if (res.userAnswers) {
                Object.values(res.userAnswers).forEach(ans => {
                    // Cast key to number to match stats keys
                    // In TS, accessing object with dynamic key needs care.
                    const s = Number(ans.surety) as 0|50|75|100;
                    if (stats[s]) {
                        stats[s].total++;
                        if (ans.isCorrect) stats[s].correct++;
                    }
                });
            }
        });

        const values = [
            stats[100].total > 0 ? (stats[100].correct / stats[100].total * 100) : 0,
            stats[75].total > 0 ? (stats[75].correct / stats[75].total * 100) : 0,
            stats[50].total > 0 ? (stats[50].correct / stats[50].total * 100) : 0,
            stats[0].total > 0 ? (stats[0].correct / stats[0].total * 100) : 0
        ];

        return {
            labels: ["100% Confidence", "75% Confidence", "50% Confidence", "0% Confidence"],
            datasets: [{
                label: "Accuracy %",
                data: values,
                backgroundColor: ["#10b981", "#6366f1", "#f59e0b", "#ef4444"],
                borderRadius: 5,
                barThickness: 35
            }]
        };
    }, [data]);

    const options: ChartOptions<'bar'> = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (v) => v + "%" }
            },
            y: {
                grid: { display: false }
            }
        }
    };

    return <div style={{ height: 300, width: '100%' }}><Bar data={chartData} options={options} /></div>;
};

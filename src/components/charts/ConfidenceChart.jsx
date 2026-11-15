import { useRef, useEffect } from 'react';
import ChartHelper from '../../lib/charts';

export default function ConfidenceChart({ values, stats, theme }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = ChartHelper.renderConfidenceChart(canvasRef.current, values, stats);
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [values, stats, theme]);

  return <canvas ref={canvasRef} />;
}

import { useRef, useEffect } from 'react';
import ChartHelper from '../../lib/charts';

export default function PerformanceChart({ data, theme }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = ChartHelper.renderPerformanceChart(canvasRef.current, data);
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data, theme]);

  return <canvas ref={canvasRef} />;
}

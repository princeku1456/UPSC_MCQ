import ConfidenceChart from '../charts/ConfidenceChart';
import PerformanceChart from '../charts/PerformanceChart';

export default function DashboardCharts({ chartData, confValues, confStats, theme, mode, setMode }) {
  return (
    <>
      <div className="row justify-content-center mb-4">
        <div className="col-12 text-center">
          <div className="btn-group shadow-sm" role="group" aria-label="Chart Data Source">
            <input
              type="radio"
              className="btn-check"
              name="dashMode"
              id="mode-quiz"
              autoComplete="off"
              checked={mode === 'quiz'}
              onChange={() => setMode('quiz')}
            />
            <label className="btn btn-outline-primary px-4 fw-bold" htmlFor="mode-quiz">
              Tests Analysis
            </label>

            <input
              type="radio"
              className="btn-check"
              name="dashMode"
              id="mode-practice"
              autoComplete="off"
              checked={mode === 'practice'}
              onChange={() => setMode('practice')}
            />
            <label className="btn btn-outline-primary px-4 fw-bold" htmlFor="mode-practice">
              Practice Analysis
            </label>
          </div>
        </div>
      </div>

      <div className="row justify-content-center mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-primary mb-3">🎯 Overall Confidence Analysis</h5>
            <div style={{ position: 'relative', height: 300, width: '100%' }}>
              <ConfidenceChart values={confValues} stats={confStats} theme={theme} />
            </div>
            <p className="small text-muted mt-3 text-center">
              Aggregate accuracy across all recent tests categorized by confidence level.
            </p>
          </div>
        </div>
      </div>

      <div className="row justify-content-center mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-primary mb-3">📈 Accuracy Trend</h5>
            <div style={{ position: 'relative', height: 300, width: '100%' }}>
              <PerformanceChart data={chartData} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

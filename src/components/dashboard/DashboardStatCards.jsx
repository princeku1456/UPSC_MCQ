export default function DashboardStatCards({ stats }) {
  const top = [
    { label: 'Tests Taken', value: stats.totalTests, cls: 'border-primary text-primary', id: 'stat-total-tests' },
    { label: 'Avg. Score', value: `${stats.avgScore}%`, cls: 'border-warning text-warning', id: 'stat-avg-score' },
    {
      label: 'Precision',
      value: `${stats.precision}%`,
      cls: 'border-success text-success',
      id: 'stat-precision-rate',
      sub: 'Net Accuracy',
    },
    {
      label: 'Neg. Drain',
      value: `${stats.negativeDrain}%`,
      cls: 'border-danger text-danger',
      id: 'stat-negative-drain',
      sub: 'Marks Lost',
    },
    {
      label: 'Concept Gap',
      value: `${stats.conceptGap}`,
      cls: `border-info text-info ${stats.conceptGapBorder}`,
      id: 'stat-concept-gap',
      sub: 'Easy Qs Missed',
    },
  ];

  const bottom = [
    { label: 'Total Qs', value: stats.totalQs, cls: 'border-dark', id: 'stat-all-total' },
    { label: 'Attempted', value: stats.attempted, cls: 'border-primary text-primary', id: 'stat-all-attempted' },
    { label: 'Unattempted', value: stats.unattempted, cls: 'border-secondary text-secondary', id: 'stat-all-unattempted' },
    { label: 'Correct', value: stats.correct, cls: 'border-success text-success', id: 'stat-all-correct' },
    { label: 'Incorrect', value: stats.incorrect, cls: 'border-danger text-danger', id: 'stat-all-incorrect' },
  ];

  return (
    <>
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3 mb-5 justify-content-center">
        {top.map((s) => (
          <div className="col" key={s.id}>
            <div className={`p-3 bg-white rounded shadow-sm border-start border-4 h-100 ${s.cls}`}>
              <h6 className="text-muted text-uppercase small fw-bold">{s.label}</h6>
              <h2 className={`fw-bold mb-0 ${s.value !== undefined ? '' : ''}`} id={s.id}>
                {s.value}
              </h2>
              {s.sub && <small className="text-muted">{s.sub}</small>}
            </div>
          </div>
        ))}
      </div>

      <div className="row row-cols-1 row-cols-md-5 g-3 mb-5 justify-content-center">
        {bottom.map((s) => (
          <div className="col" key={s.id}>
            <div className={`p-3 bg-white rounded shadow-sm border-bottom border-4 h-100 ${s.cls}`}>
              <h6 className="text-muted text-uppercase small fw-bold">{s.label}</h6>
              <h2 className="fw-bold mb-0" id={s.id}>
                {s.value}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

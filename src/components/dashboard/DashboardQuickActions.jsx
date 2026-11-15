import { useNavigate } from 'react-router-dom';

export default function DashboardQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Take Test',
      emoji: '🚀',
      cls: 'text-success',
      onClick: () => navigate('/test'),
    },
    {
      label: 'Practice MCQ',
      emoji: '🎯',
      cls: 'text-info',
      onClick: () => navigate('/practice'),
    },
  ];

  return (
    <div className="row justify-content-center mb-4">
      {actions.map((a) => (
        <div className="col-md-6" key={a.label}>
          <div
            className="card topic-card shadow-sm h-100"
            style={{ cursor: 'pointer' }}
            onClick={a.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                a.onClick();
              }
            }}
          >
            <div className="card-body text-center p-4">
              <div className="display-5 mb-2">{a.emoji}</div>
              <h3 className={`fw-bold card-title m-0 ${a.cls}`}>{a.label}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

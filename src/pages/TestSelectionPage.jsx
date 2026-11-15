import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataManager from '../lib/dataManager';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';

export default function TestSelectionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manifest, setManifest] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, h] = await Promise.all([
          DataManager.fetchQuizManifest(),
          user ? DataManager.syncUserHistory(user.uid) : Promise.resolve([]),
        ]);
        setManifest(m);
        setUserHistory(h || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const completedChapterIds = new Set(userHistory.map((h) => h.chapterId));

  const sortedSubjects = manifest
    ? Object.keys(manifest).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      )
    : [];

  return (
    <section className="py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Take Test' }]} />
        <div className="text-center mb-4">
          <h4 className="fw-bold section-title">Select a Subject</h4>
          <div className="title-underline mx-auto"></div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading Subjects from Cloud...</p>
          </div>
        ) : !manifest ? (
          <div className="alert alert-danger text-center">Failed to load Quiz Data from Firebase!</div>
        ) : (
          <div className="row justify-content-center g-4">
            {sortedSubjects.map((subjectKey) => {
              const chapters = manifest[subjectKey];
              const totalChapters = Object.keys(chapters).length;
              const subjectPrefix = `${subjectKey.replace(/\s+/g, '_')}_`;
              const completedCount = Object.keys(chapters).filter((chapId) =>
                completedChapterIds.has(subjectPrefix + chapId)
              ).length;
              const progressPercent = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
              const isCompleted = progressPercent === 100;

              return (
                <div className="col-md-4 col-lg-3 mb-4" key={subjectKey}>
                  <div
                    className={`card topic-card h-100 ${isCompleted ? 'subject-completed' : ''}`}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/test/${encodeURIComponent(subjectKey)}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/test/${encodeURIComponent(subjectKey)}`);
                      }
                    }}
                  >
                    <div className="card-body text-center p-4 d-flex flex-column">
                      <div className="display-4 mb-3">{isCompleted ? '🏆' : '📖'}</div>
                      {isCompleted && <div className="badge bg-success mb-2 animate-fade-in">✨ Completed</div>}
                      <h5 className="card-title text-primary fw-bold">{subjectKey}</h5>
                      <p className="text-muted small mb-3">
                        {completedCount} / {totalChapters} Chapters Done
                      </p>
                      <div className="mt-auto">
                        <div
                          className="progress mb-2"
                          style={{ height: 25, backgroundColor: 'var(--border-color)', borderRadius: 5 }}
                        >
                          <div
                            className={`progress-bar ${isCompleted ? 'bg-success' : ''}`}
                            role="progressbar"
                            style={{
                              width: `${progressPercent}%`,
                              ...(isCompleted ? {} : { backgroundColor: 'var(--accent-color)' }),
                              borderRadius: 5,
                            }}
                          />
                        </div>
                        <small className={`fw-bold ${isCompleted ? 'text-success' : 'text-secondary'}`}>
                          {progressPercent}% Complete
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

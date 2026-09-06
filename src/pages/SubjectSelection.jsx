import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function SubjectSelection() {
  const {
    view,
    currentSubject,
    quizManifest,
    userHistory,
    showDashboard,
    showSubjects,
    showChapters,
    loadQuiz,
    reviewTest,
    openRevisionModal,
  } = useApp();

  const isChaptersView = view === 'chapters';
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quizManifest) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [quizManifest]);

  if (loading) {
    return (
      <section className="py-5" style={{ minHeight: '90vh' }}>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading Subjects from Cloud...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!quizManifest) {
    return (
      <section className="py-5" style={{ minHeight: '90vh' }}>
        <div className="container">
          <div className="alert alert-danger text-center">Failed to load Quiz Data from Firebase!</div>
        </div>
      </section>
    );
  }

  if (isChaptersView && currentSubject) {
    return <ChaptersView />;
  }

  return <SubjectsView />;

  function SubjectsView() {
    const sortedSubjectKeys = Object.keys(quizManifest).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );
    const completedChapterIds = new Set((userHistory || []).map((h) => h.chapterId));

    return (
      <section className="py-5" style={{ minHeight: '90vh' }}>
        <div className="container">
          <button className="btn btn-primary-custom px-4 shadow mb-4" onClick={showDashboard}>← Back to Dashboard</button>
          <div className="text-center mb-4">
            <h4 className="fw-bold section-title">Select a Subject</h4>
            <div className="title-underline mx-auto"></div>
          </div>
          <div className="row justify-content-center g-4">
            {sortedSubjectKeys.map((subjectKey) => {
              const chapters = quizManifest[subjectKey];
              const totalChapters = Object.keys(chapters).length;
              const subjectPrefix = subjectKey.replace(/\s+/g, '_') + '_';
              const completedChaptersCount = Object.keys(chapters).filter((chapId) =>
                completedChapterIds.has(subjectPrefix + chapId),
              ).length;
              const progressPercent = totalChapters > 0 ? Math.round((completedChaptersCount / totalChapters) * 100) : 0;
              const isCompleted = progressPercent === 100;
              return (
                <div className="col-md-4 col-lg-3 mb-4" key={subjectKey}>
                  <div
                    className={`card topic-card h-100 ${isCompleted ? 'subject-completed' : ''}`}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex="0"
                    onClick={() => showChapters(subjectKey)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') showChapters(subjectKey); }}
                  >
                    <div className="card-body text-center p-4 d-flex flex-column">
                      <div className="display-4 mb-3">{isCompleted ? '🏆' : '📖'}</div>
                      {isCompleted && <div className="badge bg-success mb-2 animate-fade-in">✨ Completed</div>}
                      <h5 className="card-title text-primary fw-bold">{subjectKey}</h5>
                      <p className="text-muted small mb-3">{completedChaptersCount} / {totalChapters} Chapters Done</p>
                      <div className="mt-auto">
                        <div className="progress mb-2" style={{ height: 25, backgroundColor: 'var(--border-color)', borderRadius: 5 }}>
                          <div
                            className={`progress-bar ${isCompleted ? 'bg-success' : ''}`}
                            role="progressbar"
                            style={{ width: `${progressPercent}%`, backgroundColor: isCompleted ? undefined : 'var(--accent-color)', borderRadius: 5 }}
                          ></div>
                        </div>
                        <small className={`fw-bold ${isCompleted ? 'text-success' : 'text-secondary'}`}>{progressPercent}% Complete</small>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  function ChaptersView() {
    const chapters = quizManifest[currentSubject] || {};
    const sortedChapterIds = Object.keys(chapters).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );

    const latestResultsMap = new Map();
    (userHistory || []).forEach((h) => {
      if (!latestResultsMap.has(h.chapterId)) latestResultsMap.set(h.chapterId, h);
    });

    return (
      <section className="py-5" style={{ minHeight: '90vh' }}>
        <div className="container">
          <button className="btn btn-primary-custom px-4 shadow mb-4" onClick={showSubjects}>← Back to Subjects</button>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="text-start">
              <h4 className="fw-bold section-title mb-1">Chapters: {currentSubject}</h4>
              <div className="title-underline"></div>
            </div>
            <button className="btn btn-secondary-custom shadow-sm fw-bold" onClick={() => openRevisionModal(currentSubject)}>
              <i className="bi bi-journal-text me-1"></i>Create Revision Test
            </button>
          </div>
          <div className="row">
            {sortedChapterIds.map((chapId) => {
              const fullChapterId = currentSubject.replace(/\s+/g, '_') + '_' + chapId;
              const latestResult = latestResultsMap.get(fullChapterId);
              const hasTaken = !!latestResult;
              return (
                <div className="col-md-6 col-lg-4 mb-4" key={chapId}>
                  <div className="card chapter-card h-100 border-0">
                    <div className="card-body d-flex flex-column p-4">
                      <h5 className="card-title fw-bold text-dark">{chapId}</h5>
                      <div className="mt-auto">
                        <button className="btn btn-primary-custom w-100 action-btn" onClick={() => loadQuiz(currentSubject, chapId, encodeURIComponent(chapId))}>
                          {hasTaken ? '↻ Retake Test' : '🚀 Start Test'}
                        </button>
                        {hasTaken && (
                          <button className="btn btn-secondary-custom w-100 mt-2 review-perf-btn" onClick={() => reviewTest(latestResult, 'chapters')}>
                            👁 Review Performance
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}

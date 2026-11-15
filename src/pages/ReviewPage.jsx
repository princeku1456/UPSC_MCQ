import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataManager from '../lib/dataManager';
import { useQuizSession } from '../contexts/QuizSessionContext';
import { useAuth } from '../contexts/AuthContext';
import { getCorrectIndex, calculateConfidenceStats, DifficultyHelper } from '../lib/stats';
import TextFormatter from '../lib/textFormatter';
import ConfidenceChart from '../components/charts/ConfidenceChart';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ReviewPage() {
  const { session } = useQuizSession();
  const { user, theme } = useAuth();
  const navigate = useNavigate();

  const [globalStats, setGlobalStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    if (!session) return;
    if (session.chapterId && !session.chapterId.startsWith('revision_')) {
      DataManager.fetchGlobalStats(session.chapterId).then(setGlobalStats);
    }
  }, [session]);

  const questions = session?.questions || [];
  const reviewData = session?.reviewData || {};
  const userAnswers = reviewData.userAnswers || {};

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    questions.forEach((q, i) => {
      const uAns = userAnswers[i];
      if (uAns && uAns.answer !== undefined && uAns.answer !== -1) {
        if (uAns.answer === getCorrectIndex(q)) correct++;
        else incorrect++;
      } else {
        unattempted++;
      }
    });
    return { correct, incorrect, unattempted };
  }, [questions, userAnswers]);

  const subjects = useMemo(() => {
    const set = new Set(questions.map((q) => q.subject).filter(Boolean));
    return [...set];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => {
        if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
        const uAns = userAnswers[i];
        if (statusFilter === 'all') return true;
        if (statusFilter === 'correct') return uAns && uAns.answer === getCorrectIndex(q);
        if (statusFilter === 'incorrect') return uAns && uAns.answer !== -1 && uAns.answer !== getCorrectIndex(q);
        if (statusFilter === 'unattempted') return !uAns || uAns.answer === undefined || uAns.answer === -1;
        return true;
      });
  }, [questions, userAnswers, statusFilter, subjectFilter]);

  const { confValues, confStats } = useMemo(
    () => calculateConfidenceStats([reviewData]),
    [reviewData]
  );

  if (!session) {
    return (
      <section className="py-5 text-center" style={{ minHeight: '90vh' }}>
        <p className="text-muted">No review session found.</p>
        <button className="btn btn-primary-custom" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </section>
    );
  }

  return (
    <section className="py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Take Test', to: '/test' },
            { label: `Review: ${session.chapterName || session.subject}` },
          ]}
        />

        <button className="btn btn-primary-custom px-4 shadow mb-4" onClick={() => navigate('/test')}>
          ← Back
        </button>

        <div className="text-center mb-4">
          <h4 className="fw-bold section-title">Performance Review</h4>
          <div className="title-underline mx-auto"></div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-center">
          <h5 className="fw-bold text-primary mb-3">
            {session.chapterName} — {reviewData.scorePercent}%
          </h5>
          <p>
            ✅ Correct: <strong>{stats.correct}</strong> | ❌ Incorrect:{' '}
            <strong>{stats.incorrect}</strong> | ⚪ Unattempted:{' '}
            <strong>{stats.unattempted}</strong>
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
          {['all', 'correct', 'incorrect', 'unattempted'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm fw-bold ${statusFilter === f ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          {subjects.length > 1 && (
            <select
              className="form-select form-select-sm w-auto"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div id="review-container">
              {filteredQuestions.map(({ q, i }) => {
                const cIdx = getCorrectIndex(q);
                const uAns = userAnswers[i];
                const selected = uAns?.answer;
                const isCorrect = selected === cIdx;
                const diff = globalStats
                  ? DifficultyHelper.calculate(
                      (globalStats.correctCounts && globalStats.correctCounts[i]) || 0,
                      globalStats.totalAttempts || 0
                    )
                  : null;
                const timeSpent = reviewData.questionTimeSpent?.[i];

                return (
                  <div className="card mb-4 shadow-sm border-0" key={i}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold text-primary mb-0">Question {i + 1}</h6>
                        <div className="d-flex gap-2 align-items-center">
                          {q.subject && <span className="badge bg-secondary">{q.subject}</span>}
                          {diff && (
                            <span className={`badge bg-${diff.color}`}>
                              {diff.label} ({diff.percentage}%)
                            </span>
                          )}
                          {timeSpent != null && (
                            <span className="badge bg-light text-dark">
                              ⏱ {Math.round(timeSpent)}s
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="fw-bold mb-3"
                        dangerouslySetInnerHTML={{ __html: TextFormatter.formatQuestionText(q.text) }}
                      />

                      {q.options.map((opt, oi) => {
                        let cls = 'option p-3';
                        if (oi === cIdx) cls += ' correct-answer-label';
                        if (selected === oi && oi !== cIdx) cls += ' incorrect-answer-label';
                        return (
                          <div key={oi} className={cls}>
                            {oi === cIdx ? '✅' : selected === oi ? '❌' : '○'} {opt}
                          </div>
                        );
                      })}

                      {q.explanation && (
                        <div className="explanation shadow-sm mt-3">
                          <strong>💡 Explanation:</strong>
                          <br />
                          <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-lg-4">
            {globalStats?.leaderboard?.length > 0 && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h5 className="fw-bold text-primary mb-3">🏆 Leaderboard</h5>
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalStats.leaderboard.map((entry, idx) => {
                        const email = entry.userEmail || 'guest';
                        const masked = email.split('@')[0].slice(0, 2) + '***';
                        return (
                          <tr key={entry.resultId || idx} className={entry.userEmail === user?.email ? 'table-primary' : ''}>
                            <td>{idx + 1}</td>
                            <td>{masked}</td>
                            <td>{entry.scorePercent}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold text-primary mb-3">🎯 Confidence Analysis</h5>
              <div style={{ position: 'relative', height: 260, width: '100%' }}>
                <ConfidenceChart values={confValues} stats={confStats} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

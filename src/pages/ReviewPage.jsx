import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useApp } from '../context/AppContext.jsx';
import { DataManager } from '../lib/dataManager.js';
import { TextFormatter, getCorrectIndex, DifficultyHelper, formatTime } from '../lib/helpers.js';
import { renderConfidenceChart } from '../lib/charts.js';

export default function ReviewPage() {
  const { quiz, currentUser, exitQuiz } = useApp();
  const [globalStats, setGlobalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [filter, setFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const confidenceRef = useRef(null);
  const comparisonRef = useRef(null);
  const spiderRef = useRef(null);

  const questions = quiz.data || [];
  const answers = quiz.answers || {};
  const timeSpent = quiz.questionTimeSpent || {};
  const resultData = quiz.reviewData || quiz.resultObject;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (quiz.chapterId.startsWith('revision_')) {
        setGlobalStats(null);
        return;
      }
      const stats = await DataManager.fetchGlobalStats(quiz.chapterId);
      if (!cancelled) setGlobalStats(stats);
    }
    load();
    return () => { cancelled = true; };
  }, [quiz.chapterId]);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaderboard() {
      if (quiz.chapterId.startsWith('revision_')) {
        setLeaderboard([]);
        return;
      }
      const stats = await DataManager.fetchGlobalStats(quiz.chapterId);
      if (!cancelled) setLeaderboard(stats?.leaderboard || []);
    }
    loadLeaderboard();
    return () => { cancelled = true; };
  }, [quiz.chapterId]);

  const { correct, incorrect, unattempted, sillyMistakes, hardSuccess, missedEasyQNumbers, difficultyStats, subjectStats, confStats, confValues, accuracyRate, marksLost, score, totalMarks } = computeStats(questions, answers, globalStats, resultData);

  const hasSubjectStats = Object.values(subjectStats).some((s) => s.total > 0);

  useEffect(() => {
    const ctx = confidenceRef.current;
    if (!ctx) return;
    const chart = renderConfidenceChart(ctx, confValues, confStats);
    return () => chart && chart.destroy();
  }, [confValues]);

  useEffect(() => {
    const ctx = comparisonRef.current;
    if (!ctx || !globalStats) return;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = dark ? '#e5e7eb' : '#666';
    const myScore = resultData ? resultData.scorePercent : 0;
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Global Avg', 'Your Score', 'Topper'],
        datasets: [{
          label: 'Score (%)',
          data: [globalStats.avg.toFixed(1), myScore.toFixed(1), globalStats.highest.toFixed(1)],
          backgroundColor: ['rgba(108, 117, 125, 0.5)', 'rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)'],
          borderColor: ['rgba(108, 117, 125, 1)', 'rgba(30, 58, 138, 1)', 'rgba(245, 158, 11, 1)'],
          borderWidth: 1,
          borderRadius: 5,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, max: 100, grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { display: false }, ticks: { color: textColor } },
        },
      },
    });
    return () => chart.destroy();
  }, [globalStats]);

  useEffect(() => {
    if (!hasSubjectStats) return;
    const ctx = spiderRef.current;
    if (!ctx) return;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = dark ? '#e5e7eb' : '#666';
    const gridColor = dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const subjects = [];
    const accuracies = [];
    const correctAttempts = [];
    const incorrectAttempts = [];
    const unattemptedQs = [];
    Object.keys(subjectStats).forEach((subject) => {
      const s = subjectStats[subject];
      if (s.total > 0) {
        subjects.push(subject);
        const attempted = s.correct + s.incorrect;
        accuracies.push(attempted > 0 ? ((s.correct / attempted) * 100).toFixed(1) : 0);
        correctAttempts.push(s.correct);
        incorrectAttempts.push(s.incorrect);
        unattemptedQs.push(s.unattempted);
      }
    });

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: subjects,
        datasets: [
          { type: 'line', label: 'Accuracy (%)', data: accuracies, borderColor: 'rgba(59, 130, 246, 1)', backgroundColor: 'rgba(59, 130, 246, 1)', pointBackgroundColor: 'rgba(59, 130, 246, 1)', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgba(59, 130, 246, 1)', borderWidth: 3, pointRadius: 4, pointHoverRadius: 6, fill: false, yAxisID: 'y1' },
          { type: 'bar', label: 'Correct Qs', data: correctAttempts, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 1, yAxisID: 'y' },
          { type: 'bar', label: 'Incorrect Qs', data: incorrectAttempts, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 1, yAxisID: 'y' },
          { type: 'bar', label: 'Unattempted Qs', data: unattemptedQs, backgroundColor: 'rgba(250, 204, 21, 0.8)', borderColor: 'rgba(250, 204, 21, 1)', borderWidth: 1, borderRadius: { topLeft: 4, topRight: 4 }, yAxisID: 'y' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: textColor, font: { family: "'Poppins', sans-serif" } } },
          y: { stacked: true, type: 'linear', display: true, position: 'left', title: { display: true, text: 'Questions Count', color: textColor, font: { size: 10 } }, grid: { color: gridColor, drawBorder: false }, ticks: { color: textColor, precision: 0 } },
          y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Accuracy (%)', color: 'rgba(59, 130, 246, 1)', font: { size: 10 } }, grid: { drawOnChartArea: false }, ticks: { color: 'rgba(59, 130, 246, 1)', suggestedMin: 0, suggestedMax: 100, stepSize: 20 } },
        },
        plugins: {
          legend: { position: 'top', labels: { color: textColor, usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            backgroundColor: dark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: dark ? '#f8fafc' : '#0f172a',
            bodyColor: dark ? '#cbd5e1' : '#334155',
            borderColor: dark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                  if (context.datasetIndex === 0) label += '%';
                }
                return label;
              },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [hasSubjectStats]);

  const filteredQuestions = questions.map((q, i) => ({ q, i })).filter(({ q, i }) => {
    const uAns = answers[i];
    const cIdx = getCorrectIndex(q);
    let status = 'unattempted';
    if (uAns) status = uAns.answer === cIdx ? 'correct' : 'incorrect';
    const matchStatus = filter === 'all' || status === filter;
    const matchSubject = subjectFilter === 'all' || (q.subject || '') === subjectFilter;
    return matchStatus && matchSubject;
  });

  const percentile = computePercentile(globalStats, resultData);

  return (
    <section className="quiz-section py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-bottom pb-3">
          <div>
            <h4 className="fw-bold text-primary m-0">{quiz.chapterName}</h4>
            <span className="badge bg-secondary">Performance Review</span>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {hasSubjectStats && (
              <select className="form-select w-auto shadow-sm" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="all">All Subjects</option>
                {Object.keys(subjectStats).filter((s) => subjectStats[s].total > 0).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
            <div className="btn-group shadow-sm" role="group">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} cls="btn-outline-primary">All</FilterButton>
              <FilterButton active={filter === 'correct'} onClick={() => setFilter('correct')} cls="btn-outline-success">Correct</FilterButton>
              <FilterButton active={filter === 'incorrect'} onClick={() => setFilter('incorrect')} cls="btn-outline-danger">Incorrect</FilterButton>
              <FilterButton active={filter === 'unattempted'} onClick={() => setFilter('unattempted')} cls="btn-outline-secondary">Unattempted</FilterButton>
            </div>
          </div>
        </div>

        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <h5 className="fw-bold card-title mb-3">📊 UPSC Prep Index</h5>
            <div className="row g-3 text-center mb-4">
              <div className="col-6 col-md-3"><IndexCard border="primary" label="Accuracy" value={accuracyRate + '%'} color="dark" /></div>
              <div className="col-6 col-md-3"><IndexCard border="danger" label="Negative Loss" value={'-' + marksLost} color="danger" /></div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-warning">
                  <h6 className="text-uppercase text-muted small fw-bold mb-1">Concept Gaps</h6>
                  <h3 className="fw-bold text-warning m-0">{sillyMistakes}</h3>
                  <small className="text-muted d-block">
                    {missedEasyQNumbers.length > 0 ? <>Easy Qs Missed -- <span className="text-danger fw-bold">"{missedEasyQNumbers.join(', ')}"</span></> : 'No Easy Qs Missed'}
                  </small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-primary text-white rounded shadow-sm">
                  <h6 className="text-white-50 text-uppercase small fw-bold mb-1">Final Score</h6>
                  <h3 className="fw-bold m-0">{score} <span className="fs-6 text-white-50">/ {totalMarks}</span></h3>
                </div>
              </div>
            </div>
            <div className="row g-2 mb-4 text-center">
              <div className="col-4 col-md"><MiniStat label="TOTAL Qs" value={questions.length} /></div>
              <div className="col-4 col-md"><MiniStat label="ATTEMPTED" value={correct + incorrect} cls="text-primary" /></div>
              <div className="col-4 col-md"><MiniStat label="UNATTEMPTED" value={unattempted} cls="text-secondary" /></div>
              <div className="col-6 col-md"><MiniStat label="CORRECT" value={correct} cls="text-success" /></div>
              <div className="col-6 col-md"><MiniStat label="INCORRECT" value={incorrect} cls="text-danger" /></div>
            </div>

            <DifficultyMatrix difficultyStats={difficultyStats} />
            {hasSubjectStats && <SubjectMatrix subjectStats={subjectStats} spiderRef={spiderRef} />}

            <div className="row mb-4 g-3">
              <div className="col-md-6">
                <div className="alert alert-info border-0 shadow-sm h-100">
                  <h6 className="fw-bold"><i className="fas fa-lightbulb me-2"></i>Strategy Insight</h6>
                  <p className="small mb-0">
                    {accuracyRate < 70 ? 'Your accuracy is below threshold. Focus on elimination techniques.' : 'Good precision. You are making calculated attempts.'}{' '}
                    {sillyMistakes > 2 ? <>You missed <strong>{sillyMistakes} basic questions</strong> that 65% of students got right. Tighten your fundamentals.</> : "You handled the 'easy' questions with professional precision."}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="alert alert-success border-0 shadow-sm h-100">
                  <h6 className="fw-bold"><i className="fas fa-trophy me-2"></i>Competitive Edge</h6>
                  <p className="small mb-0">You solved <strong>{hardSuccess} high-difficulty</strong> questions where the community struggled. This indicates depth in complex topics.</p>
                </div>
              </div>
            </div>

            <Leaderboard data={leaderboard} currentUser={currentUser} />

            <div className="row align-items-center pt-3 border-top">
              {globalStats ? (
                <>
                  <div className="col-md-4 mb-3 mb-md-0 text-center">
                    <h6 className="text-uppercase text-muted small fw-bold">Your Rank</h6>
                    <h2 className="fw-bold text-primary">Top {100 - percentile}%</h2>
                    <p className="small text-muted">Better than {percentile}% of users</p>
                  </div>
                  <div className="col-md-8">
                    <div style={{ height: 200, width: '100%' }}>
                      <canvas ref={comparisonRef}></canvas>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-12 text-center text-muted">Not enough data for global comparison yet.</div>
              )}
            </div>

            <div className="mb-5 mt-5 p-3 rounded border bg-white">
              <h6 className="fw-bold text-secondary mb-3"><i className="bi bi-graph-up-arrow me-2"></i>Confidence vs Accuracy Analysis</h6>
              <div style={{ height: 250, width: '100%' }}>
                <canvas ref={confidenceRef}></canvas>
              </div>
              <p className="small text-muted mt-2 text-center">Correct attempts as a % of each confidence level.</p>
            </div>
          </div>
        </div>

        <div id="review-container">
          {filteredQuestions.length === 0 ? (
            <div className="alert alert-info text-center mt-3">No questions found for this filter.</div>
          ) : (
            filteredQuestions.map(({ q, i }) => <ReviewQuestionCard key={i} question={q} index={i} answers={answers} timeSpent={timeSpent} globalStats={globalStats} />)
          )}
        </div>

        <div className="text-center mt-5">
          <button className="btn btn-primary-custom px-5 shadow py-2" onClick={exitQuiz}>← Back</button>
        </div>
      </div>
    </section>
  );
}

function FilterButton({ active, onClick, cls, children }) {
  return (
    <button className={`btn ${cls}${active ? ' active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function IndexCard({ border, label, value, color }) {
  return (
    <div className={`p-3 bg-white rounded shadow-sm border-start border-4 border-${border}`}>
      <h6 className="text-uppercase text-muted small fw-bold mb-1">{label}</h6>
      <h3 className={`fw-bold text-${color} m-0`}>{value}</h3>
    </div>
  );
}

function MiniStat({ label, value, cls }) {
  return (
    <div className="p-2 border rounded bg-light">
      <small className="text-muted d-block small fw-bold">{label}</small>
      <span className={`fw-bold ${cls || ''}`}>{value}</span>
    </div>
  );
}

function DifficultyMatrix({ difficultyStats }) {
  const rows = ['Easy', 'Medium', 'Hard'].map((level) => {
    const stats = difficultyStats[level] || { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
    const attempted = stats.correct + stats.incorrect;
    const acc = attempted > 0 ? ((stats.correct / attempted) * 100).toFixed(1) : 0;
    let badgeClass = 'bg-secondary';
    if (level === 'Easy') badgeClass = 'bg-success';
    if (level === 'Medium') badgeClass = 'bg-warning text-dark';
    if (level === 'Hard') badgeClass = 'bg-danger';
    return (
      <tr key={level}>
        <td><span className={`badge ${badgeClass}`}>{level}</span></td>
        <td className="text-center">{stats.total}</td>
        <td className="text-center text-success fw-bold">{stats.correct}</td>
        <td className="text-center text-danger fw-bold">{stats.incorrect}</td>
        <td className="text-center text-muted">{stats.unattempted}</td>
        <td className="text-end fw-bold">{acc}%</td>
      </tr>
    );
  });

  return (
    <div className="card mb-4 border-0 shadow-sm">
      <div className="card-header bg-white border-bottom py-2">
        <h6 className="fw-bold text-primary m-0">🎯 Performance by Difficulty</h6>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light small text-muted">
            <tr><th>Difficulty</th><th className="text-center">Total</th><th className="text-center">Correct</th><th className="text-center">Incorrect</th><th className="text-center">Unattempted</th><th className="text-end">Accuracy</th></tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}

function SubjectMatrix({ subjectStats, spiderRef }) {
  const rows = Object.keys(subjectStats).map((subject) => {
    const stats = subjectStats[subject];
    if (stats.total === 0) return null;
    const attempted = stats.correct + stats.incorrect;
    const acc = attempted > 0 ? ((stats.correct / attempted) * 100).toFixed(1) : 0;
    return (
      <tr key={subject}>
        <td><span className="badge bg-secondary">{subject}</span></td>
        <td className="text-center">{stats.total}</td>
        <td className="text-center text-success fw-bold">{stats.correct}</td>
        <td className="text-center text-danger fw-bold">{stats.incorrect}</td>
        <td className="text-center text-muted">{stats.unattempted}</td>
        <td className="text-end fw-bold">{acc}%</td>
      </tr>
    );
  }).filter(Boolean);

  return (
    <div className="card mb-4 border-0 shadow-sm">
      <div className="card-header bg-white border-bottom py-2">
        <h6 className="fw-bold text-primary m-0">📚 Subject-wise Performance</h6>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light small text-muted">
            <tr><th>Subject</th><th className="text-center">Total</th><th className="text-center">Correct</th><th className="text-center">Incorrect</th><th className="text-center">Unattempted</th><th className="text-end">Accuracy</th></tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      <div className="card-body border-top text-center" style={{ maxHeight: 400, display: 'flex', justifyContent: 'center' }}>
        <canvas ref={spiderRef} style={{ maxHeight: 350, width: '100%', maxWidth: 500 }}></canvas>
      </div>
    </div>
  );
}

function Leaderboard({ data, currentUser }) {
  if (!data || data.length === 0) {
    return <div className="alert alert-light border text-center text-muted small">No other attempts yet. Be the first!</div>;
  }
  const uniqueUsers = {};
  data.forEach((entry) => {
    const email = entry.userEmail || 'Guest';
    if (!uniqueUsers[email] || entry.scorePercent > uniqueUsers[email].scorePercent) uniqueUsers[email] = entry;
  });
  const filteredSortedData = Object.values(uniqueUsers).sort((a, b) => b.scorePercent - a.scorePercent);
  let rank = 1;

  return (
    <div className="card border-0 shadow-sm overflow-hidden mt-3 mb-4">
      <div className="card-header bg-white border-bottom py-2">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="fw-bold text-primary m-0">🏆 Leaderboard</h6>
          <small className="text-muted">Top Students</small>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
          <tbody className="bg-white">
            {filteredSortedData.map((entry) => {
              const email = entry.userEmail || 'Guest';
              const rawName = email.split('@')[0];
              const displayName = rawName.length > 3 ? rawName.substring(0, 3) + '***' : rawName;
              const isMe = currentUser && entry.userEmail === currentUser.email;
              return (
                <tr key={email} className={isMe ? 'table-warning fw-bold' : ''}>
                  <td className="ps-3 text-secondary">#{rank++}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 shadow-sm" style={{ width: 24, height: 24, fontSize: 10 }}>
                        {rawName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-dark">{displayName}</span>
                      {isMe && <span className="badge bg-warning text-dark dummy-tag ms-2" style={{ fontSize: '0.6rem' }}>YOU</span>}
                    </div>
                  </td>
                  <td className="text-end pe-3">
                    <span className={`badge ${entry.scorePercent >= 80 ? 'bg-success' : 'bg-primary'}`}>{entry.scorePercent}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewQuestionCard({ question, index, answers, timeSpent, globalStats }) {
  const correctIndex = getCorrectIndex(question);
  const uAns = answers[index];
  const userSurety = uAns?.surety !== undefined ? uAns.surety : 'N/A';
  let status = 'unattempted';
  if (uAns) status = uAns.answer === correctIndex ? 'correct' : 'incorrect';

  let badgeHtml;
  let borderClass;
  if (status === 'correct') { badgeHtml = <span className="badge bg-success mb-2">Correct</span>; borderClass = 'border-success'; }
  else if (status === 'incorrect') { badgeHtml = <span className="badge bg-danger mb-2">Incorrect</span>; borderClass = 'border-danger'; }
  else { badgeHtml = <span className="badge bg-secondary mb-2">Unattempted</span>; borderClass = 'border-secondary'; }

  const suretyClass = `surety-${userSurety === 100 ? 100 : userSurety === 75 ? 75 : userSurety === 50 ? 50 : 0}`;

  const commTotal = globalStats?.totalAttempts || 0;
  const commCorrect = globalStats?.correctCounts?.[index] || 0;
  const diffInfo = DifficultyHelper.calculate(commCorrect, commTotal);

  let statsHtml = null;
  if (globalStats && globalStats.totalAttempts > 0) {
    const total = globalStats.totalAttempts;
    const correctCount = commCorrect;
    const attemptedCount = (globalStats.attemptedCounts && globalStats.attemptedCounts[index]) || 0;
    const pCorrect = Math.round((correctCount / total) * 100);
    const pIncorrect = Math.round(((attemptedCount - correctCount) / total) * 100);
    const pUnattempted = 100 - pCorrect - pIncorrect;
    statsHtml = (
      <div className="mt-2 mb-4 p-3 bg-light bg-opacity-75 rounded-3 border">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small fw-bold text-uppercase text-secondary" style={{ letterSpacing: '0.5px' }}>👥 Community Stats</span>
          <span className="fw-bold" style={{ color: '#4338ca' }}>{pCorrect}% Correct</span>
        </div>
        <div className="progress shadow-sm" style={{ height: 40, backgroundColor: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <div className="progress-bar stats-bar-correct d-flex align-items-center justify-content-center" role="progressbar" style={{ width: `${pCorrect}%` }}><span className="progress-bar-text">{pCorrect > 12 ? pCorrect + '%' : ''}</span></div>
          <div className="progress-bar stats-bar-incorrect d-flex align-items-center justify-content-center" role="progressbar" style={{ width: `${pIncorrect}%` }}><span className="progress-bar-text">{pIncorrect > 12 ? pIncorrect + '%' : ''}</span></div>
          <div className="progress-bar stats-bar-left d-flex align-items-center justify-content-center" role="progressbar" style={{ width: `${pUnattempted}%` }}><span className="progress-bar-text">{pUnattempted > 12 ? pUnattempted + '%' : ''}</span></div>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
          <span className="fw-bold" style={{ color: '#4338ca' }}>Total test taken by: {total}</span>
        </div>
      </div>
    );
  }

  const timeSec = (timeSpent && timeSpent[index]) ? Math.round(timeSpent[index]) : 0;
  const timeLabel = formatTime(timeSec);
  const timeBadge = <span className="badge bg-light text-dark border ms-2">⏱ {timeLabel}</span>;
  const subjectBadge = question.subject ? <span className="badge bg-success-subtle text-success ms-2">📚 {question.subject}</span> : null;

  return (
    <div className={`card mb-4 shadow-sm border-0 border-start border-5 ${borderClass} question-card`}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <h6 className="text-muted fw-bold m-0 me-2">Question {index + 1}</h6>
            <span className={`surety-badge ${suretyClass}`}>Confidence: {userSurety}%</span>
            {timeBadge}
            <span className={`badge bg-${diffInfo.color} mb-2 ms-2`}>{diffInfo.label}</span>
            {subjectBadge}
          </div>
          {badgeHtml}
        </div>
        {statsHtml}
        <div className="fs-5 fw-medium mb-3" dangerouslySetInnerHTML={{ __html: TextFormatter.formatQuestionText(question.text) }}></div>
        <div className="mb-3">
          {question.options.map((opt, optIdx) => {
            let cls = 'option p-3 mb-2 border rounded';
            let icon = '';
            if (optIdx === correctIndex) {
              cls += ' bg-success-subtle border-success fw-bold text-success';
              icon = '✅';
            } else if (uAns && uAns.answer === optIdx && status === 'incorrect') {
              cls += ' bg-danger-subtle border-danger text-danger';
              icon = '❌';
            }
            return <div key={optIdx} className={cls}>{icon} <span className="ms-1">{opt}</span></div>;
          })}
        </div>
        <div className="explanation mt-3 shadow-sm">
          <strong>💡 Explanation:</strong>
          <div className="mt-1 small" dangerouslySetInnerHTML={{ __html: question.explanation || 'No explanation provided.' }}></div>
        </div>
      </div>
    </div>
  );
}

function computeStats(questions, answers, globalStats, resultData) {
  const confStats = { 100: { total: 0, correct: 0 }, 75: { total: 0, correct: 0 }, 50: { total: 0, correct: 0 }, 0: { total: 0, correct: 0 } };
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  let sillyMistakes = 0;
  let hardSuccess = 0;
  const missedEasyQNumbers = [];
  const difficultyStats = { Easy: { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, Medium: { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, Hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0 } };
  const subjectStats = { 'Polity': { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, 'Economy': { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, 'History': { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, 'Geography': { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, 'Environment': { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, 'Science and Tech': { total: 0, correct: 0, incorrect: 0, unattempted: 0 }, 'IR': { total: 0, correct: 0, incorrect: 0, unattempted: 0 } };

  questions.forEach((q, i) => {
    const uAns = answers[i];
    const correctIndex = getCorrectIndex(q);

    if (q.subject) {
      const qSubj = q.subject.trim();
      let matchedSubj = Object.keys(subjectStats).find((s) => s.toLowerCase() === qSubj.toLowerCase());
      if (!matchedSubj && subjectStats[qSubj]) matchedSubj = qSubj;
      if (matchedSubj) {
        subjectStats[matchedSubj].total++;
        if (!uAns) subjectStats[matchedSubj].unattempted++;
        else if (uAns.answer === correctIndex) subjectStats[matchedSubj].correct++;
        else subjectStats[matchedSubj].incorrect++;
      }
    }

    const commCorrect = globalStats?.correctCounts?.[i] || 0;
    const commTotal = globalStats?.totalAttempts || 0;
    const diffInfo = DifficultyHelper.calculate(commCorrect, commTotal);
    const diffLabel = diffInfo.label;

    difficultyStats[diffLabel].total++;
    if (!uAns) difficultyStats[diffLabel].unattempted++;
    else if (uAns.answer === correctIndex) difficultyStats[diffLabel].correct++;
    else difficultyStats[diffLabel].incorrect++;

    const confidence = uAns?.surety;
    if (uAns && confidence !== undefined) {
      confStats[confidence].total++;
      if (uAns.answer === correctIndex) confStats[confidence].correct++;
    }

    if (!uAns) unattempted++;
    else if (uAns.answer === correctIndex) {
      correct++;
      if (diffLabel === 'Hard') hardSuccess++;
    } else {
      incorrect++;
      if (diffLabel === 'Easy') {
        sillyMistakes++;
        missedEasyQNumbers.push(`Q${i + 1}`);
      }
    }
  });

  const confValues = [100, 75, 50, 0].map((key) => confStats[key].total > 0 ? Number(((confStats[key].correct / confStats[key].total) * 100).toFixed(1)) : 0);
  const attempted = correct + incorrect;
  const totalQuestions = questions.length;
  const score = resultData ? resultData.score : parseFloat((correct * 2 - incorrect * 0.66).toFixed(2));
  const totalMarks = totalQuestions * 2;
  const marksLost = (incorrect * 0.66).toFixed(2);
  const accuracyRate = ((correct / (correct + incorrect)) * 100 || 0).toFixed(1);

  return { correct, incorrect, unattempted, sillyMistakes, hardSuccess, missedEasyQNumbers, difficultyStats, subjectStats, confStats, confValues, accuracyRate, marksLost, score, totalMarks };
}

function computePercentile(globalStats, resultData) {
  if (!globalStats) return 0;
  const myScore = resultData ? resultData.scorePercent : 0;
  let betterThan = 0;
  (globalStats.allScores || []).forEach((s) => { if (s < myScore) betterThan++; });
  return globalStats.totalAttempts > 0 ? Math.round((betterThan / globalStats.totalAttempts) * 100) : 0;
}

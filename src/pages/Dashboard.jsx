import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { renderConfidenceChart, renderPerformanceChart } from '../lib/charts.js';
import { calculateConfidenceStats, DifficultyHelper } from '../lib/helpers.js';
import { DataManager } from '../lib/dataManager.js';

export default function Dashboard() {
  const {
    userHistory,
    practiceHistory,
    dashboardMode,
    setDashboardMode,
    showSubjects,
    showPracticeSelection,
    generateAIReview,
    theme,
  } = useApp();

  const performanceRef = useRef(null);
  const confidenceRef = useRef(null);
  const [conceptGap, setConceptGap] = useState('0%');
  const [conceptGapColor, setConceptGapColor] = useState('info');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState(null);

  const combinedHistory = [...userHistory, ...practiceHistory];
  const chartData = dashboardMode === 'quiz' ? userHistory : practiceHistory;

  const totalTests = combinedHistory.length;
  const avgScore = totalTests
    ? (combinedHistory.reduce((acc, curr) => acc + (curr.scorePercent || 0), 0) / totalTests).toFixed(1)
    : 0;

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalAttempted = 0;
  let totalQs = 0;

  combinedHistory.forEach((res) => {
    if (res.totalMarks) totalQs += res.totalMarks / 2;
    else totalQs += (res.correctCount + res.incorrectCount + res.unattemptedCount) || 0;
    if (res.userAnswers) {
      Object.values(res.userAnswers).forEach((ans) => {
        if (ans && ans.answer !== undefined && ans.answer !== -1) {
          totalAttempted++;
          if (ans.isCorrect) totalCorrect++;
          else totalIncorrect++;
        }
      });
    }
  });

  const totalUnattempted = Math.max(0, totalQs - totalAttempted);
  const precisionRate = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0;
  const negativeLoss = totalIncorrect * 0.66;
  const positiveGain = totalCorrect * 2;
  const negativeDrain = positiveGain ? ((negativeLoss / positiveGain) * 100).toFixed(1) : 0;

  const { confValues, confStats } = calculateConfidenceStats(chartData);

  useEffect(() => {
    const perf = renderPerformanceChart(performanceRef.current, chartData);
    const conf = renderConfidenceChart(confidenceRef.current, confValues, confStats);
    return () => {
      if (perf) perf.destroy();
      if (conf) conf.destroy();
    };
  }, [chartData, dashboardMode, theme]);

  useEffect(() => {
    updateConceptGap();
  }, [combinedHistory]);

  async function updateConceptGap() {
    setConceptGap('Analyzing...');
    setConceptGapColor('info');
    try {
      const uniqueChapters = [...new Set(combinedHistory.map((r) => r.chapterId))];
      const statsMap = {};
      await Promise.all(
        uniqueChapters.map(async (id) => {
          const stats = await DataManager.fetchGlobalStats(id);
          if (stats) statsMap[id] = stats;
        }),
      );

      let sillyMistakes = 0;
      let totalQuestionsAttempted = 0;

      combinedHistory.forEach((res) => {
        const stats = statsMap[res.chapterId];
        if (!stats || !res.userAnswers) return;
        Object.entries(res.userAnswers).forEach(([index, ans]) => {
          if (!ans) return;
          totalQuestionsAttempted++;
          if (!ans.isCorrect) {
            const qIdx = parseInt(index);
            const commCorrect = (stats.correctCounts && stats.correctCounts[qIdx]) || 0;
            const commTotal = stats.totalAttempts || 0;
            const diffInfo = DifficultyHelper.calculate(commCorrect, commTotal);
            if (diffInfo.label === 'Easy') sillyMistakes++;
          }
        });
      });

      const gapPercent = totalQuestionsAttempted ? ((sillyMistakes / totalQuestionsAttempted) * 100).toFixed(1) : 0;
      setConceptGap(gapPercent + '%');
      setConceptGapColor(gapPercent > 15 ? 'danger' : 'success');
    } catch (error) {
      console.error('Concept gap calculation error:', error);
      setConceptGap('N/A');
      setConceptGapColor('info');
    }
  }

  async function handleGenerateAIReview() {
    setAiLoading(true);
    setAiContent(null);
    const content = await generateAIReview();
    if (content) setAiContent(content);
    setAiLoading(false);
  }

  return (
    <section id="dashboard-section" className="py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold section-title">My Dashboard</h2>
          <div className="title-underline mx-auto"></div>
        </div>

        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3 mb-5 justify-content-center">
          <StatCard border="primary" color="primary" label="Tests Taken" value={totalTests} />
          <StatCard border="warning" color="warning" label="Avg. Score" value={avgScore + '%'} />
          <StatCard border="success" color="success" label="Precision" value={precisionRate + '%'} sub="Net Accuracy" />
          <StatCard border="danger" color="danger" label="Neg. Drain" value={negativeDrain + '%'} sub="Marks Lost" />
          <StatCard border={conceptGapColor} color={conceptGapColor} label="Concept Gap" value={conceptGap} sub="Easy Qs Missed" />
        </div>

        <div className="row row-cols-1 row-cols-md-5 g-3 mb-5 justify-content-center">
          <StatCard bottom border="dark" label="Total Qs" value={totalQs} />
          <StatCard bottom border="primary" color="primary" label="Attempted" value={totalAttempted} />
          <StatCard bottom border="secondary" color="secondary" label="Unattempted" value={totalUnattempted} />
          <StatCard bottom border="success" color="success" label="Correct" value={totalCorrect} />
          <StatCard bottom border="danger" color="danger" label="Incorrect" value={totalIncorrect} />
        </div>

        <div className="row justify-content-center mb-4">
          <ActionCard emoji="🚀" title="Take Test" color="success" onClick={showSubjects} />
          <ActionCard emoji="🎯" title="Practice MCQ" color="info" onClick={showPracticeSelection} />
        </div>

        <div className="row justify-content-center mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--option-hover) 100%)', border: '1px solid var(--border-color)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-primary mb-0">✨ AI Personalized Mentor</h5>
                <span className="badge bg-primary rounded-pill">Gemini</span>
              </div>
              <div id="ai-review-content" className="mb-3 text-muted">
                {aiLoading ? (
                  <div className="text-center text-muted"><p>Thinking...</p></div>
                ) : aiContent ? (
                  <div className="animate-fade-in markdown-content" dangerouslySetInnerHTML={{ __html: aiContent }} />
                ) : (
                  <p>
                    Get a personalized performance review powered by Google Gemini AI. Analyze your weak spots, negative marking patterns, and confidence gaps.
                  </p>
                )}
              </div>
              <div className="d-flex gap-2 align-items-center">
                <button className="btn btn-primary-custom px-4" onClick={handleGenerateAIReview} disabled={aiLoading}>
                  {aiLoading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                  ⚡ Analyze My Performance
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mb-4">
          <div className="col-12 text-center">
            <div className="btn-group shadow-sm" role="group" aria-label="Chart Data Source">
              <input type="radio" className="btn-check" name="dashMode" id="mode-quiz" autoComplete="off" checked={dashboardMode === 'quiz'} onChange={() => setDashboardMode('quiz')} />
              <label className="btn btn-outline-primary px-4 fw-bold" htmlFor="mode-quiz">Tests Analysis</label>
              <input type="radio" className="btn-check" name="dashMode" id="mode-practice" autoComplete="off" checked={dashboardMode === 'practice'} onChange={() => setDashboardMode('practice')} />
              <label className="btn btn-outline-primary px-4 fw-bold" htmlFor="mode-practice">Practice Analysis</label>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold text-primary mb-3">🎯 Overall Confidence Analysis</h5>
              <div style={{ position: 'relative', height: 300, width: '100%' }}>
                <canvas ref={confidenceRef}></canvas>
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
                <canvas ref={performanceRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ border, color = 'dark', label, value, sub, bottom }) {
  const borderClass = bottom ? 'border-bottom' : 'border-start';
  return (
    <div className="col">
      <div className={`p-3 bg-white rounded shadow-sm ${borderClass} border-4 border-${border} h-100`}>
        <h6 className="text-muted text-uppercase small fw-bold">{label}</h6>
        <h2 className={`fw-bold text-${color} mb-0`}>{value}</h2>
        {sub && <small className="text-muted">{sub}</small>}
      </div>
    </div>
  );
}

function ActionCard({ emoji, title, color, onClick }) {
  return (
    <div className="col-md-6">
      <div className="card topic-card shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={onClick} role="button" tabIndex="0">
        <div className="card-body text-center p-4">
          <div className="display-5 mb-2">{emoji}</div>
          <h3 className={`fw-bold card-title text-${color} m-0`}>{title}</h3>
        </div>
      </div>
    </div>
  );
}

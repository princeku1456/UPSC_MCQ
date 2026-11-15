import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataManager from '../lib/dataManager';
import { useAuth } from '../contexts/AuthContext';
import { calculateConfidenceStats, DifficultyHelper } from '../lib/stats';
import Breadcrumbs from '../components/Breadcrumbs';
import DashboardStatCards from '../components/dashboard/DashboardStatCards';
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions';
import AIReviewCard from '../components/dashboard/AIReviewCard';
import DashboardCharts from '../components/dashboard/DashboardCharts';

export default function DashboardPage() {
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const [userHistory, setUserHistory] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState('quiz');
  const [conceptGap, setConceptGap] = useState('0%');
  const [conceptGapBorder, setConceptGapBorder] = useState('border-success');

  const loadDashboard = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;
      try {
        const [h, p] = await Promise.all([
          DataManager.syncUserHistory(user.uid, forceRefresh),
          DataManager.syncPracticeHistory(user.uid, forceRefresh),
        ]);
        if (h) setUserHistory(h);
        if (p) setPracticeHistory(p);
        setLoaded(true);
      } catch (e) {
        console.error('Error loading dashboard:', e);
      }
    },
    [user]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const combinedHistory = useMemo(
    () => [...userHistory, ...practiceHistory],
    [userHistory, practiceHistory]
  );

  const chartData = mode === 'quiz' ? userHistory : practiceHistory;

  const stats = useMemo(() => {
    const totalTests = combinedHistory.length;
    const avgScore = totalTests
      ? (combinedHistory.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalTests).toFixed(1)
      : 0;

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalAttempted = 0;
    let totalQs = 0;

    combinedHistory.forEach((res) => {
      if (res.totalMarks) {
        totalQs += res.totalMarks / 2;
      } else {
        totalQs += (res.correctCount + res.incorrectCount + res.unattemptedCount) || 0;
      }

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

    const totalUnattempted = totalQs - totalAttempted;
    const precision = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0;
    const negativeLoss = totalIncorrect * 0.66;
    const positiveGain = totalCorrect * 2;
    const negativeDrain = positiveGain ? ((negativeLoss / positiveGain) * 100).toFixed(1) : 0;

    return {
      totalTests,
      avgScore,
      totalQs,
      attempted: totalAttempted,
      unattempted: Math.max(0, totalUnattempted),
      correct: totalCorrect,
      incorrect: totalIncorrect,
      precision,
      negativeDrain,
      conceptGap,
      conceptGapBorder,
    };
  }, [combinedHistory, conceptGap, conceptGapBorder]);

  const { confValues, confStats } = useMemo(
    () => calculateConfidenceStats(chartData),
    [chartData]
  );

  useEffect(() => {
    let cancelled = false;
    async function updateConceptGap() {
      if (!combinedHistory.length) {
        setConceptGap('0%');
        setConceptGapBorder('border-success');
        return;
      }
      setConceptGap('Analyzing...');
      try {
        const uniqueChapters = [...new Set(combinedHistory.map((r) => r.chapterId))];
        const statsMap = {};
        await Promise.all(
          uniqueChapters.map(async (id) => {
            const s = await DataManager.fetchGlobalStats(id);
            if (s) statsMap[id] = s;
          })
        );

        let sillyMistakes = 0;
        let totalQuestionsAttempted = 0;

        combinedHistory.forEach((res) => {
          const s = statsMap[res.chapterId];
          if (!s || !res.userAnswers) return;
          Object.entries(res.userAnswers).forEach(([index, ans]) => {
            totalQuestionsAttempted++;
            if (!ans.isCorrect) {
              const qIdx = parseInt(index);
              const commCorrect = (s.correctCounts && s.correctCounts[qIdx]) || 0;
              const commTotal = s.totalAttempts || 0;
              const diff = DifficultyHelper.calculate(commCorrect, commTotal);
              if (diff.label === 'Easy') sillyMistakes++;
            }
          });
        });

        const gapPercent = totalQuestionsAttempted
          ? ((sillyMistakes / totalQuestionsAttempted) * 100).toFixed(1)
          : 0;
        if (!cancelled) {
          setConceptGap(`${gapPercent}%`);
          setConceptGapBorder(gapPercent > 15 ? 'border-danger' : 'border-success');
        }
      } catch (e) {
        console.error('Concept gap calculation error:', e);
        if (!cancelled) setConceptGap('N/A');
      }
    }

    updateConceptGap();
    return () => {
      cancelled = true;
    };
  }, [combinedHistory]);

  return (
    <section className="py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="fw-bold section-title">My Dashboard</h2>
          <div className="title-underline mx-auto"></div>
        </div>
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {loaded && combinedHistory.length === 0 && (
          <div className="alert alert-light border text-center py-5">
            <div className="display-5 mb-2">🚀</div>
            <h5 className="fw-bold">Welcome! Take your first test</h5>
            <p className="text-muted">Your performance stats and analytics will appear here.</p>
            <button className="btn btn-primary-custom px-4" onClick={() => navigate('/test')}>
              Take your first test
            </button>
          </div>
        )}

        {!loaded ? (
          <div className="text-center py-5 text-muted">Loading dashboard...</div>
        ) : (
          <>
            <DashboardStatCards stats={stats} />
            <DashboardQuickActions />
            <AIReviewCard userHistory={userHistory} />
            <DashboardCharts
              chartData={chartData}
              confValues={confValues}
              confStats={confStats}
              theme={theme}
              mode={mode}
              setMode={setMode}
            />
          </>
        )}
      </div>
    </section>
  );
}

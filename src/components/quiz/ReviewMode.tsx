import React, { useEffect, useState } from 'react';
import { HistoryEntry, Question, GlobalStats } from '../../types';
import { DataManager } from '../../services/DataManager';
import { calculateConfidenceStats, DifficultyHelper } from '../../utils/helpers';
import { GlobalComparisonChart } from '../charts/GlobalComparisonChart';
import { ConfidenceChart } from '../charts/ConfidenceChart';
import { Leaderboard } from './Leaderboard';
import { ReviewQuestions } from './ReviewQuestions';

interface ReviewModeProps {
  result: HistoryEntry;
  questions: Question[];
  onExit: () => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({ result, questions, onExit }) => {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await DataManager.fetchGlobalStats(result.chapterId, true);
        setGlobalStats(stats);
      } catch (e) {
        console.error("Failed to fetch global stats", e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [result.chapterId]);

  // Calculate local stats
  const { confValues, confStats } = calculateConfidenceStats([result]);

  // Difficulty Breakdown
  const difficultyStats = {
      Easy: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      Medium: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      Hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0 }
  };

  let sillyMistakes = 0;
  let hardSuccess = 0;
  let missedEasyQNumbers: string[] = [];

  questions.forEach((_, i) => {
      const uAns = result.userAnswers[i];
      const isCorrect = uAns?.isCorrect;

      const commCorrect = globalStats?.correctCounts?.[i] || 0;
      const commTotal = globalStats?.totalAttempts || 0;
      const diffInfo = DifficultyHelper.calculate(commCorrect, commTotal);

      const level = diffInfo.label as 'Easy' | 'Medium' | 'Hard';
      difficultyStats[level].total++;

      if (!uAns) {
          difficultyStats[level].unattempted++;
      } else if (isCorrect) {
          difficultyStats[level].correct++;
          if (level === 'Hard') hardSuccess++;
      } else {
          difficultyStats[level].incorrect++;
          if (level === 'Easy') {
              sillyMistakes++;
              missedEasyQNumbers.push(`Q${i+1}`);
          }
      }
  });

  const accuracyRate = result.correctCount && (result.correctCount + (result.incorrectCount || 0)) > 0
      ? ((result.correctCount / (result.correctCount + (result.incorrectCount || 0))) * 100).toFixed(1)
      : 0;
  const marksLost = ((result.incorrectCount || 0) * 0.66).toFixed(2);

  // Percentile Logic
  let percentile = 0;
  if (globalStats && globalStats.totalAttempts > 0) {
      const betterThan = globalStats.allScores.filter(s => s < result.scorePercent).length;
      percentile = Math.round((betterThan / globalStats.totalAttempts) * 100);
  }

  return (
    <div>
        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
            <div>
                <h4 className="fw-bold text-primary m-0">{result.chapterName}</h4>
                <span className="badge bg-secondary">Performance Review</span>
            </div>
            <button className="btn btn-primary-custom px-4 shadow py-2" onClick={onExit}>← Back</button>
        </div>

        <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
                <h5 className="fw-bold card-title mb-3">📊 UPSC Prep Index</h5>

                <div className="row g-3 text-center mb-4">
                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-primary">
                            <h6 className="text-uppercase text-muted small fw-bold mb-1">Accuracy</h6>
                            <h3 className="fw-bold text-dark m-0">{accuracyRate}%</h3>
                            <small className="text-muted">on attempted</small>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-danger">
                            <h6 className="text-uppercase text-muted small fw-bold mb-1">Negative Loss</h6>
                            <h3 className="fw-bold text-danger m-0">-{marksLost}</h3>
                            <small className="text-muted">marks lost</small>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-warning">
                            <h6 className="text-uppercase text-muted small fw-bold mb-1">Concept Gaps</h6>
                            <h3 className="fw-bold text-warning m-0">{sillyMistakes}</h3>
                             <small className="text-muted d-block">
                                {missedEasyQNumbers.length > 0
                                    ? `Easy Qs Missed: ${missedEasyQNumbers.join(", ")}`
                                    : "No Easy Qs Missed"}
                            </small>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-primary text-white rounded shadow-sm">
                            <h6 className="text-white-50 text-uppercase small fw-bold mb-1">Final Score</h6>
                            <h3 className="fw-bold m-0">{result.score.toFixed(2)} <span className="fs-6 text-white-50">/ {result.totalMarks}</span></h3>
                        </div>
                    </div>
                </div>

                {/* Difficulty Matrix */}
                <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-2">
                        <h6 className="fw-bold text-primary m-0">🎯 Performance by Difficulty</h6>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="table-light small text-muted">
                                <tr>
                                    <th>Difficulty</th>
                                    <th className="text-center">Total</th>
                                    <th className="text-center">Correct</th>
                                    <th className="text-center">Incorrect</th>
                                    <th className="text-center">Unattempted</th>
                                    <th className="text-end">Accuracy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['Easy', 'Medium', 'Hard'].map(lvl => {
                                    // @ts-ignore
                                    const stats = difficultyStats[lvl];
                                    const acc = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0;
                                    let badgeClass = lvl === 'Easy' ? 'bg-success' : lvl === 'Medium' ? 'bg-warning text-dark' : 'bg-danger';
                                    return (
                                        <tr key={lvl}>
                                            <td><span className={`badge ${badgeClass}`}>{lvl}</span></td>
                                            <td className="text-center">{stats.total}</td>
                                            <td className="text-center text-success fw-bold">{stats.correct}</td>
                                            <td className="text-center text-danger fw-bold">{stats.incorrect}</td>
                                            <td className="text-center text-muted">{stats.unattempted}</td>
                                            <td className="text-end fw-bold">{acc}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charts & Global Stats */}
                <div className="row mb-4 pt-3 border-top">
                     <div className="col-12 text-center py-3">
                         {loadingStats ? (
                             <div className="spinner-border text-primary" role="status"></div>
                         ) : globalStats ? (
                             <div className="row align-items-center">
                                 <div className="col-md-4 mb-3 mb-md-0 text-center">
                                    <h6 className="text-uppercase text-muted small fw-bold">Your Rank</h6>
                                    <h2 className="fw-bold text-primary">Top {100 - percentile}%</h2>
                                    <p className="small text-muted">Better than {percentile}% of users</p>
                                </div>
                                <div className="col-md-8">
                                    <div style={{height: '200px', width: '100%'}}>
                                        <GlobalComparisonChart myScore={result.scorePercent} globalStats={globalStats} />
                                    </div>
                                </div>
                             </div>
                         ) : (
                             <div className="text-muted">Not enough data for global comparison yet.</div>
                         )}
                     </div>
                </div>

                <div className="mb-5 mt-5 p-3 rounded border bg-white">
                    <h6 className="fw-bold text-secondary mb-3"><i className="bi bi-graph-up-arrow me-2"></i>Confidence vs Accuracy Analysis</h6>
                    <div style={{height: '250px', width: '100%'}}>
                        <ConfidenceChart confValues={confValues} confStats={confStats} />
                    </div>
                    <p className="small text-muted mt-2 text-center">Correct attempts as a % of each confidence level.</p>
                </div>

                {globalStats && <Leaderboard entries={globalStats.leaderboard} />}
            </div>
        </div>

        <ReviewQuestions
            questions={questions}
            result={result}
            globalStats={globalStats}
        />

        <div className="text-center mt-5">
            <button className="btn btn-primary-custom px-5 shadow py-2" onClick={onExit}>← Back</button>
        </div>
    </div>
  );
};

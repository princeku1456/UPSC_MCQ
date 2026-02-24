import React, { useState } from 'react';
import { Question, HistoryEntry, GlobalStats } from '../../types';
import { TextFormatter, getCorrectIndex, DifficultyHelper } from '../../utils/helpers';

interface ReviewQuestionsProps {
  questions: Question[];
  result: HistoryEntry;
  globalStats: GlobalStats | null;
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'unattempted';

export const ReviewQuestions: React.FC<ReviewQuestionsProps> = ({ questions, result, globalStats }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredQuestions = questions.map((q, i) => ({ q, i })).filter(({ q, i }) => {
    const uAns = result.userAnswers[i];
    const correctIndex = getCorrectIndex(q);

    if (filter === 'all') return true;
    if (filter === 'unattempted') return !uAns;
    if (filter === 'correct') return uAns && uAns.answer === correctIndex;
    if (filter === 'incorrect') return uAns && uAns.answer !== correctIndex;
    return true;
  });

  return (
    <div>
       <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 border-bottom pb-3">
            <div>
                <h5 className="fw-bold text-primary m-0">Detailed Review</h5>
            </div>
            <div className="btn-group shadow-sm" role="group">
                <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('all')}>All</button>
                <button className={`btn ${filter === 'correct' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setFilter('correct')}>Correct</button>
                <button className={`btn ${filter === 'incorrect' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setFilter('incorrect')}>Incorrect</button>
                <button className={`btn ${filter === 'unattempted' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setFilter('unattempted')}>Unattempted</button>
            </div>
        </div>

        {filteredQuestions.length === 0 && (
             <div className="alert alert-info text-center mt-3">No questions found for this filter.</div>
        )}

        {filteredQuestions.map(({ q, i }) => {
            const uAns = result.userAnswers[i];
            const correctIndex = getCorrectIndex(q);
            const userSurety = uAns?.surety ?? "N/A";

            let status: 'correct' | 'incorrect' | 'unattempted' = 'unattempted';
            if (uAns) status = uAns.answer === correctIndex ? 'correct' : 'incorrect';

            let borderClass = 'border-secondary';
            let badgeHtml = <span className="badge bg-secondary mb-2">Unattempted</span>;

            if (status === 'correct') {
                borderClass = 'border-success';
                badgeHtml = <span className="badge bg-success mb-2">Correct</span>;
            } else if (status === 'incorrect') {
                borderClass = 'border-danger';
                badgeHtml = <span className="badge bg-danger mb-2">Incorrect</span>;
            }

            // Community Stats
            const commTotal = globalStats?.totalAttempts || 0;
            const commCorrect = globalStats?.correctCounts?.[i] || 0;
            const diffInfo = DifficultyHelper.calculate(commCorrect, commTotal);

            const pCorrect = commTotal > 0 ? Math.round((commCorrect / commTotal) * 100) : 0;
            const attemptedCount = globalStats?.attemptedCounts?.[i] || 0;
            const pIncorrect = commTotal > 0 ? Math.round(((attemptedCount - commCorrect) / commTotal) * 100) : 0;
            const pUnattempted = 100 - pCorrect - pIncorrect;

            // Time Spent
            const timeSec = result.questionTimeSpent?.[i] ? Math.round(result.questionTimeSpent[i]) : 0;
            const timeLabel = timeSec < 60 ? `${timeSec}s` : `${Math.floor(timeSec/60)}m ${timeSec%60}s`;

            return (
                <div key={i} className={`card mb-4 shadow-sm border-0 border-start border-5 ${borderClass}`}>
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                <h6 className="text-muted fw-bold m-0 me-2">Question {i + 1}</h6>
                                <span className={`badge ${userSurety === 100 ? 'bg-success' : userSurety >= 75 ? 'bg-primary' : userSurety >= 50 ? 'bg-warning' : 'bg-secondary'}`}>
                                    Confidence: {userSurety}%
                                </span>
                                <span className="badge bg-light text-dark border ms-2">⏱ {timeLabel}</span>
                                <span className={`badge bg-${diffInfo.color} ms-2`}>{diffInfo.label}</span>
                            </div>
                            {badgeHtml}
                        </div>

                        {globalStats && commTotal > 0 && (
                             <div className="mt-2 mb-4 p-3 bg-light bg-opacity-75 rounded-3 border">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small fw-bold text-uppercase text-secondary">👥 Community Stats</span>
                                    <span className="fw-bold" style={{color: '#4338ca'}}>{pCorrect}% Correct</span>
                                </div>
                                <div className="progress shadow-sm" style={{height: '20px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden'}}>
                                    <div className="progress-bar bg-success" style={{width: `${pCorrect}%`}}>{pCorrect > 12 && `${pCorrect}%`}</div>
                                    <div className="progress-bar bg-danger" style={{width: `${pIncorrect}%`}}>{pIncorrect > 12 && `${pIncorrect}%`}</div>
                                    <div className="progress-bar bg-secondary" style={{width: `${pUnattempted}%`}}>{pUnattempted > 12 && `${pUnattempted}%`}</div>
                                </div>
                            </div>
                        )}

                        <div className="fs-5 fw-medium mb-3" dangerouslySetInnerHTML={{ __html: TextFormatter.formatQuestionText(q.text) }}></div>

                        <div className="mb-3">
                            {q.options.map((opt, idx) => {
                                let optionClass = "p-3 mb-2 border rounded";
                                let icon = "";
                                if (idx === correctIndex) {
                                    optionClass += " bg-success-subtle border-success fw-bold text-success";
                                    icon = "✅ ";
                                } else if (uAns && uAns.answer === idx && status === 'incorrect') {
                                    optionClass += " bg-danger-subtle border-danger text-danger";
                                    icon = "❌ ";
                                }

                                return (
                                    <div key={idx} className={optionClass}>
                                        {icon} {opt}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="explanation mt-3 shadow-sm p-3 bg-light border rounded">
                            <strong>💡 Explanation:</strong>
                            <div className="mt-1 small" dangerouslySetInnerHTML={{ __html: q.explanation || "No explanation provided." }}></div>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
  );
};

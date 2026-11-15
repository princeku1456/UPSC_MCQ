import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useQuizSession } from '../contexts/QuizSessionContext';
import DataManager from '../lib/dataManager';
import { getCorrectIndex } from '../lib/stats';
import TextFormatter from '../lib/textFormatter';
import { toastr } from '../lib/toast';

function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export default function QuizSessionPage() {
  const { session, startReviewSession } = useQuizSession();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const userRef = useRef(user);
  const questionsRef = useRef([]);
  const indexRef = useRef(0);
  const answersRef = useRef({});
  const markedRef = useRef({});
  const submittedRef = useRef(false);
  const timerSecondsRef = useRef(0);
  const pausedRef = useRef(false);
  const timeSpentRef = useRef({});
  const startTimeRef = useRef(null);
  const sessionRef = useRef(session);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const commitCurrentQuestionTime = useCallback(() => {
    if (startTimeRef.current && !submittedRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      timeSpentRef.current[indexRef.current] =
        (timeSpentRef.current[indexRef.current] || 0) + elapsed;
      startTimeRef.current = Date.now();
    }
  }, []);

  const saveProgress = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.mode !== 'quiz' || submittedRef.current) return;

    let currentQTime = 0;
    if (startTimeRef.current) {
      currentQTime = (Date.now() - startTimeRef.current) / 1000;
    }
    const timeData = { ...timeSpentRef.current };
    timeData[indexRef.current] = (timeData[indexRef.current] || 0) + currentQTime;

    const progress = {
      userAnswers: answersRef.current,
      markedForReview: markedRef.current,
      questionTimeSpent: timeData,
      lastQuestionIndex: indexRef.current,
      remainingTime: timerSecondsRef.current,
      timestamp: Date.now(),
    };
    localStorage.setItem(`quiz_progress_${s.chapterId}`, JSON.stringify(progress));
  }, []);

  const saveChapterStats = useCallback(
    async (chapterId, leaderboardEntry, qs, computedAnswers, percentage) => {
      const statsRef = doc(db, 'chapter_stats', chapterId);
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(statsRef);
        const newScore = percentage;

        if (!sfDoc.exists()) {
          const correctCounts = qs.map((q, i) =>
            computedAnswers[i] && computedAnswers[i].answer === getCorrectIndex(q) ? 1 : 0
          );
          const attemptedCounts = qs.map((q, i) => (computedAnswers[i] ? 1 : 0));
          transaction.set(statsRef, {
            totalScore: newScore,
            totalAttempts: 1,
            average: newScore,
            highestScore: newScore,
            allScores: [newScore],
            leaderboard: [leaderboardEntry],
            correctCounts,
            attemptedCounts,
          });
        } else {
          const data = sfDoc.data();
          const newAttempts = (data.totalAttempts || 0) + 1;
          const newAvg = ((data.totalScore || 0) + newScore) / newAttempts;
          let currentLeaderboard = data.leaderboard || [];
          currentLeaderboard.push(leaderboardEntry);
          currentLeaderboard.sort((a, b) => b.scorePercent - a.scorePercent);
          if (currentLeaderboard.length > 10) currentLeaderboard = currentLeaderboard.slice(0, 10);

          const cCounts = [...(data.correctCounts || [])];
          const aCounts = [...(data.attemptedCounts || [])];

          const maxLen = Math.max(cCounts.length, aCounts.length, qs.length);
          for (let j = 0; j < maxLen; j++) {
            if (cCounts[j] == null) cCounts[j] = 0;
            if (aCounts[j] == null) aCounts[j] = 0;
          }

          qs.forEach((q, i) => {
            if (computedAnswers[i]) {
              aCounts[i] = (aCounts[i] || 0) + 1;
              if (computedAnswers[i].answer === getCorrectIndex(q)) {
                cCounts[i] = (cCounts[i] || 0) + 1;
              }
            }
          });

          transaction.update(statsRef, {
            totalScore: (data.totalScore || 0) + newScore,
            totalAttempts: newAttempts,
            average: newAvg,
            highestScore: Math.max(data.highestScore || 0, newScore),
            allScores: [...(data.allScores || []), newScore],
            leaderboard: currentLeaderboard,
            correctCounts: cCounts,
            attemptedCounts: aCounts,
          });
        }
      });
    },
    []
  );

  const handleSubmit = useCallback(
    async (force = false) => {
      const s = sessionRef.current;
      const qs = questionsRef.current;
      if (!s || !qs.length || submittedRef.current) return;
      if (!force && !window.confirm('Are you sure you want to submit?')) return;

      commitCurrentQuestionTime();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      submittedRef.current = true;
      setSubmitted(true);

      let score = 0;
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;
      const computedAnswers = { ...answersRef.current };

      qs.forEach((q, i) => {
        const uAns = computedAnswers[i];
        const cIdx = getCorrectIndex(q);
        if (uAns && uAns.answer !== undefined && uAns.answer !== -1) {
          const isCorrect = uAns.answer === cIdx;
          computedAnswers[i] = { ...uAns, isCorrect };
          if (isCorrect) {
            score += 2;
            correct++;
          } else {
            score -= 0.66;
            incorrect++;
          }
        } else {
          unattempted++;
        }
      });

      answersRef.current = computedAnswers;
      setAnswers(computedAnswers);

      const finalScore = parseFloat(score.toFixed(2));
      const totalMarks = qs.length * 2;
      const quizPercentage = totalMarks > 0 ? parseFloat(((finalScore / totalMarks) * 100).toFixed(1)) : 0;
      const practicePercentage =
        correct + incorrect > 0
          ? parseFloat(((correct / (correct + incorrect)) * 100).toFixed(1))
          : 0;
      const percentage = s.mode === 'practice' ? practicePercentage : quizPercentage;

      const now = new Date();
      const resultObject = {
        userId: userRef.current ? userRef.current.uid : 'guest',
        userEmail: userRef.current ? userRef.current.email : 'guest',
        subject: s.subject,
        chapterId: s.chapterId,
        chapterName: s.chapterName,
        score: finalScore,
        totalMarks,
        scorePercent: percentage,
        userAnswers: computedAnswers,
        questionTimeSpent: timeSpentRef.current,
        timestamp: now,
      };

      setResult({ correct, incorrect, unattempted, finalScore, totalMarks, percentage });

      if (s.mode === 'quiz') {
        localStorage.removeItem(`quiz_progress_${s.chapterId}`);
      }

      if (!userRef.current) return;

      setSaving(true);
      try {
        if (s.mode === 'practice') {
          await DataManager.addPracticeResult({
            userId: userRef.current.uid,
            subject: s.subject,
            chapterName: s.chapterName,
            chapterId: 'practice_session',
            scorePercent: percentage,
            totalMarks,
            userAnswers: computedAnswers,
            correctCount: correct,
            incorrectCount: incorrect,
            unattemptedCount: unattempted,
          });
          await DataManager.invalidateCache(`user_practice_history_${userRef.current.uid}`);
          toastr.success('Practice result saved!');
        } else {
          const docRef = await DataManager.addQuizResult(resultObject);
          const leaderboardEntry = {
            userEmail: userRef.current.email,
            scorePercent: percentage,
            score: finalScore,
            rankTime: now.toISOString(),
            resultId: docRef.id,
          };

          await DataManager.invalidateCache(`global_stats_${s.chapterId}`);
          await DataManager.invalidateCache(`user_history_${userRef.current.uid}`);

          if (!s.chapterId.startsWith('revision_')) {
            await saveChapterStats(s.chapterId, leaderboardEntry, qs, computedAnswers, percentage);
          }
          toastr.success('Result and stats saved!');
        }
      } catch (e) {
        console.error('Failed to save result:', e);
        toastr.error('Failed to save result.');
      } finally {
        setSaving(false);
      }
    },
    [commitCurrentQuestionTime, saveChapterStats]
  );

  useEffect(() => {
    if (!session) {
      navigate('/dashboard');
      return;
    }

    const qs = session.questions || [];
    questionsRef.current = qs;
    setQuestions(qs);
    indexRef.current = 0;
    setIndex(0);
    answersRef.current = {};
    setAnswers({});
    markedRef.current = {};
    setMarked({});
    submittedRef.current = session.mode === 'review';
    setSubmitted(session.mode === 'review');
    timeSpentRef.current = {};
    startTimeRef.current = null;

    let initialSeconds = Math.floor(qs.length * 1.2 * 60);

    if (session.mode === 'review' && session.reviewData) {
      const a = session.reviewData.userAnswers || {};
      answersRef.current = a;
      setAnswers(a);
      timeSpentRef.current = session.reviewData.questionTimeSpent || {};
    } else if (session.mode === 'quiz') {
      const saved = localStorage.getItem(`quiz_progress_${session.chapterId}`);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (Date.now() - p.timestamp < 24 * 60 * 60 * 1000) {
            answersRef.current = p.userAnswers || {};
            setAnswers(p.userAnswers || {});
            markedRef.current = p.markedForReview || {};
            setMarked(p.markedForReview || {});
            timeSpentRef.current = p.questionTimeSpent || {};
            indexRef.current = p.lastQuestionIndex || 0;
            setIndex(p.lastQuestionIndex || 0);
            initialSeconds = p.remainingTime != null ? p.remainingTime : initialSeconds;
            toastr.info('Restored your previous progress and time.');
          }
        } catch (e) {
          console.error('Progress restore error:', e);
        }
      }
    }

    if (session.mode !== 'review') {
      timerSecondsRef.current = initialSeconds;
      setTimerSeconds(initialSeconds);
      startTimeRef.current = Date.now();

      timerIntervalRef.current = setInterval(() => {
        if (pausedRef.current || submittedRef.current) return;
        timerSecondsRef.current -= 1;
        setTimerSeconds(timerSecondsRef.current);
        saveProgress();
        if (timerSecondsRef.current <= 0) {
          clearInterval(timerIntervalRef.current);
          handleSubmit(true);
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session, navigate, saveProgress, handleSubmit]);

  const selectAnswer = useCallback(
    (optionIndex) => {
      if (submittedRef.current) return;
      const next = {
        ...answersRef.current,
        [indexRef.current]: {
          ...(answersRef.current[indexRef.current] || {}),
          answer: optionIndex,
        },
      };
      answersRef.current = next;
      setAnswers(next);
      saveProgress();
    },
    [saveProgress]
  );

  const setSurety = useCallback(
    (val) => {
      if (submittedRef.current) return;
      const cur = answersRef.current[indexRef.current] || {};
      const next = {
        ...answersRef.current,
        [indexRef.current]: { ...cur, answer: cur.answer === undefined ? -1 : cur.answer, surety: val },
      };
      answersRef.current = next;
      setAnswers(next);
      saveProgress();
    },
    [saveProgress]
  );

  const clearSelection = useCallback(() => {
    if (submittedRef.current) return;
    const next = { ...answersRef.current };
    delete next[indexRef.current];
    answersRef.current = next;
    setAnswers(next);
    saveProgress();
  }, [saveProgress]);

  const toggleMark = useCallback(() => {
    const next = { ...markedRef.current };
    if (next[indexRef.current]) delete next[indexRef.current];
    else next[indexRef.current] = true;
    markedRef.current = next;
    setMarked(next);
    saveProgress();
  }, [saveProgress]);

  const goTo = useCallback(
    (target) => {
      if (target < 0 || target >= questionsRef.current.length) return;
      commitCurrentQuestionTime();
      indexRef.current = target;
      setIndex(target);
      startTimeRef.current = Date.now();
      saveProgress();
    },
    [commitCurrentQuestionTime, saveProgress]
  );

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    if (pausedRef.current) toastr.info('Timer Paused');
    else toastr.success('Timer Resumed');
  }, []);

  const exit = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const s = sessionRef.current;
    if (s?.mode === 'practice') navigate('/practice');
    else if (s?.mode === 'review') navigate('/test');
    else navigate('/test');
  }, [navigate]);

  const openReview = useCallback(() => {
    const s = sessionRef.current;
    if (!result) return;
    const resultObject = {
      userId: user?.uid || 'guest',
      userEmail: user?.email || 'guest',
      subject: s.subject,
      chapterId: s.chapterId,
      chapterName: s.chapterName,
      score: result.finalScore,
      totalMarks: result.totalMarks,
      scorePercent: result.percentage,
      userAnswers: answersRef.current,
      questionTimeSpent: timeSpentRef.current,
    };
    startReviewSession({
      subject: s.subject,
      chapterId: s.chapterId,
      chapterName: s.chapterName,
      questions: questionsRef.current,
      reviewData: resultObject,
    });
    navigate('/review');
  }, [result, startReviewSession, navigate, user]);

  if (!session) return null;

  const q = questions[index];
  const currentAnswer = answers[index];
  const correctIndex = q ? getCorrectIndex(q) : -1;
  const surety = currentAnswer?.surety;

  return (
    <section className="quiz-section py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <div className="d-flex justify-content-between mb-4">
          <button className="btn btn-primary-custom px-4 shadow" onClick={exit}>
            ← Exit
          </button>
        </div>

        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="quiz-box h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-primary m-0">
                  {session.chapterName || session.subject}
                </h4>
                <button
                  className={`btn btn-sm fw-bold shadow-sm ${
                    marked[index] ? 'btn-primary-custom' : 'btn-secondary-custom'
                  }`}
                  onClick={toggleMark}
                >
                  <i className={`bi ${marked[index] ? 'bi-bookmark-check-fill' : 'bi-bookmark-star'}`}></i>{' '}
                  {marked[index] ? 'Unmark Review' : 'Mark for Review'}
                </button>
              </div>

              {q && (
                <div className="question">
                  <div
                    className="mb-3 lead fw-bold"
                    dangerouslySetInnerHTML={{
                      __html: `Q${index + 1}. ${TextFormatter.formatQuestionText(q.text)}`,
                    }}
                  />

                  {q.options.map((opt, i) => {
                    const selected = currentAnswer && currentAnswer.answer === i;
                    let cls = 'option shadow-sm';
                    if (submitted) {
                      if (i === correctIndex) cls += ' correct-answer-label';
                      if (selected && i !== correctIndex) cls += ' incorrect-answer-label';
                    } else if (selected) {
                      cls += ' selected';
                    }
                    return (
                      <label key={i} className={cls}>
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={!!selected}
                          disabled={submitted}
                          onChange={() => selectAnswer(i)}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}

                  <div className="mt-4 mb-3 animate-fade-in">
                    <div className="surety-label">Confidence Level</div>
                    <div className="surety-matrix shadow-sm" role="radiogroup" aria-label="Confidence Level">
                      {[100, 75, 50, 0].map((val) => (
                        <div
                          key={val}
                          className={`surety-opt surety-${val} ${surety === val ? 'selected' : ''}`}
                          role="radio"
                          tabIndex={0}
                          aria-checked={surety === val}
                          onClick={() => setSurety(val)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSurety(val);
                            }
                          }}
                        >
                          {val}%
                        </div>
                      ))}
                    </div>
                  </div>

                  {submitted && q.explanation && (
                    <div className="explanation shadow-sm mt-3">
                      <strong>💡 Explanation:</strong>
                      <br />
                      <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-secondary-custom px-4"
                  disabled={index === 0}
                  onClick={() => goTo(index - 1)}
                >
                  Previous
                </button>
                <button className="btn btn-primary-custom px-4" onClick={clearSelection} disabled={submitted}>
                  Clear
                </button>
                <button
                  className="btn btn-secondary-custom px-4"
                  disabled={index === questions.length - 1}
                  onClick={() => goTo(index + 1)}
                >
                  Next
                </button>
              </div>

              {submitted && (
                <div className="mt-3 text-center">
                  {currentAnswer?.answer === correctIndex ? (
                    <h5 className="text-success fw-bold">Correct! 🎉</h5>
                  ) : currentAnswer?.answer === -1 || !currentAnswer ? (
                    <h5 className="text-secondary fw-bold">Unattempted. ⚪</h5>
                  ) : (
                    <h5 className="text-danger fw-bold">Incorrect. ❌</h5>
                  )}
                </div>
              )}

              {result && (
                <div className="mt-4 text-center">
                  <div className="alert alert-primary shadow-sm">
                    <h4 className="alert-heading fw-bold">Test Complete! 🏆</h4>
                    <hr />
                    <p>
                      ✅ Correct: <strong>{result.correct}</strong> | ❌ Incorrect:{' '}
                      <strong>{result.incorrect}</strong> | ⚪ Unattempted:{' '}
                      <strong>{result.unattempted}</strong>
                    </p>
                    <h3 className="text-primary mt-2">
                      Score: {result.finalScore} / {result.totalMarks} ({result.percentage}%)
                    </h3>
                    {saving && <div className="text-muted small">Saving result...</div>}
                    <button className="btn btn-primary-custom px-4 shadow mt-2" onClick={openReview}>
                      👁 Review Performance
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="quiz-nav-sidebar">
              <div className="nav-header">Question Palette</div>
              {session.mode !== 'review' && (
                <div className="timer-container shadow-sm position-relative" style={{ paddingBottom: 45 }}>
                  <span className="timer-label">Time Remaining</span>
                  <div className={`timer-value ${timerSeconds < 180 ? 'low-time' : ''}`}>
                    {formatTime(timerSeconds)}
                  </div>
                  <button
                    className="btn btn-sm fw-bold position-absolute"
                    style={{ bottom: 12, right: 12, fontSize: '0.85rem', padding: '5px 12px', borderRadius: 8 }}
                    onClick={togglePause}
                  >
                    <i className={`bi ${paused ? 'bi-play-fill' : 'bi-pause-fill'}`}></i>{' '}
                    {paused ? 'Resume' : 'Pause'}
                  </button>
                </div>
              )}

              <div className="nav-grid">
                {questions.map((item, i) => {
                  const uAns = answers[i];
                  let cls = 'nav-item shadow-sm';
                  if (i === index) cls += ' active';
                  if (submitted) {
                    const c = getCorrectIndex(item);
                    if (!uAns || uAns.answer === -1) cls += ' unattempted';
                    else if (uAns.answer === c) cls += ' correct-nav';
                    else cls += ' incorrect-nav';
                  } else {
                    if (uAns) cls += ' attempted';
                    if (marked[i]) cls += ' marked-nav';
                  }
                  return (
                    <div
                      key={i}
                      className={cls}
                      role="button"
                      tabIndex={0}
                      onClick={() => goTo(i)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          goTo(i);
                        }
                      }}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>

              {session.mode !== 'review' && !submitted && (
                <button
                  className="btn btn-success-custom w-100 mt-4 py-2 fw-bold"
                  onClick={() => handleSubmit(false)}
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

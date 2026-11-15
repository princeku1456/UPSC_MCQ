import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  runTransaction,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import DataManager from '../../lib/dataManager';
import { getCorrectIndex } from '../../lib/stats';
import TextFormatter from '../../lib/textFormatter';
import { toastr } from '../../lib/toast';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [manifest, setManifest] = useState(null);
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [userEmails, setUserEmails] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [attempts, setAttempts] = useState(null);
  const [searching, setSearching] = useState(false);

  const [review, setReview] = useState({ show: false, loading: false, resultData: null, questions: [] });

  useEffect(() => {
    if (!user) return;
    async function check() {
      try {
        const snap = await getDoc(doc(db, 'admins', user.uid));
        if (snap.exists()) {
          setIsAdmin(true);
          await loadSubjects();
          await loadAllUserEmails();
        } else {
          toastr.error('You are not authorized as admin.');
          await signOut(auth);
          navigate('/admin');
        }
      } catch (e) {
        console.error(e);
        await signOut(auth);
        navigate('/admin');
      } finally {
        setAdminChecked(true);
      }
    }
    check();
  }, [user, navigate]);

  async function loadSubjects() {
    const m = await DataManager.fetchQuizManifest();
    setManifest(m);
  }

  async function loadAllUserEmails() {
    try {
      const snap = await getDocs(collection(db, 'results'));
      const emails = new Set();
      snap.forEach((d) => {
        const data = d.data();
        if (data.userEmail && data.userEmail !== 'guest') emails.add(data.userEmail.toLowerCase());
      });
      setUserEmails([...emails].sort());
    } catch (e) {
      console.error('Error loading user emails:', e);
    }
  }

  const sortedSubjects = useMemo(
    () =>
      manifest
        ? Object.keys(manifest).sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
          )
        : [],
    [manifest]
  );

  const sortedChapters = useMemo(() => {
    if (!manifest || !subject) return [];
    return Object.keys(manifest[subject] || {}).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [manifest, subject]);

  const chapterValue = subject ? `${subject.replace(/\s+/g, '_')}_${chapter}` : '';

  async function analyze() {
    if (!chapter) {
      toastr.warning('Select Subject and Test.');
      return;
    }
    setAnalyzing(true);
    try {
      const [questions, statsDoc, resultsSnap] = await Promise.all([
        DataManager.fetchQuizQuestions(chapterValue),
        getDoc(doc(db, 'chapter_stats', chapterValue)),
        getDocs(
          query(
            collection(db, 'results'),
            where('chapterId', '==', chapterValue),
            orderBy('timestamp', 'desc'),
            limit(100)
          )
        ),
      ]);

      if (!questions) throw new Error('Quiz content not found.');

      const stats = statsDoc.exists() ? statsDoc.data() : { totalAttempts: 0, average: 0 };
      const results = resultsSnap.docs.map((d) => d.data());
      const accuracies = questions.map((q, qIdx) => {
        const cIdx = getCorrectIndex(q);
        let correctCount = 0;
        results.forEach((res) => {
          const choice = res.userAnswers ? res.userAnswers[qIdx] : null;
          if (choice && choice.answer === cIdx) correctCount++;
        });
        return results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
      });

      setAnalysis({ questions, stats, results, accuracies });
      toastr.success('Discussion data updated!');
    } catch (e) {
      console.error('Analysis fetch error:', e);
      toastr.error(e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function searchAttempts() {
    if (!searchEmail) {
      toastr.warning('Please select a user email.');
      return;
    }
    setSearching(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, 'results'),
          where('userEmail', '==', searchEmail),
          orderBy('timestamp', 'desc')
        )
      );
      setAttempts(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    } catch (e) {
      console.error(e);
      toastr.error('Error fetching user data. Ensure index is created in Firebase.');
    } finally {
      setSearching(false);
    }
  }

  async function viewAttempt(attempt) {
    setReview({ show: true, loading: true, resultData: null, questions: [] });
    try {
      const [resultSnap, questions] = await Promise.all([
        getDoc(doc(db, 'results', attempt.id)),
        DataManager.fetchQuizQuestions(attempt.chapterId),
      ]);
      if (!resultSnap.exists() || !questions) throw new Error('Record or questions not found.');
      setReview({ show: true, loading: false, resultData: resultSnap.data(), questions });
    } catch (e) {
      toastr.error(e.message);
      setReview({ show: false, loading: false, resultData: null, questions: [] });
    }
  }

  async function deleteAttempt(attempt) {
    if (
      !window.confirm(
        `CRITICAL: This will delete the attempt for "${attempt.chapterName}" and recalculate global statistics. Proceed?`
      )
    ) {
      return;
    }

    try {
      const resultRef = doc(db, 'results', attempt.id);
      const resultSnap = await getDoc(resultRef);
      if (!resultSnap.exists()) {
        toastr.error('Result record not found.');
        return;
      }

      const data = resultSnap.data();
      const chapterId = data.chapterId;
      const scorePercent = data.scorePercent;
      const userAnswers = data.userAnswers || {};
      const statsRef = doc(db, 'chapter_stats', chapterId);

      await runTransaction(db, async (transaction) => {
        const statsSnap = await transaction.get(statsRef);
        transaction.delete(resultRef);

        if (statsSnap.exists()) {
          const stats = statsSnap.data();
          const newAttempts = Math.max(0, (stats.totalAttempts || 1) - 1);
          const newTotalScore = Math.max(0, (stats.totalScore || 0) - scorePercent);
          const newAverage = newAttempts > 0 ? newTotalScore / newAttempts : 0;

          const newAllScores = [...(stats.allScores || [])];
          const scoreIndex = newAllScores.indexOf(scorePercent);
          if (scoreIndex > -1) newAllScores.splice(scoreIndex, 1);
          const newHighest = newAllScores.length > 0 ? Math.max(...newAllScores) : 0;

          const newLeaderboard = (stats.leaderboard || []).filter((entry) => {
            if (entry.resultId && entry.resultId === attempt.id) return false;
            if (entry.userEmail === data.userEmail) {
              const scoreMatch = Math.abs(entry.scorePercent - scorePercent) < 0.1;
              const entryTime = new Date(entry.rankTime).getTime();
              const dataTime = data.timestamp ? data.timestamp.toDate().getTime() : 0;
              const timeMatch = Math.abs(entryTime - dataTime) < 5000;
              if (scoreMatch && timeMatch) return false;
            }
            return true;
          });

          const cCounts = [...(stats.correctCounts || [])];
          const aCounts = [...(stats.attemptedCounts || [])];
          Object.entries(userAnswers).forEach(([idx, ans]) => {
            const i = parseInt(idx);
            if (aCounts[i] > 0) aCounts[i]--;
            if (ans.isCorrect && cCounts[i] > 0) cCounts[i]--;
          });

          transaction.update(statsRef, {
            totalAttempts: newAttempts,
            totalScore: newTotalScore,
            average: newAverage,
            allScores: newAllScores,
            highestScore: newHighest,
            leaderboard: newLeaderboard,
            correctCounts: cCounts,
            attemptedCounts: aCounts,
          });
        }
      });

      toastr.success('Attempt deleted and global stats updated!');
      setAttempts((prev) => (prev ? prev.filter((a) => a.id !== attempt.id) : prev));
      setAnalysis(null);
    } catch (e) {
      console.error('Delete transaction error:', e);
      toastr.error('Failed to complete full deletion.');
    }
  }

  async function logout() {
    await signOut(auth);
    navigate('/admin');
  }

  if (!adminChecked) {
    return (
      <section className="py-5 text-center" style={{ minHeight: '90vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </section>
    );
  }

  if (!isAdmin) return null;

  return (
    <section className="py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold section-title mb-0">Admin Portal</h2>
          <button className="btn btn-outline-danger" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold text-primary mb-3">Class Discussion Analysis</h5>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Subject</label>
                <select
                  className="form-select"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setChapter('');
                    setAnalysis(null);
                  }}
                >
                  <option value="">-- Choose Subject --</option>
                  {sortedSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Test</label>
                <select
                  className="form-select"
                  value={chapter}
                  disabled={!subject}
                  onChange={(e) => {
                    setChapter(e.target.value);
                    setAnalysis(null);
                  }}
                >
                  <option value="">-- Choose Test --</option>
                  {sortedChapters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary-custom w-100" onClick={analyze} disabled={analyzing}>
                {analyzing ? 'Fetching...' : 'Analyze Test'}
              </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold text-primary mb-3">Search User Attempts</h5>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">User Email</label>
                <select
                  className="form-select"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                >
                  <option value="">Select a User Email...</option>
                  {userEmails.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-secondary-custom w-100" onClick={searchAttempts} disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="col-lg-8">
            {analysis && (
              <>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-white border-bottom p-4">
                    <h5 className="fw-bold text-primary m-0">🏆 Leaderboard</h5>
                    <small className="text-muted">
                      Total Attempts: {analysis.stats.totalAttempts} | Global Avg:{' '}
                      {analysis.stats.average ? analysis.stats.average.toFixed(1) : 0}%
                    </small>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Rank</th>
                          <th>User</th>
                          <th>Score</th>
                          <th>Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analysis.stats.leaderboard || []).map((entry, i) => (
                          <tr key={entry.resultId || i}>
                            <td className="fw-bold">#{i + 1}</td>
                            <td>{entry.userEmail ? entry.userEmail.split('@')[0] : 'guest'}</td>
                            <td>{entry.score.toFixed(1)}</td>
                            <td>
                              <span className={`badge ${entry.scorePercent >= 80 ? 'bg-success' : 'bg-secondary'}`}>
                                {entry.scorePercent}%
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!analysis.stats.leaderboard || analysis.stats.leaderboard.length === 0) && (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No records.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                  <h5 className="fw-bold text-primary mb-3">Question Accuracy Palette</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {analysis.accuracies.map((acc, i) => {
                      let heat = 'heat-high';
                      if (acc < 40) heat = 'heat-low';
                      else if (acc <= 70) heat = 'heat-mid';
                      return (
                        <div
                          key={i}
                          className={`palette-item ${heat}`}
                          title={`Accuracy: ${acc}%`}
                          role="button"
                          tabIndex={0}
                          onClick={() => document.getElementById(`q-card-${i}`)?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <h4 className="fw-bold text-dark border-start border-4 border-primary ps-3">📊 Discussion Dashboard</h4>
                {analysis.questions.map((q, qIdx) => {
                  const cIdx = getCorrectIndex(q);
                  const accuracy = analysis.accuracies[qIdx];
                  const buckets = q.options.map(() => []);
                  const skipped = [];
                  analysis.results.forEach((res) => {
                    const choice = res.userAnswers ? res.userAnswers[qIdx] : null;
                    const name = res.userEmail ? res.userEmail.split('@')[0] : 'Guest';
                    const suretyVal = choice && choice.surety !== undefined ? `${choice.surety}%` : 'N/A';
                    if (!choice || choice.answer === undefined || choice.answer === -1) {
                      skipped.push({ name, surety: suretyVal });
                    } else if (buckets[choice.answer]) {
                      buckets[choice.answer].push({ name, surety: suretyVal });
                    }
                  });

                  return (
                    <div key={qIdx} id={`q-card-${qIdx}`} className={`card mb-5 shadow-sm border-0 rounded-4 ${accuracy < 40 ? 'high-error' : ''}`}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between mb-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary">Question {qIdx + 1}</span>
                          <span className="badge bg-light text-dark border">Accuracy: {accuracy}%</span>
                        </div>
                        <div className="fw-bold mb-4 h5" dangerouslySetInnerHTML={{ __html: TextFormatter.formatQuestionText(q.text) }} />

                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === cIdx;
                          const users = buckets[oIdx];
                          const percent = analysis.results.length > 0 ? Math.round((users.length / analysis.results.length) * 100) : 0;
                          return (
                            <div key={oIdx} className={`p-3 border rounded-3 mb-2 ${isCorrect ? 'bg-success bg-opacity-10 border-success' : 'bg-white'}`}>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <span className={`badge ${isCorrect ? 'bg-success' : 'bg-secondary'} me-2`}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className={isCorrect ? 'fw-bold text-success' : ''}>{opt}</span>
                                </div>
                                <span className="fw-bold text-muted small">
                                  {users.length} Users ({percent}%)
                                </span>
                              </div>
                              <div className="d-flex flex-wrap gap-2 mt-2">
                                {users.map((u, ui) => (
                                  <span key={ui} className="badge user-tag">
                                    {u.name} <strong className="text-primary ms-1">{u.surety}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        <div className="mt-3 p-2 bg-light rounded-3 border-dashed border-2">
                          <small className="text-muted fw-bold">⚪ SKIPPED ({skipped.length})</small>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {skipped.map((u, si) => (
                              <span key={si} className="badge user-tag border-secondary text-secondary">
                                {u.name} <small className="ms-1 opacity-50">({u.surety})</small>
                              </span>
                            ))}
                            {skipped.length === 0 && <span className="text-muted small">None</span>}
                          </div>
                        </div>

                        <div className="explanation-box mb-3 mt-3">
                          <h6 className="fw-bold text-warning-emphasis">
                            <i className="bi bi-lightbulb"></i> Explanation:
                          </h6>
                          <p className="small m-0">{q.explanation || 'No explanation.'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {attempts && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom p-4">
                  <h5 className="fw-bold text-primary m-0">Attempts for {searchEmail}</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Test</th>
                        <th>Score</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-4">
                            No attempts found for this user.
                          </td>
                        </tr>
                      )}
                      {attempts.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <small className="text-muted">
                              {a.timestamp ? new Date(a.timestamp.toDate()).toLocaleDateString() : 'N/A'}
                            </small>
                          </td>
                          <td>
                            <span className="fw-bold">{a.subject}</span>
                          </td>
                          <td>{a.chapterName}</td>
                          <td>
                            <span className="badge bg-primary">{a.scorePercent}%</span>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-outline-primary btn-sm me-1" onClick={() => viewAttempt(a)}>
                              <i className="bi bi-eye"></i> View
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => deleteAttempt(a)}>
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal show={review.show} onHide={() => setReview((r) => ({ ...r, show: false }))} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-primary">User Attempt Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {review.loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : review.resultData ? (
            <div>
              <div className="mb-4">
                <h4 className="fw-bold text-primary">{review.resultData.scorePercent}%</h4>
                <p>
                  {review.resultData.subject} — {review.resultData.chapterName}
                </p>
              </div>
              {review.questions.map((q, index) => {
                const cIdx = getCorrectIndex(q);
                const uAns = review.resultData.userAnswers?.[index];
                const attempted = uAns !== undefined;
                const isCorrect = attempted && uAns.answer === cIdx;
                return (
                  <div
                    key={index}
                    className={`card mb-3 border-start border-4 ${
                      !attempted ? 'border-secondary' : isCorrect ? 'border-success' : 'border-danger'
                    }`}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold text-secondary mb-0">Question {index + 1}</h6>
                        {!attempted ? (
                          <span className="badge bg-secondary">Unattempted</span>
                        ) : isCorrect ? (
                          <span className="badge bg-success">Correct</span>
                        ) : (
                          <span className="badge bg-danger">Incorrect</span>
                        )}
                      </div>
                      <div className="mb-3 lead" style={{ fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: TextFormatter.formatQuestionText(q.text || q.question) }} />
                      {q.options.map((opt, oi) => {
                        let cls = 'p-2 mb-2 rounded border';
                        if (oi === cIdx) cls += ' bg-success text-white border-success';
                        else if (attempted && uAns.answer === oi) cls += ' bg-danger text-white border-danger';
                        else cls += ' bg-white text-dark';
                        return (
                          <div key={oi} className={cls}>
                            {oi === cIdx ? '✔' : attempted && uAns.answer === oi ? '✖' : '○'} {opt}
                          </div>
                        );
                      })}
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-light rounded border-start border-warning border-4">
                          <h6 className="fw-bold text-warning-emphasis">Explanation</h6>
                          <div className="small">{q.explanation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setReview((r) => ({ ...r, show: false }))}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

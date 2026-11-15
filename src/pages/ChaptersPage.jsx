import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import DataManager from '../lib/dataManager';
import { useAuth } from '../contexts/AuthContext';
import { useQuizSession } from '../contexts/QuizSessionContext';
import { getCorrectIndex } from '../lib/stats';
import { toastr } from '../lib/toast';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ChaptersPage() {
  const { subject: subjectParam } = useParams();
  const subject = decodeURIComponent(subjectParam || '');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startQuizSession, startReviewSession } = useQuizSession();

  const [manifest, setManifest] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRevision, setShowRevision] = useState(false);
  const [revisionFilter, setRevisionFilter] = useState('all');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [generating, setGenerating] = useState(false);

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

  const chapters = manifest && subject ? manifest[subject] : null;
  const sortedChapterIds = chapters
    ? Object.keys(chapters).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      )
    : [];

  const subjectPrefix = `${subject.replace(/\s+/g, '_')}_`;
  const latestResultsMap = new Map();
  userHistory.forEach((h) => {
    if (!latestResultsMap.has(h.chapterId)) latestResultsMap.set(h.chapterId, h);
  });

  async function startTest(chapId) {
    const fullId = subjectPrefix + chapId;
    const questions = await DataManager.fetchQuizQuestions(fullId);
    if (!questions) {
      toastr.error('Quiz questions not found in database!');
      return;
    }
    startQuizSession({ subject, chapterId: fullId, chapterName: chapId, questions });
    navigate('/quiz');
  }

  async function reviewTest(resultObj) {
    const questions = await DataManager.fetchQuizQuestions(resultObj.chapterId);
    if (!questions) {
      toastr.error('Quiz questions not found in database!');
      return;
    }
    startReviewSession({
      subject,
      chapterId: resultObj.chapterId,
      chapterName: resultObj.chapterName,
      questions,
      reviewData: resultObj,
    });
    navigate('/review');
  }

  function openRevision() {
    setSelectedChapters([]);
    setRevisionFilter('all');
    setShowRevision(true);
  }

  async function generateRevision() {
    if (selectedChapters.length === 0) {
      toastr.warning('Please select at least one test.');
      return;
    }

    setGenerating(true);
    try {
      let combinedQuestions = [];

      for (const chapId of selectedChapters) {
        const fullId = subjectPrefix + chapId;
        const questions = await DataManager.fetchQuizQuestions(fullId);
        if (!questions || questions.length === 0) continue;

        const latestResult = latestResultsMap.get(fullId);
        const tagged = questions
          .map((q, qIndex) => {
            let include = true;
            if (revisionFilter !== 'all') {
              if (!latestResult) {
                if (revisionFilter === 'correct' || revisionFilter === 'incorrect') include = false;
              } else {
                const uAns = latestResult.userAnswers && latestResult.userAnswers[qIndex];
                if (!uAns) {
                  include = revisionFilter === 'unattempted';
                } else {
                  const isCorrect = uAns.answer === getCorrectIndex(q);
                  if (revisionFilter === 'correct' && !isCorrect) include = false;
                  if (revisionFilter === 'incorrect' && isCorrect) include = false;
                  if (revisionFilter === 'unattempted') include = false;
                }
              }
            }
            return include ? { ...q, subject: q.subject || subject } : null;
          })
          .filter(Boolean);

        combinedQuestions = combinedQuestions.concat(tagged);
      }

      if (combinedQuestions.length === 0) {
        toastr.error('No questions found matching your filter criteria.');
        return;
      }

      for (let i = combinedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedQuestions[i], combinedQuestions[j]] = [combinedQuestions[j], combinedQuestions[i]];
      }

      const finalQuestions = combinedQuestions.slice(0, 100);
      setShowRevision(false);

      startQuizSession({
        subject,
        chapterId: `revision_${Date.now()}`,
        chapterName: 'Revision Test',
        questions: finalQuestions,
      });
      navigate('/quiz');
    } catch (e) {
      console.error('Error generating revision test:', e);
      toastr.error('Failed to generate test.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <section className="py-5 text-center" style={{ minHeight: '90vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
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
            { label: subject },
          ]}
        />

        <button className="btn btn-primary-custom px-4 shadow mb-4" onClick={() => navigate('/test')}>
          ← Back to Subjects
        </button>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold section-title mb-1">Chapters: {subject}</h4>
            <div className="title-underline"></div>
          </div>
          <button className="btn btn-secondary-custom shadow-sm fw-bold" onClick={openRevision}>
            <i className="bi bi-journal-text me-1"></i>Create Revision Test
          </button>
        </div>

        <div className="row">
          {sortedChapterIds.map((chapId) => {
            const fullId = subjectPrefix + chapId;
            const latestResult = latestResultsMap.get(fullId);
            const hasTaken = !!latestResult;
            return (
              <div className="col-md-6 col-lg-4 mb-4" key={chapId}>
                <div className="card chapter-card h-100 border-0">
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title fw-bold text-dark">{chapId}</h5>
                    <div className="mt-auto">
                      <button className="btn btn-primary-custom w-100" onClick={() => startTest(chapId)}>
                        {hasTaken ? '↻ Retake Test' : '🚀 Start Test'}
                      </button>
                      {hasTaken && (
                        <button
                          className="btn btn-secondary-custom w-100 mt-2"
                          onClick={() => reviewTest(latestResult)}
                        >
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

      <Modal show={showRevision} onHide={() => setShowRevision(false)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-primary">📝 Create Revision Test</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Select the tests you want to include. Up to 100 questions will be randomly selected.
          </p>
          <Form.Select
            className="mb-3"
            size="sm"
            value={revisionFilter}
            onChange={(e) => setRevisionFilter(e.target.value)}
          >
            <option value="all">All Questions</option>
            <option value="incorrect">Incorrect Only</option>
            <option value="correct">Correct Only</option>
            <option value="unattempted">Unattempted Only</option>
          </Form.Select>

          <div className="list-group list-group-flush">
            {sortedChapterIds.map((chapId) => (
              <label key={chapId} className="list-group-item d-flex gap-2 align-items-center">
                <input
                  className="form-check-input flex-shrink-0"
                  type="checkbox"
                  checked={selectedChapters.includes(chapId)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedChapters((prev) => [...prev, chapId]);
                    else setSelectedChapters((prev) => prev.filter((c) => c !== chapId));
                  }}
                />
                <span>{chapId}</span>
              </label>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={() => setShowRevision(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={generateRevision} disabled={generating}>
            {generating ? 'Generating...' : '🚀 Generate Test'}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

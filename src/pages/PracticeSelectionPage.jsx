import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataManager from '../lib/dataManager';
import { useQuizSession } from '../contexts/QuizSessionContext';
import { toastr } from '../lib/toast';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PracticeSelectionPage() {
  const navigate = useNavigate();
  const { startPracticeSession } = useQuizSession();
  const [manifest, setManifest] = useState(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const m = await DataManager.fetchPracticeManifest();
        setManifest(m);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topics = subject && manifest?.[subject] ? Object.keys(manifest[subject]) : [];

  async function generatePractice() {
    if (!subject || !topic) {
      toastr.error('Please select both a Subject and a Topic.');
      return;
    }

    setGenerating(true);
    try {
      const chapterIds = topic === 'all' ? topics : [topic];
      const promises = chapterIds.map((chapId) => {
        const docId = `${subject.replace(/\s+/g, '_')}_${chapId.replace(/\s+/g, '_')}`;
        return DataManager.fetchPracticeQuestions(docId);
      });

      const results = await Promise.all(promises);
      const allQuestions = results.flat();

      if (allQuestions.length === 0) {
        toastr.error('No questions available.');
        return;
      }

      const randomized = [...allQuestions];
      const fetchLimit = Math.min(limit, randomized.length);
      for (let i = 0; i < fetchLimit; i++) {
        const j = i + Math.floor(Math.random() * (randomized.length - i));
        [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
      }
      const questions = randomized.slice(0, fetchLimit);

      startPracticeSession({
        subject,
        chapterId: 'practice_session',
        chapterName: topic === 'all' ? 'All Topics' : topic,
        questions,
      });
      navigate('/practice/session');
    } catch (e) {
      console.error('Practice fetch error:', e);
      toastr.error('Failed to load questions.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Practice' }]} />

        <button className="btn btn-primary-custom px-4 shadow mb-4" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>

        <div className="text-center mb-5">
          <h2 className="fw-bold section-title text-primary">Practice MCQ</h2>
          <div className="title-underline mx-auto" style={{ background: 'var(--secondary-color)' }}></div>
          <p className="text-muted mt-3">Configure your custom practice session below.</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">1. Select Subject</label>
                  <select
                    className="form-select form-select-lg"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setTopic('');
                    }}
                  >
                    <option value="" disabled>
                      Choose a Subject...
                    </option>
                    {manifest &&
                      Object.keys(manifest).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">2. Select Topic / Chapter</label>
                  <select
                    className="form-select form-select-lg"
                    value={topic}
                    disabled={!subject}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="" disabled>
                      {subject ? 'Choose a Topic...' : 'Select Subject first...'}
                    </option>
                    <option value="all">All Topics</option>
                    {topics.map((chapId) => (
                      <option key={chapId} value={chapId}>
                        {chapId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small">3. Number of Questions</label>
                  <select
                    className="form-select form-select-lg"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                  >
                    {[10, 20, 30, 40, 50, 75, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} Questions
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-secondary-custom w-100 py-3 fw-bold fs-5"
                  onClick={generatePractice}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Practice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

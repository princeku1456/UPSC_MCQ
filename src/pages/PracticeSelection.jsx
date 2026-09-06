import { useEffect, useState } from 'react';
import toastr from 'toastr';
import { useApp } from '../context/AppContext.jsx';

export default function PracticeSelection() {
  const { practiceManifest, showDashboard, loadPracticeQuiz } = useApp();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [limit, setLimit] = useState('10');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(!practiceManifest);
  }, [practiceManifest]);

  useEffect(() => {
    if (!subject || !practiceManifest) {
      setTopics([]);
      return;
    }
    const chapters = practiceManifest[subject] || {};
    setTopics(Object.keys(chapters));
    setTopic('');
  }, [subject, practiceManifest]);

  function generate() {
    if (!subject || !topic) {
      toastr.error('Please select both a Subject and a Topic.');
      return;
    }
    loadPracticeQuiz(subject, topic, parseInt(limit));
  }

  if (loading) {
    return (
      <section className="py-5" style={{ minHeight: '90vh' }}>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading Practice data...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!practiceManifest) {
    return (
      <section className="py-5" style={{ minHeight: '90vh' }}>
        <div className="container">
          <div className="alert alert-danger text-center">Failed to load Practice Data from Firebase!</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5" style={{ minHeight: '90vh' }}>
      <div className="container">
        <button className="btn btn-primary-custom px-4 shadow mb-4" onClick={showDashboard}>← Back to Dashboard</button>
        <div className="text-center mb-5">
          <h2 className="fw-bold section-title text-primary">Practice MCQ</h2>
          <div className="title-underline mx-auto" style={{ background: 'var(--secondary-color)' }}></div>
          <p className="text-muted mt-3">Configure your custom practice session below.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="mb-3">
                <label className="form-label fw-bold text-muted small">1. Select Subject</label>
                <select className="form-select form-select-lg" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="" disabled>Choose a Subject...</option>
                  {Object.keys(practiceManifest).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold text-muted small">2. Select Topic / Chapter</label>
                <select className="form-select form-select-lg" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={!subject}>
                  <option value="" disabled>{subject ? 'Choose a Topic...' : 'Select Subject first...'}</option>
                  <option value="all">All Topics</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">3. Number of Questions</label>
                <select className="form-select form-select-lg" value={limit} onChange={(e) => setLimit(e.target.value)}>
                  {['10', '20', '30', '40', '50', '75', '100'].map((n) => (
                    <option key={n} value={n}>{n} Questions</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-secondary-custom w-100 py-3 fw-bold fs-5" onClick={generate}>
                Generate Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

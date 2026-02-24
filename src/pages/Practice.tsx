import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataManager } from '../services/DataManager';
import { Question, HistoryEntry } from '../types';
import { QuizInterface } from '../components/quiz/QuizInterface';
import { ReviewMode } from '../components/quiz/ReviewMode';

type Step = 'config' | 'quiz' | 'review';

export const Practice: React.FC = () => {
  const { currentUser } = useAuth();
  const [manifest, setManifest] = useState<any | null>(null);
  const [step, setStep] = useState<Step>('config');

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [questionLimit, setQuestionLimit] = useState<number>(10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        const m = await DataManager.fetchPracticeManifest();
        setManifest(m);
      }
    };
    init();
  }, [currentUser]);

  const handleStart = async () => {
    if (!selectedSubject || !selectedChapter) return;

    try {
        let qs: Question[] = [];
        if (selectedChapter === 'all') {
            const chapters = Object.keys(manifest[selectedSubject]);
            const promises = chapters.map(chapId => {
                const docId = selectedSubject.replace(/\s+/g, "_") + "_" + chapId;
                return DataManager.fetchPracticeQuestions(docId);
            });
            const results = await Promise.all(promises);
            qs = results.reduce<Question[]>((acc, val) => val ? [...acc, ...val] : acc, []);
        } else {
            const docId = selectedSubject.replace(/\s+/g, "_") + "_" + selectedChapter;
            qs = (await DataManager.fetchPracticeQuestions(docId)) || [];
        }

        if (qs.length === 0) {
            alert("No questions found.");
            return;
        }

        // Randomize and slice
        qs = qs.sort(() => 0.5 - Math.random()).slice(0, questionLimit);
        setQuestions(qs);
        setStep('quiz');
    } catch (e) {
        console.error("Failed to start practice", e);
    }
  };

  const handleSubmit = async (res: HistoryEntry) => {
      try {
          const firestoreResult = { ...res, timestamp: new Date() };
          await DataManager.savePracticeResult(firestoreResult);
      } catch (e) {
          console.error("Failed to save practice result", e);
      }
      setResult(res);
      setStep('review');
  };

  if (!manifest) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
      <div>
          {step === 'config' && (
              <>
                <button className="btn btn-primary-custom px-4 shadow mb-4" onClick={() => window.history.back()}>← Back to Dashboard</button>
                <div className="text-center mb-5">
                    <h2 className="fw-bold section-title text-primary">Practice MCQ</h2>
                    <div className="title-underline mx-auto" style={{background: 'var(--secondary-color)'}}></div>
                    <p className="text-muted mt-3">Configure your custom practice session below.</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">1. Select Subject</label>
                                <select className="form-select form-select-lg" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }}>
                                    <option value="" disabled>Choose a Subject...</option>
                                    {Object.keys(manifest).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">2. Select Topic / Chapter</label>
                                <select className="form-select form-select-lg" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} disabled={!selectedSubject}>
                                    <option value="" disabled>Select Subject first...</option>
                                    <option value="all">All Topics</option>
                                    {selectedSubject && manifest[selectedSubject] && Object.keys(manifest[selectedSubject]).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small">3. Number of Questions</label>
                                <select className="form-select form-select-lg" value={questionLimit} onChange={e => setQuestionLimit(parseInt(e.target.value))}>
                                    {[10, 20, 30, 40, 50, 75, 100].map(n => <option key={n} value={n}>{n} Questions</option>)}
                                </select>
                            </div>

                            <button className="btn btn-secondary-custom w-100 py-3 fw-bold fs-5" onClick={handleStart} disabled={!selectedSubject || !selectedChapter}>
                                Generate Practice
                            </button>
                        </div>
                    </div>
                </div>
              </>
          )}

          {step === 'quiz' && (
              <QuizInterface
                  questions={questions}
                  subject={selectedSubject}
                  chapterId="practice_session"
                  chapterName={selectedChapter === 'all' ? 'All Topics' : selectedChapter}
                  onSubmit={handleSubmit}
              />
          )}

          {step === 'review' && result && (
              <ReviewMode
                  result={result}
                  questions={questions}
                  onExit={() => {
                      setStep('config');
                      setQuestions([]);
                      setResult(null);
                  }}
              />
          )}
      </div>
  );
};

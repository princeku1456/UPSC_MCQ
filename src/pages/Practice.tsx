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
      <div className="container">
          {step === 'config' && (
              <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6">
                      <div className="card border-0 shadow-sm rounded-4 p-4">
                          <h4 className="fw-bold text-primary mb-4 text-center">Practice Setup</h4>

                          <div className="mb-3">
                              <label className="form-label fw-bold">1. Select Subject</label>
                              <select className="form-select" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }}>
                                  <option value="" disabled>Choose...</option>
                                  {Object.keys(manifest).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>

                          <div className="mb-3">
                              <label className="form-label fw-bold">2. Select Topic</label>
                              <select className="form-select" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} disabled={!selectedSubject}>
                                  <option value="" disabled>Choose...</option>
                                  <option value="all">All Topics</option>
                                  {selectedSubject && manifest[selectedSubject] && Object.keys(manifest[selectedSubject]).map(c => (
                                      <option key={c} value={c}>{c}</option>
                                  ))}
                              </select>
                          </div>

                          <div className="mb-4">
                              <label className="form-label fw-bold">3. Question Limit</label>
                              <select className="form-select" value={questionLimit} onChange={e => setQuestionLimit(parseInt(e.target.value))}>
                                  {[10, 20, 30, 40, 50, 75, 100].map(n => <option key={n} value={n}>{n} Questions</option>)}
                              </select>
                          </div>

                          <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleStart} disabled={!selectedSubject || !selectedChapter}>
                              Start Practice
                          </button>
                      </div>
                  </div>
              </div>
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

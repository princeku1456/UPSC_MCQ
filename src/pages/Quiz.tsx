import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataManager } from '../services/DataManager';
import { QuizManifest, HistoryEntry, Question } from '../types';
import { SubjectSelection } from '../components/quiz/SubjectSelection';
import { ChapterSelection } from '../components/quiz/ChapterSelection';
import { QuizInterface } from '../components/quiz/QuizInterface';
import { ReviewMode } from '../components/quiz/ReviewMode';

type QuizStep = 'subjects' | 'chapters' | 'quiz' | 'review';

export const Quiz: React.FC = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<QuizStep>('subjects');
  const [manifest, setManifest] = useState<QuizManifest | null>(null);
  const [userHistory, setUserHistory] = useState<HistoryEntry[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedChapterName, setSelectedChapterName] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizResult, setQuizResult] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        const [m, h] = await Promise.all([
          DataManager.fetchQuizManifest(),
          DataManager.syncUserHistory(currentUser.uid)
        ]);
        setManifest(m);
        setUserHistory(h || []);
      }
    };
    init();
  }, [currentUser]);

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setStep('chapters');
  };

  const handleChapterSelect = async (chapterId: string, chapterName: string) => {
    setSelectedChapterId(chapterId);
    setSelectedChapterName(chapterName);

    // Check if review mode (already taken)
    // Actually, user might want to retake.
    // The ChapterSelection component should handle "Start" vs "Review" buttons.
    // But here we just prepare for Quiz Execution.
    // Wait, if "Review" is clicked in ChapterSelection, we go straight to Review.

    try {
      const questions = await DataManager.fetchQuizQuestions(chapterId);
      if (questions) {
        setQuizQuestions(questions);
        setStep('quiz');
      } else {
        alert("Failed to load questions.");
      }
    } catch (e) {
      console.error(e);
      alert("Error loading quiz.");
    }
  };

  const handleReviewSelect = async (result: HistoryEntry) => {
    // Load questions for the result's chapter
    const questions = await DataManager.fetchQuizQuestions(result.chapterId);
    if (questions) {
      setQuizQuestions(questions);
      setQuizResult(result);
      setStep('review');
    }
  };

  const handleQuizSubmit = async (result: HistoryEntry) => {
    try {
        const firestoreResult = { ...result, timestamp: new Date() }; // Firestore will convert Date to Timestamp or use serverTimestamp if we import it
        // But DataManager.saveQuizResult expects HistoryEntry where timestamp is `any`.
        // Let's rely on DataManager to handle types if needed, or pass Date object which Firestore accepts.
        await DataManager.saveQuizResult(firestoreResult);
    } catch (e) {
        console.error("Failed to save result", e);
    }

    setQuizResult(result);
    setStep('review');
    setUserHistory(prev => [result, ...prev]);
  };

  const handleBack = () => {
    if (step === 'chapters') {
        setStep('subjects');
        setSelectedSubject(null);
    } else if (step === 'quiz') {
        if (confirm("Are you sure you want to exit? Progress will be lost.")) {
            setStep('chapters');
            setQuizQuestions([]);
        }
    } else if (step === 'review') {
        setStep('chapters');
        setQuizResult(null);
        setQuizQuestions([]);
    }
  };

  if (!manifest) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container">
      {step !== 'subjects' && (
        <button className="btn btn-outline-secondary mb-3" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
      )}

      {step === 'subjects' && (
        <SubjectSelection
            manifest={manifest}
            userHistory={userHistory}
            onSelect={handleSubjectSelect}
        />
      )}

      {step === 'chapters' && selectedSubject && (
        <ChapterSelection
            subject={selectedSubject}
            chapters={manifest[selectedSubject]}
            userHistory={userHistory}
            onSelect={handleChapterSelect}
            onReview={handleReviewSelect}
        />
      )}

      {step === 'quiz' && (
        <QuizInterface
            questions={quizQuestions}
            subject={selectedSubject!}
            chapterId={selectedChapterId!}
            chapterName={selectedChapterName!}
            onSubmit={handleQuizSubmit}
        />
      )}

      {step === 'review' && quizResult && (
        <ReviewMode
            result={quizResult}
            questions={quizQuestions}
            onExit={() => {
                setStep('chapters');
                setQuizResult(null);
                setQuizQuestions([]);
            }}
        />
      )}
    </div>
  );
};

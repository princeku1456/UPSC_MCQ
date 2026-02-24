import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Question, HistoryEntry, UserAnswer } from '../../types';
import { useQuizTimer } from '../../hooks/useQuizTimer';
import { TextFormatter, getCorrectIndex } from '../../utils/helpers';

interface QuizInterfaceProps {
  questions: Question[];
  subject: string;
  chapterId: string;
  chapterName: string;
  onSubmit: (result: HistoryEntry) => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, subject, chapterId, chapterName, onSubmit }) => {
  const { currentUser } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<number, number>>({});
  const lastQuestionStartTime = useRef<number>(Date.now());

  const timerDuration = Math.ceil(questions.length * 1.2 * 60);

  const handleTimeUp = () => {
    submitQuiz(true);
  };

  const { secondsRemaining, isPaused, toggle } = useQuizTimer(timerDuration, handleTimeUp);

  const updateQuestionTime = () => {
    const now = Date.now();
    const elapsed = (now - lastQuestionStartTime.current) / 1000;
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + elapsed
    }));
    lastQuestionStartTime.current = now;
  };

  const handleNavigate = (newIndex: number) => {
    updateQuestionTime();
    setCurrentQuestionIndex(newIndex);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: { ...prev[currentQuestionIndex], answer: optionIndex, surety: prev[currentQuestionIndex]?.surety || 0 }
    }));
  };

  const handleSuretySelect = (surety: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: { ...prev[currentQuestionIndex], surety }
    }));
  };

  const toggleMarkReview = () => {
    setMarkedForReview(prev => {
      const newState = { ...prev };
      if (newState[currentQuestionIndex]) delete newState[currentQuestionIndex];
      else newState[currentQuestionIndex] = true;
      return newState;
    });
  };

  const submitQuiz = async (force: boolean = false) => {
    if (!force && !confirm("Are you sure you want to submit?")) return;

    updateQuestionTime();

    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const finalAnswers: Record<number, UserAnswer> = {};

    questions.forEach((q, i) => {
      const uAns = userAnswers[i];
      const correctIndex = getCorrectIndex(q);

      if (uAns && uAns.answer !== undefined) {
        const isCorrect = uAns.answer === correctIndex;
        finalAnswers[i] = { ...uAns, isCorrect };

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

    const finalScore = parseFloat(score.toFixed(2));
    const totalMarks = questions.length * 2;
    const percentage = totalMarks > 0 ? parseFloat(((finalScore / totalMarks) * 100).toFixed(1)) : 0;

    const result: HistoryEntry = {
      userId: currentUser!.uid,
      userEmail: currentUser!.email || "guest",
      subject,
      chapterId,
      chapterName,
      score: finalScore,
      totalMarks,
      scorePercent: percentage,
      userAnswers: finalAnswers,
      questionTimeSpent,
      timestamp: new Date(), // Local Date object for immediate UI update
      correctCount: correct,
      incorrectCount: incorrect,
      unattemptedCount: unattempted
    };

    onSubmit(result);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const isMarked = markedForReview[currentQuestionIndex];

  return (
    <div className="row">
      {/* Main Content */}
      <div className={`col-lg-8 mb-4 ${isPaused ? 'opacity-25 pe-none' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-primary m-0">{chapterName}</h4>
          <button
            className={`btn btn-sm fw-bold shadow-sm ${isMarked ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={toggleMarkReview}
          >
            <i className={`bi ${isMarked ? 'bi-bookmark-check-fill' : 'bi-bookmark-star'}`}></i> {isMarked ? 'Unmark Review' : 'Mark for Review'}
          </button>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="mb-3 lead fw-bold" dangerouslySetInnerHTML={{ __html: `Q${currentQuestionIndex + 1}. ${TextFormatter.formatQuestionText(currentQuestion.text)}` }}></div>

            <div className="options-list">
              {currentQuestion.options.map((opt, idx) => (
                <label key={idx} className={`option shadow-sm d-flex align-items-center p-3 mb-2 border rounded ${currentAnswer?.answer === idx ? 'bg-light border-primary' : ''}`} style={{cursor: 'pointer'}}>
                  <input
                    type="radio"
                    name={`q-${currentQuestionIndex}`}
                    className="form-check-input me-3"
                    checked={currentAnswer?.answer === idx}
                    onChange={() => handleAnswerSelect(idx)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 animate-fade-in">
              <label className="form-label fw-bold text-muted small text-uppercase">Confidence Level</label>
              <div className="btn-group w-100 shadow-sm" role="group">
                {[100, 75, 50, 0].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`btn ${currentAnswer?.surety === val ? getSuretyColor(val) : 'btn-outline-secondary'}`}
                    onClick={() => handleSuretySelect(val)}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-outline-secondary px-4"
            disabled={currentQuestionIndex === 0}
            onClick={() => handleNavigate(currentQuestionIndex - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-secondary px-4"
            onClick={() => setUserAnswers(prev => {
                const newState = { ...prev };
                delete newState[currentQuestionIndex];
                return newState;
            })}
          >
            Clear
          </button>
          <button
            className="btn btn-outline-secondary px-4"
            disabled={currentQuestionIndex === questions.length - 1}
            onClick={() => handleNavigate(currentQuestionIndex + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Sidebar / Palette */}
      <div className="col-lg-4">
        <div className="card shadow-sm border-0 mb-3 sticky-top" style={{top: '20px', zIndex: 100}}>
           <div className="card-header bg-white py-3">
               <h6 className="mb-0 fw-bold text-muted">Question Palette</h6>
           </div>
           <div className="card-body">
               {/* Timer */}
               <div className="timer-display text-center mb-4 p-3 bg-light rounded position-relative">
                   <div className={`display-4 fw-bold ${secondsRemaining < 180 ? 'text-danger' : 'text-dark'}`}>
                       {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                   </div>
                   <small className="text-muted text-uppercase fw-bold">Time Remaining</small>
                   <button
                       className="btn btn-sm btn-secondary position-absolute bottom-0 end-0 m-2"
                       onClick={toggle}
                   >
                       <i className={`bi ${isPaused ? 'bi-play-fill' : 'bi-pause-fill'}`}></i> {isPaused ? 'Resume' : 'Pause'}
                   </button>
               </div>

               {/* Grid */}
               <div className="d-flex flex-wrap gap-2 justify-content-center mb-4" style={{maxHeight: '300px', overflowY: 'auto'}}>
                   {questions.map((_, idx) => {
                       const isCurrent = idx === currentQuestionIndex;
                       const uAns = userAnswers[idx];
                       const isReview = markedForReview[idx];

                       let btnClass = 'btn-outline-secondary';
                       if (isCurrent) btnClass = 'btn-primary';
                       else if (isReview) btnClass = 'btn-warning text-white'; // Purple replacement? Warning is yellow/orange.
                       // Wait, quiz.js used purple for review. Bootstrap warning is yellow.
                       // I'll stick to btn-warning or custom style.
                       else if (uAns) btnClass = 'btn-success text-white'; // Attempted

                       return (
                           <button
                               key={idx}
                               className={`btn btn-sm ${btnClass}`}
                               style={{width: '40px', height: '40px'}}
                               onClick={() => handleNavigate(idx)}
                           >
                               {idx + 1}
                           </button>
                       );
                   })}
               </div>

               <button className="btn btn-success w-100 fw-bold py-2" onClick={() => submitQuiz(false)}>
                   Submit Test
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

function getSuretyColor(val: number) {
    if (val === 100) return 'btn-success';
    if (val === 75) return 'btn-primary'; // slightly less confident
    if (val === 50) return 'btn-warning';
    return 'btn-danger';
}

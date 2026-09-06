import { useApp } from '../context/AppContext.jsx';
import { TextFormatter, getCorrectIndex } from '../lib/helpers.js';

export default function QuizPage() {
  const {
    quiz,
    exitQuiz,
    selectAnswer,
    setSurety,
    toggleMarkForReview,
    navigateQuestions,
    goToQuestion,
    clearSelection,
    submitAll,
    toggleTimerPause,
    selectPracticeAnswer,
    setPracticeSurety,
    togglePracticeMarkForReview,
    navigatePractice,
    goToPracticeQuestion,
    clearPracticeSelection,
    submitPractice,
    formatTime,
    reviewTest,
  } = useApp();

  const isPractice = quiz.mode === 'practice';
  const question = quiz.data[quiz.currentIndex];

  if (!question) {
    return (
      <section className="quiz-section py-5">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading Questions...</p>
        </div>
      </section>
    );
  }

  const cIdx = getCorrectIndex(question);
  const uAns = quiz.answers[quiz.currentIndex];
  const selectedAnswer = uAns && uAns.answer !== undefined ? uAns.answer : undefined;
  const currentSurety = uAns?.surety;

  const markBtn = isPractice ? togglePracticeMarkForReview : toggleMarkForReview;
  const marked = quiz.marked[quiz.currentIndex];

  return (
    <section className="quiz-section py-5">
      <div className="container">
        <div className="d-flex justify-content-between mb-4">
          <button className="btn btn-primary-custom px-4 shadow" onClick={exitQuiz}>← Exit</button>
        </div>
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="quiz-box h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className={`fw-bold m-0 ${isPractice ? 'text-info' : 'text-primary'}`}>{quiz.chapterName}</h4>
                <button
                  className="btn btn-primary-custom btn-sm fw-bold shadow-sm"
                  onClick={markBtn}
                  style={marked ? { background: '#7e22ce' } : undefined}
                >
                  <i className={marked ? 'bi bi-bookmark-check-fill' : 'bi bi-bookmark-star'}></i>{' '}
                  {marked ? 'Unmark Review' : 'Mark for Review'}
                </button>
              </div>

              {quiz.submitted && quiz.result && (
                <div className="mb-4">
                  {isPractice ? <PracticeResultSummary result={quiz.result} /> : <QuizResultSummary result={quiz.result} onReview={() => reviewTest(quiz.resultObject, 'chapters')} />}
                </div>
              )}

              <div className="question">
                <div className="mb-3 lead fw-bold">Q{quiz.currentIndex + 1}. {renderText(question.text)}</div>
                <div>
                  {question.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    let cls = 'option shadow-sm';
                    if (quiz.submitted) {
                      if (idx === cIdx) cls += ' correct-answer-label';
                      else if (isSelected && idx !== cIdx) cls += ' incorrect-answer-label';
                    }
                    return (
                      <label key={idx} className={cls}>
                        <input
                          type="radio"
                          name={`q${quiz.currentIndex}`}
                          value={idx}
                          checked={isSelected}
                          disabled={quiz.submitted}
                          onChange={() => (isPractice ? selectPracticeAnswer(idx) : selectAnswer(idx))}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                <SuretyMatrix
                  currentSurety={currentSurety}
                  disabled={quiz.submitted}
                  onSelect={(val) => (isPractice ? setPracticeSurety(val) : setSurety(val))}
                />

                {quiz.submitted && question.explanation && (
                  <div className="explanation shadow-sm mt-3">
                    <strong>💡 Explanation:</strong>
                    <br />
                    <div className="mt-1" dangerouslySetInnerHTML={{ __html: question.explanation }} />
                  </div>
                )}
              </div>

              {quiz.submitted && (
                <div className="mt-3 text-center">
                  <FeedbackText uAns={uAns} correctIndex={cIdx} />
                </div>
              )}

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-secondary-custom px-4" disabled={quiz.currentIndex === 0} onClick={() => (isPractice ? navigatePractice(-1) : navigateQuestions(-1))}>Previous</button>
                <button className="btn btn-primary-custom px-4" disabled={quiz.submitted} onClick={() => (isPractice ? clearPracticeSelection() : clearSelection())}>Clear</button>
                <button className="btn btn-secondary-custom px-4" disabled={quiz.currentIndex === quiz.data.length - 1} onClick={() => (isPractice ? navigatePractice(1) : navigateQuestions(1))}>Next</button>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="quiz-nav-sidebar">
              <div className="nav-header">Question Palette</div>
              <div className={`timer-container shadow-sm ${isPractice ? 'border-info' : ''}`} style={{ paddingBottom: '45px !important' }}>
                <span className="timer-label">Time Remaining</span>
                <div className={`timer-value${quiz.timerSeconds < 180 ? ' low-time' : ''}`}>{formatTime(quiz.timerSeconds)}</div>
                {!quiz.submitted && (
                  <button
                    className="btn btn-sm btn-secondary-custom fw-bold position-absolute"
                    style={{ bottom: 12, right: 12, fontSize: '0.85rem', padding: '5px 12px', borderRadius: 8 }}
                    onClick={toggleTimerPause}
                  >
                    <i className={quiz.timerPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'}></i> {quiz.timerPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
              </div>
              <div className="nav-grid">
                {quiz.data.map((_, i) => {
                  const itemAnswer = quiz.answers[i];
                  const itemMarked = quiz.marked[i];
                  const itemCorrect = getCorrectIndex(quiz.data[i]);
                  let cls = 'nav-item shadow-sm nav-item-animate';
                  if (i === quiz.currentIndex) cls += ' active';
                  if (quiz.submitted) {
                    if (!itemAnswer || itemAnswer.answer === undefined || itemAnswer.answer === -1) cls += ' unattempted';
                    else if (itemAnswer.answer === itemCorrect) cls += ' correct-nav';
                    else cls += ' incorrect-nav';
                  } else {
                    if (itemAnswer && itemAnswer.answer !== undefined && itemAnswer.answer !== -1) cls += ' attempted';
                    if (itemMarked) cls += ' marked-nav';
                  }
                  return (
                    <div key={i} className={cls} style={{ '--animation-delay': `${i * 30}ms` }} role="button" tabIndex="0"
                      onClick={() => (isPractice ? goToPracticeQuestion(i) : goToQuestion(i))}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (isPractice ? goToPracticeQuestion(i) : goToQuestion(i)); }}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              {!quiz.submitted && (
                <button
                  className={`btn w-100 mt-4 py-2 fw-bold ${isPractice ? 'btn-secondary-custom rounded-pill text-white' : 'btn-success-custom'}`}
                  onClick={() => (isPractice ? submitPractice(false) : submitAll(false))}
                >
                  {isPractice ? 'Finish Practice' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderText(text) {
  return <span dangerouslySetInnerHTML={{ __html: TextFormatter.formatQuestionText(text) }} />;
}

function SuretyMatrix({ currentSurety, disabled, onSelect }) {
  return (
    <div className="mt-4 mb-3 animate-fade-in">
      <div className="surety-label">Confidence Level</div>
      <div className="surety-matrix shadow-sm" role="radiogroup" aria-label="Confidence Level">
        {[100, 75, 50, 0].map((val) => (
          <div
            key={val}
            className={`surety-opt surety-${val} ${currentSurety === val ? 'selected' : ''}`}
            data-val={val}
            role="radio"
            tabIndex="0"
            aria-checked={currentSurety === val}
            onClick={() => !disabled && onSelect(val)}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) onSelect(val); }}
          >
            {val}%
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackText({ uAns, correctIndex }) {
  if (uAns && uAns.answer === correctIndex) return <h5 className="text-success fw-bold">Correct! 🎉</h5>;
  if (uAns) return <h5 className="text-danger fw-bold">Incorrect. ❌</h5>;
  return <h5 className="text-secondary fw-bold">Unattempted. ⚪</h5>;
}

function QuizResultSummary({ result, onReview }) {
  return (
    <div className="alert alert-primary mt-3 shadow-sm" role="alert">
      <h4 className="alert-heading fw-bold">Test Complete! 🏆</h4>
      <hr />
      <p>✅ Correct: <strong>{result.correct}</strong> | ❌ Incorrect: <strong>{result.incorrect}</strong></p>
      <p>⚪ Unattempted: <strong>{result.unattempted}</strong></p>
      <h3 className="text-primary mt-2">Score: {result.score} / {result.totalMarks} ({result.percentage}%)</h3>
      <div className="d-flex justify-content-center gap-2 mt-2">
        <button className="btn btn-primary-custom px-4 shadow" onClick={onReview}>👁 Review Performance</button>
      </div>
    </div>
  );
}

function PracticeResultSummary({ result }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 text-center animate-fade-in mb-4">
      <h4 className="fw-bold text-primary mb-3">Practice Result</h4>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <div className="p-2 bg-primary text-white rounded shadow-sm">
            <small className="text-white-50 d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Total Score</small>
            <h3 className="fw-bold m-0">{result.score} <span className="fs-6 text-white-50">/ {result.totalPossibleMarks}</span></h3>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="p-2 bg-light rounded shadow-sm border-start border-4 border-success">
            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Accuracy</small>
            <h4 className="fw-bold m-0 text-success">{result.accuracy}%</h4>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="p-2 bg-light rounded shadow-sm border-start border-4 border-danger">
            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Neg. Drain</small>
            <h4 className="fw-bold m-0 text-danger">{result.negativeDrain}%</h4>
          </div>
        </div>
      </div>
      <div className="row g-2">
        <div className="col-4"><div className="p-2 bg-light rounded"><small className="text-muted d-block">Correct</small><span className="fw-bold text-success">{result.correct}</span></div></div>
        <div className="col-4"><div className="p-2 bg-light rounded"><small className="text-muted d-block">Incorrect</small><span className="fw-bold text-danger">{result.incorrect}</span></div></div>
        <div className="col-4"><div className="p-2 bg-light rounded"><small className="text-muted d-block">Skipped</small><span className="fw-bold text-secondary">{result.unattempted}</span></div></div>
      </div>
    </div>
  );
}

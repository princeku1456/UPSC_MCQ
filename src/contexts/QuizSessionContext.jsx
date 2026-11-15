import { createContext, useContext, useState, useCallback } from 'react';

const QuizSessionContext = createContext(null);

export function QuizSessionProvider({ children }) {
  const [session, setSession] = useState(null);

  const startQuizSession = useCallback((payload) => {
    setSession({ mode: 'quiz', ...payload });
  }, []);

  const startPracticeSession = useCallback((payload) => {
    setSession({ mode: 'practice', ...payload });
  }, []);

  const startReviewSession = useCallback((payload) => {
    setSession({ mode: 'review', ...payload });
  }, []);

  const clearSession = useCallback(() => setSession(null), []);

  return (
    <QuizSessionContext.Provider
      value={{ session, startQuizSession, startPracticeSession, startReviewSession, clearSession }}
    >
      {children}
    </QuizSessionContext.Provider>
  );
}

export function useQuizSession() {
  return useContext(QuizSessionContext);
}

export default QuizSessionContext;

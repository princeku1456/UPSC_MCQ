import { useState, useEffect, useRef } from 'react';

export const useQuizTimer = (initialSeconds: number, onComplete: () => void) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onComplete]);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);
  const toggle = () => setIsPaused(prev => !prev);
  const reset = (newSeconds: number) => setSecondsRemaining(newSeconds);

  return { secondsRemaining, isPaused, pause, resume, toggle, reset };
};
